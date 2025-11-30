const admin = require('firebase-admin');
const path = require('path');

async function testFirebase() {
    try {
        const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
        console.log('Service account path:', serviceAccountPath);

        const serviceAccount = require(serviceAccountPath);
        console.log('Service account loaded. Project ID:', serviceAccount.project_id);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase admin initialized');
        }

        const db = admin.firestore();
        console.log('Firestore initialized');

        const snapshot = await db.collection('groups').limit(1).get();
        console.log('Successfully fetched groups. Count:', snapshot.size);

    } catch (error) {
        console.error('Firebase test failed:', error);
    }
}

testFirebase();
