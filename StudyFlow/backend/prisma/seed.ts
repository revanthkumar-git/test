import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

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

  // Create demo student
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const user = await prisma.user.create({
    data: {
      email: 'student@university.edu',
      name: 'Alex Morgan',
      passwordHash,
    },
  });

  console.log(`👤 Created demo student: ${user.email} (Password: password123)`);

  // Create Courses
  const cs201 = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      instructor: 'Prof. Ada Lovelace',
      color: '#3B82F6', // Blue
      icon: 'code',
    },
  });

  const math240 = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Linear Algebra & Differential Equations',
      code: 'MATH240',
      instructor: 'Dr. Alan Turing',
      color: '#8B5CF6', // Purple
      icon: 'calculator',
    },
  });

  const phys150 = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Modern Physics & Quantum Mechanics',
      code: 'PHYS150',
      instructor: 'Dr. Richard Feynman',
      color: '#EC4899', // Pink
      icon: 'flask',
    },
  });

  const cs350 = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Cloud & Web Architecture',
      code: 'CS350',
      instructor: 'Prof. Tim Berners-Lee',
      color: '#10B981', // Emerald
      icon: 'globe',
    },
  });

  console.log('📚 Created 4 university courses.');

  const now = new Date();

  // Helper to create dates offset from today
  const addDays = (days: number, hours = 23, minutes = 59): Date => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  // Seed Assignments
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
    },

    // --- UPCOMING NEXT WEEK & BEYOND ---
    {
      userId: user.id,
      courseId: cs350.id,
      title: 'Dockerizing Full-Stack Microservices Project',
      description: 'Create multi-stage Dockerfile and docker-compose configuration for frontend, backend, and PostgreSQL database.',
      dueDate: addDays(8, 23, 59),
      priority: 'HIGH',
      status: 'NOT_STARTED',
      isRecurring: false,
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
    },
  ];

  for (const item of assignmentsData) {
    await prisma.assignment.create({
      data: item,
    });
  }

  console.log(`✅ Seeded ${assignmentsData.length} assignments successfully!`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });