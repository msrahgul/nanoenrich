import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/firebase'; // Your new firebase config
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes inactivity timeout

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        logout();
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
      await signInWithEmailAndPassword(auth, email, password);
      // No need to set state manually, onAuthStateChanged handles it
      return; 
    } catch (error: any) {
      console.error("Login failed", error);
      throw new Error(error.message); // Throw to be caught by the Login page
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
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