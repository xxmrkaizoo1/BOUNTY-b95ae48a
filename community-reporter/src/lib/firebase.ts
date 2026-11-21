import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** Firebase is used only when the required env vars are present; otherwise the app runs in local demo mode. */
export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    // Firestore rejects `undefined` fields; optional report fields may be undefined.
    ignoreUndefinedProperties: true,
    // Offline cache so the PWA keeps working without a connection.
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
}

export function getFirebase() {
  if (!auth || !db) {
    throw new Error("Firebase is not configured. Copy .env.example to .env and fill it in.");
  }
  return { auth, db };
}
