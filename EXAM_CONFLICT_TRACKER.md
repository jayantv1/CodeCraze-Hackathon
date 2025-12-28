# Exam Conflict Tracker Feature

## Overview

The Exam Conflict Tracker is an enhanced feature that helps teachers coordinate exam schedules to reduce student stress. When a teacher attempts to schedule an exam on a date where another exam already exists, the system provides comprehensive conflict information to help the teacher make an informed decision.

## Features

### 1. Enhanced Conflict Detection
- **Detects ANY exam on the same day** (not just exams for the same grade level)
- Provides detailed information about conflicting exams
- Shows count of conflicts and same-audience conflicts

### 2. Comprehensive Conflict Warning Modal
When a conflict is detected, teachers see:
- **Conflicting Exams**: List of all exams already scheduled on that date
  - Exam title
  - Teacher name
  - Target audience (grade level)
  
- **Your Other Exams**: All exams the teacher has scheduled
  - Helps teachers see their own exam schedule
  - Shows dates and target audiences
  
- **Your Classes & Students**: Complete list of students in the teacher's classes
  - Shows all classes taught by the teacher
  - Lists all enrolled students
  - Helps teachers understand the impact on their students

### 3. Teacher Decision Making
- Teachers can review all conflict information
- Option to **Schedule Anyway** (override the warning)
- Option to **Cancel** and reschedule for another date
- Decision is left to the teacher's discretion with full information

## Technical Implementation

### Backend (Flask API)

#### Enhanced Conflict Detection Endpoint
```
POST /api/tests/check-conflict
```
- Checks for ANY test on the same date
- Returns detailed conflict information including:
  - List of conflicting exams
  - Conflict counts
  - Same-audience conflict count

#### New Endpoints

**Get Teacher's Classes and Students**
```
GET /api/teachers/<teacher_id>/classes?organizationId=<org_id>
```
Returns all classes taught by a teacher with enrolled students.

**Get Teacher's Other Exams**
```
GET /api/teachers/<teacher_id>/exams?organizationId=<org_id>
```
Returns all exams scheduled by the teacher.

### Frontend (Next.js)

#### Enhanced Calendar Page
- Uses actual `teacher_id` from authentication context
- Fetches conflict details when a conflict is detected
- Displays comprehensive conflict information in an expanded modal
- Responsive design that adapts to show all information

### Data Model

#### Classes Collection
```
classes/
  {classId}/
    - name: string
    - teacher_id: string
    - teacher_name: string
    - grade_level: string
    - organizationId: string
    - created_at: timestamp
    students/
      {studentId}/
        - name: string
        - email: string
        - enrolled_at: timestamp
```

## Setup Instructions

### 1. Initialize Classes and Students

Run the initialization script to create sample classes and enroll students:

```bash
python scripts/init_classes.py
```

This script will:
- Create sample classes for a teacher
- Enroll students in those classes
- Set up the data structure needed for conflict tracking

### 2. Using the Feature

1. Navigate to the Calendar page
2. Click "Schedule Test" or click on a date
3. Fill in the test details:
   - Test Title
   - Target Audience (Grade level)
4. If a conflict is detected:
   - Review the conflict information
   - Check your other exams
   - Review your students' schedules
   - Make an informed decision:
     - **Schedule Anyway**: Proceed with scheduling despite the conflict
     - **Cancel**: Go back and choose a different date

## API Routes

### Next.js API Routes (Proxies to Flask)

- `GET /api/tests` - Get all tests
- `POST /api/tests` - Schedule a test
- `POST /api/tests/check-conflict` - Check for conflicts
- `GET /api/teachers/[teacherId]/classes` - Get teacher's classes
- `GET /api/teachers/[teacherId]/exams` - Get teacher's exams

## Benefits

1. **Reduced Student Stress**: Teachers can see when students have multiple exams on the same day
2. **Better Coordination**: Teachers can coordinate with colleagues to space out exams
3. **Informed Decisions**: Teachers have all the information they need to make scheduling decisions
4. **Flexibility**: Teachers can still override warnings when necessary (e.g., standardized test dates)

## Future Enhancements

Potential improvements:
- Suggest alternative dates with fewer conflicts
- Email notifications to other teachers when conflicts are scheduled
- Analytics dashboard showing exam distribution
- Integration with school calendar systems
- Automatic rescheduling suggestions based on student schedules

