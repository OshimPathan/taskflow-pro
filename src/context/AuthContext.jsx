import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase.config';

const AuthContext = createContext(null);

// Demo mode flag - set to false when Firebase is configured
const USE_DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_DEMO_MODE) {
      // Demo mode: use localStorage
      const savedUser = localStorage.getItem('taskflow_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('taskflow_user');
        }
      }
      setLoading(false);
      return;
    }

    // Production mode: use Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || userData.name || 'User',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || userData.avatar || null,
          provider: firebaseUser.providerData[0]?.providerId || 'email',
          ...userData
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (USE_DEMO_MODE) {
      // Demo fallback
      const demoUser = {
        id: 'demo_' + Date.now(),
        name: 'Demo User',
        email: 'demo@taskflowpro.app',
        avatar: null,
        provider: 'demo',
      };
      setUser(demoUser);
      localStorage.setItem('taskflow_user', JSON.stringify(demoUser));
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Create/update user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL,
        provider: 'google',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }, { merge: true });

    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }, []);

  const loginWithEmail = useCallback(async (name, email, password = 'demo123456') => {
    if (USE_DEMO_MODE) {
      // Demo fallback
      const userData = {
        id: 'email_' + Date.now(),
        name: name || 'User',
        email: email,
        avatar: null,
        provider: 'email',
      };
      setUser(userData);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));
      return;
    }

    try {
      // Try to sign in first
      let result;
      try {
        result = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError) {
        // If user doesn't exist, create account
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/wrong-password') {
          result = await createUserWithEmailAndPassword(auth, email, password);

          // Update profile with name
          await firebaseUpdateProfile(result.user, { displayName: name });
        } else {
          throw signInError;
        }
      }

      // Create/update user document
      await setDoc(doc(db, 'users', result.user.uid), {
        name: name || result.user.displayName || 'User',
        email: result.user.email,
        provider: 'email',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }, { merge: true });

    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    if (USE_DEMO_MODE) {
      setUser(null);
      localStorage.removeItem('taskflow_user');
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (USE_DEMO_MODE) {
      setUser(prev => {
        const updated = { ...prev, ...updates };
        localStorage.setItem('taskflow_user', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      if (auth.currentUser) {
        // Update Firebase Auth profile
        if (updates.name) {
          await firebaseUpdateProfile(auth.currentUser, { displayName: updates.name });
        }

        // Update Firestore user document
        await setDoc(doc(db, 'users', auth.currentUser.uid), updates, { merge: true });

        // Update local state
        setUser(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, logout, updateProfile, isDemoMode: USE_DEMO_MODE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
