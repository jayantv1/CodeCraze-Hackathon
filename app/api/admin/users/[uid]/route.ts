import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function DELETE(request: Request, { params }: { params: { uid: string } }) {
    try {
        const { uid } = params;
        await adminAuth.deleteUser(uid);
        await adminDb.collection('users').doc(uid).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { uid: string } }) {
    try {
        const { uid } = params;
        const body = await request.json();
        const { role } = body;

        if (role) {
            await adminDb.collection('users').doc(uid).update({ role });
            // Also update custom claims if using them
            await adminAuth.setCustomUserClaims(uid, { role });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
