#!/usr/bin/env python3
"""
INITIAL SETUP ONLY - Create the first admin account
After creating the first admin, all other users should be invited through the Admin Dashboard UI
Usage: python add_single_user.py <email> [name] [role]
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Initialize Firebase
import firebase_admin
from firebase_admin import credentials, firestore, auth
from google.cloud import firestore as gcs_firestore

# Load service account credentials
cred_path = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")
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


def get_or_create_organization(domain):
    """Get organization by domain or create if doesn't exist"""
    orgs_ref = db.collection("organizations")
    query = orgs_ref.where("domain", "==", domain).limit(1)
    docs = list(query.stream())

    if docs:
        org_id = docs[0].id
        org_name = docs[0].to_dict().get("name", domain.split(".")[0].capitalize())
        print(f"✅ Found organization: {org_name} (ID: {org_id})")
        return org_id, org_name
    else:
        # Create new organization
        org_name = domain.split(".")[0].capitalize()
        org_ref = db.collection("organizations").add(
            {
                "name": org_name,
                "domain": domain,
                "settings": {"allow_user_discovery": True, "require_approval": False},
                "created_at": gcs_firestore.SERVER_TIMESTAMP,
            }
        )
        org_id = org_ref[1].id
        print(f"✅ Created new organization: {org_name} (ID: {org_id})")
        return org_id, org_name


def add_user(email, name=None, role="educator"):
    """Add a user to the system"""

    # Extract domain from email
    if "@" not in email:
        print("❌ Invalid email address")
        sys.exit(1)

    domain = email.split("@")[1]

    # Get or create organization
    org_id, org_name = get_or_create_organization(domain)

    # Default name to email username if not provided
    if not name:
        name = email.split("@")[0].replace(".", " ").title()

    print(f"\n📋 Adding user:")
    print(f"   Email: {email}")
    print(f"   Name: {name}")
    print(f"   Role: {role}")
    print(f"   Organization: {org_name} ({domain})\n")

    try:
        # Check if user already exists in Firebase Auth
        try:
            existing_user = auth.get_user_by_email(email)
            user_uid = existing_user.uid
            print(f"ℹ️  User already exists in Firebase Auth (UID: {user_uid})")
        except auth.UserNotFoundError:
            # Create user in Firebase Auth
            user = auth.create_user(
                email=email,
                password="TempPassword123!",  # Temporary password
                display_name=name,
                email_verified=False,
            )
            user_uid = user.uid
            print(f"✅ Created Firebase Auth user (UID: {user_uid})")

        # Create or update user document in Firestore
        user_data = {
            "uid": user_uid,
            "email": email,
            "name": name,
            "role": role,
            "organizationId": org_id,
            "organizationName": org_name,
            "createdAt": gcs_firestore.SERVER_TIMESTAMP,
        }

        # Create root pointer
        db.collection("users").document(user_uid).set({
            "uid": user_uid,
            "organizationId": org_id
        }, merge=True)

        # Create user in organization collection
        db.collection("organizations").document(org_id).collection("users").document(user_uid).set(user_data, merge=True)
        print(f"✅ Created/Updated Firestore user document in organization\n")

        print("=" * 60)
        print("✅ FIRST ADMIN ACCOUNT CREATED!")
        print("=" * 60)
        print(f"\nLogin credentials:")
        print(f"   Email: {email}")
        print(f"   Temporary Password: TempPassword123!")
        print(f"\nOr use Google Sign-In with {email}")
        print(f"\n⚠️  IMPORTANT:")
        print(f"   1. Log in to the admin dashboard")
        print(f"   2. Use the 'Invite User' feature to add other users")
        print(f"   3. DO NOT use this script again - use the UI instead!\n")

    except Exception as e:
        print(f"❌ Error creating user: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("=" * 60)
        print("INITIAL SETUP - Create First Admin Account")
        print("=" * 60)
        print("\nUsage: python add_single_user.py <email> [name] [role]")
        print("\nExample (create admin):")
        print("  python add_single_user.py admin@example.com 'Admin Name' admin")
        print("\nAfter creating the first admin:")
        print("  1. Log in with the admin account")
        print("  2. Go to the Admin Dashboard")
        print("  3. Use 'Invite User' to add all other users")
        print("\n⚠️  This script is for INITIAL SETUP ONLY!")
        sys.exit(1)

    email = sys.argv[1]
    name = sys.argv[2] if len(sys.argv) > 2 else None
    role = (
        sys.argv[3] if len(sys.argv) > 3 else "admin"
    )  # Default to admin for initial setup

    # Recommend admin role for first user
    if role != "admin":
        print(f"\n⚠️  WARNING: Creating user with role '{role}'")
        print("For initial setup, it's recommended to create an admin account.")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != "y":
            print("Cancelled.")
            sys.exit(0)

    add_user(email, name, role)
