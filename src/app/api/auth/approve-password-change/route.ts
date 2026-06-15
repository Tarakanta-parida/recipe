import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { authDb } from '@/lib/auth-db';
import { emailService } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Verify authentication and role
    if (!user || user.role !== 'super_author') {
      return NextResponse.json({ error: 'Forbidden: Only Super Authors can approve requests' }, { status: 403 });
    }

    const { requestId } = await request.json();
    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    // Approve request (updates expires_at to 15 mins from now)
    const approved = await authDb.approvePasswordRequest(requestId, user.id);
    if (!approved) {
      return NextResponse.json({ error: 'Request not found or not in pending state' }, { status: 400 });
    }

    // Fetch the request details
    const approvedReq = await authDb.getPasswordRequestById(requestId);
    if (approvedReq) {
      // Send simulated reset email with 15-minute token link
      await emailService.sendResetLink(approvedReq.requester_email || '', approvedReq.request_token);
      
      // Log audit
      await authDb.createAuditLog(
        user.id,
        `Approved password change request for user ID ${approvedReq.requester_id}`,
        ip
      );
    }

    return NextResponse.json({
      message: 'Password change request approved successfully'
    });
  } catch (err: any) {
    console.error('Approve password change API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to approve request' }, { status: 500 });
  }
}
