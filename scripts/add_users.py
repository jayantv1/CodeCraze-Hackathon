#!/usr/bin/env python3
"""
Add additional users to LumFlare organization
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Initialize Firebase
import firebase_admin
from firebase_admin import credentials, firestore, auth
from google.cloud import firestore as gcs_firestore

# Load service account credentials
cred_path = os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json')
if not os.path.exists(cred_path):
    print(f"❌ Service account key not found at {cred_path}")
    sys.exit(1)

# Initialize Firebase Admin
try:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase initialized successfully\n")
except Exception as e:
    print(f"❌ Failed to initialize Firebase: {e}")
    sys.exit(1)

# Get the LumFlare organization
def get_organization():
    orgs_ref = db.collection('organizations')
    query = orgs_ref.where('domain', '==', 'lumflare.com').limit(1)
    docs = list(query.stream())
    
    if docs:
        return docs[0].id, docs[0].to_dict().get('name', 'LumFlare')
    else:
        print("❌ LumFlare organization not found")
        sys.exit(1)

# Add users
def add_users():
    org_id, org_name = get_organization()
    print(f"📋 Adding users to organization: {org_name} (ID: {org_id})\n")
    
    users_to_add = [
        {"email": "jvenkatesan@lumflare.org", "name": "J Venkatesan", "role": "educator"},
        {"email": "arai@lumflare.org", "name": "A Rai", "role": "educator"},
        {"email": "skyasya@lumflare.org", "name": "S Kyasya", "role": "educator"}
    ]
    
    for user_info in users_to_add:
        try:
            # Create user in Firebase Auth
            user = auth.create_user(
                email=user_info["email"],
                password="password",  # Default password
                display_name=user_info["name"],
                email_verified=True
            )
            print(f"✅ Created Firebase Auth user: {user_info['email']} (UID: {user.uid})")
            
            # Create user document in Firestore
            user_data = {
                'uid': user.uid,
                'email': user_info["email"],
                'name': user_info["name"],
                'role': user_info["role"],
                'organizationId': org_id,
                'organizationName': org_name,
                'createdAt': gcs_firestore.SERVER_TIMESTAMP
            }
            
            db.collection('users').document(user.uid).set(user_data)
            print(f"   ✅ Created Firestore user document\n")
            
        except Exception as e:
            print(f"❌ Error creating user {user_info['email']}: {e}\n")
    
    print("\n" + "="*60)
    print("✅ Users added successfully!")
    print("="*60)
    print("\nAll users have the default password: 'password'")
    print("They should change it after their first login.\n")

if __name__ == "__main__":
    add_users()
