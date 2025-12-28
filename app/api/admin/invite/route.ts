import { NextResponse } from 'next/server';
import { auth as adminAuth, db as adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, role, position, location, organizationId, organizationName } = body;

        if (!email || !organizationId) {
            return NextResponse.json({ error: 'Email and Organization ID required' }, { status: 400 });
        }

        // Create user in Firebase Auth
        // Note: Passwordless or temp password? For simplicity, we'll create with a temp password or just a placeholder.
        // Actually, creating a user without password usually requires sending an invite link.
        // For this hackathon, we might just create the Firestore document and let the user "sign up" later, 
        // OR create the auth user with a default password.
        // Let's try to create the user.

        let uid;
        try {
            const userRecord = await adminAuth.createUser({
                email: email,
                emailVerified: false,
                password: 'tempPassword123!', // In a real app, send a reset link
                displayName: email.split('@')[0],
                disabled: false,
            });
            uid = userRecord.uid;
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                const userRecord = await adminAuth.getUserByEmail(email);
                uid = userRecord.uid;
            } else {
                throw error;
            }
        }

        // Create/Update Firestore document
        await adminDb.collection('users').doc(uid).set({
            email,
            role,
            position: position || '',
            location: location || '',
            organizationId,
            organizationName,
            createdAt: new Date(),
            name: email.split('@')[0], // Default name
        }, { merge: true });

        return NextResponse.json({ success: true, uid });
    } catch (error) {
        console.error('Error inviting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
