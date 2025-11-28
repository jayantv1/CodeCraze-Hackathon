# User Management and Permissions API Endpoints

from flask import Blueprint, request, jsonify
from api.firebase_db import get_db
from firebase_admin import firestore

api = Blueprint('user_api', __name__)

# Helper to get DB
def db():
    return get_db()

# --- ORGANIZATIONS ---
@api.route('/api/organizations', methods=['GET'])
def get_organizations():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "organizations": []}), 200
    try:
        orgs_ref = db_instance.collection('organizations')
        docs = orgs_ref.stream()
        orgs = [{'id': doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(orgs)
    except Exception as e:
        return jsonify({"error": str(e), "organizations": []}), 500

@api.route('/api/organizations', methods=['POST'])
def create_organization():
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    required = ['name', 'domain']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
        
    org_data = {
        'name': data['name'],
        'domain': data['domain'],
        'settings': {
            'allow_user_discovery': data.get('allow_user_discovery', True),
            'require_approval': data.get('require_approval', False)
        },
        'created_at': firestore.SERVER_TIMESTAMP
    }
    
    update_time, org_ref = db().collection('organizations').add(org_data)
    return jsonify({"id": org_ref.id, "message": "Organization created"}), 201

@api.route('/api/organizations/<org_id>/users', methods=['GET'])
def get_organization_users(org_id):
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "users": []}), 200
    try:
        users_ref = db_instance.collection('users').where('organization_id', '==', org_id)
        docs = users_ref.stream()
        users = [{'id': doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e), "users": []}), 500

# --- USERS ---
@api.route('/api/users', methods=['GET'])
def get_users():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "users": []}), 200
    try:
        users_ref = db_instance.collection('users')
        limit_val = int(request.args.get('limit', 100))
        docs = users_ref.limit(limit_val).stream()
        users = [{'id': doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e), "users": []}), 500

@api.route('/api/users/search', methods=['GET'])
def search_users():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "users": []}), 200
    try:
        query = request.args.get('query', '').lower()
        domain = request.args.get('domain')
        
        users_ref = db_instance.collection('users')
        
        # If domain filter is specified, filter by domain
        if domain:
            docs = users_ref.where('domain', '==', domain).stream()
        else:
            docs = users_ref.stream()
        
        # Filter in memory for name/email search
        all_users = [{'id': doc.id, **doc.to_dict()} for doc in docs]
        
        if query:
            filtered_users = [
                u for u in all_users 
                if query in u.get('email', '').lower() or 
                   query in u.get('name', '').lower()
            ]
            return jsonify(filtered_users)
        
        return jsonify(all_users)
    except Exception as e:
        return jsonify({"error": str(e), "users": []}), 500

@api.route('/api/users', methods=['POST'])
def create_user():
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    required = ['email', 'name']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Extract domain from email
    email = data['email']
    domain = email.split('@')[1] if '@' in email else ''
    
    user_data = {
        'email': email,
        'name': data['name'],
        'domain': domain,
        'organization_id': data.get('organization_id', ''),
        'avatar_url': data.get('avatar_url', ''),
        'role': data.get('role', 'user'),
        'created_at': firestore.SERVER_TIMESTAMP
    }
    
    update_time, user_ref = db().collection('users').add(user_data)
    return jsonify({"id": user_ref.id, "message": "User created"}), 201

@api.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected"}), 500
    try:
        user_doc = db_instance.collection('users').document(user_id).get()
        if user_doc.exists:
            return jsonify({'id': user_doc.id, **user_doc.to_dict()})
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    try:
        db().collection('users').document(user_id).update(data)
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- GROUP MEMBER MANAGEMENT ---
@api.route('/api/groups/<group_id>/members/<user_id>', methods=['PUT'])
def update_group_member(group_id, user_id):
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    try:
        member_ref = db().collection('groups').document(group_id).collection('members').document(user_id)
        member_ref.update(data)
        return jsonify({"message": "Member updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/groups/<group_id>/members/<user_id>', methods=['DELETE'])
def remove_group_member(group_id, user_id):
    if not db(): return jsonify({"error": "Database not connected"}), 500
    
    try:
        db().collection('groups').document(group_id).collection('members').document(user_id).delete()
        return jsonify({"message": "Member removed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/groups/<group_id>/admins', methods=['POST'])
def add_group_admin(group_id):
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    try:
        # Update member role to admin
        member_ref = db().collection('groups').document(group_id).collection('members').document(user_id)
        member_ref.update({
            'role': 'admin',
            'permissions': {
                'can_post': True,
                'can_announce': True,
                'can_invite': True,
                'can_manage_channels': True
            }
        })
        return jsonify({"message": "Admin added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/groups/<group_id>/settings', methods=['PUT'])
def update_group_settings(group_id):
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    try:
        db().collection('groups').document(group_id).update(data)
        return jsonify({"message": "Group settings updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- CHANNEL PERMISSIONS ---
@api.route('/api/channels/<channel_id>/permissions', methods=['PUT'])
def update_channel_permissions(channel_id):
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    permissions = {
        'permissions': {
            'who_can_post': data.get('who_can_post', 'all'),
            'who_can_announce': data.get('who_can_announce', 'admins_only'),
            'require_approval': data.get('require_approval', False)
        }
    }
    
    try:
        db().collection('channels').document(channel_id).update(permissions)
        return jsonify({"message": "Channel permissions updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/channels/<channel_id>/settings', methods=['PUT'])
def update_channel_settings(channel_id):
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    try:
        db().collection('channels').document(channel_id).update(data)
        return jsonify({"message": "Channel settings updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
