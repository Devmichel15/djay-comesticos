// ============================================================================
// Firebase Configuration & Initialization
// ============================================================================
// Firebase v12+ | Offline-First Architecture

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCnjZStHhSpK1OzWa9klsL249xts3TJfI8",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "backend-djay.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "backend-djay",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "backend-djay.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1020937753704",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:1020937753704:web:efaef92999c8c12a2497dd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3ZX7MLRF4X",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// ============================================================================
// Firestore with Persistent Cache (v12+ API)
// ============================================================================
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Initialize Firebase Storage (Explicit Bucket)
// ⚠️ FIX: Forcing bucket to avoid auto-detect issues or wrong region
const storage = getStorage(app, "gs://backend-djay.appspot.com");

// Export Firebase instances
export { app, auth, db, storage };

// ============================================================================
// Simple Network State (non-blocking)
// ============================================================================
export const isOnline = () => {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
};
