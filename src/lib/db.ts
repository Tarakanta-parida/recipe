import { createClient } from '@supabase/supabase-js';

// --- FRONTEND INTERFACE ---
// We keep the old interface so the UI doesn't break
export interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  author: string;
  image: string;
  ingredients: string[];
  steps: string[];
  status: 'pending' | 'approved';
  featured: boolean;
  createdAt: string;
}

// --- NEW DB SCHEMA ROWS ---
export interface RecipeRow {
  id: string;
  food_name: string;
  description: string;
  category: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  image_url: string;
  author_name: string;
  created_at: string;
  status: 'pending' | 'approved'; // Added to support existing app logic
  featured: boolean; // Added to support existing app logic
}

export interface IngredientRow {
  id: string;
  recipe_id: string;
  ingredient: string;
}

export interface InstructionRow {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
}

// Helper to generate UUIDs locally (for mock DB)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Mock seed data mappings
const seedRecipe = (
  id: string, name: string, category: string, desc: string, 
  prep: number, cook: number, servings: number, author: string, 
  image: string, ingredients: string[], steps: string[], 
  status: 'pending' | 'approved', featured: boolean, date: string
) => {
  const recipeRow: RecipeRow = {
    id, food_name: name, category, description: desc,
    prep_time: prep, cook_time: cook, servings,
    author_name: author, image_url: image,
    status, featured, created_at: new Date(date).toISOString()
  };
  
  const ingredientRows: IngredientRow[] = ingredients.map((ing) => ({
    id: generateUUID(),
    recipe_id: id,
    ingredient: ing
  }));

  const instructionRows: InstructionRow[] = steps.map((step, i) => ({
    id: generateUUID(),
    recipe_id: id,
    step_number: i + 1,
    instruction: step
  }));

  return { recipeRow, ingredientRows, instructionRows };
};

