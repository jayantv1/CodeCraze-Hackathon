import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        console.log('Initializing Firebase Admin with key at:', process.cwd() + '/serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(process.cwd() + '/serviceAccountKey.json'),
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
