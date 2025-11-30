#!/usr/bin/env python3
"""
Migrate Users to Organization Structure
Migrates all users from the root 'users' collection to 'organizations/{orgId}/users' subcollections.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import sys

def main():
    print("=" * 60)
    print("MIGRATE USERS TO ORGANIZATION STRUCTURE")
    print("=" * 60)
    
    try:
        # Initialize Firebase Admin
        cred = credentials.Certificate('serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        print("\n✅ Firebase initialized successfully\n")
        
        # Get all users from root collection
        users_ref = db.collection('users')
        users_snapshot = list(users_ref.stream())
        
        migrated = 0
        skipped = 0
        errors = 0
        
        print(f"Found {len(users_snapshot)} users in root collection\n")
        
        for user_doc in users_snapshot:
            user_data = user_doc.to_dict()
            user_id = user_doc.id
            org_id = user_data.get('organizationId')
            
            if not org_id:
                print(f"⚠️  Skipping {user_data.get('email', user_id)} - no organizationId")
                skipped += 1
                continue
            
            try:
                # Copy to organization subcollection
                org_user_ref = db.collection('organizations').document(org_id).collection('users').document(user_id)
                org_user_ref.set(user_data, merge=True)
                
                # Update root collection to be just a pointer
                db.collection('users').document(user_id).set({
                    'uid': user_id,
                    'organizationId': org_id
                }, merge=True)
                
                print(f"✅ Migrated {user_data.get('email', user_id)} to org {org_id}")
                migrated += 1
                
            except Exception as e:
                print(f"❌ Error migrating {user_id}: {e}")
                errors += 1
        
        print("\n" + "=" * 60)
        print("MIGRATION COMPLETE!")
        print("=" * 60)
        print(f"✅ Migrated: {migrated}")
        print(f"⚠️  Skipped:  {skipped}")
        print(f"❌ Errors:   {errors}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
