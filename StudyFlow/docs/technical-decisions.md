# Technical Decisions Document: StudyFlow

This document details the architectural decisions, database modeling, security and authentication approaches, engineering trade-offs, and future improvements implemented in **StudyFlow**.

---

## 1. Architecture Choices

### Client-Server Decoupling with Co-Located Monorepo
- **Decision**: Implemented a decoupled architecture with a dedicated Express/TypeScript backend (`/backend`) and a Vite + React + TypeScript frontend (`/frontend`) inside a single Git repository.
- **Rationale**:
  - A clean API boundary satisfies the technical requirements and allows client applications (web, mobile, or third-party integrations) to consume the same RESTful API.
  - In production, the backend server can automatically serve the compiled frontend single-page application (`dist/`), eliminating CORS complexity and allowing the entire app to run from a single command (`npm start` on port 5000).
  - During development, Vite provides instant hot-module replacement (HMR) with reverse proxying to `http://localhost:5000`.

### Type-Safe End-to-End Stack (TypeScript + Zod + Prisma)
- **Decision**: Full TypeScript across both backend and frontend, paired with **Zod** schemas for runtime validation and **Prisma ORM** for type-safe query generation.
- **Rationale**:
  - Eliminates class-of-error bugs (e.g. `undefined` fields or misspelled database columns).
  - Zod schemas validate both incoming request payloads (`req.body`) and query string filters (`req.query`), returning standardized 400 Bad Request responses with detailed field-level error messages.

---

## 2. Database Design & Persistence

### Relational Model with Prisma ORM & SQLite
- **Decision**: We used a relational data model with SQLite as the default driver, managed via Prisma ORM.
- **Rationale**:
  - **Zero-Friction Evaluation**: SQLite requires no external database server daemon (e.g. Postgres or MySQL container) to run locally, making local testing instant and reliable.
  - **Relational Integrity**: Foreign keys (`userId -> Course`, `userId -> Assignment`, `courseId -> Assignment`) ensure referential integrity with cascade deletion (`onDelete: Cascade`).
  - **Strict User Scoping & Indexing**: Composite indexes on `[userId, dueDate]`, `[userId, courseId]`, and `[userId, status]` ensure index scans even as student data grows.
  - **PostgreSQL / MySQL Ready**: Because queries use Prisma ORM rather than raw SQL dialects, switching to production PostgreSQL only requires changing the `provider` in `schema.prisma` from `sqlite` to `postgresql`.

---

## 3. Authentication & Authorization Approach

### JWT with Cryptographic Password Hashing
- **Password Security**: Passwords are never stored in plaintext. They are hashed using `bcryptjs` with 10 salt rounds before persisting to the database.
- **Stateless Tokens**: The backend issues JSON Web Tokens (JWT) signed with HMAC-SHA256 containing minimal payload (`id`, `email`, `name`).
- **Strict Multi-Tenant Data Isolation**:
  - Every course and assignment query strictly scopes requests by `req.user.id`.
  - For `PUT`, `DELETE`, and `GET /:id` operations, the backend checks `where: { id, userId }`. If an authenticated user tries to access or modify another student's assignment or course, a `404 Not Found` or `403 Forbidden` is returned, preventing IDOR (Insecure Direct Object Reference) vulnerabilities.
  - This is verified through automated integration tests (`tests/api.test.ts`).

---

## 4. Key Engineering Trade-offs

| Decision | Pros | Trade-offs & Mitigations |
| :--- | :--- | :--- |
| **SQLite Default vs PostgreSQL** | Zero setup required; instant run for evaluation; portable single file. | SQLite concurrency is limited for huge write-heavy multi-tenant clusters. Mitigated by Prisma abstraction, allowing instant swap to Postgres in `docker-compose.yml`. |
| **HTML5 Drag-and-Drop vs Heavy Library (dnd-kit/react-beautiful-dnd)** | Zero extra bundle size; fast native browser rendering; no React 19 compatibility issues. | Native HTML5 drag events require manual drop target styling, which we solved with clean Tailwind state classes (`dragOverCol`). |
| **Unified Production Server Mode** | Single port, single command, zero CORS issues in deployed environments. | In enterprise multi-cloud setups, static assets are usually served via CDN (S3/CloudFront). We kept frontend and backend decoupled so Vite can deploy to Vercel/Netlify independently if desired. |

---

## 5. What We Would Improve with More Development Time

1. **Push Notifications & Webhooks**:
   - Integrate Web Push API with Service Workers for browser notifications 24h and 1h before deadlines even when the browser tab is closed.
2. **Third-Party Calendar Two-Way Sync**:
   - Implement OAuth2 integration with Google Calendar API and Microsoft Graph for live two-way sync (so updating a deadline in Google Calendar reflects in StudyFlow).
3. **Syllabus PDF / Canvas LMS Importer**:
   - Build a parser that extracts course schedules and assignments directly from uploaded course syllabus PDFs or imports via Canvas/Blackboard LMS APIs.
4. **Study Group Collaboration**:
   - Allow students enrolled in the same course to share study schedules, assignments, and notes with role-based permissions (Viewer / Editor).
5. **End-to-End Playwright Tests**:
   - Add automated browser testing for drag-and-drop interactions and full user journeys.