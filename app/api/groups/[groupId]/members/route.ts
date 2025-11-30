import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: { groupId: string } }) {
    try {
        console.log(`[GET /api/groups/${params.groupId}/members] Fetching members`);
        const snapshot = await db.collection('groups').doc(params.groupId).collection('members').get();
        const members = snapshot.docs.map(doc => {
            const data = doc.data();
            const member = {
                ...data,
                user_id: doc.id  // Always use doc.id as user_id to ensure uniqueness for React keys
            };
            console.log(`[GET /api/groups/${params.groupId}/members] Member doc.id: ${doc.id}, member object:`, member);
            return member;
        });
        console.log(`[GET /api/groups/${params.groupId}/members] Returning ${members.length} members`);
        return NextResponse.json(members);
    } catch (error) {
        console.error(`[GET /api/groups/${params.groupId}/members] Error:`, error);
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { groupId: string } }) {
    try {
        const body = await request.json();
        const { user_id, user_name, user_email, role } = body;

        if (!user_id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await db.collection('groups').doc(params.groupId).collection('members').doc(user_id).set({
            user_id: user_id,  // Critical: needed for role dropdown visibility check
            user_name,
            user_email,
            role: role || 'member',
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
        console.error('Error adding member:', error);
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
    }
}
