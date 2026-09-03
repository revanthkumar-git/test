import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    // Start of current day and 7 days ahead
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Run parallel counts for fast response
    const [
      totalCount,
      completedCount,
      overdueCount,
      dueThisWeekCount,
      overdueAssignments,
      upcomingAssignments,
      courses,
    ] = await Promise.all([
      // Total active (not completed)
      prisma.assignment.count({
        where: { userId, status: { not: 'COMPLETED' } },
      }),
      // Completed assignments
      prisma.assignment.count({
        where: { userId, status: 'COMPLETED' },
      }),
      // Overdue assignments (dueDate < now and not completed)
      prisma.assignment.count({
        where: {
          userId,
          dueDate: { lt: now },
          status: { not: 'COMPLETED' },
        },
      }),
      // Due this week (between now and +7 days, not completed)
      prisma.assignment.count({
        where: {
          userId,
          dueDate: { gte: startOfToday, lte: endOfWeek },
          status: { not: 'COMPLETED' },
        },
      }),
      // Top 5 overdue assignments
      prisma.assignment.findMany({
        where: {
          userId,
          dueDate: { lt: now },
          status: { not: 'COMPLETED' },
        },
        include: {
          course: {
            select: { id: true, name: true, code: true, color: true, icon: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      // Upcoming assignments (next 10 due in the future)
      prisma.assignment.findMany({
        where: {
          userId,
          dueDate: { gte: now },
          status: { not: 'COMPLETED' },
        },
        include: {
          course: {
            select: { id: true, name: true, code: true, color: true, icon: true },
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      // Courses with assignment counts
      prisma.course.findMany({
        where: { userId },
        include: {
          assignments: {
            select: { status: true },
          },
        },
      }),
    ]);

    const courseBreakdown = courses.map((c) => {
      const total = c.assignments.length;
      const completed = c.assignments.filter((a) => a.status === 'COMPLETED').length;
      const pending = total - completed;
      return {
        id: c.id,
        name: c.name,
        code: c.code,
        color: c.color,
        icon: c.icon,
        total,
        completed,
        pending,
      };
    });

    res.status(200).json({
      metrics: {
        totalActive: totalCount,
        completed: completedCount,
        overdue: overdueCount,
        dueThisWeek: dueThisWeekCount,
        totalAssignments: totalCount + completedCount,
        completionRate: (totalCount + completedCount) > 0
          ? Math.round((completedCount / (totalCount + completedCount)) * 100)
          : 0,
      },
      overdueAssignments,
      upcomingAssignments,
      courseBreakdown,
    });
  } catch (error) {
    console.error('getDashboardSummary error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch dashboard summary.' });
  }
};