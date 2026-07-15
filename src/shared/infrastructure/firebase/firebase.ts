/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeFirestore, persistentLocalCache, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCvwcIa2TmO2M1roel8Dz8hljvDbQPdwTQ",
  authDomain: "gen-lang-client-0593011966.firebaseapp.com",
  projectId: "gen-lang-client-0593011966",
  storageBucket: "gen-lang-client-0593011966.firebasestorage.app",
  messagingSenderId: "502096018820",
  appId: "1:502096018820:web:53c3f17aec0cc1f615f1d1"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with local persistent cache (Offline Persistence) with safe fallbacks
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache()
  }, "ai-studio-treinopro-524f80f6-512c-48e3-a990-cba57700b45b");
} catch (error) {
  console.warn("Firestore offline persistence initialization failed, falling back...", error);
  try {
    db = getFirestore(app, "ai-studio-treinopro-524f80f6-512c-48e3-a990-cba57700b45b");
  } catch (err2) {
    db = getFirestore(app);
  }
}

const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { app, auth, db, storage };
