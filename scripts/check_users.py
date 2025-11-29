#!/usr/bin/env python3
"""
Check and fix user organization assignments
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Initialize Firebase
import firebase_admin
from firebase_admin import credentials, firestore

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

def check_and_fix_users():
    print("🔍 Checking user organization assignments...\n")
    
    # Get the current LumFlare organization
    orgs_ref = db.collection('organizations')
    query = orgs_ref.where('domain', '==', 'lumflare.org').limit(1)
    docs = list(query.stream())
    
    if not docs:
        print("❌ LumFlare organization (lumflare.org) not found")
        return
    
    correct_org_id = docs[0].id
    correct_org_name = docs[0].to_dict().get('name', 'LumFlare')
    
    print(f"📋 Current Organization:")
    print(f"   Name: {correct_org_name}")
    print(f"   Domain: lumflare.org")
    print(f"   ID: {correct_org_id}\n")
    
    # Get all users
    users_ref = db.collection('users')
    all_users = users_ref.stream()
    
    print("👥 Current Users:")
    print("="*80)
    
    users_to_fix = []
    
    for user_doc in all_users:
        user_data = user_doc.to_dict()
        user_email = user_data.get('email', 'Unknown')
        user_org_id = user_data.get('organizationId', 'None')
        user_role = user_data.get('role', 'educator')
        
        status = "✅" if user_org_id == correct_org_id else "❌"
        print(f"{status} {user_email}")
        print(f"   Role: {user_role}")
        print(f"   Org ID: {user_org_id}")
        
        if user_org_id != correct_org_id:
            print(f"   ⚠️  MISMATCH - Should be: {correct_org_id}")
            users_to_fix.append((user_doc.id, user_email))
        
        print()
    
    # Fix users with wrong organization
    if users_to_fix:
        print("\n🔧 Fixing user organization assignments...\n")
        
        for uid, email in users_to_fix:
            try:
                users_ref.document(uid).update({
                    'organizationId': correct_org_id,
                    'organizationName': correct_org_name
                })
                print(f"✅ Fixed {email}")
            except Exception as e:
                print(f"❌ Error fixing {email}: {e}")
        
        print("\n" + "="*80)
        print("✅ All users updated successfully!")
        print("="*80)
    else:
        print("✅ All users are correctly assigned to the organization!")

if __name__ == "__main__":
    check_and_fix_users()
