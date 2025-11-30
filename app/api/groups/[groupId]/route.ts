import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: { groupId: string } }) {
    try {
        const doc = await db.collection('groups').doc(params.groupId).get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }
        return NextResponse.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { groupId: string } }) {
    try {
        const body = await request.json();
        await db.collection('groups').doc(params.groupId).update(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { groupId: string } }) {
    try {
        // Delete all channels in the group
        const channelsSnapshot = await db.collection('channels').where('group_id', '==', params.groupId).get();
        const batch = db.batch();

        channelsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete the group itself
        const groupRef = db.collection('groups').doc(params.groupId);
        batch.delete(groupRef);

        await batch.commit();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting group:', error);
        return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
    }
}
