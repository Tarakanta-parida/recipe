'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  adminMode: boolean;
  toggleAdminMode: () => void;
  enableAdminMode: () => void;
  adminPassword: string | null;
  isPasswordSet: boolean;
  changeAdminPassword: (newPass: string) => void;
  theme: Theme;
  toggleTheme: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [isPasswordSet, setIsPasswordSet] = useState<boolean>(true); // Assume true initially to avoid flicker, then update in useEffect
  const [theme, setTheme] = useState<Theme>('light');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load configuration from local storage on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem('kavi_admin_mode');
    if (storedAdmin === 'true') {
      setAdminMode(true);
    }

    const storedPassword = localStorage.getItem('kavi_admin_password');
    if (storedPassword) {
      setAdminPassword(storedPassword);
      setIsPasswordSet(true);
    } else {
      setAdminPassword(null);
      setIsPasswordSet(false);
    }

    const storedTheme = (localStorage.getItem('kavi_theme') as Theme) || 'light';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
  }, []);

  const enableAdminMode = () => {
    setAdminMode(true);
    localStorage.setItem('kavi_admin_mode', 'true');
    showToast('Admin Mode Enabled: You can now approve, edit, or delete recipes.', 'success');
  };

  const changeAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    setIsPasswordSet(true);
    localStorage.setItem('kavi_admin_password', newPass);
    showToast(isPasswordSet ? 'Admin password updated successfully!' : 'Admin password set successfully!', 'success');
  };

  const toggleAdminMode = () => {
    if (!adminMode) {
      const password = prompt('Enter Admin Password to enable Admin Mode:');
      if (password === null) return; // User cancelled
      if (password === adminPassword) {
        enableAdminMode();
      } else {
        showToast('Incorrect password.', 'error');
      }
    } else {
      setAdminMode(false);
      localStorage.setItem('kavi_admin_mode', 'false');
      showToast('Admin Mode Disabled: Switched back to public user view.', 'info');
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
    <AppContext.Provider value={{ adminMode, toggleAdminMode, enableAdminMode, adminPassword, isPasswordSet, changeAdminPassword, theme, toggleTheme, toasts, showToast }}>
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
