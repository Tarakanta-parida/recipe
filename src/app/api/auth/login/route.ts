import { NextResponse } from 'next/server';
import { authDb } from '@/lib/auth-db';
import { comparePassword, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const user = await authDb.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Write audit log
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    await authDb.createAuditLog(user.id, 'User login', ip);

    // Set JWT Cookie
    await setAuthCookie({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('Login API error:', err);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
