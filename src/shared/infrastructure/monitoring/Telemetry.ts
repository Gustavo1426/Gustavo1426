import { db, auth } from "../firebase/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  payload?: any;
  userId?: string | null;
}

class TelemetryService {
  private static instance: TelemetryService;
  private localLogsKey = "treinopro_telemetry_logs";

  private constructor() {
    this.setupGlobalHandlers();
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  private setupGlobalHandlers() {
    if (typeof window === "undefined") return;

    window.onerror = (message, source, lineno, colno, error) => {
      const msgStr = typeof message === "string" ? message : (message && (message as any).message ? (message as any).message : "Unknown error");
      this.logError(error || new Error(msgStr), {
        source,
        lineno,
        colno,
        type: "uncaught_exception"
      });
    };

    window.onunhandledrejection = (event) => {
      const reason = event && (event.reason !== undefined && event.reason !== null) ? event.reason : "Unhandled rejection without reason";
      this.logError(reason instanceof Error ? reason : new Error(String(reason)), {
        type: "unhandled_rejection"
      });
    };
  }

  public logEvent(eventName: string, payload: any = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "info",
      message: `Event: ${eventName}`,
      payload,
      userId: auth?.currentUser?.uid || null
    };

    this.saveLocal(entry);
    this.flushToCloud(entry);
  }

  public logError(error: Error | string, context: any = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message: error instanceof Error ? error.message : String(error),
      payload: {
        stack: error instanceof Error ? error.stack : undefined,
        ...context
      },
      userId: auth?.currentUser?.uid || null
    };

    console.warn("[Telemetry]", entry);
    this.saveLocal(entry);
    this.flushToCloud(entry);
  }

  private saveLocal(entry: LogEntry) {
    try {
      const existing = this.getLogs();
      existing.push(entry);
      // Keep only last 100 entries locally to manage quota
      if (existing.length > 100) {
        existing.shift();
      }
      localStorage.setItem(this.localLogsKey, JSON.stringify(existing));
    } catch (err) {
      console.warn("Failed to write telemetry locally", err);
    }
  }

  public getLogs(): LogEntry[] {
    try {
      const data = localStorage.getItem(this.localLogsKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public clearLogs() {
    try {
      localStorage.removeItem(this.localLogsKey);
    } catch (err) {
      console.warn("Failed to clear local telemetry logs", err);
    }
  }

  private async flushToCloud(entry: LogEntry) {
    // Only attempt cloud flush if network is available and database is defined
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    try {
      const telemetryId = `${entry.timestamp.replace(/[^0-9]/g, "")}_${Math.random().toString(36).substr(2, 5)}`;
      const docRef = doc(db, "system_telemetry", telemetryId);
      await setDoc(docRef, entry);
    } catch (err) {
      // Slitly fallback - avoid infinite loops by not logging telemetry errors to telemetry
      console.warn("Failed to flush telemetry to Cloud Firestore", err);
    }
  }
}

export const Telemetry = TelemetryService.getInstance();