const seeds = [
  seedRecipe(
    "11111111-1111-4111-a111-111111111111", 
    "Grandma's Chicken Curry", "Lunch", "A deeply aromatic, slow-simmered curry using freshly ground spices, passed down from my grandmother. Perfect with steamed basmati rice or hot roti.",
    15, 45, 4, "Kavi Raman", "/assets/chicken_curry.png",
    [
      "1 kg chicken, cut into curry-size pieces",
      "3 large onions, finely sliced",
      "2 large tomatoes, pureed",
      "2 tbsp ginger-garlic paste",
      "3 tbsp curry powder (turmeric, coriander, cumin blend)",
      "1 tsp chili powder (adjust to heat preference)",
      "400ml coconut milk",
      "3 tbsp cooking oil",
      "Fresh cilantro, chopped for garnish"
    ],
    [
      "Heat oil in a heavy-bottomed pot. Add sliced onions and sauté until brown and caramelized.",
      "Stir in the ginger-garlic paste and cook for 2 minutes until fragrant.",
      "Add the curry powder and chili powder, stirring quickly to toast spices without burning.",
      "Add chicken pieces and sear in spices for 5-7 minutes until browned.",
      "Pour in tomato puree and salt to taste. Simmer for 10 minutes until chicken releases juices.",
      "Stir in the coconut milk, cover with lid, and cook on low heat for 30 minutes until chicken is tender.",
      "Garnish with chopped cilantro and serve hot."
    ],
    "approved", true, "2026-05-10"
  ),
  seedRecipe(
    "22222222-2222-4222-a222-222222222222",
    "Traditional Masala Dosa", "Breakfast", "Crispy fermented rice crepes stuffed with a spiced potato mash (aloo masala), served with fresh coconut chutney and vegetable sambar.",
    20, 15, 6, "Aanya Patel", "/assets/masala_dosa.png",
    [
      "3 cups parboiled rice (soaked for 5 hours)",
      "1 cup split black gram / urad dal (soaked for 5 hours)",
      "4 large potatoes, boiled and mashed",
      "1 onion, sliced",
      "2 green chilies, chopped",
      "1 tsp mustard seeds",
      "1/2 tsp turmeric powder",
      "10-12 curry leaves",
      "Oil or ghee for cooking crepes",
      "Salt to taste"
    ],
    [
      "Grind the soaked rice and urad dal separately to a smooth batter. Mix, add salt, and ferment overnight (8-10 hours).",
      "For potato masala: Heat oil in a pan, add mustard seeds. Once they crackle, add curry leaves, green chilies, and onions. Sauté until translucent.",
      "Add turmeric and mashed potatoes. Mix well, pour 1/4 cup water, and simmer for 5 minutes. Season with salt.",
      "Heat a flat non-stick griddle (tawa). Splash a little water and wipe it clean with a damp cloth.",
      "Pour a ladle of batter in the center, and spread it in a circular motion to form a thin crepe.",
      "Drizzle ghee around the edges and cook on medium heat until the bottom is golden brown and crispy.",
      "Place a portion of potato masala in the center, fold the dosa, and serve hot with chutney."
    ],
    "approved", true, "2026-05-15"
  ),
  seedRecipe(
    "33333333-3333-4333-a333-333333333333",
    "Classic Beef Rendang", "Traditional Foods", "A dry, caramelized beef curry slowly simmered in coconut milk and lemongrass paste until melt-in-the-mouth tender and deeply savory.",
    30, 180, 6, "Chef Haris", "/assets/beef_rendang.png",
    [
      "1 kg beef chuck, cut into chunks",
      "3 lemongrass stalks, bruised",
      "5 kaffir lime leaves, torn",
      "2 turmeric leaves, sliced (optional)",
      "600ml thick coconut milk",
      "100g toasted grated coconut (kerisik)",
      "For spice paste: 12 shallots, 4 cloves garlic, 3cm ginger, 3cm galangal, 15 dried chilies soaked in water"
    ],
    [
      "Blend the spice paste ingredients into a smooth paste using a blender.",
      "In a large wok, combine the beef, spice paste, coconut milk, bruised lemongrass, and kaffir lime leaves.",
      "Bring to a boil on medium heat, then lower heat and cook uncovered, stirring occasionally, for 2 hours.",
      "Once the sauce thickens and oil begins to separate, add the toasted grated coconut (kerisik) and salt to taste.",
      "Reduce heat to very low and cook, stirring frequently, for another hour until the liquid is fully absorbed and the beef turns a dark chocolate brown.",
      "Remove lemongrass stalks and serve dry with warm jasmine rice."
    ],
    "approved", true, "2026-06-01"
  ),
  seedRecipe(
    "44444444-4444-4444-a444-444444444444",
    "Heritage Apple Pie", "Desserts", "A traditional American holiday classic with a flaky, buttery lattice crust and sweet cinnamon-kissed apple filling.",
    30, 50, 8, "Evelyn Smith", "/assets/apple_pie.png",
    [
      "2 home-made double pie crusts",
      "6 large Granny Smith apples, peeled and sliced thin",
      "150g brown sugar",
      "1 tsp ground cinnamon",
      "1/4 tsp ground nutmeg",
      "2 tbsp all-purpose flour",
      "1 tbsp lemon juice",
      "2 tbsp cold butter, diced",
      "1 egg beaten (for egg wash)"
    ],
    [
      "Preheat oven to 200°C (400°F). Roll out one pie dough and press it into a 9-inch pie dish.",
      "In a large bowl, toss the apple slices with lemon juice, flour, brown sugar, cinnamon, and nutmeg until well coated.",
      "Pour apples into the pie crust and scatter the cold butter pieces on top.",
      "Roll out the second pie dough, cut into strips, and weave a lattice pattern on top of the apples. Flute the edges.",
      "Brush the top crust with egg wash. Bake for 20 minutes, then reduce oven temp to 175°C (350°F) and bake for another 30-40 minutes until golden."
    ],
    "approved", false, "2026-06-05"
  ),
  seedRecipe(
    "55555555-5555-4555-a555-555555555555",
    "Traditional Turkish Baklava", "Snacks", "Crispy layers of micro-thin filo pastry stuffed with premium chopped pistachios and sweetened with hot honey syrup.",
    45, 40, 12, "Elif Yilmaz", "/assets/baklava.png",
    [
      "1 pack (450g) filo pastry, thawed",
      "250g unsalted butter, melted",
      "300g pistachios, finely ground",
      "For syrup: 200g sugar, 150ml water, 4 tbsp honey, 1 tbsp lemon juice, 1 tbsp orange blossom water"
    ],
    [
      "For syrup: Boil sugar, water, lemon juice, and honey in a saucepan. Simmer for 10 minutes, stir in orange blossom water, and let cool fully.",
      "Preheat oven to 165°C (325°F). Butter a rectangular baking pan.",
      "Layer 10 sheets of filo pastry, brushing each layer with melted butter.",
      "Spread half of the ground pistachios evenly on top.",
      "Add 6 more buttered filo sheets, then spread the rest of the pistachios.",
      "Layer the remaining filo sheets on top, buttering each. Using a sharp knife, cut into diamond shapes.",
      "Bake for 45 minutes until puffed and golden brown.",
      "Pour the cold syrup over the hot baklava immediately. Let it rest for 4 hours to soak before serving."
    ],
    "approved", false, "2026-06-12"
  )
];

