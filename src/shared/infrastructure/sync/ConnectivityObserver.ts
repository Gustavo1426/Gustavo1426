/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type ConnectionCallback = (isOnline: boolean) => void;

/**
 * Observes the network connectivity state and dispatches events when the connection changes.
 */
export class ConnectivityObserver {
  private static listeners: ConnectionCallback[] = [];

  public static initialize(): void {
    window.addEventListener("online", () => this.notify(true));
    window.addEventListener("offline", () => this.notify(false));
  }

  public static isOnline(): boolean {
    return navigator.onLine;
  }

  public static subscribe(callback: ConnectionCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private static notify(isOnline: boolean): void {
    console.log(`[ConnectivityObserver] Connection changed: ${isOnline ? "ONLINE" : "OFFLINE"}`);
    this.listeners.forEach((listener) => {
      try {
        listener(isOnline);
      } catch (err) {
        console.error("[ConnectivityObserver] Error in subscriber:", err);
      }
    });
  }
}
