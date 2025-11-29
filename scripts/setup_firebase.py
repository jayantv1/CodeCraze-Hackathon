#!/usr/bin/env python3
"""
Firebase Setup Script
This script clears existing Firebase data and sets up the LumFlare organization with an admin account.
"""

import sys
import os
import json

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

def clear_all_data():
    """Clear all users and Firestore data"""
    print("🗑️  Clearing existing data...")
    
    # Clear Firestore collections
    collections = ['users', 'organizations', 'groups', 'channels', 'messages', 'posts', 'tests']
    
    for collection_name in collections:
        print(f"  Clearing {collection_name}...")
        collection_ref = db.collection(collection_name)
        docs = collection_ref.stream()
        deleted_count = 0
        for doc in docs:
            doc.reference.delete()
            deleted_count += 1
        print(f"  ✅ Deleted {deleted_count} documents from {collection_name}")
    
    # Clear Firebase Auth users
    print("  Clearing Firebase Auth users...")
    try:
        page = auth.list_users()
        deleted_count = 0
        while page:
            for user in page.users:
                auth.delete_user(user.uid)
                deleted_count += 1
            page = page.get_next_page()
        print(f"  ✅ Deleted {deleted_count} users from Firebase Auth")
    except Exception as e:
        print(f"  ⚠️  Error clearing Auth users: {e}")
    
    print("✅ Data cleared successfully\n")
    return True

def create_organization():
    """Create the LumFlare organization"""
    print("🏢 Creating LumFlare organization...")
    
    org_data = {
        'name': 'LumFlare',
        'domain': 'lumflare.com',
        'createdAt': gcs_firestore.SERVER_TIMESTAMP,
        'settings': {
            'allowUserInvites': True,
            'requireApproval': False
        }
    }
    
    update_time, org_ref = db.collection('organizations').add(org_data)
    org_id = org_ref.id
    print(f"✅ Organization created with ID: {org_id}\n")
    return org_id

def create_admin_user(org_id):
    """Create the admin user"""
    print("👤 Creating admin user...")
    
    email = "pyeturi@lumflare.org"
    password = "password"
    
    try:
        # Create user in Firebase Auth
        user = auth.create_user(
            email=email,
            password=password,
            display_name="Admin User",
            email_verified=True
        )
        print(f"✅ Created Firebase Auth user: {user.uid}")
        
        # Create user document in Firestore
        user_data = {
            'uid': user.uid,
            'email': email,
            'name': 'Admin User',
            'role': 'admin',
            'organizationId': org_id,
            'organizationName': 'LumFlare',
            'createdAt': gcs_firestore.SERVER_TIMESTAMP
        }
        
        db.collection('users').document(user.uid).set(user_data)
        print(f"✅ Created Firestore user document")
        print(f"\n📧 Admin credentials:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Role: admin\n")
        
        return user.uid
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None

def main():
    """Main setup function"""
    print("\n" + "="*60)
    print("  LumFlare Firebase Setup")
    print("="*60 + "\n")
    
    # Confirm action
    response = input("⚠️  This will DELETE all existing data. Continue? (yes/no): ")
    if response.lower() != 'yes':
        print("❌ Setup cancelled.")
        return
    
    # Execute setup
    if not clear_all_data():
        print("❌ Failed to clear data. Aborting.")
        return
    
    org_id = create_organization()
    if not org_id:
        print("❌ Failed to create organization. Aborting.")
        return
    
    admin_uid = create_admin_user(org_id)
    if not admin_uid:
        print("❌ Failed to create admin user. Aborting.")
        return
    
    print("="*60)
    print("✅ Setup completed successfully!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
