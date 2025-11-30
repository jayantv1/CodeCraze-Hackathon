import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (!admin.apps.length) {
    try {
        const serviceAccount = require('../serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase admin initialized successfully');
    } catch (error) {
        console.error('Firebase admin initialization error', error);
        throw new Error('Failed to initialize Firebase Admin SDK');
    }
} else {
    console.log('Firebase admin already initialized');
}

// Initialize Firestore and Auth after app is created
db = admin.firestore();
auth = admin.auth();

export { db, auth };
