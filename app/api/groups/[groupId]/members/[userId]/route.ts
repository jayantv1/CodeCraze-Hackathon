import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function DELETE(request: Request, { params }: { params: Promise<{ groupId: string, userId: string }> }) {
    try {
        const { groupId, userId } = await params;
        await db.collection('groups').doc(groupId).collection('members').doc(userId).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ groupId: string, userId: string }> }) {
    try {
        const { groupId, userId } = await params;
        const body = await request.json();
        const { permissions, role } = body;

        const updateData: any = {};
        if (permissions) updateData.permissions = permissions;
        if (role) updateData.role = role;

        await db.collection('groups').doc(groupId).collection('members').doc(userId).update(updateData);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
    }
}
