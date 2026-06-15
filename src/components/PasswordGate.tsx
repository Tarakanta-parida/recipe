'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface PasswordGateProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function PasswordGate({ children, title, description }: PasswordGateProps) {
  const { adminMode, enableAdminMode } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the password field on mount
  useEffect(() => {
    if (!adminMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [adminMode]);

  if (adminMode) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      enableAdminMode();
      setError(false);
    } else {
      setError(true);
      setIsShaking(true);
      setPassword('');
      // Reset shaking state after animation finishes
      setTimeout(() => setIsShaking(false), 300);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 md:py-24 text-center flex flex-col items-center gap-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm animate-pulse">
        <Lock className="w-8 h-8" />
      </div>
      
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-2">
        <div className="relative w-full">
          <input
            ref={inputRef}
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Enter password (hint: admin123)"
            className={`w-full bg-card border rounded-xl pl-4 pr-11 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-center shadow-sm placeholder:text-muted-foreground/60 ${
              isShaking 
                ? 'border-destructive ring-2 ring-destructive/20 animate-shake' 
                : 'border-border'
            }`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(false);
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground cursor-pointer focus:outline-none"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <p className="text-destructive text-xs font-semibold animate-fade-in">
            Incorrect password. Please try again.
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 mt-1 shadow-md hover:shadow-lg active:scale-[0.99]"
        >
          Unlock Section <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
