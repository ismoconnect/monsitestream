// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGv68IMx8ELeS-ydegez4AhBWfTS2jbyA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "monstream-c47e1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "monstream-c47e1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "monstream-c47e1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "990068847901",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:990068847901:web:e023ee8b245727f1a95df4"
};

// Initialize Firebase
let app;
let db, storage, functions, auth;

try {
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  auth = getAuth(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create mock services for development
  db = null;
  storage = null;
  functions = null;
  auth = null;
}

export { db, storage, functions, auth };

// Connect to emulators in development (DISABLED - using production Firebase)
// if (import.meta.env.DEV) {
//   try {
//     if (db) connectFirestoreEmulator(db, 'localhost', 8080);
//     if (storage) connectStorageEmulator(storage, 'localhost', 9199);
//     if (functions) connectFunctionsEmulator(functions, 'localhost', 5001);
//   } catch (error) {
//     console.log('Emulators already connected or not available');
//   }
// }

export default app;
