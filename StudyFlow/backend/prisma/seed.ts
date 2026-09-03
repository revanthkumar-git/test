import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with personalized student data...');

  // Clean up existing demo data
  const existingUser = await prisma.user.findUnique({
    where: { email: 'student@university.edu' },
  });

  if (existingUser) {
    console.log('Cleaning up existing demo user data...');
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
  }

  // Create demo student with personalized profile
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const user = await prisma.user.create({
    data: {
      email: 'student@university.edu',
      name: 'Alex Morgan',
      passwordHash,
      university: 'Stanford University',
      major: 'B.S. Computer Science & AI',
      semester: 'Junior - Fall 2026',
      studyGoal: 'Submit all assignments 24 hours before deadlines',
      avatarColor: '#6366F1',
      streakDays: 5,
    },
  });

  console.log(`👤 Created demo student: ${user.name} (${user.email}) at ${user.university}`);

  // Create Courses
  const cs201 = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      instructor: 'Prof. Ada Lovelace',
      color: '#3B82F6',
      icon: 'code',
    },
  });

  const math240 = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Linear Algebra & Differential Equations',
      code: 'MATH240',
      instructor: 'Dr. Alan Turing',
      color: '#8B5CF6',
      icon: 'calculator',
    },
  });

  const phys150 = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Modern Physics & Quantum Mechanics',
      code: 'PHYS150',
      instructor: 'Dr. Richard Feynman',
      color: '#EC4899',
      icon: 'flask',
    },
  });

  const cs350 = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Cloud & Web Architecture',
      code: 'CS350',
      instructor: 'Prof. Tim Berners-Lee',
      color: '#10B981',
      icon: 'globe',
    },
  });

  console.log('📚 Created 4 university courses.');

  const now = new Date();

  const addDays = (days: number, hours = 23, minutes = 59): Date => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // Seed Assignments with Subtask Checklists & Notes
  const assignmentsData = [
    // --- OVERDUE ASSIGNMENTS ---
    {
      userId: user.id,
      courseId: math240.id,
      title: 'Problem Set 2: Eigenvalues & Matrix Diagonalization',
      description: 'Complete exercises 4.1 through 4.9 from textbook. Submit handwritten or LaTeX PDF.',
      dueDate: addDays(-3, 17, 0),
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      isRecurring: false,
      notes: 'Check theorem 4.7 for algebraic vs geometric multiplicity. Review recitation notes.',
      tags: 'Homework,Math',
      subtasks: JSON.stringify([
        { id: 'sub-1', title: 'Compute characteristic polynomial for problems 4.1-4.3', completed: true },
        { id: 'sub-2', title: 'Find eigenvalues and solve for eigenspaces', completed: true },
        { id: 'sub-3', title: 'Diagonalize matrix and compute powers A^k', completed: false },
        { id: 'sub-4', title: 'Typeset solutions in LaTeX and export PDF', completed: false },
      ]),
    },
    {
      userId: user.id,
      courseId: phys150.id,
      title: 'Lab Report 1: Photoelectric Effect & Work Function',
      description: 'Analyze experimental data gathered during Tuesday lab session and calculate Planck constant.',
      dueDate: addDays(-1, 23, 59),
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      isRecurring: false,
      notes: 'Remember to calculate standard error and uncertainty bounds.',
      tags: 'Lab,Physics',
      subtasks: JSON.stringify([
        { id: 'sub-5', title: 'Plot stopping voltage vs frequency in Python/Excel', completed: true },
        { id: 'sub-6', title: 'Determine slope and calculate Planck constant h', completed: false },
        { id: 'sub-7', title: 'Write error analysis and discussion section', completed: false },
      ]),
    },

    // --- UPCOMING THIS WEEK ---
    {
      userId: user.id,
      courseId: cs201.id,
      title: 'Programming Project 2: Red-Black Tree Implementation',
      description: 'Implement insertion, deletion, and balancing rotations in C++/Java. Include unit test suite with 100% branch coverage.',
      dueDate: addDays(1, 23, 59),
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      isRecurring: false,
      notes: 'Handle case 2 (uncle is red) and case 3 (uncle is black). Ask TA about memory leaks in valgrind.',
      tags: 'Project,Algorithms,C++',
      subtasks: JSON.stringify([
        { id: 'sub-8', title: 'Review Red-Black tree properties & invariant proofs', completed: true },
        { id: 'sub-9', title: 'Implement binary search tree primitive operations', completed: true },
        { id: 'sub-10', title: 'Implement left_rotate and right_rotate helpers', completed: true },
        { id: 'sub-11', title: 'Implement insert_fixup balancing cases', completed: false },
        { id: 'sub-12', title: 'Benchmark execution speed on 100k random keys', completed: false },
      ]),
    },
    {
      userId: user.id,
      courseId: cs350.id,
      title: 'REST API Design Document & OpenAPI Spec',
      description: 'Design RESTful API schemas for the microservices semester project using Swagger/OpenAPI 3.0.',
      dueDate: addDays(2, 18, 30),
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      isRecurring: false,
      notes: 'Follow JSON API conventions and RFC 7807 problem details.',
      tags: 'Architecture,Spec',
      subtasks: JSON.stringify([
        { id: 'sub-13', title: 'Define Auth and User schema models', completed: true },
        { id: 'sub-14', title: 'Draft Course and Assignment endpoints specification', completed: false },
        { id: 'sub-15', title: 'Validate OpenAPI 3.0 YAML in Swagger Editor', completed: false },
      ]),
    },
    {
      userId: user.id,
      courseId: math240.id,
      title: 'Weekly Calculus & Algebra Review Quiz',
      description: 'Timed 30-minute online quiz on canvas covering chapter 5 theorems and vector spaces.',
      dueDate: addDays(3, 20, 0),
      priority: 'LOW',
      status: 'NOT_STARTED',
      isRecurring: true,
      recurrenceRule: 'WEEKLY',
      notes: 'Quiz is timed: 30 minutes, 15 multiple choice questions.',
      tags: 'Quiz,Weekly',
      subtasks: JSON.stringify([
        { id: 'sub-16', title: 'Re-read lecture 9 summary notes', completed: false },
        { id: 'sub-17', title: 'Solve 5 practice quiz problems', completed: false },
      ]),
    },
    {
      userId: user.id,
      courseId: phys150.id,
      title: 'Quantum Harmonic Oscillator Problem Set',
      description: 'Solve the 1D Schrödinger equation using ladder operators. Show full algebraic derivation.',
      dueDate: addDays(5, 12, 0),
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      isRecurring: false,
      notes: 'Check commutator relation [a, a_dagger] = 1.',
      tags: 'Theory,Quantum',
      subtasks: JSON.stringify([
        { id: 'sub-18', title: 'Derive commutation relation for ladder operators', completed: true },
        { id: 'sub-19', title: 'Calculate zero-point ground state energy E_0', completed: true },
        { id: 'sub-20', title: 'Plot wavefunctions psi_0 through psi_3', completed: false },
      ]),
    },

    // --- UPCOMING NEXT WEEK & BEYOND ---
    {
      userId: user.id,
      courseId: cs350.id,
      title: 'Dockerizing Full-Stack Microservices Project',
      description: 'Create multi-stage Dockerfile and docker-compose configuration for frontend, backend, and database.',
      dueDate: addDays(8, 23, 59),
      priority: 'HIGH',
      status: 'NOT_STARTED',
      isRecurring: false,
      notes: 'Use alpine base images to minimize image footprint.',
      tags: 'DevOps,Docker',
      subtasks: JSON.stringify([
        { id: 'sub-21', title: 'Write backend Dockerfile with multi-stage build', completed: false },
        { id: 'sub-22', title: 'Write frontend Dockerfile with Vite production bundle', completed: false },
        { id: 'sub-23', title: 'Configure docker-compose.yml with network bridge', completed: false },
      ]),
    },
    {
      userId: user.id,
      courseId: cs201.id,
      title: 'Graph Algorithms: Dijkstra & A* Pathfinding Benchmark',
      description: 'Compare execution performance of Dijkstra vs A* on large road networks. Write benchmarking summary.',
      dueDate: addDays(11, 23, 59),
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      isRecurring: false,
      tags: 'Algorithms,Benchmark',
      subtasks: null,
    },
    {
      userId: user.id,
      courseId: math240.id,
      title: 'Midterm Examination Preparation Guide',
      description: 'Review practice midterm exams 2024 and 2025. Solve all past boundary-value questions.',
      dueDate: addDays(14, 10, 0),
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
      isRecurring: false,
      tags: 'Exam,Midterm',
      subtasks: null,
    },

    // --- COMPLETED ASSIGNMENTS ---
    {
      userId: user.id,
      courseId: cs201.id,
      title: 'Assignment 1: Amortized Analysis & Dynamic Arrays',
      description: 'Derive runtime complexities and implement resizing array data structure.',
      dueDate: addDays(-7, 23, 59),
      priority: 'MEDIUM',
      status: 'COMPLETED',
      completedAt: addDays(-8, 14, 30),
      isRecurring: false,
      tags: 'Algorithms,Homework',
      subtasks: JSON.stringify([
        { id: 'sub-24', title: 'Prove geometric doubling amortized O(1) bound', completed: true },
        { id: 'sub-25', title: 'Implement Vector class with dynamic resize', completed: true },
        { id: 'sub-26', title: 'Submit code to grading auto-checker', completed: true },
      ]),
    },
    {
      userId: user.id,
      courseId: phys150.id,
      title: 'Physics Lab Safety & Equipment Calibration Quiz',
      description: 'Complete mandatory university safety module before beginning laboratory sessions.',
      dueDate: addDays(-10, 23, 59),
      priority: 'LOW',
      status: 'COMPLETED',
      completedAt: addDays(-11, 16, 0),
      isRecurring: false,
      tags: 'Safety,Lab',
      subtasks: null,
    },
    {
      userId: user.id,
      courseId: cs350.id,
      title: 'Setup Local Git Repository & Development Environment',
      description: 'Configure Node.js, TypeScript, Docker, and VS Code extensions.',
      dueDate: addDays(-12, 18, 0),
      priority: 'LOW',
      status: 'COMPLETED',
      completedAt: addDays(-12, 11, 15),
      isRecurring: false,
      tags: 'Setup,Git',
      subtasks: null,
    },
  ];

  for (const item of assignmentsData) {
    await prisma.assignment.create({
      data: item,
    });
  }

  console.log(`✅ Seeded ${assignmentsData.length} personalized assignments successfully!`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });