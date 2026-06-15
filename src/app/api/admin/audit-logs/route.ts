import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { authDb } from '@/lib/auth-db';

export async function GET() {
  try {
    const user = await getCurrentUser();

    // Verify authentication and role
    if (!user || user.role !== 'super_author') {
      return NextResponse.json({ error: 'Forbidden: Only Super Authors can access audit logs' }, { status: 403 });
    }

    const logs = await authDb.getAuditLogs();
    return NextResponse.json(logs);
  } catch (err: any) {
    console.error('Fetch audit logs API error:', err);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
