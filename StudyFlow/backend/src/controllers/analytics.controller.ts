import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now = new Date();

    const assignments = await prisma.assignment.findMany({
      where: { userId },
      include: {
        course: {
          select: { id: true, name: true, code: true, color: true },
        },
      },
    });

    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === 'COMPLETED').length;
    const inProgress = assignments.filter((a) => a.status === 'IN_PROGRESS').length;
    const notStarted = assignments.filter((a) => a.status === 'NOT_STARTED').length;
    const overdue = assignments.filter((a) => a.status !== 'COMPLETED' && new Date(a.dueDate) < now).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Priority breakdown
    const priorityBreakdown = {
      high: assignments.filter((a) => a.priority === 'HIGH').length,
      medium: assignments.filter((a) => a.priority === 'MEDIUM').length,
      low: assignments.filter((a) => a.priority === 'LOW').length,
    };

    // Course workload breakdown
    const courseMap = new Map<string, { name: string; color: string; total: number; completed: number }>();
    assignments.forEach((a) => {
      const cId = a.courseId;
      if (!courseMap.has(cId)) {
        courseMap.set(cId, {
          name: a.course.name,
          color: a.course.color,
          total: 0,
          completed: 0,
        });
      }
      const entry = courseMap.get(cId)!;
      entry.total += 1;
      if (a.status === 'COMPLETED') entry.completed += 1;
    });

    const courseStats = Array.from(courseMap.entries()).map(([courseId, data]) => ({
      courseId,
      name: data.name,
      color: data.color,
      total: data.total,
      completed: data.completed,
      pending: data.total - data.completed,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));

    res.status(200).json({
      summary: {
        total,
        completed,
        inProgress,
        notStarted,
        overdue,
        completionRate,
      },
      priorityBreakdown,
      courseStats,
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch analytics.' });
  }
};