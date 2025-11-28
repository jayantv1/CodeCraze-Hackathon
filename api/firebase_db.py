import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase Admin SDK
# Check if the app is already initialized to avoid errors during hot reloads
if not firebase_admin._apps:
    cred_path = os.path.join(os.getcwd(), 'serviceAccountKey.json')
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print("Warning: serviceAccountKey.json not found. Firebase not initialized.")
        # In a real app, you might want to raise an error here
        # raise FileNotFoundError("serviceAccountKey.json not found")

def get_db():
    if firebase_admin._apps:
        return firestore.client()
    return None
