from flask import Blueprint, request, jsonify
from api.firebase_db import get_db
from firebase_admin import firestore
from datetime import datetime

api = Blueprint('api', __name__)

# Helper to get DB
def db():
    return get_db()

@api.route('/api/health', methods=['GET'])
def health_check():
    db_instance = db()
    return jsonify({"status": "ok", "firebase": "connected" if db_instance else "disconnected"})

# --- GROUPS ---
@api.route('/api/groups', methods=['GET'])
def get_groups():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "groups": []}), 200
    try:
        groups_ref = db_instance.collection('groups')
        docs = groups_ref.stream()
        groups = [{'id': doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(groups)
    except Exception as e:
        return jsonify({"error": str(e), "groups": []}), 500

@api.route('/api/groups', methods=['POST'])
def create_group():
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    # Basic validation
    if not data.get('name'):
        return jsonify({"error": "Group name is required"}), 400
    
    update_time, group_ref = db().collection('groups').add({
        'name': data['name'],
        'description': data.get('description', ''),
        'is_private': data.get('is_private', False),
        'created_at': firestore.SERVER_TIMESTAMP
    })
    return jsonify({"id": group_ref.id, "message": "Group created"}), 201

# --- POSTS (STREAM) ---
@api.route('/api/posts', methods=['GET'])
def get_posts():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "posts": []}), 200
    try:
        # Optional: Filter by scope (school, district, group)
        scope = request.args.get('scope')
        
        posts_ref = db_instance.collection('posts')
        if scope:
            query = posts_ref.where('scope', '==', scope)
        else:
            query = posts_ref
            
        # Order by created_at desc
        query = query.order_by('created_at', direction=firestore.Query.DESCENDING)
        
        docs = query.stream()
        posts = [{'id': doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(posts)
    except Exception as e:
        return jsonify({"error": str(e), "posts": []}), 500

@api.route('/api/posts', methods=['POST'])
def create_post():
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    # Required fields: content, author_id, author_name, scope
    required = ['content', 'author_id', 'author_name', 'scope']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
        
    post_data = {
        'content': data['content'],
        'author_id': data['author_id'],
        'author_name': data['author_name'],
        'scope': data['scope'], # 'school', 'district', or group_id
        'image_url': data.get('image_url'),
        'created_at': firestore.SERVER_TIMESTAMP,
        'likes': 0
    }
    
    update_time, post_ref = db().collection('posts').add(post_data)
    return jsonify({"id": post_ref.id, "message": "Post created"}), 201

# --- TESTS (CALENDAR) ---
@api.route('/api/tests', methods=['GET'])
def get_tests():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "tests": []}), 200
    try:
        # Filter by grade or date range if needed
        grade = request.args.get('grade')
        
        tests_ref = db_instance.collection('tests')
        if grade:
            query = tests_ref.where('target_audience', '==', grade)
        else:
            query = tests_ref
            
        docs = query.stream()
        tests = [{'id': doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(tests)
    except Exception as e:
        return jsonify({"error": str(e), "tests": []}), 500

@api.route('/api/tests/check-conflict', methods=['POST'])
def check_conflict():
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    date_str = data.get('date') # Format: YYYY-MM-DD
    target_audience = data.get('target_audience') # e.g., "Grade 10"
    
    if not date_str or not target_audience:
        return jsonify({"error": "Date and target audience required"}), 400
        
    # Query for tests on the same date and audience
    tests_ref = db().collection('tests')
    query = tests_ref.where('date', '==', date_str).where('target_audience', '==', target_audience)
    docs = list(query.stream())
    
    if len(docs) > 0:
        return jsonify({
            "conflict": True, 
            "message": f"There are already {len(docs)} test(s) scheduled for {target_audience} on {date_str}.",
            "existing_tests": [{'id': d.id, **d.to_dict()} for d in docs]
        })
    
    return jsonify({"conflict": False, "message": "No conflicts found."})

@api.route('/api/tests', methods=['POST'])
def schedule_test():
    if not db(): return jsonify({"error": "Database not connected"}), 500
    data = request.json
    
    required = ['title', 'date', 'target_audience', 'teacher_id']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400
        
    test_data = {
        'title': data['title'],
        'date': data['date'], # YYYY-MM-DD
        'target_audience': data['target_audience'],
        'teacher_id': data['teacher_id'],
        'teacher_name': data.get('teacher_name', 'Unknown'),
        'created_at': firestore.SERVER_TIMESTAMP
    }
    
    update_time, test_ref = db().collection('tests').add(test_data)
    return jsonify({"id": test_ref.id, "message": "Test scheduled"}), 201
