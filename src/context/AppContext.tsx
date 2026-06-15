'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CustomUser {
  id: string;
  name: string;
  email: string;
  role: 'super_author' | 'contributor';
}

interface AppContextType {
  adminMode: boolean;
  toggleAdminMode: () => Promise<void>;
  enableAdminMode: () => void;
  adminPassword: string | null;
  isPasswordSet: boolean;
  changeAdminPassword: (currentPass: string, newPass: string) => Promise<boolean>;
  theme: Theme;
  toggleTheme: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  user: CustomUser | null;
  userRole: 'super_author' | 'contributor' | null;
  checkSession: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [userRole, setUserRole] = useState<'super_author' | 'contributor' | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Dummy variables to satisfy TypeScript interface
  const adminPassword = null;
  const isPasswordSet = true;

  // Verifies the custom session cookie
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setUserRole(data.user.role);
          setAdminMode(true); // Logged in contributors and super authors have dashboard access
        } else {
          setUser(null);
          setUserRole(null);
          setAdminMode(false);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setAdminMode(false);
      }
    } catch (err) {
      console.error('Session validation error:', err);
      setUser(null);
      setUserRole(null);
      setAdminMode(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Theme loading
  useEffect(() => {
    const storedTheme = (localStorage.getItem('kavi_theme') as Theme) || 'light';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
  }, []);

  const enableAdminMode = () => {
    setAdminMode(true);
    showToast('Admin Mode Enabled.', 'success');
  };

  // Deprecated direct supabase password changer - we will use custom API endpoints instead
  const changeAdminPassword = async (currentPass: string, newPass: string): Promise<boolean> => {
    showToast('Direct password changes are disabled. Please request a password reset instead.', 'error');
    return false;
  };

  const toggleAdminMode = async () => {
    if (adminMode || user) {
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
          setAdminMode(false);
          setUser(null);
          setUserRole(null);
          showToast('Logged out of Admin Mode.', 'info');
        } else {
          showToast('Failed to log out.', 'error');
        }
      } catch (err) {
        console.error('Logout error:', err);
        showToast('Connection error during logout.', 'error');
      }
    } else {
      // Redirect to admin dashboard where login gate will appear
      window.location.href = '/admin';
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('kavi_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <AppContext.Provider value={{ adminMode, toggleAdminMode, enableAdminMode, adminPassword, isPasswordSet, changeAdminPassword, theme, toggleTheme, toasts, showToast, user, userRole, checkSession }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
