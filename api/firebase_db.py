import firebase_admin
from firebase_admin import credentials, firestore
import os

# Firebase Configuration
FIREBASE_CONFIG = {
    "apiKey": "AIzaSyD9Oc03NcGywc5tpmIGziE58GLRrnDrHUo",
    "authDomain": "lumflare-71d2f.firebaseapp.com",
    "projectId": "lumflare-71d2f",
    "storageBucket": "lumflare-71d2f.firebasestorage.app",
    "messagingSenderId": "1097937718518",
    "appId": "1:1097937718518:web:9fe0140871d2ccbd9130d7",
    "measurementId": "G-NQYN8VJ01S"
}

# Initialize Firebase Admin SDK
# Check if the app is already initialized to avoid errors during hot reloads
if not firebase_admin._apps:
    cred_path = os.path.join(os.getcwd(), 'serviceAccountKey.json')
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Fallback to initializing with project ID (requires default credentials or public access)
        print("Warning: serviceAccountKey.json not found. Attempting to initialize with project ID.")
        try:
            firebase_admin.initialize_app(options={'projectId': FIREBASE_CONFIG['projectId']})
        except Exception as e:
             print(f"Failed to initialize Firebase: {e}")

def get_db():
    if firebase_admin._apps:
        return firestore.client()
    return None