const SEED_RECIPES = seeds.map(s => s.recipeRow);
const SEED_INGREDIENTS = seeds.flatMap(s => s.ingredientRows);
const SEED_INSTRUCTIONS = seeds.flatMap(s => s.instructionRows);

// Configure Supabase if details are provided in environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
const BACKEND_SECRET = process.env.BACKEND_SECRET || 'kavis_kitchen_secret_2026';

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Global memory store for local development mockup fallback
declare global {
  var _dbRecipes: RecipeRow[] | undefined;
  var _dbIngredients: IngredientRow[] | undefined;
  var _dbInstructions: InstructionRow[] | undefined;
}

if (!globalThis._dbRecipes) {
  globalThis._dbRecipes = [...SEED_RECIPES];
  globalThis._dbIngredients = [...SEED_INGREDIENTS];
  globalThis._dbInstructions = [...SEED_INSTRUCTIONS];
}

// Mapper from DB rows to Frontend Recipe Interface
function mapToFrontendRecipe(
  recipeRow: RecipeRow, 
  ingredients: IngredientRow[], 
  instructions: InstructionRow[]
): Recipe {
  return {
    id: recipeRow.id,
    name: recipeRow.food_name,
    category: recipeRow.category,
    description: recipeRow.description,
    prepTime: recipeRow.prep_time,
    cookTime: recipeRow.cook_time,
    servings: recipeRow.servings,
    author: recipeRow.author_name,
    image: recipeRow.image_url,
    status: recipeRow.status,
    featured: recipeRow.featured,
    createdAt: recipeRow.created_at,
    ingredients: ingredients
      .filter(i => i.recipe_id === recipeRow.id)
      .map(i => i.ingredient),
    steps: instructions
      .filter(i => i.recipe_id === recipeRow.id)
      .sort((a, b) => a.step_number - b.step_number)
      .map(i => i.instruction)
  };
}

