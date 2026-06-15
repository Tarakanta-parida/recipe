import { NextResponse } from 'next/server';
import { authDb } from '@/lib/auth-db';
import { hashPassword, validatePassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Missing token or new password' }, { status: 400 });
    }

    // Validate password rules (min 8 chars, 1 upper, 1 lower, 1 num, 1 special)
    if (!validatePassword(newPassword)) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      }, { status: 400 });
    }

    // Get the request details
    const req = await authDb.getPasswordRequestByToken(token);
    if (!req) {
      return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    // Check expiration
    if (new Date(req.expires_at).getTime() < Date.now()) {
      await authDb.consumePasswordRequest(req.id); // Mark it as expired
      return NextResponse.json({ error: 'Password reset token has expired (15 minutes limit exceeded)' }, { status: 400 });
    }

    const isOtp = req.request_token.startsWith('OTP:');

    if (isOtp) {
      // Direct Super Author OTP flow - must be in pending state
      if (req.status !== 'pending') {
        return NextResponse.json({ error: 'This verification code has already been used or invalidated' }, { status: 400 });
      }

      // Hash password and update
      const newHash = await hashPassword(newPassword);
      const updated = await authDb.updateUserPassword(req.requester_id, newHash);
      if (!updated) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
      }

      // Mark request as consumed (expired)
      await authDb.consumePasswordRequest(req.id);

      // Log audit
      await authDb.createAuditLog(req.requester_id, 'Direct password change completed via OTP by Super Author', ip);

      return NextResponse.json({ message: 'Your password has been changed successfully' });
    } else {
      // Contributor reset link flow - must be in approved state
      if (req.status !== 'approved') {
        return NextResponse.json({ error: 'This request has not been approved by a Super Author yet' }, { status: 400 });
      }

      // Hash password and update
      const newHash = await hashPassword(newPassword);
      const updated = await authDb.updateUserPassword(req.requester_id, newHash);
      if (!updated) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
      }

      // Mark request as consumed
      await authDb.consumePasswordRequest(req.id);

      // Log audit
      await authDb.createAuditLog(
        req.requester_id,
        `Password reset completed via approved request. Approved by user ID ${req.approver_id}`,
        ip
      );

      return NextResponse.json({ message: 'Your password has been reset successfully' });
    }
  } catch (err: any) {
    console.error('Reset password API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to reset password' }, { status: 500 });
  }
}
