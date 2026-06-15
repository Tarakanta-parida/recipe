import { NextResponse } from 'next/server';
import { db, Recipe } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as 'approved' | 'pending' | 'all') || 'approved';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    let recipes = await db.getRecipes(status);

    // Filter by Category
    if (category && category !== 'All') {
      recipes = recipes.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Search Keyword (LIKE matching on Name, Description, and Ingredients)
    if (search) {
      const query = search.toLowerCase().trim();
      recipes = recipes.filter(r => {
        const nameMatch = r.name.toLowerCase().includes(query);
        const descMatch = r.description.toLowerCase().includes(query);
        const ingredientMatch = r.ingredients.some(ing => ing.toLowerCase().includes(query));
        return nameMatch || descMatch || ingredientMatch;
      });
    }

    return NextResponse.json(recipes);
  } catch (err) {
    console.error('API recipes GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Server-side validation
    const { name, category, description, prepTime, cookTime, servings, author, image, ingredients, steps, status } = body;
    
    if (!name || !category || !description || !prepTime || !cookTime || !servings || !author || !ingredients || !steps) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0 || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json({ error: 'Ingredients and steps must be non-empty arrays' }, { status: 400 });
    }

    const newRecipe = await db.createRecipe({
      name,
      category,
      description,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      author,
      image,
      ingredients,
      steps,
      status // passes 'approved' if simulated admin mode is active
    });

    return NextResponse.json(newRecipe, { status: 201 });
  } catch (err) {
    console.error('API recipes POST error:', err);
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
  }
}
