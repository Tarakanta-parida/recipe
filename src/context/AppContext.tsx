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
  theme: Theme;
  toggleTheme: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load configuration from local storage on mount
  useEffect(() => {
    const storedAdmin = localStorage.getItem('kavi_admin_mode');
    if (storedAdmin === 'true') {
      setAdminMode(true);
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

  const toggleAdminMode = () => {
    if (!adminMode) {
      const password = prompt('Enter Admin Password to enable Admin Mode:');
      if (password === null) return; // User cancelled
      if (password === 'admin123') {
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
    <AppContext.Provider value={{ adminMode, toggleAdminMode, enableAdminMode, theme, toggleTheme, toasts, showToast }}>
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
