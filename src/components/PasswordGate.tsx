'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { supabaseClient } from '@/lib/db';
import { Lock, Mail, Key, ArrowRight, Eye, EyeOff, LogIn, UserPlus, Loader2 } from 'lucide-react';

interface PasswordGateProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

type AuthTab = 'login' | 'register';

export default function PasswordGate({ children, title, description }: PasswordGateProps) {
  const { adminMode, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus input on tab change
  useEffect(() => {
    if (!adminMode && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [adminMode, activeTab]);

  if (adminMode) {
    return <>{children}</>;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseClient) {
      setFormError('Supabase is not configured.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(error.message);
        showToast(error.message, 'error');
      } else {
        showToast('Signed in successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      setFormError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseClient) {
      setFormError('Supabase is not configured.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(error.message);
        showToast(error.message, 'error');
      } else if (data?.user && data.session === null) {
        // Confirmation email might be enabled
        showToast('Account created! Please check your email for verification link.', 'info');
        setActiveTab('login');
      } else {
        showToast('Account created and signed in!', 'success');
      }
    } catch (err) {
      console.error(err);
      setFormError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12 md:py-20 flex flex-col items-center gap-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm animate-pulse">
        <Lock className="w-8 h-8" />
      </div>
      
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {activeTab === 'login' ? title : 'Create Admin Account'}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          {activeTab === 'login' 
            ? description 
            : 'Register a new administrator credential in Supabase Auth to manage recipes.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary/40 border border-border rounded-xl p-1 w-full gap-1">
        <button
          onClick={() => {
            setActiveTab('login');
            setFormError('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'login'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LogIn className="w-4 h-4" /> Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab('register');
            setFormError('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'register'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Register
        </button>
      </div>
      
      {formError && (
        <div className="w-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold p-3.5 rounded-xl animate-fade-in text-center">
          {formError}
        </div>
      )}

      {activeTab === 'login' ? (
        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              ref={emailInputRef}
              type="email"
              required
              placeholder="Admin Email"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 mt-1 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="w-full flex flex-col gap-4">
          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              ref={emailInputRef}
              type="email"
              required
              placeholder="Admin Email"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Create Password"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative w-full">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Confirm Password"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 mt-1 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
              </>
            ) : (
              <>
                Create Admin Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
