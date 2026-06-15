import React from 'react';
import Link from 'next/link';
import { ChefHat, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary/40 border-t border-border mt-auto pt-16 pb-8 text-muted-foreground">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* About Column */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <ChefHat className="w-6 h-6 text-primary" />
            <span>Kavi&apos;s Traditional Kitchen</span>
          </Link>
          <p className="text-sm leading-relaxed max-w-sm">
            A digital archive dedicated to preserving grandma&apos;s culinary magic, traditional methods, and spice heritage for future food lovers across the globe.
          </p>
        </div>

        {/* Explore Links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-foreground text-base">Explore</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-primary transition-colors">Search Recipes</Link>
            </li>
            <li>
              <Link href="/add-recipe" className="hover:text-primary transition-colors">Add Recipe</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Archive/Legal */}
        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-foreground text-base">Heritage & Archives</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Cultural Documentation</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Terms of Sharing</Link>
            </li>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span>&copy; {new Date().getFullYear()} Kavi&apos;s Kitchen. Made with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>to keep traditional cooking alive.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-105 transition-all" aria-label="Instagram">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
          <a href="#" className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-105 transition-all" aria-label="YouTube">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
