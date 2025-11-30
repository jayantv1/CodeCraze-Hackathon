from flask import Blueprint, request, jsonify
from api.firebase_db import get_db
from firebase_admin import firestore
from datetime import datetime

api = Blueprint("api", __name__)


# Helper to get DB
def db():
    return get_db()


@api.route("/api/health", methods=["GET"])
def health_check():
    db_instance = db()
    return jsonify(
        {"status": "ok", "firebase": "connected" if db_instance else "disconnected"}
    )


@api.route("/api/auth/sync", methods=["POST"])
def sync_user():
    if not db():
        return jsonify({"error": "Database not connected"}), 500
    data = request.json
    uid = data.get("uid")
    email = data.get("email")
    name = data.get("name")

    if not uid or not email:
        return jsonify({"error": "Missing required fields"}), 400

    users_ref = db().collection("users")
    user_doc = users_ref.document(uid).get()

    if not user_doc.exists:
        # User doesn't exist - reject login
        # Users must be invited by an admin before they can log in
        domain = email.split("@")[1]
        return (
            jsonify(
                {
                    "error": "User not found",
                    "message": f"You don't have an account. Please contact your organization administrator to get invited.",
                }
            ),
            403,
        )

    # If user exists, validate they have an organization
    user_data = user_doc.to_dict()
    org_id = user_data.get("organizationId")

    if not org_id:
        # Existing user without organization - reject login
        return (
            jsonify(
                {
                    "error": "Organization not found",
                    "message": "Your account is not associated with an organization. Please contact support.",
                }
            ),
            403,
        )

    # Verify the organization still exists
    org_doc = db().collection("organizations").document(org_id).get()
    if not org_doc.exists:
        return (
            jsonify(
                {
                    "error": "Organization not found",
                    "message": "Your organization no longer exists. Please contact support.",
                }
            ),
            403,
        )

    return (
        jsonify(
            {
                "message": "User authenticated",
                "organizationId": org_id,
                "organizationName": user_data.get("organizationName"),
            }
        ),
        200,
    )


# --- GROUPS ---
@api.route("/api/groups", methods=["GET"])
def get_groups():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "groups": []}), 200
    try:
        org_id = request.args.get("organizationId")
        if not org_id:
            return jsonify({"error": "Organization ID required"}), 400

        groups_ref = db_instance.collection("groups")
        query = groups_ref.where("organizationId", "==", org_id)
        docs = query.stream()
        groups = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(groups)
    except Exception as e:
        return jsonify({"error": str(e), "groups": []}), 500


@api.route("/api/groups", methods=["POST"])
def create_group():
    if not db():
        return jsonify({"error": "Database not connected"}), 500
    data = request.json
    # Basic validation
    if not data.get("name") or not data.get("organizationId"):
        return jsonify({"error": "Group name and organizationId are required"}), 400

    update_time, group_ref = (
        db()
        .collection("groups")
        .add(
            {
                "name": data["name"],
                "description": data.get("description", ""),
                "is_private": data.get("is_private", False),
                "created_by": data.get("created_by"),  # ID of the educator
                "organizationId": data["organizationId"],
                "created_at": firestore.SERVER_TIMESTAMP,
            }
        )
    )
    return jsonify({"id": group_ref.id, "message": "Group created"}), 201


# --- POSTS (STREAM) ---
@api.route("/api/posts", methods=["GET"])
def get_posts():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "posts": []}), 200
    try:
        # Optional: Filter by scope (school, district, group)
        scope = request.args.get("scope")
        org_id = request.args.get("organizationId")

        if not org_id:
            return jsonify({"error": "Organization ID required"}), 400

        posts_ref = db_instance.collection("posts")
        query = posts_ref.where("organizationId", "==", org_id)

        if scope:
            query = query.where("scope", "==", scope)

        # Order by created_at desc
        query = query.order_by("created_at", direction=firestore.Query.DESCENDING)

        docs = query.stream()
        posts = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(posts)
    except Exception as e:
        return jsonify({"error": str(e), "posts": []}), 500


@api.route("/api/posts", methods=["POST"])
def create_post():
    if not db():
        return jsonify({"error": "Database not connected"}), 500
    data = request.json

    # Required fields: content, author_id, author_name, scope
    required = ["content", "author_id", "author_name", "scope"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    post_data = {
        "content": data["content"],
        "author_id": data["author_id"],
        "author_name": data["author_name"],
        "scope": data["scope"],  # 'school', 'district', or group_id
        "organizationId": data.get("organizationId"),
        "image_url": data.get("image_url"),
        "created_at": firestore.SERVER_TIMESTAMP,
        "likes": 0,
    }

    update_time, post_ref = db().collection("posts").add(post_data)
    return jsonify({"id": post_ref.id, "message": "Post created"}), 201


# --- TESTS (CALENDAR) ---
@api.route("/api/tests", methods=["GET"])
def get_tests():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "tests": []}), 200
    try:
        # Filter by grade or date range if needed
        grade = request.args.get("grade")
        org_id = request.args.get("organizationId")

        if not org_id:
            return jsonify({"error": "Organization ID required"}), 400

        tests_ref = db_instance.collection("tests")
        query = tests_ref.where("organizationId", "==", org_id)

        if grade:
            query = query.where("target_audience", "==", grade)

        docs = query.stream()
        tests = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(tests)
    except Exception as e:
        return jsonify({"error": str(e), "tests": []}), 500


