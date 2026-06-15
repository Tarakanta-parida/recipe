import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipe = await db.getRecipeById(id);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (err) {
    console.error('API recipe GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const recipe = await db.getRecipeById(id);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const updated = await db.updateRecipe(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('API recipe PUT error:', err);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const recipe = await db.getRecipeById(id);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const success = await db.deleteRecipe(id);
    if (success) {
      return NextResponse.json({ message: 'Recipe deleted successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
    }
  } catch (err) {
    console.error('API recipe DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
}
