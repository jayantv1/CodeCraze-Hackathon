import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function PATCH(request: Request, { params }: { params: { channelId: string } }) {
    try {
        const body = await request.json();
        await db.collection('channels').doc(params.channelId).update(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { channelId: string } }) {
    try {
        // Delete all messages in the channel (optional, but good practice)
        // For now, just delete the channel document
        await db.collection('channels').doc(params.channelId).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting channel:', error);
        return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
    }
}
