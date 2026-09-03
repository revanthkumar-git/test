# StudyFlow API Documentation

The StudyFlow REST API provides secure endpoints for managing user accounts, courses, assignments, study schedules, metrics, and calendar synchronizations.

## Base URL & General Conventions

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token passed via the `Authorization` header:
  ```http
  Authorization: Bearer <your-jwt-token>
  ```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account and returns the profile with a JWT token.

**Request Body:**
```json
{
  "name": "Alex Morgan",
  "email": "student@university.edu",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "c1f10738-9252-4411-827d-0ff07eeb9da9",
    "email": "student@university.edu",
    "name": "Alex Morgan",
    "createdAt": "2026-09-03T16:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### `POST /api/auth/login`
Authenticates existing credentials and returns a JWT token.

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "c1f10738-9252-4411-827d-0ff07eeb9da9",
    "email": "student@university.edu",
    "name": "Alex Morgan",
    "createdAt": "2026-09-03T16:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### `GET /api/auth/me`
Fetches the currently authenticated user profile. Requires Authorization header.

**Response (200 OK):**
```json
{
  "user": {
    "id": "c1f10738-9252-4411-827d-0ff07eeb9da9",
    "email": "student@university.edu",
    "name": "Alex Morgan",
    "createdAt": "2026-09-03T16:00:00.000Z"
  }
}
```

---

## 2. Course Endpoints

### `GET /api/courses`
Returns all courses belonging to the authenticated user with assignment count aggregations.

**Response (200 OK):**
```json
{
  "courses": [
    {
      "id": "course-uuid-1",
      "userId": "user-uuid-1",
      "name": "Data Structures & Algorithms",
      "code": "CS201",
      "instructor": "Prof. Ada Lovelace",
      "color": "#3B82F6",
      "icon": "code",
      "createdAt": "2026-09-03T16:00:00.000Z",
      "updatedAt": "2026-09-03T16:00:00.000Z",
      "_count": {
        "assignments": 4
      }
    }
  ]
}
```

---

### `POST /api/courses`
Creates a new course for the authenticated user.

**Request Body:**
```json
{
  "name": "Linear Algebra",
  "code": "MATH240",
  "instructor": "Dr. Alan Turing",
  "color": "#8B5CF6",
  "icon": "calculator"
}
```

---

### `GET /api/courses/:id`
Returns a specific course along with all associated assignments.

---

### `PUT /api/courses/:id`
Updates course metadata (name, code, instructor, color, icon).

---

### `DELETE /api/courses/:id`
Deletes the course and cascades deletion of all linked assignments.

---

## 3. Assignment Endpoints

### `GET /api/assignments`
Retrieves assignments for the authenticated user. Supports rich filtering and sorting query parameters:

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `courseId` | `string` | Filter by course ID | `?courseId=course-uuid` |
| `status` | `string` | Filter by status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`) | `?status=IN_PROGRESS` |
| `priority` | `string` | Filter by priority (`LOW`, `MEDIUM`, `HIGH`) | `?priority=HIGH` |
| `search` | `string` | Case-insensitive title / description search | `?search=tree` |
| `sort` | `string` | Sort order (`dueDateAsc`, `dueDateDesc`, `priority`, `title`, `createdAt`) | `?sort=dueDateAsc` |
| `isOverdue` | `boolean` | Filter for overdue assignments | `?isOverdue=true` |

**Response (200 OK):**
```json
{
  "assignments": [
    {
      "id": "assign-uuid-1",
      "userId": "user-uuid-1",
      "courseId": "course-uuid-1",
      "title": "Red-Black Tree Implementation",
      "description": "Implement insertion, deletion, and balancing rotations.",
      "dueDate": "2026-09-05T23:59:00.000Z",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "isRecurring": false,
      "recurrenceRule": null,
      "completedAt": null,
      "createdAt": "2026-09-03T16:00:00.000Z",
      "course": {
        "id": "course-uuid-1",
        "name": "Data Structures & Algorithms",
        "code": "CS201",
        "color": "#3B82F6",
        "icon": "code"
      }
    }
  ]
}
```

---

### `POST /api/assignments`
Creates a new assignment associated with a course.

**Request Body:**
```json
{
  "title": "Programming Project 2",
  "description": "Implement balancing tree algorithm in C++",
  "courseId": "course-uuid-1",
  "dueDate": "2026-09-06T18:00:00.000Z",
  "priority": "HIGH",
  "status": "NOT_STARTED",
  "isRecurring": true,
  "recurrenceRule": "WEEKLY"
}
```

---

### `GET /api/assignments/:id`
Retrieves a single assignment by ID.

---

### `PUT /api/assignments/:id`
Updates assignment details, dates, priority, or status.

---

### `PATCH /api/assignments/:id/status`
Quick-toggle status endpoint.

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

---

### `DELETE /api/assignments/:id`
Permanently removes the assignment.

---

## 4. Dashboard & Analytics Endpoints

### `GET /api/dashboard/summary`
Returns top-level metric counters, upcoming deadlines, overdue tasks, and course breakdown:
```json
{
  "metrics": {
    "totalActive": 9,
    "completed": 3,
    "overdue": 2,
    "dueThisWeek": 4,
    "totalAssignments": 12,
    "completionRate": 25
  },
  "overdueAssignments": [...],
  "upcomingAssignments": [...],
  "courseBreakdown": [...]
}
```

---

### `GET /api/analytics`
Returns completion rate breakdown, priority distributions, and per-course statistics.

---

## 5. Calendar Integration Endpoint

### `GET /api/calendar/export.ics`
Generates and downloads a standard RFC 5545 `.ics` file containing all assignment deadlines and alarms for importing into Google Calendar, Apple Calendar, or Microsoft Outlook.