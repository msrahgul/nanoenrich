import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // 1. Check for existing session on page load
    useEffect(() => {
        const storedAuth = localStorage.getItem('isAdminAuthenticated');
        const loginTimestamp = localStorage.getItem('loginTimestamp');

        if (storedAuth === 'true' && loginTimestamp) {
            const now = Date.now();
            const elapsedTime = now - parseInt(loginTimestamp, 10);

            if (elapsedTime < SESSION_DURATION) {
                setIsAuthenticated(true);
            } else {
                logout(); // Session expired
            }
        }
        setIsLoading(false);
    }, []);

    // 2. Auto Logout on Inactivity
    useEffect(() => {
        if (!isAuthenticated) return;

        let logoutTimer: NodeJS.Timeout;

        const resetTimer = () => {
            if (logoutTimer) clearTimeout(logoutTimer);

            // Update timestamp on activity to keep session valid across reloads if needed
            localStorage.setItem('loginTimestamp', Date.now().toString());

            logoutTimer = setTimeout(() => {
                logout();
                toast({
                    title: "Session Expired",
                    description: "You have been logged out due to inactivity.",
                    variant: "destructive",
                });
            }, SESSION_DURATION);
        };

        // Events to detect activity
        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        // Attach listeners
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Initial start
        resetTimer();

        // Cleanup
        return () => {
            if (logoutTimer) clearTimeout(logoutTimer);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [isAuthenticated]);

    const login = (username: string, password: string) => {
        if (username === 'admin' && password === 'admin123') {
            setIsAuthenticated(true);
            localStorage.setItem('isAdminAuthenticated', 'true');
            localStorage.setItem('loginTimestamp', Date.now().toString());
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAdminAuthenticated');
        localStorage.removeItem('loginTimestamp');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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