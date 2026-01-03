import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await params;
        console.log(`[GET /api/groups/${groupId}/members] Fetching members`);
        const snapshot = await db.collection('groups').doc(groupId).collection('members').get();
        const members = snapshot.docs.map(doc => {
            const data = doc.data();
            const member = {
                ...data,
                user_id: doc.id  // Always use doc.id as user_id to ensure uniqueness for React keys
            };
            console.log(`[GET /api/groups/${groupId}/members] Member doc.id: ${doc.id}, member object:`, member);
            return member;
        });
        console.log(`[GET /api/groups/${groupId}/members] Returning ${members.length} members`);
        return NextResponse.json(members);
    } catch (error) {
        // params is a Promise so we can't log it directly in catch block easily without resolving it first which might fail
        // Using generic error logging
        console.error(`[GET /api/groups/members] Error:`, error);
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await params;
        const body = await request.json();
        const { user_id, user_name, user_email, role } = body;

        if (!user_id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await db.collection('groups').doc(groupId).collection('members').doc(user_id).set({
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
