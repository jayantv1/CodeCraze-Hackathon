import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await params;
        const doc = await db.collection('groups').doc(groupId).get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }
        return NextResponse.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await params;
        const body = await request.json();
        await db.collection('groups').doc(groupId).update(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await params;
        // Delete all channels in the group
        const channelsSnapshot = await db.collection('channels').where('group_id', '==', groupId).get();
        const batch = db.batch();

        channelsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete the group itself
        const groupRef = db.collection('groups').doc(groupId);
        batch.delete(groupRef);

        await batch.commit();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting group:', error);
        return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
    }
}
