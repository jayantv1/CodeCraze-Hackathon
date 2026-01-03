import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await params;
        const body = await request.json();
        const { user_id, user_name } = body;

        if (!user_id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Check if group exists
        const groupDoc = await db.collection('groups').doc(groupId).get();
        if (!groupDoc.exists) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Add user as member
        await db.collection('groups').doc(groupId).collection('members').doc(user_id).set({
            user_id: user_id,  // Critical: needed for role dropdown visibility check
            user_name: user_name || 'Unknown',
            role: 'member',
            joined_at: new Date().toISOString(),
            permissions: {
                can_post: true,
                can_announce: false,
                can_invite: false,
                can_manage_channels: false
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error joining group:', error);
        return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
    }
}
