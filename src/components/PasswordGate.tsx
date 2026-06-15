'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, Mail, Key, ArrowRight, Eye, EyeOff, LogIn, UserPlus, HelpCircle, Loader2, Check, X } from 'lucide-react';

interface PasswordGateProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

type AuthTab = 'login' | 'register' | 'request-reset' | 'reset-password';

export default function PasswordGate({ children, title, description }: PasswordGateProps) {
  const { adminMode, showToast, checkSession } = useApp();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const emailInputRef = useRef<HTMLInputElement>(null);

  // Check URL query parameters for reset_token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('reset_token');
      if (token) {
        setResetToken(token);
        setActiveTab('reset-password');
      }
    }
  }, []);

  // Focus input on tab change
  useEffect(() => {
    if (!adminMode && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [adminMode, activeTab]);

  // Password Validation helper
  const isPasswordValid = (pass: string) => {
    if (pass.length < 8) return false;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  };

  if (adminMode) {
    return <>{children}</>;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Invalid email or password');
        showToast(data.error || 'Invalid email or password', 'error');
      } else {
        showToast('Signed in successfully!', 'success');
        await checkSession(); // Reload context session and unlock dashboard
      }
    } catch (err) {
      console.error(err);
      setFormError('Connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    setFormSuccess('');

    if (!isPasswordValid(password)) {
      setFormError('Password does not meet requirements.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Registration failed');
        showToast(data.error || 'Registration failed', 'error');
      } else {
        showToast('Account registered successfully!', 'success');
        await checkSession(); // Automatically log in and unlock
      }
    } catch (err) {
      console.error(err);
      setFormError('Connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch('/api/auth/request-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to submit request');
        showToast(data.error || 'Failed to submit request', 'error');
      } else {
        setFormSuccess(data.message);
        showToast('Reset request submitted!', 'success');
        setName('');
        setEmail('');
        setReason('');
      }
    } catch (err) {
      console.error(err);
      setFormError('Connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    setFormSuccess('');

    if (!resetToken) {
      setFormError('No reset token provided.');
      setLoading(false);
      return;
    }

    if (!isPasswordValid(password)) {
      setFormError('Password does not meet requirements.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to reset password');
        showToast(data.error || 'Failed to reset password', 'error');
      } else {
        setFormSuccess('Password reset successfully! You can now log in.');
        showToast('Password reset successfully!', 'success');
        setPassword('');
        setConfirmPassword('');
        // Clean URL parameter
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setTimeout(() => {
          setActiveTab('login');
          setFormSuccess('');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setFormError('Connection error occurred.');
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
          {activeTab === 'login' && title}
          {activeTab === 'register' && 'Register Author/Contributor'}
          {activeTab === 'request-reset' && 'Request Password Change'}
          {activeTab === 'reset-password' && 'Set New Password'}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          {activeTab === 'login' && description}
          {activeTab === 'register' && 'Create your kitchen account to begin contributing recipes.'}
          {activeTab === 'request-reset' && 'Submit a request to Super Authors to reset your account password.'}
          {activeTab === 'reset-password' && 'Enter your secure new password details below.'}
        </p>
      </div>

      {/* Tabs */}
      {activeTab !== 'reset-password' && (
        <div className="flex bg-secondary/40 border border-border rounded-xl p-1 w-full gap-1">
          <button
            onClick={() => {
              setActiveTab('login');
              setFormError('');
              setFormSuccess('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setFormError('');
              setFormSuccess('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Register
          </button>
          <button
            onClick={() => {
              setActiveTab('request-reset');
              setFormError('');
              setFormSuccess('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'request-reset' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Reset Req
          </button>
        </div>
      )}
      
      {formError && (
        <div className="w-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold p-3.5 rounded-xl animate-fade-in text-center">
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold p-3.5 rounded-xl animate-fade-in text-center">
          {formSuccess}
        </div>
      )}

      {/* LOGIN FORM */}
      {activeTab === 'login' && (
        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              ref={emailInputRef}
              type="email"
              required
              placeholder="Email Address"
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
      )}

      {/* REGISTER FORM */}
      {activeTab === 'register' && (
        <form onSubmit={handleSignUp} className="w-full flex flex-col gap-4">
          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              ref={emailInputRef}
              type="text"
              required
              placeholder="Full Name"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              type="email"
              required
              placeholder="Email Address"
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

          {/* Password checklist */}
          <div className="bg-secondary/20 border border-border rounded-xl p-3 flex flex-col gap-1.5 text-[10px]">
            <div className="font-bold text-muted-foreground text-xs mb-0.5">Password Rules:</div>
            <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {password.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} At least 8 characters
            </div>
            <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {/[A-Z]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} One uppercase letter
            </div>
            <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {/[a-z]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} One lowercase letter
            </div>
            <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {/[0-9]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} One number
            </div>
            <div className={`flex items-center gap-1.5 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} One special character
            </div>
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
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* REQUEST RESET FORM */}
      {activeTab === 'request-reset' && (
        <form onSubmit={handleRequestReset} className="w-full flex flex-col gap-4">
          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              ref={emailInputRef}
              type="text"
              required
              placeholder="Your Full Name"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              type="email"
              required
              placeholder="Your Email Address"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative w-full">
            <textarea
              required
              placeholder="Reason for password change request (visible to Super Authors)"
              rows={3}
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60 resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 mt-1 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Submit Request <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* RESET PASSWORD WITH TOKEN FORM */}
      {activeTab === 'reset-password' && (
        <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-4">
          <div className="bg-secondary/40 border border-border rounded-xl p-3.5 text-xs text-muted-foreground flex flex-col gap-1">
            <div className="font-bold text-foreground">Secure Verification Token Active</div>
            <div className="truncate font-mono text-[10px] text-primary">{resetToken}</div>
          </div>

          <div className="relative w-full">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="New Secure Password"
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
              placeholder="Confirm New Password"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground shadow-sm placeholder:text-muted-foreground/60"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Password checklist */}
          <div className="bg-secondary/20 border border-border rounded-xl p-3 flex flex-col gap-1.5 text-[10px]">
            <div className="font-bold text-muted-foreground text-xs mb-0.5">Password Rules:</div>
            <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {password.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} At least 8 characters
            </div>
            <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {/[A-Z]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} One uppercase letter
            </div>
            <div className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {/[a-z]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} One lowercase letter
            </div>
            <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {/[0-9]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} One number
            </div>
            <div className={`flex items-center gap-1.5 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-emerald-500 font-semibold' : 'text-muted-foreground'}`}>
              {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} One special character
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 mt-1 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Resetting...
              </>
            ) : (
              <>
                Update Password <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
