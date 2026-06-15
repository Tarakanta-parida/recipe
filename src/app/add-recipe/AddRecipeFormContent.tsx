'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { storage } from '@/lib/storage';
import { Plus, Trash2, CloudUpload, ArrowRight, Loader2, Save } from 'lucide-react';

export default function AddRecipeFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminMode, showToast } = useApp();
  const editId = searchParams.get('edit') || '';

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);

  const [imageString, setImageString] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load recipe if in edit mode
  useEffect(() => {
    if (editId) {
      const fetchRecipe = async () => {
        try {
          setFetchingData(true);
          const res = await fetch(`/api/recipes/${editId}`);
          if (res.ok) {
            const recipe = await res.json();
            setName(recipe.name);
            setCategory(recipe.category);
            setAuthor(recipe.author);
            setDescription(recipe.description);
            setPrepTime(recipe.prepTime.toString());
            setCookTime(recipe.cookTime.toString());
            setServings(recipe.servings.toString());
            setIngredients(recipe.ingredients);
            setSteps(recipe.steps);
            setImageString(recipe.image);
          } else {
            showToast('Failed to load recipe for editing.', 'error');
          }
        } catch (err) {
          console.error('Fetch recipe edit error:', err);
          showToast('Error retrieving recipe data.', 'error');
        } finally {
          setFetchingData(false);
        }
      };

      fetchRecipe();
    }
  }, [editId, showToast]);

  // Ingredients handlers
  const handleIngredientChange = (idx: number, val: string) => {
    const next = [...ingredients];
    next[idx] = val;
    setIngredients(next);
  };

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, '']);
  };

  const removeIngredientRow = (idx: number) => {
    if (ingredients.length > 1) {
      setIngredients((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  // Steps handlers
  const handleStepChange = (idx: number, val: string) => {
    const next = [...steps];
    next[idx] = val;
    setSteps(next);
  };

  const addStepRow = () => {
    setSteps((prev) => [...prev, '']);
  };

  const removeStepRow = (idx: number) => {
    if (steps.length > 1) {
      setSteps((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  // Image Upload handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImageFile(file);
        // Pre-parse to Base64 instantly for client preview
        const base64 = await storage.fileToBase64(file);
        setImageString(base64);
      } catch (err) {
        console.error('Image parsing error:', err);
        showToast('Error reading image file.', 'error');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    const cleanedIngredients = ingredients.map((i) => i.trim()).filter((i) => i !== '');
    const cleanedSteps = steps.map((s) => s.trim()).filter((s) => s !== '');

    if (cleanedIngredients.length === 0 || cleanedSteps.length === 0) {
      showToast('Please provide at least one ingredient and one cooking step.', 'error');
      return;
    }

    try {
      setLoading(true);

      // Handle Image uploading (if file is changed, upload to Supabase or keep base64)
      let finalImageUrl = imageString;
      if (imageFile) {
        showToast('Uploading image...', 'info');
        finalImageUrl = await storage.uploadImage(imageFile);
      }

      if (!finalImageUrl) {
        showToast('Please upload a recipe image.', 'error');
        setLoading(false);
        return;
      }

      // Compile recipe object
      const recipeData = {
        name: name.trim(),
        category,
        author: author.trim(),
        description: description.trim(),
        prepTime: parseInt(prepTime),
        cookTime: parseInt(cookTime),
        servings: parseInt(servings),
        image: finalImageUrl,
        ingredients: cleanedIngredients,
        steps: cleanedSteps,
        status: adminMode ? 'approved' : 'pending' // if admin, auto-approved
      };

      const endpoint = editId ? `/api/recipes/${editId}` : '/api/recipes';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (res.ok) {
        const result = await res.json();
        if (editId) {
          showToast(`Recipe "${recipeData.name}" has been updated successfully!`);
          router.push(`/recipe/${editId}`);
        } else {
          if (adminMode) {
            showToast(`Recipe "${recipeData.name}" has been added and approved!`);
            router.push(`/recipe/${result.id}`);
          } else {
            showToast('Recipe submitted successfully! It is pending admin approval.', 'info');
            router.push('/');
          }
        }
      } else {
        const errorRes = await res.json();
        showToast(errorRes.error || 'Failed to submit recipe.', 'error');
      }
    } catch (err) {
      console.error('Submit recipe error:', err);
      showToast('Error connecting to API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Fetching recipe details for edit...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8 animate-fade-in">
      <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
        <h1 className="font-display text-4xl font-bold text-center mb-2">
          {editId ? 'Edit Traditional Recipe' : 'Share Your Recipe'}
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-base mb-10">
          Document your family&apos;s culinary secrets to preserve them for future generations.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Food Name */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="food-name" className="text-sm font-bold text-foreground">
                Food Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                id="food-name"
                required
                placeholder="e.g. Grandma's Chicken Curry"
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-sm font-bold text-foreground">
                Category <span className="text-primary">*</span>
              </label>
              <select
                id="category"
                required
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground appearance-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>Select Category</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
                <option value="Desserts">Desserts</option>
                <option value="Traditional Foods">Traditional Foods</option>
              </select>
            </div>

            {/* Author */}
            <div className="flex flex-col gap-2">
              <label htmlFor="author" className="text-sm font-bold text-foreground">
                Author Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                id="author"
                required
                placeholder="e.g. Kavi Raman"
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-bold text-foreground">
                Short Description <span className="text-primary">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={3}
                placeholder="Describe the origin, history, or cozy details of this dish..."
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Image Upload box */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-foreground">
                Food Image <span className="text-primary">*</span>
              </label>
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-border rounded-2xl bg-secondary/20 p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-center relative group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                
                {imageString ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    <img
                      src={imageString}
                      alt="Recipe Preview"
                      className="max-h-[220px] w-full object-cover rounded-xl border border-border shadow-sm"
                    />
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                      Click to choose another image
                    </span>
                  </div>
                ) : (
                  <>
                    <CloudUpload className="w-10 h-10 text-primary transition-transform group-hover:-translate-y-1" />
                    <span className="text-sm font-semibold text-foreground">
                      Click to upload recipe image
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, or WEBP up to 5MB
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Prep Time */}
            <div className="flex flex-col gap-2">
              <label htmlFor="prep-time" className="text-sm font-bold text-foreground">
                Prep Time (minutes) <span className="text-primary">*</span>
              </label>
              <input
                type="number"
                id="prep-time"
                required
                min={0}
                placeholder="e.g. 15"
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>

            {/* Cook Time */}
            <div className="flex flex-col gap-2">
              <label htmlFor="cook-time" className="text-sm font-bold text-foreground">
                Cooking Time (minutes) <span className="text-primary">*</span>
              </label>
              <input
                type="number"
                id="cook-time"
                required
                min={0}
                placeholder="e.g. 35"
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
              />
            </div>

            {/* Servings */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label htmlFor="servings" className="text-sm font-bold text-foreground">
                Servings <span className="text-primary">*</span>
              </label>
              <input
                type="number"
                id="servings"
                required
                min={1}
                placeholder="e.g. 4"
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>

            {/* Ingredients List */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-foreground flex justify-between items-center">
                <span>Ingredients <span className="text-primary">*</span></span>
                <button
                  type="button"
                  onClick={addIngredientRow}
                  className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Ingredient
                </button>
              </label>
              <div className="flex flex-col gap-3">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 items-center animate-fade-in">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500g Chicken, bone-in, cut into pieces"
                      className="flex-1 bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                      value={ing}
                      onChange={(e) => handleIngredientChange(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={ingredients.length === 1}
                      onClick={() => removeIngredientRow(idx)}
                      className="w-11 h-11 border border-border bg-secondary/30 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Steps List */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-foreground flex justify-between items-center">
                <span>Cooking Steps <span className="text-primary">*</span></span>
                <button
                  type="button"
                  onClick={addStepRow}
                  className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </label>
              <div className="flex flex-col gap-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-start animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-2.5">
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sauté onions in a heavy wok until golden brown."
                      className="flex-1 bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground mt-0.5"
                      value={step}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={steps.length === 1}
                      onClick={() => removeStepRow(idx)}
                      className="w-11 h-11 border border-border bg-secondary/30 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-0.5 text-muted-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-4 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting recipe...</span>
              </>
            ) : (
              <>
                {editId ? <Save className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                <span>{editId ? 'Save Changes' : 'Submit Recipe'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
