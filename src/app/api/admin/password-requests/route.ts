import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { authDb } from '@/lib/auth-db';

export async function GET() {
  try {
    const user = await getCurrentUser();

    // Verify authentication
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await authDb.getPendingPasswordRequests();

    if (user.role === 'super_author') {
      // Super Authors see all requests
      return NextResponse.json(requests);
    } else {
      // Contributors see only their own requests
      const ownRequests = requests.filter(r => r.requester_id === user.id);
      return NextResponse.json(ownRequests);
    }
  } catch (err: any) {
    console.error('Fetch password requests API error:', err);
    return NextResponse.json({ error: 'Failed to fetch password requests' }, { status: 500 });
  }
}