@api.route("/api/tests/check-conflict", methods=["POST"])
def check_conflict():
    if not db():
        return jsonify({"error": "Database not connected"}), 500
    data = request.json
    date_str = data.get("date")  # Format: YYYY-MM-DD
    target_audience = data.get("target_audience")  # e.g., "Grade 10"

    if not date_str or not target_audience:
        return jsonify({"error": "Date and target audience required"}), 400

    # Query for tests on the same date and audience
    org_id = data.get("organizationId")
    if not org_id:
        return jsonify({"error": "Organization ID required"}), 400

    tests_ref = db().collection("tests")
    query = (
        tests_ref.where("organizationId", "==", org_id)
        .where("date", "==", date_str)
        .where("target_audience", "==", target_audience)
    )
    docs = list(query.stream())

    if len(docs) > 0:
        return jsonify(
            {
                "conflict": True,
                "message": f"There are already {len(docs)} test(s) scheduled for {target_audience} on {date_str}.",
                "existing_tests": [{"id": d.id, **d.to_dict()} for d in docs],
            }
        )

    return jsonify({"conflict": False, "message": "No conflicts found."})


@api.route("/api/tests", methods=["POST"])
def schedule_test():
    if not db():
        return jsonify({"error": "Database not connected"}), 500
    data = request.json

    required = ["title", "date", "target_audience", "teacher_id"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    test_data = {
        "title": data["title"],
        "date": data["date"],  # YYYY-MM-DD
        "target_audience": data["target_audience"],
        "teacher_id": data["teacher_id"],
        "organizationId": data.get("organizationId"),
        "teacher_name": data.get("teacher_name", "Unknown"),
        "created_at": firestore.SERVER_TIMESTAMP,
    }

    update_time, test_ref = db().collection("tests").add(test_data)
    return jsonify({"id": test_ref.id, "message": "Test scheduled"}), 201


# --- CHANNELS ---
@api.route("/api/channels", methods=["GET"])
def get_channels():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "channels": []}), 200
    try:
        group_id = request.args.get("group_id")
        org_id = request.args.get("organizationId")

        if not org_id:
            return jsonify({"error": "Organization ID required"}), 400

        channels_ref = db_instance.collection("channels")
        query = channels_ref.where("organizationId", "==", org_id)

        if group_id:
            query = query.where("group_id", "==", group_id)

        docs = query.stream()
        channels = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(channels)
    except Exception as e:
        return jsonify({"error": str(e), "channels": []}), 500


@api.route("/api/channels", methods=["POST"])
def create_channel():
    if not db():
        return jsonify({"error": "Database not connected"}), 500
    data = request.json

    required = ["name", "group_id"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    channel_data = {
        "name": data["name"],
        "group_id": data["group_id"],
        "organizationId": data.get("organizationId"),
        "description": data.get("description", ""),
        "is_private": data.get("is_private", False),
        "created_at": firestore.SERVER_TIMESTAMP,
    }

    update_time, channel_ref = db().collection("channels").add(channel_data)
    return jsonify({"id": channel_ref.id, "message": "Channel created"}), 201


# --- MESSAGES ---
@api.route("/api/messages", methods=["GET"])
def get_messages():
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "messages": []}), 200
    try:
        channel_id = request.args.get("channel_id")
        limit_val = int(request.args.get("limit", 50))

        if not channel_id:
            return jsonify({"error": "channel_id is required"}), 400

        messages_ref = db_instance.collection("messages")

        try:
            # Try to query with ordering (requires index)
            query = (
                messages_ref.where("channel_id", "==", channel_id)
                .order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(limit_val)
            )
            docs = list(query.stream())
        except Exception as index_error:
            # If index doesn't exist or there's an error, fall back to simple query
            print(f"Falling back to simple query: {index_error}")
            query = messages_ref.where("channel_id", "==", channel_id).limit(limit_val)
            docs = list(query.stream())

        # Verify organization access (optional but recommended if channel_id isn't enough)
        # For now, relying on channel_id being scoped to org via group/channel creation

        messages = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        # Reverse to show oldest first (if we got them in descending order)
        messages.reverse()
        return jsonify(messages)
    except Exception as e:
        print(f"Error in get_messages: {e}")
        return jsonify({"error": str(e), "messages": []}), 500


