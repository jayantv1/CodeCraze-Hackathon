#!/usr/bin/env python3
"""
List ALL Firebase Auth users (including those not in Firestore)
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Initialize Firebase
import firebase_admin
from firebase_admin import credentials, auth

# Load service account credentials
cred_path = os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json')

# Initialize Firebase Admin
try:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    print("✅ Firebase initialized successfully\n")
except Exception as e:
    print(f"❌ Failed to initialize Firebase: {e}")
    sys.exit(1)

def list_all_auth_users():
    print("🔍 Listing ALL Firebase Auth users:\n")
    print("="*80)
    
    page = auth.list_users()
    count = 0
    
    while page:
        for user in page.users:
            count += 1
            print(f"{count}. {user.email}")
            print(f"   UID: {user.uid}")
            print(f"   Display Name: {user.display_name}")
            print(f"   Email Verified: {user.email_verified}")
            print()
        
        page = page.get_next_page()
    
    print("="*80)
    print(f"Total users: {count}")

if __name__ == "__main__":
    list_all_auth_users()
