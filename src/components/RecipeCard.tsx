import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User } from 'lucide-react';
import { Recipe } from '@/lib/db';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Link href={`/recipe/${recipe.id}`} className="block group">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1">
        {/* Image wrapper */}
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No Image Available
            </div>
          )}
          <span className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm border border-border text-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {recipe.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {recipe.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
            {recipe.description}
          </p>

          {/* Metadata Footer */}
          <div className="flex justify-between items-center border-t border-border/60 pt-4 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>{totalTime} mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{recipe.author}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
