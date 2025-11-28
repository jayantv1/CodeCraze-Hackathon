"""
Helper script to initialize default groups and channels in Firestore.
Run this once to set up the initial data structure for the messaging system.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.firebase_db import get_db
from firebase_admin import firestore

def initialize_messaging_data():
    db = get_db()
    if not db:
        print("Error: Database not connected")
        return
    
    print("Initializing messaging data...")
    
    # Create default groups
    groups_data = [
        {
            'name': 'General',
            'description': 'School-wide communication',
            'is_private': False,
            'created_at': firestore.SERVER_TIMESTAMP
        },
        {
            'name': 'Math Department',
            'description': 'For all math teachers',
            'is_private': False,
            'created_at': firestore.SERVER_TIMESTAMP
        },
        {
            'name': 'Grade 10 Teachers',
            'description': 'All teachers working with 10th grade',
            'is_private': False,
            'created_at': firestore.SERVER_TIMESTAMP
        }
    ]
    
    group_ids = []
    for group_data in groups_data:
        # Check if group already exists
        existing = db.collection('groups').where('name', '==', group_data['name']).limit(1).get()
        if len(list(existing)) > 0:
            print(f"Group '{group_data['name']}' already exists, skipping...")
            group_ids.append(list(existing)[0].id)
        else:
            _, group_ref = db.collection('groups').add(group_data)
            group_ids.append(group_ref.id)
            print(f"Created group: {group_data['name']} (ID: {group_ref.id})")
    
    # Create default channels for each group
    for group_id in group_ids:
        channels_data = [
            {
                'name': 'general',
                'group_id': group_id,
                'description': 'General discussion',
                'is_private': False,
                'created_at': firestore.SERVER_TIMESTAMP
            },
            {
                'name': 'announcements',
                'group_id': group_id,
                'description': 'Important announcements',
                'is_private': False,
                'created_at': firestore.SERVER_TIMESTAMP
            },
            {
                'name': 'random',
                'group_id': group_id,
                'description': 'Off-topic conversations',
                'is_private': False,
                'created_at': firestore.SERVER_TIMESTAMP
            }
        ]
        
        for channel_data in channels_data:
            # Check if channel already exists
            existing = db.collection('channels').where('name', '==', channel_data['name']).where('group_id', '==', group_id).limit(1).get()
            if len(list(existing)) > 0:
                print(f"  Channel '#{channel_data['name']}' already exists in group, skipping...")
            else:
                _, channel_ref = db.collection('channels').add(channel_data)
                print(f"  Created channel: #{channel_data['name']} (ID: {channel_ref.id})")
    
    print("\nInitialization complete!")
    print("\nYou can now:")
    print("1. Visit /chat in your browser")
    print("2. Select a group from the left sidebar")
    print("3. Select a channel from the middle sidebar")
    print("4. Start messaging!")

if __name__ == '__main__':
    initialize_messaging_data()
