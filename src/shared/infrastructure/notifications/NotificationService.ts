import { Telemetry } from "../monitoring/Telemetry";

class NotificationEngine {
  private static instance: NotificationEngine;
  private permissionGranted: boolean = false;

  private constructor() {
    this.checkPermissionStatus();
  }

  public static getInstance(): NotificationEngine {
    if (!NotificationEngine.instance) {
      NotificationEngine.instance = new NotificationEngine();
    }
    return NotificationEngine.instance;
  }

  private checkPermissionStatus() {
    if (typeof window !== "undefined" && "Notification" in window) {
      this.permissionGranted = Notification.permission === "granted";
    }
  }

  /**
   * Request native browser/device notification permissions
   */
  public async requestPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("Notifications are not supported in this browser environment.");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === "granted";
      Telemetry.logEvent("notification_permission_requested", { result: permission });
      return this.permissionGranted;
    } catch (err) {
      Telemetry.logError("Error requesting notification permission", { error: err });
      return false;
    }
  }

  /**
   * Send a system notification or fallback gracefully to in-app banners
   */
  public send(title: string, body: string, options: NotificationOptions = {}): boolean {
    if (typeof window === "undefined") return false;

    // Log the notification event
    Telemetry.logEvent("notification_sent", { title, body });

    // 1. Try sending native browser/system notification if permitted
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const icon = "/assets/icon.png"; // Standard mobile layout asset
        new Notification(title, {
          body,
          icon,
          ...options
        });
        return true;
      } catch (err) {
        console.warn("Native Notification failed, falling back to in-app notification", err);
      }
    }

    // 2. Dispatch a global custom event for the application to render an elegant custom in-app snackbar
    const customEvent = new CustomEvent("treinopro_inapp_notification", {
      detail: { title, body, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(customEvent);

    return false;
  }

  /**
   * Trigger training specific reminder notification
   */
  public remindTraining(studentName: string, workoutName: string) {
    this.send(
      `Treino Agendado: ${workoutName}`,
      `Olá ${studentName}, seu treino já está disponível! Vamos manter a consistência hoje? 🔥`
    );
  }

  /**
   * Trigger payment specific notification
   */
  public remindPayment(studentName: string, dueDate: string) {
    this.send(
      `Confirmação de Assinatura`,
      `Olá ${studentName}, seu plano vence em ${dueDate}. Regularize para não perder acesso aos seus treinos e dietas.`
    );
  }

  /**
   * Trigger chat/new message notification
   */
  public newMessage(senderName: string, messagePreview: string) {
    this.send(
      `Nova mensagem de ${senderName}`,
      messagePreview
    );
  }
}

export const NotificationService = NotificationEngine.getInstance();
