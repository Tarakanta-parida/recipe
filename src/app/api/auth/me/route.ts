import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { authDb } from '@/lib/auth-db';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Optionally fetch full user name from database
    const dbUser = await authDb.getUserById(sessionUser.id);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionUser.id,
        email: sessionUser.email,
        role: sessionUser.role,
        name: dbUser?.name || 'User'
      }
    });
  } catch (err) {
    console.error('Session retrieval API error:', err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
