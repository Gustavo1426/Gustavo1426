/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SyncTask {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  collection: string;
  payload: any;
  timestamp: number;
}

/**
 * Manages the queue of database/API updates waiting to be synced to the backend.
 */
export class SyncQueue {
  private static STORAGE_KEY = "treinopro_sync_queue";

  public static getTasks(): SyncTask[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  public static enqueue(task: Omit<SyncTask, "id" | "timestamp">): void {
    const tasks = this.getTasks();
    const newTask: SyncTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    tasks.push(newTask);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    console.log(`[SyncQueue] Enqueued task: ${newTask.action} in ${newTask.collection}`);
  }

  public static dequeue(): SyncTask | null {
    const tasks = this.getTasks();
    if (tasks.length === 0) return null;
    const task = tasks.shift() || null;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    return task;
  }

  public static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
