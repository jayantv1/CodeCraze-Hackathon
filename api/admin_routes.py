# Admin API endpoints
from flask import Blueprint, request, jsonify
from api.firebase_db import get_db
from firebase_admin import firestore

admin_api = Blueprint('admin_api', __name__)

# Helper to get DB
def db():
    return get_db()


@admin_api.route('/api/admin/users', methods=['GET'])
def get_organization_users():
    """Get all users in an organization"""
    if not db(): return jsonify({"error": "Database not connected"}), 500
    
    org_id = request.args.get('organizationId')
    if not org_id:
        return jsonify({"error": "organizationId required"}), 400
    
    try:
        users_ref = db().collection('users')
        query = users_ref.where('organizationId', '==', org_id)
        docs = query.stream()
        
        users = []
        for doc in docs:
            user_data = doc.to_dict()
            users.append({
                'uid': user_data.get('uid'),
                'email': user_data.get('email'),
                'name': user_data.get('name'),
                'role': user_data.get('role', 'educator'),
                'organizationId': user_data.get('organizationId')
            })
        
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api.route('/api/admin/invite', methods=['POST'])
def invite_user():
    """Invite a new user to the organization"""
    if not db(): return jsonify({"error": "Database not connected"}), 500
    
    data = request.json
    email = data.get('email')
    role = data.get('role', 'educator')
    org_id = data.get('organizationId')
    org_name = data.get('organizationName')
    
    if not email or not org_id:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        # Create user in Firebase Auth
        from firebase_admin import auth
        user = auth.create_user(
            email=email,
            email_verified=False
        )
        
        # Create user document in Firestore
        user_data = {
            'uid': user.uid,
            'email': email,
            'name': email.split('@')[0],
            'role': role,
            'organizationId': org_id,
            'organizationName': org_name,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'invited': True
        }
        
        db().collection('users').document(user.uid).set(user_data)
        
        # TODO: Send invitation email with password reset link
        
        return jsonify({"message": "User invited successfully", "uid": user.uid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api.route('/api/admin/users/<uid>', methods=['DELETE'])
def delete_user(uid):
    """Remove a user from the organization"""
    if not db(): return jsonify({"error": "Database not connected"}), 500
    
    data = request.json
    org_id = data.get('organizationId')
    
    if not org_id:
        return jsonify({"error": "organizationId required"}), 400
    
    try:
        # Verify user belongs to the organization
        user_doc = db().collection('users').document(uid).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        if user_data.get('organizationId') != org_id:
            return jsonify({"error": "User does not belong to this organization"}), 403
        
        # Delete from Firestore
        db().collection('users').document(uid).delete()
        
        # Delete from Firebase Auth
        from firebase_admin import auth
        auth.delete_user(uid)
        
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api.route('/api/admin/users/<uid>', methods=['PATCH'])
def update_user_role(uid):
    """Update a user's role"""
    if not db(): return jsonify({"error": "Database not connected"}), 500
    
    data = request.json
    org_id = data.get('organizationId')
    new_role = data.get('role')
    
    if not org_id or not new_role:
        return jsonify({"error": "Missing required fields"}), 400
    
    if new_role not in ['educator', 'admin']:
        return jsonify({"error": "Invalid role"}), 400
    
    try:
        # Verify user belongs to the organization
        user_ref = db().collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        if user_data.get('organizationId') != org_id:
            return jsonify({"error": "User does not belong to this organization"}), 403
        
        # Update role
        user_ref.update({'role': new_role})
        
        return jsonify({"message": "User role updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
