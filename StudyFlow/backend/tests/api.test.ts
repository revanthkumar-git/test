import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/server';
import prisma from '../src/prisma';

describe('Student Productivity App API Integration Tests', () => {
  let userAToken: string;
  let userAId: string;
  let userBToken: string;
  let userBId: string;
  let courseAId: string;
  let assignmentAId: string;

  beforeAll(async () => {
    // Ensure test users are cleared
    await prisma.user.deleteMany({
      where: {
        email: { in: ['test-user-a@test.edu', 'test-user-b@test.edu'] },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: ['test-user-a@test.edu', 'test-user-b@test.edu'] },
      },
    });
    await prisma.$disconnect();
  });

  describe('Health & Auth Endpoints', () => {
    it('GET /api/health returns 200 OK', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('POST /api/auth/register registers user A successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice User A',
          email: 'test-user-a@test.edu',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('test-user-a@test.edu');
      expect(res.body.token).toBeDefined();

      userAToken = res.body.token;
      userAId = res.body.user.id;
    });

    it('POST /api/auth/register registers user B successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob User B',
          email: 'test-user-b@test.edu',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      userBToken = res.body.token;
      userBId = res.body.user.id;
    });

    it('POST /api/auth/register rejects duplicate email with 409', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Alice',
          email: 'test-user-a@test.edu',
          password: 'password123',
        });

      expect(res.status).toBe(409);
    });

    it('POST /api/auth/login succeeds with correct password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-user-a@test.edu',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('POST /api/auth/login rejects incorrect password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-user-a@test.edu',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });

    it('GET /api/auth/me returns profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('test-user-a@test.edu');
    });

    it('GET /api/auth/me rejects request without token with 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Course Management & Multi-Tenant Authorization', () => {
    it('POST /api/courses creates a course for User A', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Calculus I',
          code: 'MATH101',
          instructor: 'Dr. Newton',
          color: '#3B82F6',
          icon: 'calculator',
        });

      expect(res.status).toBe(201);
      expect(res.body.course.name).toBe('Calculus I');
      expect(res.body.course.instructor).toBe('Dr. Newton');
      courseAId = res.body.course.id;
    });

    it('GET /api/courses returns only User A courses for User A', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBeGreaterThanOrEqual(1);
      const course = res.body.courses.find((c: any) => c.id === courseAId);
      expect(course).toBeDefined();
    });

    it('GET /api/courses for User B does NOT return User A courses (Data Isolation)', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      const found = res.body.courses.find((c: any) => c.id === courseAId);
      expect(found).toBeUndefined();
    });

    it('User B cannot edit or delete User A course', async () => {
      const editRes = await request(app)
        .put(`/api/courses/${courseAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ name: 'Hacked Course' });

      expect(editRes.status).toBe(404);

      const delRes = await request(app)
        .delete(`/api/courses/${courseAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(delRes.status).toBe(404);
    });

    it('PUT /api/courses/:id allows User A to update course', async () => {
      const res = await request(app)
        .put(`/api/courses/${courseAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ instructor: 'Sir Isaac Newton' });

      expect(res.status).toBe(200);
      expect(res.body.course.instructor).toBe('Sir Isaac Newton');
    });
  });

  describe('Assignment Management, Filtering, and Recurrence', () => {
    it('POST /api/assignments creates an assignment for User A', async () => {
      const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Derivatives Problem Set',
          description: 'Problems 1 through 10',
          courseId: courseAId,
          dueDate,
          priority: 'HIGH',
          status: 'NOT_STARTED',
        });

      expect(res.status).toBe(201);
      expect(res.body.assignment.title).toBe('Derivatives Problem Set');
      expect(res.body.assignment.priority).toBe('HIGH');
      expect(res.body.assignment.status).toBe('NOT_STARTED');
      assignmentAId = res.body.assignment.id;
    });

    it('User B cannot create an assignment with User A course', async () => {
      const dueDate = new Date().toISOString();
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Unauthorized Assignment',
          courseId: courseAId,
          dueDate,
        });

      expect(res.status).toBe(400);
    });

    it('GET /api/assignments supports search, filter by status, and priority', async () => {
      const res = await request(app)
        .get('/api/assignments?search=Derivatives&priority=HIGH&status=NOT_STARTED')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.assignments.length).toBe(1);
      expect(res.body.assignments[0].id).toBe(assignmentAId);
    });

    it('PATCH /api/assignments/:id/status updates status and sets completedAt', async () => {
      const res = await request(app)
        .patch(`/api/assignments/${assignmentAId}/status`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(200);
      expect(res.body.assignment.status).toBe('COMPLETED');
      expect(res.body.assignment.completedAt).not.toBeNull();
    });

    it('User B cannot view or delete User A assignment', async () => {
      const getRes = await request(app)
        .get(`/api/assignments/${assignmentAId}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(getRes.status).toBe(404);

      const delRes = await request(app)
        .delete(`/api/assignments/${assignmentAId}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(delRes.status).toBe(404);
    });
  });

  describe('Dashboard, Analytics, and Calendar Export', () => {
    it('GET /api/dashboard/summary returns metrics and summary lists', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.metrics).toBeDefined();
      expect(res.body.metrics.completed).toBeGreaterThanOrEqual(1);
      expect(res.body.courseBreakdown).toBeDefined();
    });

    it('GET /api/analytics returns statistical breakdowns', async () => {
      const res = await request(app)
        .get('/api/analytics')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(res.body.priorityBreakdown).toBeDefined();
      expect(res.body.courseStats).toBeDefined();
    });

    it('GET /api/calendar/export.ics generates valid RFC 5545 iCalendar data', async () => {
      const res = await request(app)
        .get('/api/calendar/export.ics')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/calendar');
      expect(res.text).toContain('BEGIN:VCALENDAR');
      expect(res.text).toContain('END:VCALENDAR');
      expect(res.text).toContain('SUMMARY:');
    });
  });
});