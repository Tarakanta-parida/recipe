import { NextResponse } from 'next/server';
import { clearAuthCookie, getCurrentUser } from '@/lib/auth';
import { authDb } from '@/lib/auth-db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (user) {
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
      await authDb.createAuditLog(user.id, 'User logout', ip);
    }
    
    await clearAuthCookie();
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
  }
}
