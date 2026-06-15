'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Recipe } from '@/lib/db';
import RecipeCard from '@/components/RecipeCard';
import { Search, Loader2, Egg, Soup, Cookie, Cake, Flame, Coffee, ChefHat } from 'lucide-react';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const { showToast } = useApp();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load initial query parameter if it exists
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchKeyword(query);
    }
  }, [searchParams]);

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
          showToast('Failed to retrieve recipe database.', 'error');
        }
      } catch (err) {
        console.error('Fetch recipes search error:', err);
        showToast('Connection error loading recipes.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [showToast]);

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

  // Filter recipes locally for real-time reactivity
  const filteredRecipes = recipes.filter((recipe) => {
    // 1. Category Filter
    if (selectedCategory !== 'All' && recipe.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // 2. Keyword Filter
    if (searchKeyword.trim() !== '') {
      const query = searchKeyword.toLowerCase().trim();
      const nameMatch = recipe.name.toLowerCase().includes(query);
      const descMatch = recipe.description.toLowerCase().includes(query);
      const ingredientMatch = recipe.ingredients.some(ing => ing.toLowerCase().includes(query));
      return nameMatch || descMatch || ingredientMatch;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-10 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center flex flex-col gap-3">
        <h1 className="font-display text-4xl md:text-5xl font-bold">Find Traditional Dishes</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Explore our community&apos;s library of traditional and cultural recipes by keyword or category.
        </p>
      </div>

      {/* Expanded Search Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center bg-card border border-border shadow-md rounded-2xl p-4 gap-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Enter keywords (e.g., spice, chicken, curry)..."
          className="flex-1 bg-transparent border-0 text-foreground placeholder-muted-foreground focus:outline-none text-base md:text-lg"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      {/* Categories Chip bar */}
      <div className="flex gap-3 overflow-x-auto pb-4 justify-start max-w-5xl mx-auto w-full scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border cursor-pointer transition-all hover:-translate-y-0.5 whitespace-nowrap ${
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

      {/* Results Section */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-2xl font-bold border-b border-border/60 pb-3">
          {searchKeyword.trim() !== '' || selectedCategory !== 'All'
            ? `Search Results (${filteredRecipes.length} matched)`
            : `All Heritage Recipes (${filteredRecipes.length})`}
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">Searching the kitchen archives...</p>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-card border border-dashed border-border rounded-2xl flex flex-col items-center gap-3">
            <Search className="w-12 h-12 text-muted-foreground/60 animate-pulse" />
            <h3 className="font-display text-xl font-semibold">No Recipes Match</h3>
            <p className="text-muted-foreground text-sm">Try refining your search keyword or selecting a different category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
