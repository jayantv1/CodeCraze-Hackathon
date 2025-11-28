# AI System Generation Prompt

**Role**: Expert Full-Stack Developer (Next.js + Flask)

**Objective**: Build a "Teacher Communication and Scheduling System" within an existing Next.js + Flask codebase.

## Project Context
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS.
- **Backend**: Flask (Python).
- **Current State**: Basic setup with `api/index.py` and standard Next.js structure.

## Feature 1: "Slack for Teachers" (Communication Hub)
**Goal**: A secure, school-district-focused communication platform.
**Key Functionalities**:
1.  **Groups/Channels**:
    -   Ability to create and join groups (e.g., "Math Dept", "Grade 10 Teachers", "Supervisors").
    -   Private and Public groups.
2.  **Announcements**:
    -   Special role (e.g., Superintendent) can post "Announcements" that are pinned or highlighted.
3.  **The Stream (Feed)**:
    -   A LinkedIn-style feed where teachers can post updates.
    -   **Scopes**: Post to "My School", "My District", or specific "Groups".
    -   **Content**: Text, images (e.g., "Bake sale success"), events.
**UI/UX**:
-   Sidebar for navigation (Groups, Stream, Calendar).
-   Clean, professional aesthetic (Slack meets LinkedIn).

## Feature 2: Test Calendar & Conflict Warning
**Goal**: Coordinate testing schedules to reduce student stress.
**Key Functionalities**:
1.  **Calendar View**:
    -   Interactive calendar showing scheduled tests.
    -   Filter by Grade Level or Class (to see relevant conflicts).
2.  **Scheduling & Conflict Detection**:
    -   When a teacher adds a test, check for existing tests on that date for the same target audience (e.g., "10th Grade").
    -   **Warning System**: If a test exists, prompt: *"Another test is already scheduled for this day. Are you sure you want to proceed? Spacing tests helps reduce student stress."*
    -   Allow override (soft block), but log the decision.

## Technical Implementation Steps
Please generate the code step-by-step:

1.  **Database Design**:
    -   Use **Firebase Firestore** as the NoSQL database.
    -   Design collections for `users`, `groups`, `posts`, `tests`.
    -   Use Firebase Authentication for user management.
2.  **Backend API (Flask)**:
    -   Initialize Firebase Admin SDK.
    -   Endpoints for CRUD for Posts/Groups, and Test Scheduling using Firestore.
    -   Logic for conflict detection (querying Firestore).
3.  **Frontend (Next.js)**:
    -   **Dashboard**: Main layout with sidebar.
    -   **Stream Component**: Feed of posts.
    -   **Calendar Component**: React-Calendar or similar, with modal for adding tests and handling warnings.
4.  **Styling**:
    -   Use Tailwind CSS for a responsive, modern design.

## Instructions
-   Start by setting up the database models in `api/models.py`.
-   Create the API routes in `api/routes.py` and register them in `index.py`.
-   Build the frontend pages in `app/`.
-   Ensure types are defined for TypeScript.
