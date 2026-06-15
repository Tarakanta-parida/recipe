import { createClient } from '@supabase/supabase-js';

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

const SEED_RECIPES: Recipe[] = [
  {
    id: "seed-chicken-curry",
    name: "Grandma's Chicken Curry",
    category: "Lunch",
    description: "A deeply aromatic, slow-simmered curry using freshly ground spices, passed down from my grandmother. Perfect with steamed basmati rice or hot roti.",
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    author: "Kavi Raman",
    image: "/assets/chicken_curry.png",
    ingredients: [
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
    steps: [
      "Heat oil in a heavy-bottomed pot. Add sliced onions and sauté until brown and caramelized.",
      "Stir in the ginger-garlic paste and cook for 2 minutes until fragrant.",
      "Add the curry powder and chili powder, stirring quickly to toast spices without burning.",
      "Add chicken pieces and sear in spices for 5-7 minutes until browned.",
      "Pour in tomato puree and salt to taste. Simmer for 10 minutes until chicken releases juices.",
      "Stir in the coconut milk, cover with lid, and cook on low heat for 30 minutes until chicken is tender.",
      "Garnish with chopped cilantro and serve hot."
    ],
    status: "approved",
    featured: true,
    createdAt: new Date("2026-05-10").toISOString()
  },
  {
    id: "seed-masala-dosa",
    name: "Traditional Masala Dosa",
    category: "Breakfast",
    description: "Crispy fermented rice crepes stuffed with a spiced potato mash (aloo masala), served with fresh coconut chutney and vegetable sambar.",
    prepTime: 20,
    cookTime: 15,
    servings: 6,
    author: "Aanya Patel",
    image: "/assets/masala_dosa.png",
    ingredients: [
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
    steps: [
      "Grind the soaked rice and urad dal separately to a smooth batter. Mix, add salt, and ferment overnight (8-10 hours).",
      "For potato masala: Heat oil in a pan, add mustard seeds. Once they crackle, add curry leaves, green chilies, and onions. Sauté until translucent.",
      "Add turmeric and mashed potatoes. Mix well, pour 1/4 cup water, and simmer for 5 minutes. Season with salt.",
      "Heat a flat non-stick griddle (tawa). Splash a little water and wipe it clean with a damp cloth.",
      "Pour a ladle of batter in the center, and spread it in a circular motion to form a thin crepe.",
      "Drizzle ghee around the edges and cook on medium heat until the bottom is golden brown and crispy.",
      "Place a portion of potato masala in the center, fold the dosa, and serve hot with chutney."
    ],
    status: "approved",
    featured: true,
    createdAt: new Date("2026-05-15").toISOString()
  },
  {
    id: "seed-beef-rendang",
    name: "Classic Beef Rendang",
    category: "Traditional Foods",
    description: "A dry, caramelized beef curry slowly simmered in coconut milk and lemongrass paste until melt-in-the-mouth tender and deeply savory.",
    prepTime: 30,
    cookTime: 180,
    servings: 6,
    author: "Chef Haris",
    image: "/assets/beef_rendang.png",
    ingredients: [
      "1 kg beef chuck, cut into chunks",
      "3 lemongrass stalks, bruised",
      "5 kaffir lime leaves, torn",
      "2 turmeric leaves, sliced (optional)",
      "600ml thick coconut milk",
      "100g toasted grated coconut (kerisik)",
      "For spice paste: 12 shallots, 4 cloves garlic, 3cm ginger, 3cm galangal, 15 dried chilies soaked in water"
    ],
    steps: [
      "Blend the spice paste ingredients into a smooth paste using a blender.",
      "In a large wok, combine the beef, spice paste, coconut milk, bruised lemongrass, and kaffir lime leaves.",
      "Bring to a boil on medium heat, then lower heat and cook uncovered, stirring occasionally, for 2 hours.",
      "Once the sauce thickens and oil begins to separate, add the toasted grated coconut (kerisik) and salt to taste.",
      "Reduce heat to very low and cook, stirring frequently, for another hour until the liquid is fully absorbed and the beef turns a dark chocolate brown.",
      "Remove lemongrass stalks and serve dry with warm jasmine rice."
    ],
    status: "approved",
    featured: true,
    createdAt: new Date("2026-06-01").toISOString()
  },
  {
    id: "seed-apple-pie",
    name: "Heritage Apple Pie",
    category: "Desserts",
    description: "A traditional American holiday classic with a flaky, buttery lattice crust and sweet cinnamon-kissed apple filling.",
    prepTime: 30,
    cookTime: 50,
    servings: 8,
    author: "Evelyn Smith",
    image: "/assets/apple_pie.png",
    ingredients: [
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
    steps: [
      "Preheat oven to 200°C (400°F). Roll out one pie dough and press it into a 9-inch pie dish.",
      "In a large bowl, toss the apple slices with lemon juice, flour, brown sugar, cinnamon, and nutmeg until well coated.",
      "Pour apples into the pie crust and scatter the cold butter pieces on top.",
      "Roll out the second pie dough, cut into strips, and weave a lattice pattern on top of the apples. Flute the edges.",
      "Brush the top crust with egg wash. Bake for 20 minutes, then reduce oven temp to 175°C (350°F) and bake for another 30-40 minutes until golden."
    ],
    status: "approved",
    featured: false,
    createdAt: new Date("2026-06-05").toISOString()
  },
  {
    id: "seed-baklava",
    name: "Traditional Turkish Baklava",
    category: "Snacks",
    description: "Crispy layers of micro-thin filo pastry stuffed with premium chopped pistachios and sweetened with hot honey syrup.",
    prepTime: 45,
    cookTime: 40,
    servings: 12,
    author: "Elif Yilmaz",
    image: "/assets/baklava.png",
    ingredients: [
      "1 pack (450g) filo pastry, thawed",
      "250g unsalted butter, melted",
      "300g pistachios, finely ground",
      "For syrup: 200g sugar, 150ml water, 4 tbsp honey, 1 tbsp lemon juice, 1 tbsp orange blossom water"
    ],
    steps: [
      "For syrup: Boil sugar, water, lemon juice, and honey in a saucepan. Simmer for 10 minutes, stir in orange blossom water, and let cool fully.",
      "Preheat oven to 165°C (325°F). Butter a rectangular baking pan.",
      "Layer 10 sheets of filo pastry, brushing each layer with melted butter.",
      "Spread half of the ground pistachios evenly on top.",
      "Add 6 more buttered filo sheets, then spread the rest of the pistachios.",
      "Layer the remaining filo sheets on top, buttering each. Using a sharp knife, cut into diamond shapes.",
      "Bake for 45 minutes until puffed and golden brown.",
      "Pour the cold syrup over the hot baklava immediately. Let it rest for 4 hours to soak before serving."
    ],
    status: "approved",
    featured: false,
    createdAt: new Date("2026-06-12").toISOString()
  }
];

// Configure Supabase if details are provided in environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Global memory store for local development mockup fallback
declare global {
  var _recipes: Recipe[] | undefined;
}

if (!globalThis._recipes) {
  globalThis._recipes = [...SEED_RECIPES];
}

// Database Service Layer
export const db = {
  async getRecipes(status?: 'approved' | 'pending' | 'all'): Promise<Recipe[]> {
    if (isSupabaseConfigured && supabaseClient) {
      let query = supabaseClient.from('recipes').select('*');
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      const { data, error } = await query.order('createdAt', { ascending: false });
      if (error) {
        console.error('Supabase getRecipes error:', error);
        return [];
      }
      return (data || []) as Recipe[];
    } else {
      // Memory Fallback
      const recipes = globalThis._recipes || [];
      if (!status || status === 'all') return recipes;
      return recipes.filter(r => r.status === status);
    }
  },

  async getRecipeById(id: string): Promise<Recipe | null> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('recipes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('Supabase getRecipeById error:', error);
        return null;
      }
      return data as Recipe | null;
    } else {
      const recipes = globalThis._recipes || [];
      return recipes.find(r => r.id === id) || null;
    }
  },

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'status' | 'featured'> & { status?: 'approved' | 'pending' }): Promise<Recipe> {
    const newRecipe: Recipe = {
      ...recipe,
      id: 'recipe_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: recipe.status || 'pending',
      featured: false
    };

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('recipes')
        .insert([newRecipe])
        .select()
        .single();
      if (error) {
        console.error('Supabase createRecipe error:', error);
        throw error;
      }
      return data as Recipe;
    } else {
      const recipes = globalThis._recipes || [];
      recipes.unshift(newRecipe);
      globalThis._recipes = recipes;
      return newRecipe;
    }
  },

  async updateRecipe(id: string, updatedFields: Partial<Recipe>): Promise<Recipe | null> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('recipes')
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Supabase updateRecipe error:', error);
        return null;
      }
      return data as Recipe;
    } else {
      const recipes = globalThis._recipes || [];
      const idx = recipes.findIndex(r => r.id === id);
      if (idx !== -1) {
        recipes[idx] = { ...recipes[idx], ...updatedFields };
        globalThis._recipes = recipes;
        return recipes[idx];
      }
      return null;
    }
  },

  async deleteRecipe(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseClient) {
      const { error } = await supabaseClient
        .from('recipes')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Supabase deleteRecipe error:', error);
        return false;
      }
      return true;
    } else {
      const recipes = globalThis._recipes || [];
      const len = recipes.length;
      globalThis._recipes = recipes.filter(r => r.id !== id);
      return globalThis._recipes.length !== len;
    }
  }
};
