import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

# Firebase Configuration (mirrored from api/firebase_db.py just in case, though usually only projectId needed for backend)
FIREBASE_CONFIG = {
    "projectId": "lumflare-71d2f",
    "storageBucket": "lumflare-71d2f.firebasestorage.app"
}

# Check if initialized
if not firebase_admin._apps:
    cred_path = os.path.join(os.getcwd(), 'serviceAccountKey.json')
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': FIREBASE_CONFIG['storageBucket']
        })
    else:
        # Fallback to default or projectId
        print("Warning: serviceAccountKey.json not found. initializing with project ID.")
        try:
             firebase_admin.initialize_app(options={
                 'projectId': FIREBASE_CONFIG['projectId'],
                 'storageBucket': FIREBASE_CONFIG['storageBucket']
             })
        except Exception as e:
             print(f"Failed to initialize Firebase: {e}")

try:
    db = firestore.client()
except Exception as e:
    print(f"Error getting firestore client: {e}")
    db = None
