'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Recipe } from '@/lib/db';
import RecipeCard from '@/components/RecipeCard';
import { Search, ChefHat, Egg, Soup, Cookie, Cake, Flame, Coffee, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch approved recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/recipes?status=approved');
        if (res.ok) {
          const data = await res.json();
          setRecipes(data);
        } else {
          showToast('Failed to load recipes.', 'error');
        }
      } catch (err) {
        console.error('Fetch recipes error:', err);
        showToast('Connection error loading recipes.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [showToast]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Traditional Foods'];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'All': return <Coffee className="w-4 h-4" />;
      case 'Breakfast': return <Egg className="w-4 h-4" />;
      case 'Lunch': return <Soup className="w-4 h-4" />;
      case 'Dinner': return <ChefHat className="w-4 h-4" />;
      case 'Snacks': return <Cookie className="w-4 h-4" />;
      case 'Desserts': return <Cake className="w-4 h-4" />;
      case 'Traditional Foods': return <Flame className="w-4 h-4" />;
      default: return <ChefHat className="w-4 h-4" />;
    }
  };

  // Filter recipes based on category selection
  const filteredRecipes = selectedCategory === 'All'
    ? recipes
    : recipes.filter(r => r.category.toLowerCase() === selectedCategory.toLowerCase());

  // Featured Recipes
  const featuredRecipes = filteredRecipes.filter(r => r.featured);

  // Latest Recipes (sorted by date descending)
  const latestRecipes = [...filteredRecipes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-16 animate-fade-in">
      {/* Hero Banner Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Preserving <span className="text-primary relative inline-block">Traditional <span className="absolute bottom-2 left-0 w-full h-2.5 bg-primary/10 -z-10" /></span> Cooking Knowledge
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed">
            Welcome to Kavi&apos;s Traditional Kitchen. Discover and share heirloom family recipes, cultural dishes, and traditional cooking methods passed down through generations.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex items-center bg-card border border-border shadow-md rounded-2xl p-1.5 max-w-lg w-full focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <input
              type="text"
              placeholder="Search Chicken Curry, Dosa, Rendang..."
              className="flex-1 bg-transparent border-0 px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0 text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 hover:translate-x-0.5"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 flex justify-center items-center relative">
          <div className="relative w-full max-w-[360px] aspect-square rounded-full overflow-hidden flex items-center justify-center shadow-xl border-4 border-primary/20 hover:scale-[1.03] transition-all duration-500">
            <img
              src="/assets/logo.jpg"
              alt="Kavi's Traditional Kitchen Logo"
              className="w-full h-full object-cover rounded-full hover:rotate-3 transition-all duration-700"
            />
          </div>
        </div>
      </section>

      {/* Category Chips Bar */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-3xl font-bold border-b border-border/60 pb-3">Browse by Category</h2>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border cursor-pointer transition-all hover:-translate-y-0.5 ${
                  isActive
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Gathering heritage recipes...</p>
        </div>
      ) : (
        <>
          {/* Featured Section */}
          <section className="flex flex-col gap-8">
            <h2 className="font-display text-3xl font-bold border-b border-border/60 pb-3">Featured Heritage Recipes</h2>
            {featuredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-card border border-dashed border-border rounded-2xl flex flex-col items-center gap-3">
                <ChefHat className="w-12 h-12 text-muted-foreground/60" />
                <h3 className="font-display text-xl font-semibold">No Featured Recipes</h3>
                <p className="text-muted-foreground text-sm">No featured dishes under &quot;{selectedCategory}&quot; category yet.</p>
              </div>
            )}
          </section>

          {/* Latest Section */}
          <section className="flex flex-col gap-8">
            <h2 className="font-display text-3xl font-bold border-b border-border/60 pb-3">Latest Additions</h2>
            {latestRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-card border border-dashed border-border rounded-2xl flex flex-col items-center gap-3">
                <ChefHat className="w-12 h-12 text-muted-foreground/60" />
                <h3 className="font-display text-xl font-semibold">No Additions Found</h3>
                <p className="text-muted-foreground text-sm">No recipes have been added to &quot;{selectedCategory}&quot; yet.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
