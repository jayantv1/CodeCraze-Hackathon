import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function PATCH(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        const body = await request.json();
        const { uid, ...data } = body;

        if (!uid) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        if (decodedToken.uid !== uid) {
            // Check if admin
            const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
            const userData = userDoc.data();
            if (userData?.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // Filter allowed fields to prevent arbitrary updates
        const allowedFields = ['displayName', 'pronouns', 'position', 'location', 'photoURL', 'name', 'avatar_url'];
        const updateData: any = {};
        for (const key of Object.keys(data)) {
            if (allowedFields.includes(key)) {
                updateData[key] = data[key];
            }
        }

        await adminDb.collection('users').doc(uid).update(updateData);
        console.log('Profile updated successfully for:', uid);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
