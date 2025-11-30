import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organizationId');

        if (!organizationId) {
            return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
        }

        console.log(`[GET /api/admin/users] Fetching users for org: ${organizationId}`);

        const snapshot = await db.collection('organizations').doc(organizationId).collection('users').get();
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            uid: doc.id, // For compatibility
            ...doc.data()
        }));

        console.log(`[GET /api/admin/users] Found ${users.length} users`);
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
