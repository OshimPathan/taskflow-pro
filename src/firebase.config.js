import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with offline persistence (with fallback)
let firestoreDb;
try {
    firestoreDb = initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    });
} catch (err) {
    // Fallback: if persistence fails (e.g., already initialized, unsupported browser)
    console.warn('Firestore persistence init failed, using default:', err.message);
    firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

// Initialize Analytics (only in production, lazy load to avoid crashes)
export let analytics = null;
if (import.meta.env.PROD && typeof window !== 'undefined') {
    try {
        import('firebase/analytics').then(({ getAnalytics }) => {
            analytics = getAnalytics(app);
        }).catch(() => { });
    } catch (e) {
        // Analytics not critical
    }
}

export default app;
