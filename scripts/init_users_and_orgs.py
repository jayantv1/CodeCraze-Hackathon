#!/usr/bin/env python3
"""
Initialize test data for user management and permissions system.
Creates sample organizations, users, and group members with various roles.
"""

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

def create_sample_data():
    print("🚀 Initialize User Management Data")
    print("=" * 50)
    
    # 1. Create Organization
    print("\n📁 Creating organization...")
    org_ref = db.collection('organizations').add({
        'name': 'Example School District',
        'domain': 'exampleschool.com',
        'settings': {
            'allow_user_discovery': True,
            'require_approval': False
        },
        'created_at': firestore.SERVER_TIMESTAMP
    })
    org_id = org_ref[1].id
    print(f"✅ Created organization: Example School District (ID: {org_id})")
    
    # 2. Create Sample Users
    print("\n👥 Creating sample users...")
    users = [
        {
            'name': 'Alice Johnson',
            'email': 'alice@exampleschool.com',
            'domain': 'exampleschool.com',
            'organization_id': org_id,
            'role': 'admin',
            'created_at': firestore.SERVER_TIMESTAMP
        },
        {
            'name': 'Bob Smith',
            'email': 'bob@exampleschool.com',
            'domain': 'exampleschool.com',
            'organization_id': org_id,
            'role': 'user',
            'created_at': firestore.SERVER_TIMESTAMP
        },
        {
            'name': 'Carol Davis',
            'email': 'carol@exampleschool.com',
            'domain': 'exampleschool.com',
            'organization_id': org_id,
            'role': 'user',
            'created_at': firestore.SERVER_TIMESTAMP
        },
        {
            'name': 'David Wilson',
            'email': 'david@exampleschool.com',
            'domain': 'exampleschool.com',
            'organization_id': org_id,
            'role': 'user',
            'created_at': firestore.SERVER_TIMESTAMP
        }
    ]
    
    created_users = []
    for user in users:
        user_ref = db.collection('users').add(user)
        user_id = user_ref[1].id
        created_users.append({'id': user_id, **user})
        print(f"✅ Created user: {user['name']} ({user['role']})")
    
    # 3. Add Users to Existing Groups as Members with Different Roles
    print("\n🔐 Adding users to groups with permissions...")
    
    # Get the first group (General)
    groups = list(db.collection('groups').limit(1).stream())
    if groups:
        group = groups[0]
        group_id = group.id
        
        # Add users with different roles
        role_assignments = [
            {'user': created_users[0], 'role': 'owner', 'all_perms': True},  # Alice - Owner
            {'user': created_users[1], 'role': 'admin', 'all_perms': True},  # Bob - Admin
            {'user': created_users[2], 'role': 'moderator', 'limited_perms': True},  # Carol - Moderator
            {'user': created_users[3], 'role': 'member', 'basic_perms': True}  # David - Member
        ]
        
        for assignment in role_assignments:
            user = assignment['user']
            role = assignment['role']
            
            # Determine permissions based on role
            if 'all_perms' in assignment:
                permissions = {
                    'can_post': True,
                    'can_announce': True,
                    'can_invite': True,
                    'can_manage_channels': True
                }
            elif 'limited_perms' in assignment:
                permissions = {
                    'can_post': True,
                    'can_announce': True,
                    'can_invite': False,
                    'can_manage_channels': False
                }
            else:
                permissions = {
                    'can_post': True,
                    'can_announce': False,
                    'can_invite': False,
                    'can_manage_channels': False
                }
            
            member_data = {
                'user_id': user['id'],
                'user_name': user['name'],
                'user_email': user['email'],
                'role': role,
                'permissions': permissions,
                'joined_at': firestore.SERVER_TIMESTAMP
            }
            
            db.collection('groups').document(group_id).collection('members').document(user['id']).set(member_data)
            print(f"✅ Added {user['name']} to General group as {role}")
    
    print("\n" + "=" * 50)
    print("✨ User management data initialization complete!")
    print(f"Created: 1 organization, {len(created_users)} users")
    print("\nYou can now:")
    print("- Search for users by domain (@exampleschool.com)")
    print("- Manage group members and their roles")
    print("- Test permission-based features")

if __name__ == '__main__':
    create_sample_data()
