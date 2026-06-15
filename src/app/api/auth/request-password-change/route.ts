import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { authDb } from '@/lib/auth-db';
import { emailService } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. Super Author Direct Change Flow
    if (user && user.role === 'super_author') {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Token format "OTP:123456"
      const token = `OTP:${otp}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

      await authDb.createPasswordRequest(
        user.id,
        'Direct password change by Super Author',
        token,
        expiresAt
      );

      // Log action
      await authDb.createAuditLog(user.id, 'OTP generated for Super Author password change', ip);

      // Send simulated email
      await emailService.sendOTP(user.email, otp);

      return NextResponse.json({
        type: 'super_author',
        message: 'A verification code (OTP) has been sent to your registered email.'
      });
    }

    // 2. Contributor Request Flow
    const body = await request.json();
    const { name, email, reason } = body;

    if (!name || !email || !reason) {
      return NextResponse.json({ error: 'Missing required fields: name, email, and reason' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Find the user requesting the change
    const targetUser = await authDb.getUserByEmail(cleanEmail);
    if (!targetUser) {
      return NextResponse.json({ error: 'No user registered with this email address' }, { status: 404 });
    }

    // Generate secure request token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Pending request valid for 24 hours

    const req = await authDb.createPasswordRequest(
      targetUser.id,
      reason,
      token,
      expiresAt
    );

    // Log action
    await authDb.createAuditLog(targetUser.id, `Password change request submitted: ${reason}`, ip);

    // Notify Super Authors
    const superAuthors = ['rkparida09@gmail.com', 'paridatarakanta2020@gmail.com'];
    await emailService.sendApprovalNotification(superAuthors, cleanEmail, reason);

    return NextResponse.json({
      type: 'contributor',
      message: 'Your password change request has been submitted. A Super Author will review and approve it.'
    });
  } catch (err: any) {
    console.error('Request password change API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to request password change' }, { status: 500 });
  }
}
