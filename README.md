# 🎓 StudyFlow - Student Productivity & Assignment Manager

[![CI Pipeline](https://github.com/revanthkumar-git/test/actions/workflows/ci.yml/badge.svg)](https://github.com/revanthkumar-git/test/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-1B222D.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-21%20Passed-brightgreen.svg)]()

> A full-stack academic productivity web application designed to help students organize coursework, manage assignments, track critical deadlines, visualize study calendars, and maintain study schedules.

---

## ✨ Features

### 👤 1. Authentication & Security
- Secure Email/Password registration and login.
- Passwords hashed using **bcrypt** (10 salt rounds).
- Stateless **JWT authentication** with user-scoped data access.
- **Strict multi-tenant isolation**: Students can only view, create, edit, or delete their own data.
- **⚡ One-Click Demo Student Sign In** pre-configured on the login modal for instant evaluation.

### 📚 2. Course Management
- Create, update, and delete university courses.
- Attributes: Course Name, Course Code (e.g. `CS201`), Instructor, Custom Color Theme, and Subject Icon (Code, Math, Science, Globe, etc.).
- Real-time assignment count badge and completion rate metrics per course.

### 📝 3. Assignment Lifecycle & Scheduling
- Create assignments linked to courses with:
  - **Title** and **Detailed Notes / Instructions**
  - **Due Date & Time** (datetime picker with automatic timezone handling)
  - **Priority**: Low, Medium, High (with visual color indicators)
  - **Status**: Not Started, In Progress, Completed
  - **Recurring Assignments** (Daily, Weekly, Biweekly, Monthly with automatic next-occurrence generation upon completion).
- Quick completion toggles with visual strikethrough.

### 📊 4. Academic Dashboard
- **4 Key Stat Cards**: Total Active Tasks, Due This Week, Overdue Assignments, and Completed Tasks.
- **🚨 Overdue Warning Alert Banner**: Prominently highlights overdue assignments requiring immediate attention.
- **Upcoming Deadlines Timeline**: Chronologically sorted list of assignments due soon with relative countdowns.
- **Coursework Progress Bars**: Visual completion meters for each enrolled course.

### 📅 5. Interactive Study Calendar
- Full month grid view with responsive day cells.
- Color-coded assignment pills mapped directly to course theme colors.
- Click any assignment to open details and edit.
- Click any date cell to quickly add an assignment pre-filled with that date.
- Next, Previous, and Today navigation controls.

### 📋 6. Drag-and-Drop Kanban Board (Bonus)
- 3 Status Columns: **Not Started**, **In Progress**, **Completed**.
- Fluid HTML5 drag-and-drop to advance task status.
- Instant optimistic UI update with automatic backend synchronization (`PATCH /api/assignments/:id/status`).

### 🔍 7. Search, Filtering & Multi-Criteria Sorting
- **Instant Search**: Real-time search by assignment title or description.
- **Multi-Dropdown Filters**: Filter by Course, Priority (High, Medium, Low), or Status.
- **Status Filter Tabs**: All, Not Started, In Progress, Completed, Overdue.
- **Multi-Sort Controls**: Due Date (Soonest / Latest), Priority (Highest first), Title (A-Z).

### 📈 8. Study Analytics & Insights (Bonus)
- Overall academic completion rate gauge.
- Breakdown of workload by course.
- Priority distribution chart (High vs Medium vs Low ratio).
- Personalized productivity coaching recommendations.

### 🗓️ 9. Calendar Export (.ics) (Bonus)
- 1-Click download of standard RFC 5545 `studyflow-assignments.ics` file.
- Direct sync into **Google Calendar**, **Apple Calendar**, or **Microsoft Outlook** with built-in 24-hour and 1-hour alarm reminders.

### 🌓 10. Dark Mode & Responsive Design
- Seamless Light / Dark theme switch with persistent state in `localStorage`.
- Mobile-first responsive layout with collapsible drawer navigation.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher, tested on Node v20 & v24 LTS)
- **npm** (v9 or higher)

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/revanthkumar-git/test.git
   cd test
   ```

2. **Setup Backend:**
   ```bash
   cd StudyFlow/backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run seed
   ```
   > 💡 *The seed command creates the demo student account with 4 university courses and 12 sample assignments (upcoming, overdue, and completed).*

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run the Application:**
   - **Mode A (Development with Hot Reload):**
     In terminal 1 (backend):
     ```bash
     cd StudyFlow/backend
     npm run dev
     ```
     In terminal 2 (frontend):
     ```bash
     cd StudyFlow/frontend
     npm run dev
     ```
     Open `http://localhost:5173` in your browser.

   - **Mode B (Unified Production Server):**
     ```bash
     npm run build --prefix StudyFlow/frontend
     npm run build --prefix StudyFlow/backend
     node StudyFlow/backend/dist/server.js
     ```
     Open `http://localhost:5000` in your browser. Both API and Frontend are served on port 5000!

---

## 🔑 Demo Credentials

Click the **"One-Click Demo Student Sign In"** button on the login screen or use:
- **Email:** `student@university.edu`
- **Password:** `password123`

You can also click **"Create Account"** to register your own custom account.

---

## 🧪 Running Automated Tests

The test suite runs with **Vitest** and **Supertest** covering authentication, course CRUD, assignment management, multi-tenant isolation, filtering, sorting, and calendar export:

```bash
cd StudyFlow/backend
npm test
```

Expected output:
```
 ✓ tests/api.test.ts (21 tests)
 Test Files  1 passed (1)
      Tests  21 passed (21)
```

---

## 🐳 Docker Deployment

To run the entire application containerized:

```bash
cd StudyFlow
docker compose up --build
```
Access the application at `http://localhost:5000`.

---

## 📁 Project Structure

```
.
├── README.md                   # Project overview & documentation (Root level)
├── .gitignore                  # Git ignore rules (Root level)
├── package.json                # Root package management scripts
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI automated pipeline
│
└── StudyFlow/                  # Core application package
    ├── Dockerfile              # Production multi-stage Docker build
    ├── docker-compose.yml      # Containerized local development
    ├── .dockerignore           # Docker ignore patterns
    │
    ├── docs/
    │   ├── api.md              # Comprehensive REST API reference
    │   └── technical-decisions.md # Architectural & design decisions
    │
    ├── backend/
    │   ├── prisma/
    │   │   ├── schema.prisma   # Prisma relational data model
    │   │   ├── seed.ts         # University demo seed script
    │   │   └── dev.db          # SQLite database file
    │   ├── src/
    │   │   ├── controllers/    # Business logic (auth, courses, assignments, etc.)
    │   │   ├── middleware/     # JWT auth token & Zod validation
    │   │   ├── routes/         # Express API routing
    │   │   ├── services/       # RFC 5545 iCalendar generator
    │   │   ├── prisma.ts       # Prisma singleton
    │   │   └── server.ts       # Express server & static SPA host
    │   ├── tests/
    │   │   └── api.test.ts     # Vitest integration test suite
    │   ├── package.json
    │   └── tsconfig.json
    │
    └── frontend/
        ├── src/
        │   ├── components/
        │   │   ├── layout/     # Navbar, Sidebar, DarkModeToggle
        │   │   ├── auth/       # Login & Register modal with demo button
        │   │   ├── dashboard/  # Stat cards, Overdue alert, Upcoming timeline
        │   │   ├── assignments/# Filter bar, Assignment list & edit modal
        │   │   ├── calendar/   # Monthly interactive grid view
        │   │   ├── kanban/     # Drag & Drop status columns
        │   │   ├── courses/    # Course cards & color/icon picker modal
        │   │   ├── analytics/  # Completion graphs & workload breakdown
        │   │   └── common/     # Toast, Modal, Spinner, Empty states
        │   ├── context/        # AuthContext, ThemeContext
        │   ├── services/       # Typed API client
        │   ├── types/          # Full TypeScript definitions
        │   ├── App.tsx         # Root component
        │   └── main.tsx        # App entrypoint
        ├── package.json
        ├── vite.config.ts
        └── tailwind.config.js
```

---

## 📚 Documentation Deliverables

- **API Documentation**: [`StudyFlow/docs/api.md`](StudyFlow/docs/api.md)
- **Technical Decisions & Trade-offs**: [`StudyFlow/docs/technical-decisions.md`](StudyFlow/docs/technical-decisions.md)

---

## 🛡️ License
MIT License. Built for the Student Productivity App Build Challenge.