'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/db';

type Theme = 'light' | 'dark';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
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
  user: User | null;
  userRole: 'admin' | 'editor' | 'pending' | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'pending' | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Dummy state variables to satisfy TypeScript interface
  const adminPassword = null;
  const isPasswordSet = true;

  // Listen to Supabase Auth state changes and load roles
  useEffect(() => {
    const client = supabaseClient;
    if (!client) {
      // If Supabase is not configured, fall back to mock adminMode
      const storedAdmin = localStorage.getItem('kavi_admin_mode');
      if (storedAdmin === 'true') {
        setAdminMode(true);
      }
      return;
    }

    const checkUserRoleAndMode = async (currentUser: User | null) => {
      if (!currentUser) {
        setAdminMode(false);
        setUserRole(null);
        return;
      }

      try {
        const { data, error } = await client
          .from('user_roles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching role:', error);
          setAdminMode(false);
          setUserRole(null);
          return;
        }

        const role = data?.role || 'pending';
        setUserRole(role);

        if (role === 'admin' || role === 'editor') {
          setAdminMode(true);
        } else {
          setAdminMode(false);
          showToast('Your registration is pending administrator confirmation.', 'info');
        }
      } catch (err) {
        console.error('Role check failed:', err);
        setAdminMode(false);
        setUserRole(null);
      }
    };

    // Get current session
    client.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkUserRoleAndMode(currentUser);
    });

    // Listen to changes
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkUserRoleAndMode(currentUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Theme loading
  useEffect(() => {
    const storedTheme = (localStorage.getItem('kavi_theme') as Theme) || 'light';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
  }, []);

  const enableAdminMode = () => {
    setAdminMode(true);
    localStorage.setItem('kavi_admin_mode', 'true');
    showToast('Admin Mode Enabled.', 'success');
  };

  const changeAdminPassword = async (currentPass: string, newPass: string): Promise<boolean> => {
    if (!supabaseClient) {
      showToast('Supabase is not configured.', 'error');
      return false;
    }
    if (!user || !user.email) {
      showToast('You must be logged in to change the password.', 'error');
      return false;
    }

    try {
      // Re-authenticate user to verify current password
      const { error: reAuthError } = await supabaseClient.auth.signInWithPassword({
        email: user.email,
        password: currentPass
      });

      if (reAuthError) {
        showToast('Current password is incorrect.', 'error');
        return false;
      }

      // Update password in Supabase
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password: newPass
      });

      if (updateError) {
        showToast(updateError.message, 'error');
        return false;
      }

      showToast('Admin password updated successfully in Supabase!', 'success');
      return true;
    } catch (err) {
      console.error('Password change error:', err);
      showToast('Failed to change password.', 'error');
      return false;
    }
  };

  const toggleAdminMode = async () => {
    if (adminMode || user) {
      if (supabaseClient) {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
          showToast(error.message, 'error');
        } else {
          setAdminMode(false);
          setUser(null);
          setUserRole(null);
          showToast('Logged out of Admin Mode.', 'info');
        }
      } else {
        setAdminMode(false);
        localStorage.setItem('kavi_admin_mode', 'false');
        showToast('Admin Mode Disabled.', 'info');
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
    <AppContext.Provider value={{ adminMode, toggleAdminMode, enableAdminMode, adminPassword, isPasswordSet, changeAdminPassword, theme, toggleTheme, toasts, showToast, user, userRole }}>
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
