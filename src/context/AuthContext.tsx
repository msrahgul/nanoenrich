import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, googleProvider } from '@/firebase'; // Import provider
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>; // Add type definition
  logout: (showToast?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes inactivity timeout

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(['nanoenrich@gmail.com']);

  // 0. Listen for Authorized Emails from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'authorized_users'), (snapshot) => {
      const emails = snapshot.docs.map(doc => doc.id.toLowerCase());
      // Ensure default is always there
      if (!emails.includes('nanoenrich@gmail.com')) {
        emails.push('nanoenrich@gmail.com');
      }
      setAuthorizedEmails(emails);
    });
    return () => unsub();
  }, []);

  // 1. Listen for Firebase Auth State Changes (Handles Refresh Automatically)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Auto Logout on Inactivity (Business Rule)
  useEffect(() => {
    if (!user) return;

    let logoutTimer: NodeJS.Timeout;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        logout(false); // Logout without showing the default success toast
        toast({
          title: "Session Expired",
          description: "Logged out due to inactivity.",
          variant: "destructive",
        });
      }, SESSION_DURATION);
    };

    // Activity events
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      // 1. Business Rule: Check if email is in the allowed list before attempting login
      if (!authorizedEmails.includes(email)) {
        throw new Error("Unauthorized: Access restricted");
      }

      await signInWithEmailAndPassword(auth, email, password);
      // No need to set state manually, onAuthStateChanged handles it
      return;
    } catch (error: any) {
      console.error("Login failed", error);
      // Keep shared error message for unauthorized, otherwise generic
      if (error.message === "Unauthorized: Access restricted") {
        throw error;
      }
      throw new Error("Invalid email or password");
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Business Rule: Allow ONLY specified admin emails
      if (!user.email || !authorizedEmails.includes(user.email)) {
        await signOut(auth); // Immediately sign out unauthorized users
        throw new Error("Unauthorized: Access restricted");
      }
    } catch (error: any) {
      console.error("Google Login failed", error);
      throw error;
    }
  };

  const logout = async (showToast = true) => {
    try {
      await signOut(auth);
      if (showToast) {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      isLoading,
      login,
      loginWithGoogle, // Provide the new function
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};