// Database Service Layer
export const db = {
  async getRecipes(status?: 'approved' | 'pending' | 'all'): Promise<Recipe[]> {
    if (isSupabaseConfigured && supabaseClient) {
      let query = supabaseClient.from('recipes').select('*');
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      const { data: recipesData, error: recipesError } = await query.order('created_at', { ascending: false });
      if (recipesError || !recipesData) {
        console.error('Supabase getRecipes error:', recipesError);
        return [];
      }
      
      const recipeIds = recipesData.map(r => r.id);
      
      const { data: ingredientsData } = await supabaseClient
        .from('ingredients')
        .select('*')
        .in('recipe_id', recipeIds);
        
      const { data: instructionsData } = await supabaseClient
        .from('instructions')
        .select('*')
        .in('recipe_id', recipeIds);
        
      return recipesData.map(row => mapToFrontendRecipe(
        row as RecipeRow, 
        (ingredientsData || []) as IngredientRow[], 
        (instructionsData || []) as InstructionRow[]
      ));
    } else {
      // Memory Fallback
      let recipes = globalThis._dbRecipes || [];
      if (status && status !== 'all') {
        recipes = recipes.filter(r => r.status === status);
      }
      const ingredients = globalThis._dbIngredients || [];
      const instructions = globalThis._dbInstructions || [];
      
      return recipes.map(r => mapToFrontendRecipe(r, ingredients, instructions))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async getRecipeById(id: string): Promise<Recipe | null> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data: recipeData, error } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error || !recipeData) return null;

      const { data: ingredientsData } = await supabaseClient
        .from('ingredients')
        .select('*')
        .eq('recipe_id', id);
        
      const { data: instructionsData } = await supabaseClient
        .from('instructions')
        .select('*')
        .eq('recipe_id', id);
        
      return mapToFrontendRecipe(
        recipeData as RecipeRow, 
        (ingredientsData || []) as IngredientRow[], 
        (instructionsData || []) as InstructionRow[]
      );
    } else {
      const recipes = globalThis._dbRecipes || [];
      const row = recipes.find(r => r.id === id);
      if (!row) return null;
      
      const ingredients = globalThis._dbIngredients || [];
      const instructions = globalThis._dbInstructions || [];
      return mapToFrontendRecipe(row, ingredients, instructions);
    }
  },

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'status' | 'featured'> & { status?: 'approved' | 'pending' }): Promise<Recipe> {
    const id = generateUUID();
    const recipeRow: RecipeRow = {
      id,
      food_name: recipe.name,
      description: recipe.description,
      category: recipe.category,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      servings: recipe.servings,
      image_url: recipe.image,
      author_name: recipe.author,
      status: recipe.status || 'pending',
      featured: false,
      created_at: new Date().toISOString()
    };
    
    const ingredientRows: IngredientRow[] = recipe.ingredients.map(ing => ({
      id: generateUUID(),
      recipe_id: id,
      ingredient: ing
    }));
    
    const instructionRows: InstructionRow[] = recipe.steps.map((step, idx) => ({
      id: generateUUID(),
      recipe_id: id,
      step_number: idx + 1,
      instruction: step
    }));

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('secure_create_recipe', {
        secret_token: BACKEND_SECRET,
        p_recipe: recipeRow,
        p_ingredients: ingredientRows,
        p_instructions: instructionRows
      });
      if (error) throw error;
      
      return mapToFrontendRecipe(recipeRow, ingredientRows, instructionRows);
    } else {
      globalThis._dbRecipes = [recipeRow, ...(globalThis._dbRecipes || [])];
      globalThis._dbIngredients = [...ingredientRows, ...(globalThis._dbIngredients || [])];
      globalThis._dbInstructions = [...instructionRows, ...(globalThis._dbInstructions || [])];
      return mapToFrontendRecipe(recipeRow, ingredientRows, instructionRows);
    }
  },

  async updateRecipe(id: string, updatedFields: Partial<Recipe>): Promise<Recipe | null> {
    const existing = await this.getRecipeById(id);
    if (!existing) return null;

    const rowUpdates: Partial<RecipeRow> = {};
    if (updatedFields.name !== undefined) rowUpdates.food_name = updatedFields.name;
    if (updatedFields.description !== undefined) rowUpdates.description = updatedFields.description;
    if (updatedFields.category !== undefined) rowUpdates.category = updatedFields.category;
    if (updatedFields.prepTime !== undefined) rowUpdates.prep_time = updatedFields.prepTime;
    if (updatedFields.cookTime !== undefined) rowUpdates.cook_time = updatedFields.cookTime;
    if (updatedFields.servings !== undefined) rowUpdates.servings = updatedFields.servings;
    if (updatedFields.image !== undefined) rowUpdates.image_url = updatedFields.image;
    if (updatedFields.author !== undefined) rowUpdates.author_name = updatedFields.author;
    if (updatedFields.status !== undefined) rowUpdates.status = updatedFields.status;
    if (updatedFields.featured !== undefined) rowUpdates.featured = updatedFields.featured;

    let ingredientRows: IngredientRow[] | null = null;
    let instructionRows: InstructionRow[] | null = null;

    if (updatedFields.ingredients) {
      ingredientRows = updatedFields.ingredients.map(ing => ({
        id: generateUUID(),
        recipe_id: id,
        ingredient: ing
      }));
    }
    
    if (updatedFields.steps) {
      instructionRows = updatedFields.steps.map((step, idx) => ({
        id: generateUUID(),
        recipe_id: id,
        step_number: idx + 1,
        instruction: step
      }));
    }

    if (isSupabaseConfigured && supabaseClient) {
      const { error } = await supabaseClient.rpc('secure_update_recipe', {
        secret_token: BACKEND_SECRET,
        p_recipe_id: id,
        p_recipe: rowUpdates,
        p_ingredients: ingredientRows,
        p_instructions: instructionRows
      });
      if (error) throw error;
      
      return await this.getRecipeById(id);
    } else {
      let recipes = globalThis._dbRecipes || [];
      const idx = recipes.findIndex(r => r.id === id);
      if (idx !== -1) {
        recipes[idx] = { ...recipes[idx], ...rowUpdates };
        globalThis._dbRecipes = recipes;
      }
      
      if (ingredientRows) {
        let allIngs = globalThis._dbIngredients || [];
        allIngs = allIngs.filter(i => i.recipe_id !== id);
        globalThis._dbIngredients = [...allIngs, ...ingredientRows];
      }
      
      if (instructionRows) {
        let allInsts = globalThis._dbInstructions || [];
        allInsts = allInsts.filter(i => i.recipe_id !== id);
        globalThis._dbInstructions = [...allInsts, ...instructionRows];
      }
      
      return await this.getRecipeById(id);
    }
  },

  async deleteRecipe(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('secure_delete_recipe', {
        secret_token: BACKEND_SECRET,
        p_recipe_id: id
      });
      
      if (error) {
        console.error('Supabase deleteRecipe error:', error);
        return false;
      }
      return data as boolean;
    } else {
      const recipes = globalThis._dbRecipes || [];
      const len = recipes.length;
      globalThis._dbRecipes = recipes.filter(r => r.id !== id);
      globalThis._dbIngredients = (globalThis._dbIngredients || []).filter(i => i.recipe_id !== id);
      globalThis._dbInstructions = (globalThis._dbInstructions || []).filter(i => i.recipe_id !== id);
      return globalThis._dbRecipes.length !== len;
    }
  }
};
