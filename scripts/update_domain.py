#!/usr/bin/env python3
"""
Update LumFlare organization domain to lumflare.org
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

# Update organization domain
def update_organization_domain():
    print("🔄 Updating organization domain...\n")
    
    # Find organization by old domain
    orgs_ref = db.collection('organizations')
    query = orgs_ref.where('domain', '==', 'lumflare.com').limit(1)
    docs = list(query.stream())
    
    if not docs:
        print("⚠️  Organization with domain 'lumflare.com' not found")
        print("   Checking for 'lumflare.org'...")
        
        query = orgs_ref.where('domain', '==', 'lumflare.org').limit(1)
        docs = list(query.stream())
        
        if docs:
            print("✅ Organization already has domain 'lumflare.org'")
            return
        else:
            print("❌ No LumFlare organization found")
            return
    
    org_doc = docs[0]
    org_id = org_doc.id
    
    # Update domain
    org_doc.reference.update({'domain': 'lumflare.org'})
    
    print(f"✅ Updated organization domain to 'lumflare.org'")
    print(f"   Organization ID: {org_id}")
    print(f"   Organization Name: {org_doc.to_dict().get('name', 'LumFlare')}\n")
    
    print("="*60)
    print("✅ Domain update completed!")
    print("="*60)
    print("\nOnly users with @lumflare.org email addresses can now log in.")

if __name__ == "__main__":
    update_organization_domain()
