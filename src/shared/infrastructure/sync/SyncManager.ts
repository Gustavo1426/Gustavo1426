/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, auth, handleFirestoreError, OperationType } from "../firebase/firebase";
import { collection, doc, getDocs, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { SyncQueue } from "./SyncQueue";

interface SyncMapping {
  localStorageKey: string;
  firestoreCollection: string;
  idField: string;
}

const SYNC_MAPPINGS: SyncMapping[] = [
  { localStorageKey: "treinopro_students", firestoreCollection: "students", idField: "id" },
  { localStorageKey: "treinopro_workouts", firestoreCollection: "workouts", idField: "id" },
  { localStorageKey: "treinopro_diets", firestoreCollection: "diets", idField: "id" },
  { localStorageKey: "treinopro_payments", firestoreCollection: "payments", idField: "id" },
  { localStorageKey: "treinopro_plans", firestoreCollection: "plans", idField: "id" },
  { localStorageKey: "treinopro_chat_histories", firestoreCollection: "chat_histories", idField: "id" },
  { localStorageKey: "treinopro_students_gamification", firestoreCollection: "students_gamification", idField: "id" },
  { localStorageKey: "treinopro_challenges", firestoreCollection: "challenges", idField: "id" }
];

const SINGLE_OBJECT_MAPPINGS = [
  { localStorageKey: "treinopro_settings", firestoreCollection: "settings", docId: "global_settings" }
];

/**
 * Manages the synchronization of data between the local cache/storage and the remote server/Firebase database.
 */
export class SyncManager {
  private static instance: SyncManager;
  private isSyncing: boolean = false;
  private lastSyncedTime: string | null = null;

  private constructor() {
    const savedTime = localStorage.getItem("treinopro_last_synced");
    if (savedTime) {
      this.lastSyncedTime = savedTime;
    }
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Helper to get timestamps in milliseconds.
   */
  private getTimestamp(item: any): number {
    if (!item) return 0;
    const dateStr = item.lastUpdated || item.updatedAt || item.timestamp;
    if (!dateStr) return 0;
    return new Date(dateStr).getTime();
  }

  /**
   * Triggers the synchronization process.
   */
  public async sync(): Promise<boolean> {
    if (!auth?.currentUser) {
      console.log("[SyncManager] Skipping sync: No authenticated user session active. Operating in offline/local-only mode.");
      return false;
    }

    if (this.isSyncing) {
      console.log("[SyncManager] Sync is already in progress.");
      return false;
    }

    this.isSyncing = true;
    console.log("[SyncManager] Starting bidirectional synchronization with Firestore...");

    try {
      // 0. Flush the SyncQueue (Pending offline tasks)
      console.log("[SyncManager] Flushing pending offline tasks from SyncQueue...");
      const pendingTasks = SyncQueue.getTasks();
      if (pendingTasks.length > 0) {
        for (const task of pendingTasks) {
          try {
            const docRef = doc(db, task.collection, task.payload.id || task.payload.docId || task.id);
            if (task.action === "CREATE" || task.action === "UPDATE") {
              try {
                await setDoc(docRef, task.payload);
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, task.collection);
              }
            } else if (task.action === "DELETE") {
              try {
                await deleteDoc(docRef);
              } catch (err) {
                handleFirestoreError(err, OperationType.DELETE, task.collection);
              }
            }
            console.log(`[SyncManager] Processed queued task: ${task.action} on ${task.collection}`);
          } catch (err) {
            console.error(`[SyncManager] Failed to process queued task ${task.id}:`, err);
          }
        }
        SyncQueue.clear();
      }

      // 1. Sync Array-based collections
      for (const mapping of SYNC_MAPPINGS) {
        console.log(`[SyncManager] Syncing collection: ${mapping.firestoreCollection}...`);
        
        // Load local items
        const localData = localStorage.getItem(mapping.localStorageKey);
        const localItems: any[] = localData ? JSON.parse(localData) : [];
        const localMap = new Map<string, any>();
        
        localItems.forEach((item) => {
          const id = item[mapping.idField];
          if (id) localMap.set(String(id), item);
        });

        // Load remote items from Firestore
        let querySnapshot;
        try {
          querySnapshot = await getDocs(collection(db, mapping.firestoreCollection));
        } catch (err) {
          const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
          if (errStr.includes("permission") || errStr.includes("insufficient") || errStr.includes("not-found")) {
            console.warn(`[SyncManager] Permission denied or missing collection: ${mapping.firestoreCollection}. Skipping sync for this collection. (Normal for student or guest roles)`);
            continue;
          } else {
            handleFirestoreError(err, OperationType.LIST, mapping.firestoreCollection);
          }
        }

        const remoteMap = new Map<string, any>();
        
        querySnapshot.forEach((doc) => {
          remoteMap.set(doc.id, doc.data());
        });

        const mergedItems: any[] = [];
        const itemsToUpload: any[] = [];

        // Compare and resolve conflicts (Last Write Wins)
        localMap.forEach((localItem, id) => {
          const remoteItem = remoteMap.get(id);
          if (!remoteItem) {
            // Document only exists locally - upload it
            itemsToUpload.push({ id, data: localItem });
            mergedItems.push(localItem);
          } else {
            // Document exists in both - resolve conflict
            const localTs = this.getTimestamp(localItem);
            const remoteTs = this.getTimestamp(remoteItem);

            if (localTs >= remoteTs) {
              itemsToUpload.push({ id, data: localItem });
              mergedItems.push(localItem);
            } else {
              mergedItems.push(remoteItem);
            }
          }
        });

        // Add remote documents that do not exist locally
        remoteMap.forEach((remoteItem, id) => {
          if (!localMap.has(id)) {
            mergedItems.push(remoteItem);
          }
        });

        // Upload any new or updated documents to Firestore
        for (const item of itemsToUpload) {
          try {
            await setDoc(doc(db, mapping.firestoreCollection, item.id), item.data);
          } catch (writeErr) {
            const errStr = String(writeErr instanceof Error ? writeErr.message : writeErr).toLowerCase();
            if (errStr.includes("permission") || errStr.includes("insufficient")) {
              console.warn(`[SyncManager] Permission denied writing item ${item.id} to ${mapping.firestoreCollection}.`);
            } else {
              console.error(`[SyncManager] Error uploading item ${item.id} to ${mapping.firestoreCollection}:`, writeErr);
              handleFirestoreError(writeErr, OperationType.WRITE, mapping.firestoreCollection);
            }
          }
        }

        // Save resolved state to localStorage
        localStorage.setItem(mapping.localStorageKey, JSON.stringify(mergedItems));
      }

      // 2. Sync Single Object-based collections (e.g. Settings)
      for (const mapping of SINGLE_OBJECT_MAPPINGS) {
        console.log(`[SyncManager] Syncing document: ${mapping.firestoreCollection}/${mapping.docId}...`);
        
        const localData = localStorage.getItem(mapping.localStorageKey);
        const localObj = localData ? JSON.parse(localData) : null;

        const docRef = doc(db, mapping.firestoreCollection, mapping.docId);
        let docSnap;
        try {
          docSnap = await getDoc(docRef);
        } catch (err) {
          const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
          if (errStr.includes("permission") || errStr.includes("insufficient") || errStr.includes("not-found")) {
            console.warn(`[SyncManager] Permission denied or document missing: ${mapping.firestoreCollection}/${mapping.docId}. Skipping sync for this document.`);
            continue;
          } else {
            handleFirestoreError(err, OperationType.GET, mapping.firestoreCollection);
          }
        }
        
        const remoteObj = docSnap.exists() ? docSnap.data() : null;

        if (localObj && !remoteObj) {
          // Local exists, remote doesn't -> save local to remote
          try {
            await setDoc(docRef, localObj);
          } catch (err) {
            const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
            if (errStr.includes("permission") || errStr.includes("insufficient")) {
              console.warn(`[SyncManager] Permission denied saving local settings to remote.`);
            } else {
              handleFirestoreError(err, OperationType.WRITE, mapping.firestoreCollection);
            }
          }
        } else if (!localObj && remoteObj) {
          // Remote exists, local doesn't -> save remote to local
          localStorage.setItem(mapping.localStorageKey, JSON.stringify(remoteObj));
        } else if (localObj && remoteObj) {
          // Both exist -> compare timestamp and resolve
          const localTs = this.getTimestamp(localObj);
          const remoteTs = this.getTimestamp(remoteObj);

          if (localTs >= remoteTs) {
            try {
              await setDoc(docRef, localObj);
            } catch (err) {
              const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
              if (errStr.includes("permission") || errStr.includes("insufficient")) {
                console.warn(`[SyncManager] Permission denied updating settings.`);
              } else {
                handleFirestoreError(err, OperationType.WRITE, mapping.firestoreCollection);
              }
            }
          } else {
            localStorage.setItem(mapping.localStorageKey, JSON.stringify(remoteObj));
          }
        }
      }

      // 3. Sync Student-Specific Periodizations
      console.log("[SyncManager] Syncing student-specific periodizations...");
      try {
        const studentsData = localStorage.getItem("treinopro_students");
        const students: any[] = studentsData ? JSON.parse(studentsData) : [];
        for (const student of students) {
          if (!student.id) continue;
          const localKey = `treinopro_periodization_${student.id}`;
          const localData = localStorage.getItem(localKey);
          const localObj = localData ? JSON.parse(localData) : null;

          const docRef = doc(db, "periodizations", student.id);
          let docSnap;
          try {
            docSnap = await getDoc(docRef);
          } catch (err) {
            const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
            if (errStr.includes("permission") || errStr.includes("insufficient") || errStr.includes("not-found")) {
              console.warn(`[SyncManager] Permission denied or document missing for periodization: periodizations/${student.id}. Skipping.`);
              continue;
            } else {
              handleFirestoreError(err, OperationType.GET, `periodizations/${student.id}`);
            }
          }

          const remoteObj = docSnap.exists() ? docSnap.data() : null;

          if (localObj && !remoteObj) {
            try {
              await setDoc(docRef, localObj);
            } catch (err) {
              const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
              if (errStr.includes("permission") || errStr.includes("insufficient")) {
                console.warn(`[SyncManager] Permission denied saving local periodization to remote for student ${student.id}.`);
              } else {
                handleFirestoreError(err, OperationType.WRITE, `periodizations/${student.id}`);
              }
            }
          } else if (!localObj && remoteObj) {
            localStorage.setItem(localKey, JSON.stringify(remoteObj));
          } else if (localObj && remoteObj) {
            const localTs = this.getTimestamp(localObj);
            const remoteTs = this.getTimestamp(remoteObj);

            if (localTs >= remoteTs) {
              try {
                await setDoc(docRef, localObj);
              } catch (err) {
                const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
                if (errStr.includes("permission") || errStr.includes("insufficient")) {
                  console.warn(`[SyncManager] Permission denied updating periodization for student ${student.id}.`);
                } else {
                  handleFirestoreError(err, OperationType.WRITE, `periodizations/${student.id}`);
                }
              }
            } else {
              localStorage.setItem(localKey, JSON.stringify(remoteObj));
            }
          }
        }
      } catch (err) {
        console.error("[SyncManager] Failed to sync student-specific periodizations:", err);
      }

      // 4. Sync Student-Specific Postural Evaluations
      console.log("[SyncManager] Syncing student-specific postural evaluations...");
      try {
        const studentsData = localStorage.getItem("treinopro_students");
        const students: any[] = studentsData ? JSON.parse(studentsData) : [];
        for (const student of students) {
          if (!student.id) continue;
          const localKey = `treinopro_postural_evaluations_${student.id}`;
          const localData = localStorage.getItem(localKey);
          const localArray = localData ? JSON.parse(localData) : null;

          const docRef = doc(db, "postural_evaluations", student.id);
          let docSnap;
          try {
            docSnap = await getDoc(docRef);
          } catch (err) {
            const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
            if (errStr.includes("permission") || errStr.includes("insufficient") || errStr.includes("not-found")) {
              console.warn(`[SyncManager] Permission denied or document missing for postural evaluations: postural_evaluations/${student.id}. Skipping.`);
              continue;
            } else {
              handleFirestoreError(err, OperationType.GET, `postural_evaluations/${student.id}`);
            }
          }

          const remoteObj = docSnap.exists() ? docSnap.data() : null;

          if (localArray && !remoteObj) {
            try {
              await setDoc(docRef, {
                studentId: student.id,
                evaluations: localArray,
                lastUpdated: new Date().toISOString()
              });
            } catch (err) {
              const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
              if (errStr.includes("permission") || errStr.includes("insufficient")) {
                console.warn(`[SyncManager] Permission denied saving local postural evaluations to remote for student ${student.id}.`);
              } else {
                handleFirestoreError(err, OperationType.WRITE, `postural_evaluations/${student.id}`);
              }
            }
          } else if (!localArray && remoteObj) {
            if (remoteObj.evaluations) {
              localStorage.setItem(localKey, JSON.stringify(remoteObj.evaluations));
            }
          } else if (localArray && remoteObj) {
            const localTs = localArray.reduce((max: number, ev: any) => {
              const evTs = ev.timestamp || (ev.date ? new Date(ev.date).getTime() : 0);
              return evTs > max ? evTs : max;
            }, 0) || 1;
            
            const remoteTs = (remoteObj.evaluations || []).reduce((max: number, ev: any) => {
              const evTs = ev.timestamp || (ev.date ? new Date(ev.date).getTime() : 0);
              return evTs > max ? evTs : max;
            }, 0) || (remoteObj.lastUpdated ? new Date(remoteObj.lastUpdated).getTime() : 0);

            if (localTs >= remoteTs) {
              try {
                await setDoc(docRef, {
                  studentId: student.id,
                  evaluations: localArray,
                  lastUpdated: new Date().toISOString()
                });
              } catch (err) {
                const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
                if (errStr.includes("permission") || errStr.includes("insufficient")) {
                  console.warn(`[SyncManager] Permission denied updating postural evaluations for student ${student.id}.`);
                } else {
                  handleFirestoreError(err, OperationType.WRITE, `postural_evaluations/${student.id}`);
                }
              }
            } else {
              if (remoteObj.evaluations) {
                localStorage.setItem(localKey, JSON.stringify(remoteObj.evaluations));
              }
            }
          }
        }
      } catch (err) {
        console.error("[SyncManager] Failed to sync student-specific postural evaluations:", err);
      }

      // 5. Sync Student-Specific Physical Evaluations
      console.log("[SyncManager] Syncing student-specific physical evaluations...");
      try {
        const studentsData = localStorage.getItem("treinopro_students");
        const students: any[] = studentsData ? JSON.parse(studentsData) : [];
        for (const student of students) {
          if (!student.id) continue;
          const localKey = `coach_physical_evaluations_${student.id}`;
          const localData = localStorage.getItem(localKey);
          const localArray = localData ? JSON.parse(localData) : null;

          const docRef = doc(db, "physical_evaluations", student.id);
          let docSnap;
          try {
            docSnap = await getDoc(docRef);
          } catch (err) {
            const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
            if (errStr.includes("permission") || errStr.includes("insufficient") || errStr.includes("not-found")) {
              console.warn(`[SyncManager] Permission denied or document missing for physical evaluations: physical_evaluations/${student.id}. Skipping.`);
              continue;
            } else {
              handleFirestoreError(err, OperationType.GET, `physical_evaluations/${student.id}`);
            }
          }

          const remoteObj = docSnap.exists() ? docSnap.data() : null;

          if (localArray && !remoteObj) {
            try {
              await setDoc(docRef, {
                studentId: student.id,
                evaluations: localArray,
                lastUpdated: new Date().toISOString()
              });
            } catch (err) {
              const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
              if (errStr.includes("permission") || errStr.includes("insufficient")) {
                console.warn(`[SyncManager] Permission denied saving local physical evaluations to remote for student ${student.id}.`);
              } else {
                handleFirestoreError(err, OperationType.WRITE, `physical_evaluations/${student.id}`);
              }
            }
          } else if (!localArray && remoteObj) {
            if (remoteObj.evaluations) {
              localStorage.setItem(localKey, JSON.stringify(remoteObj.evaluations));
            }
          } else if (localArray && remoteObj) {
            const localTs = localArray.reduce((max: number, ev: any) => {
              const evTs = ev.timestamp || (ev.date ? new Date(ev.date).getTime() : 0);
              return evTs > max ? evTs : max;
            }, 0) || 1;
            
            const remoteTs = (remoteObj.evaluations || []).reduce((max: number, ev: any) => {
              const evTs = ev.timestamp || (ev.date ? new Date(ev.date).getTime() : 0);
              return evTs > max ? evTs : max;
            }, 0) || (remoteObj.lastUpdated ? new Date(remoteObj.lastUpdated).getTime() : 0);

            if (localTs >= remoteTs) {
              try {
                await setDoc(docRef, {
                  studentId: student.id,
                  evaluations: localArray,
                  lastUpdated: new Date().toISOString()
                });
              } catch (err) {
                const errStr = String(err instanceof Error ? err.message : err).toLowerCase();
                if (errStr.includes("permission") || errStr.includes("insufficient")) {
                  console.warn(`[SyncManager] Permission denied updating physical evaluations for student ${student.id}.`);
                } else {
                  handleFirestoreError(err, OperationType.WRITE, `physical_evaluations/${student.id}`);
                }
              }
            } else {
              if (remoteObj.evaluations) {
                localStorage.setItem(localKey, JSON.stringify(remoteObj.evaluations));
              }
            }
          }
        }
      } catch (err) {
        console.error("[SyncManager] Failed to sync student-specific physical evaluations:", err);
      }

      this.lastSyncedTime = new Date().toISOString();
      localStorage.setItem("treinopro_last_synced", this.lastSyncedTime);

      console.log("[SyncManager] Bidirectional sync completed successfully.");

      // Dispatch custom event to notify React components that data has synchronized
      window.dispatchEvent(new Event("treinopro_sync_completed"));

      return true;
    } catch (error) {
      console.error("[SyncManager] Sync failed:", error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  public getSyncStatus(): { isSyncing: boolean; lastSynced: string | null } {
    return {
      isSyncing: this.isSyncing,
      lastSynced: this.lastSyncedTime,
    };
  }
}
