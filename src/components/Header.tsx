'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ChefHat, Sun, Moon, Lock, Unlock, Menu, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { adminMode, toggleAdminMode, theme, toggleTheme } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search Recipes' },
    { href: '/add-recipe', label: 'Add Recipe' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  if (adminMode) {
    navLinks.push({ href: '/admin', label: 'Admin Dashboard' });
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled ? 'py-3 shadow-sm border-border' : 'py-5 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary group">
          <ChefHat className="w-7 h-7 transition-transform group-hover:rotate-12 text-primary" />
          <span>Kavi&apos;s Kitchen</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-primary relative py-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Admin Simulation Mode */}
          <button
            onClick={toggleAdminMode}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-secondary ${
              adminMode
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-secondary/50 border-border text-foreground'
            }`}
            title={adminMode ? 'Disable Admin Mode' : 'Enable Admin Mode'}
          >
            {adminMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </button>

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl border border-border bg-secondary/50 flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:bg-secondary text-foreground"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl border border-border bg-secondary/50 flex items-center justify-center cursor-pointer text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border py-4 px-6 flex flex-col gap-4 animate-fade-in shadow-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-semibold py-2 border-b border-border/50 last:border-0 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
