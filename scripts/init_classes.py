#!/usr/bin/env python3
"""
Initialize classes and student enrollments for the exam conflict tracker.
This script creates sample classes and enrolls students in them.
"""

import sys
import os

# Add parent directory to path to import firebase_db
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.firebase_db import get_db
from firebase_admin import firestore

db = get_db()

if not db:
    print("❌ Database not connected. Please check your Firebase configuration.")
    sys.exit(1)

def create_class(org_id, teacher_id, teacher_name, class_name, grade_level, student_names):
    """Create a class and enroll students"""
    class_data = {
        "name": class_name,
        "teacher_id": teacher_id,
        "teacher_name": teacher_name,
        "grade_level": grade_level,
        "organizationId": org_id,
        "created_at": firestore.SERVER_TIMESTAMP,
    }
    
    # Create class document
    update_time, class_ref = db.collection("classes").add(class_data)
    class_id = class_ref.id
    print(f"✅ Created class: {class_name} (ID: {class_id})")
    
    # Add students to the class
    students_ref = db.collection("classes").document(class_id).collection("students")
    for i, student_name in enumerate(student_names):
        student_data = {
            "name": student_name,
            "email": f"{student_name.lower().replace(' ', '.')}@student.example.com",
            "enrolled_at": firestore.SERVER_TIMESTAMP,
        }
        students_ref.document(f"student_{i+1}").set(student_data)
    
    print(f"   Enrolled {len(student_names)} students")
    return class_id

def init_classes():
    """Initialize sample classes and enrollments"""
    print("🚀 Initializing Classes and Student Enrollments\n")
    
    # Get organization (you can modify this to match your org)
    orgs_ref = db.collection("organizations")
    orgs = list(orgs_ref.limit(1).stream())
    
    if not orgs:
        print("❌ No organizations found. Please create an organization first.")
        return
    
    org = orgs[0]
    org_id = org.id
    org_name = org.to_dict().get("name", "Unknown")
    print(f"📋 Using organization: {org_name} (ID: {org_id})\n")
    
    # Get a teacher (you can modify this to use a specific teacher)
    users_ref = db.collection("users")
    teachers = list(users_ref.limit(1).stream())
    
    if not teachers:
        print("❌ No users found. Please create a user first.")
        return
    
    teacher = teachers[0]
    teacher_id = teacher.id
    teacher_data = teacher.to_dict()
    teacher_name = teacher_data.get("name", teacher_data.get("displayName", "Teacher"))
    
    print(f"👨‍🏫 Using teacher: {teacher_name} (ID: {teacher_id})\n")
    
    # Create sample classes
    classes = [
        {
            "name": "Mathematics 101",
            "grade_level": "Grade 10",
            "students": ["Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Emma Davis"]
        },
        {
            "name": "Science 201",
            "grade_level": "Grade 10",
            "students": ["Alice Johnson", "Bob Smith", "Frank Miller", "Grace Lee", "Henry Wilson"]
        },
        {
            "name": "English Literature",
            "grade_level": "Grade 11",
            "students": ["Carol Williams", "David Brown", "Ivy Taylor", "Jack Anderson", "Kate Martinez"]
        },
    ]
    
    created_classes = []
    for class_info in classes:
        class_id = create_class(
            org_id=org_id,
            teacher_id=teacher_id,
            teacher_name=teacher_name,
            class_name=class_info["name"],
            grade_level=class_info["grade_level"],
            student_names=class_info["students"]
        )
        created_classes.append(class_id)
        print()
    
    print("=" * 50)
    print("✅ Classes and enrollments initialized successfully!")
    print(f"\nCreated {len(created_classes)} classes with student enrollments.")
    print("\nYou can now use the exam conflict tracker with full student schedule information.")

if __name__ == "__main__":
    try:
        init_classes()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

