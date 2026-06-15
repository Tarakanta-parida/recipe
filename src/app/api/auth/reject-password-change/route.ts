import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { authDb } from '@/lib/auth-db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Verify authentication and role
    if (!user || user.role !== 'super_author') {
      return NextResponse.json({ error: 'Forbidden: Only Super Authors can reject requests' }, { status: 403 });
    }

    const { requestId } = await request.json();
    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    // Reject request
    const rejected = await authDb.rejectPasswordRequest(requestId, user.id);
    if (!rejected) {
      return NextResponse.json({ error: 'Request not found or not in pending state' }, { status: 400 });
    }

    // Log audit
    const req = await authDb.getPasswordRequestById(requestId);
    if (req) {
      await authDb.createAuditLog(
        user.id,
        `Rejected password change request for user ID ${req.requester_id}`,
        ip
      );
    }

    return NextResponse.json({
      message: 'Password change request rejected successfully'
    });
  } catch (err: any) {
    console.error('Reject password change API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to reject request' }, { status: 500 });
  }
}
