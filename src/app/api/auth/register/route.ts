import { NextResponse } from 'next/server';
import { authDb } from '@/lib/auth-db';
import { hashPassword, validatePassword, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // Validate password strength rules (min 8 chars, 1 upper, 1 lower, 1 num, 1 special)
    if (!validatePassword(password)) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await authDb.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
    }

    // Default role is contributor, unless predefined email
    let role: 'super_author' | 'contributor' = 'contributor';
    const cleanEmail = email.trim().toLowerCase();
    if (['rkparida09@gmail.com', 'paridatarakanta2020@gmail.com'].includes(cleanEmail)) {
      role = 'super_author';
    }

    const passwordHash = await hashPassword(password);
    const user = await authDb.createUser(name.trim(), cleanEmail, passwordHash, role);

    // Write audit log
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    await authDb.createAuditLog(user.id, `User registration as ${role}`, ip);

    // Auto sign-in
    await setAuthCookie({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return NextResponse.json({
      message: 'Account registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