@api.route("/api/messages", methods=["POST"])
def create_message():
    if not db():
        return jsonify({"error": "Database not connected"}), 500
    data = request.json

    required = ["content", "author_id", "author_name", "channel_id"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    message_data = {
        "content": data["content"],
        "author_id": data["author_id"],
        "author_name": data["author_name"],
        "channel_id": data["channel_id"],
        "organizationId": data.get("organizationId"),
        "is_announcement": data.get("is_announcement", False),
        "created_at": firestore.SERVER_TIMESTAMP,
    }

    update_time, message_ref = db().collection("messages").add(message_data)
    return jsonify({"id": message_ref.id, "message": "Message sent"}), 201


# --- GROUP MEMBERS ---
@api.route("/api/groups/<group_id>/join", methods=["POST"])
def join_group(group_id):
    if not db():
        return jsonify({"error": "Database not connected"}), 500
    data = request.json

    user_id = data.get("user_id")
    user_name = data.get("user_name")

    if not user_id or not user_name:
        return jsonify({"error": "user_id and user_name are required"}), 400

    # Add user to group's members subcollection
    member_data = {
        "user_id": user_id,
        "user_name": user_name,
        "joined_at": firestore.SERVER_TIMESTAMP,
    }

    db().collection("groups").document(group_id).collection("members").document(
        user_id
    ).set(member_data)
    return jsonify({"message": "Joined group successfully"}), 200


@api.route("/api/groups/<group_id>/leave", methods=["POST"])
def leave_group(group_id):
    if not db():
        return jsonify({"error": "Database not connected"}), 500
    data = request.json

    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    db().collection("groups").document(group_id).collection("members").document(
        user_id
    ).delete()
    return jsonify({"message": "Left group successfully"}), 200


@api.route("/api/groups/<group_id>/members", methods=["GET"])
def get_group_members(group_id):
    db_instance = db()
    if not db_instance:
        return jsonify({"error": "Database not connected", "members": []}), 200
    try:
        members_ref = (
            db_instance.collection("groups").document(group_id).collection("members")
        )
        docs = members_ref.stream()
        members = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        return jsonify(members)
    except Exception as e:
        return jsonify({"error": str(e), "members": []}), 500


@api.route("/api/groups/<group_id>", methods=["PATCH"])
def update_group(group_id):
    """Update group name and description"""
    if not db():
        return jsonify({"error": "Database not connected"}), 500

    data = request.json
    name = data.get("name")
    description = data.get("description", "")

    if not name:
        return jsonify({"error": "Group name is required"}), 400

    try:
        group_ref = db().collection("groups").document(group_id)
        group_ref.update({"name": name, "description": description})
        return jsonify({"message": "Group updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/api/groups/<group_id>/members", methods=["POST"])
def add_group_member(group_id):
    """Add a member to a group"""
    if not db():
        return jsonify({"error": "Database not connected"}), 500

    data = request.json
    user_id = data.get("user_id")
    user_name = data.get("user_name")
    user_email = data.get("user_email")

    if not user_id or not user_name:
        return jsonify({"error": "user_id and user_name are required"}), 400

    try:
        # Add member to group's members subcollection
        db().collection("groups").document(group_id).collection("members").document(
            user_id
        ).set(
            {
                "user_id": user_id,
                "user_name": user_name,
                "user_email": user_email,
                "role": "member",
                "joined_at": firestore.SERVER_TIMESTAMP,
            }
        )
        return jsonify({"message": "Member added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/api/groups/<group_id>/members/<user_id>", methods=["DELETE"])
def remove_group_member(group_id, user_id):
    """Remove a member from a group"""
    if not db():
        return jsonify({"error": "Database not connected"}), 500

    try:
        # Delete the member from the group's members subcollection
        db().collection("groups").document(group_id).collection("members").document(
            user_id
        ).delete()
        return jsonify({"message": "Member removed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/api/groups/<group_id>", methods=["DELETE"])
def delete_group(group_id):
    """Delete a group and all its data"""
    if not db():
        return jsonify({"error": "Database not connected"}), 500

    try:
        # Delete all members
        members_ref = db().collection("groups").document(group_id).collection("members")
        for member in members_ref.stream():
            member.reference.delete()

        # Delete all channels in the group
        channels_ref = db().collection("channels")
        channels_query = channels_ref.where("group_id", "==", group_id)
        for channel in channels_query.stream():
            # Delete messages in the channel
            messages_ref = db().collection("messages")
            messages_query = messages_ref.where("channel_id", "==", channel.id)
            for message in messages_query.stream():
                message.reference.delete()
            # Delete the channel
            channel.reference.delete()

        # Delete the group itself
        db().collection("groups").document(group_id).delete()

        return jsonify({"message": "Group deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
