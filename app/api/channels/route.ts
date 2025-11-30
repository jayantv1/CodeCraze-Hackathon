import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('group_id');
        const organizationId = searchParams.get('organizationId');

        let query = db.collection('channels');

        if (groupId) {
            query = query.where('group_id', '==', groupId) as any;
        }

        if (organizationId) {
            query = query.where('organizationId', '==', organizationId) as any;
        }

        const snapshot = await query.get();
        const channels = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, group_id, description, is_private, organizationId } = body;

        if (!name || !group_id || !organizationId) {
            return NextResponse.json({ error: 'Name, Group ID and Organization ID are required' }, { status: 400 });
        }

        const channelRef = await db.collection('channels').add({
            name,
            group_id,
            description: description || '',
            is_private: is_private || false,
            organizationId,
            created_at: new Date().toISOString()
        });

        return NextResponse.json({
            id: channelRef.id,
            name,
            group_id,
            description,
            is_private,
            organizationId
        });
    } catch (error) {
        console.error('Error creating channel:', error);
        return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
    }
}
