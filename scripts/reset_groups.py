#!/usr/bin/env python3
"""
Reset Groups Collection
Deletes all groups and their subcollections to start fresh with proper data structure.
"""

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import firestore as gcs_firestore
import sys

def delete_collection(db, coll_ref, batch_size=100):
    """Delete a collection in batches."""
    deleted = 0
    docs = coll_ref.limit(batch_size).stream()
    
    for doc in docs:
        print(f'  Deleting {doc.id}...')
        # Delete subcollections first
        subcollections = doc.reference.collections()
        for subcoll in subcollections:
            delete_collection(db, subcoll, batch_size)
        
        doc.reference.delete()
        deleted += 1
    
    if deleted >= batch_size:
        return delete_collection(db, coll_ref, batch_size)
    
    return deleted

def main():
    print("=" * 60)
    print("RESET GROUPS COLLECTION")
    print("=" * 60)
    print("\n⚠️  WARNING: This will DELETE ALL groups and their data!")
    print("This cannot be undone.\n")
    
    confirm = input("Type 'DELETE' to confirm: ")
    if confirm != 'DELETE':
        print("❌ Aborted.")
        return
    
    try:
        # Initialize Firebase Admin
        cred = credentials.Certificate('serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        print("\n✅ Firebase initialized successfully\n")
        
        # Delete all groups
        print("🗑️  Deleting all groups...")
        groups_ref = db.collection('groups')
        deleted = delete_collection(db, groups_ref)
        
        print(f"\n✅ Deleted {deleted} groups successfully!")
        
        print("\n" + "=" * 60)
        print("✅ GROUPS COLLECTION RESET COMPLETE!")
        print("=" * 60)
        print("\nYou can now create new groups with the correct data structure.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
