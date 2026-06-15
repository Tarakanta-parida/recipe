'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Recipe } from '@/lib/db';
import { useApp } from '@/context/AppContext';
import { Clock, Users, Flame, ChevronLeft, Check, Edit3, Trash2, CheckCircle2, Loader2, Info, ChefHat } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RecipeDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { adminMode, showToast } = useApp();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/recipes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRecipe(data);
        } else {
          showToast('Recipe not found.', 'error');
        }
      } catch (err) {
        console.error('Fetch recipe details error:', err);
        showToast('Error loading recipe details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, showToast]);

  const handleToggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleApprove = async () => {
    if (!recipe) return;
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRecipe(updated);
        showToast(`Recipe "${recipe.name}" has been approved!`);
      } else {
        showToast('Failed to approve recipe.', 'error');
      }
    } catch (err) {
      console.error('Approve error:', err);
      showToast('Error connecting to API.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    if (confirm(`Are you sure you want to delete "${recipe.name}"?`)) {
      try {
        const res = await fetch(`/api/recipes/${recipe.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          showToast(`Recipe "${recipe.name}" was deleted.`, 'info');
          router.push('/');
        } else {
          showToast('Failed to delete recipe.', 'error');
        }
      } catch (err) {
        console.error('Delete error:', err);
        showToast('Error connecting to API.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading recipe details...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-2xl font-bold">!</div>
        <h3 className="font-display text-2xl font-bold">Recipe Not Found</h3>
        <p className="text-muted-foreground text-sm">The recipe you are looking for does not exist or has been removed.</p>
        <Link href="/" className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 animate-fade-in">
      {/* Back button */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Recipes
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Card A: Image, Description, Stats */}
        <div className="lg:col-span-8 bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col order-1">
          <div className="relative aspect-video w-full bg-secondary">
            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-8 md:p-10 flex flex-col gap-8">
            {/* Header info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {recipe.category}
                </span>
                <span className="text-muted-foreground text-sm font-medium">by <strong className="text-foreground">{recipe.author}</strong></span>
                {recipe.status === 'pending' && (
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-xs font-bold px-3 py-1 rounded-full shadow-sm ml-auto">
                    Pending Approval
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight text-foreground">{recipe.name}</h1>
              <p className="text-muted-foreground text-base leading-relaxed border-b border-border pb-6">
                {recipe.description}
              </p>
            </div>

            {/* Stats Card Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 text-center flex flex-col items-center gap-1.5 shadow-sm">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prep Time</span>
                <span className="text-sm font-bold text-foreground">{recipe.prepTime} mins</span>
              </div>
              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 text-center flex flex-col items-center gap-1.5 shadow-sm">
                <Flame className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cook Time</span>
                <span className="text-sm font-bold text-foreground">{recipe.cookTime} mins</span>
              </div>
              <div className="bg-secondary/40 border border-border/80 rounded-2xl p-4 text-center flex flex-col items-center gap-1.5 shadow-sm">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Servings</span>
                <span className="text-sm font-bold text-foreground">{recipe.servings} people</span>
              </div>
            </div>

            {/* Admin operations buttons */}
            {adminMode && (
              <div className="flex items-center gap-4 flex-wrap border-t border-border pt-8 mt-4">
                <Link
                  href={`/add-recipe?edit=${recipe.id}`}
                  className="bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white px-5 py-2.5 rounded-xl cursor-pointer text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Edit Recipe
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white px-5 py-2.5 rounded-xl cursor-pointer text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Recipe
                </button>
                {recipe.status === 'pending' && (
                  <button
                    onClick={handleApprove}
                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-xl cursor-pointer text-sm font-semibold transition-all flex items-center gap-2 ml-auto"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Recipe
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card B: Ingredients Checklist Card */}
        <div className="lg:col-span-4 lg:row-span-2 lg:sticky lg:top-28 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 order-2">
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-2xl font-bold text-foreground">Ingredients</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Check off ingredients as you prepare or measure them:
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {recipe.ingredients.map((ing, idx) => {
              const isChecked = !!checkedIngredients[idx];
              return (
                <li key={idx}>
                  <label
                    className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-secondary/60 ${
                      isChecked ? 'text-muted-foreground line-through opacity-70' : 'text-foreground font-medium'
                    }`}
                  >
                    <div className="relative flex items-center mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isChecked}
                        onChange={() => handleToggleIngredient(idx)}
                      />
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-card'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </div>
                    </div>
                    <span className="text-sm select-none pt-0.5">{ing}</span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-border/60 pt-6 mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              <strong className="text-primary">Traditional Tip:</strong> Traditional recipes flavor best when ingredients are prepared fresh and spices are toasted gently before grinding!
            </span>
          </div>
        </div>

        {/* Card C: Cooking Steps Card */}
        <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm flex flex-col gap-6 order-3 animate-fade-in">
          <h3 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
            <ChefHat className="w-6 h-6 text-primary" /> Cooking Steps
          </h3>
          <div className="flex flex-col gap-6">
            {recipe.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/40 border-l-4 border-l-primary">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {idx + 1}
                </div>
                <p className="text-foreground text-sm md:text-base leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
