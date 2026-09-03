import { Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'Low', 'Medium', 'High']);
const statusEnum = z.enum([
  'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED',
  'not_started', 'in_progress', 'completed',
  'Not Started', 'In Progress', 'Completed'
]);

const normalizePriority = (p?: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
  if (!p) return 'MEDIUM';
  const upper = p.toUpperCase();
  if (upper === 'LOW' || upper === 'MEDIUM' || upper === 'HIGH') return upper;
  return 'MEDIUM';
};

const normalizeStatus = (s?: string): 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' => {
  if (!s) return 'NOT_STARTED';
  const clean = s.toUpperCase().replace(/[\s-]/g, '_');
  if (clean === 'NOT_STARTED' || clean === 'IN_PROGRESS' || clean === 'COMPLETED') return clean;
  return 'NOT_STARTED';
};

export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().trim().optional().nullable(),
  courseId: z.string().min(1, 'Course is required'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format. Please provide a valid ISO date string.',
  }),
  priority: priorityEnum.optional().default('MEDIUM'),
  status: statusEnum.optional().default('NOT_STARTED'),
  isRecurring: z.boolean().optional().default(false),
  recurrenceRule: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional().nullable(),
});

export const updateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').trim().optional(),
  description: z.string().trim().optional().nullable(),
  courseId: z.string().min(1).optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format.',
  }).optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: statusEnum,
});

export const getAssignments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { courseId, status, priority, search, sort, isOverdue } = req.query;

    const where: any = { userId };

    if (courseId && typeof courseId === 'string' && courseId !== 'all') {
      where.courseId = courseId;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      where.status = normalizeStatus(status);
    }

    if (priority && typeof priority === 'string' && priority !== 'all') {
      where.priority = normalizePriority(priority);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = search.trim();
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }

    const now = new Date();
    if (isOverdue === 'true') {
      where.dueDate = { lt: now };
      where.status = { not: 'COMPLETED' };
    } else if (isOverdue === 'false') {
      where.OR = [
        { dueDate: { gte: now } },
        { status: 'COMPLETED' },
      ];
    }

    let orderBy: any = { dueDate: 'asc' };
    if (sort) {
      switch (sort) {
        case 'dueDateDesc':
        case '-dueDate':
          orderBy = { dueDate: 'desc' };
          break;
        case 'dueDateAsc':
        case 'dueDate':
          orderBy = { dueDate: 'asc' };
          break;
        case 'title':
          orderBy = { title: 'asc' };
          break;
        case 'priority':
          // In SQLite / Prisma, order by priority directly
          orderBy = { priority: 'desc' };
          break;
        case 'createdAt':
          orderBy = { createdAt: 'desc' };
          break;
        default:
          orderBy = { dueDate: 'asc' };
      }
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy,
    });

    res.status(200).json({ assignments });
  } catch (error) {
    console.error('getAssignments error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch assignments.' });
  }
};

export const getAssignmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const assignment = await prisma.assignment.findFirst({
      where: { id, userId },
      include: {
        course: true,
      },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Not Found', message: 'Assignment not found.' });
      return;
    }

    res.status(200).json({ assignment });
  } catch (error) {
    console.error('getAssignmentById error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      title,
      description,
      courseId,
      dueDate,
      priority,
      status,
      isRecurring,
      recurrenceRule,
    } = req.body;

    // Verify course belongs to this user
    const course = await prisma.course.findFirst({
      where: { id: courseId, userId },
    });

    if (!course) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'The selected course does not exist or does not belong to you.',
      });
      return;
    }

    const parsedStatus = normalizeStatus(status);
    const parsedPriority = normalizePriority(priority);

    const assignment = await prisma.assignment.create({
      data: {
        userId,
        courseId,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        priority: parsedPriority,
        status: parsedStatus,
        isRecurring: !!isRecurring,
        recurrenceRule: isRecurring ? (recurrenceRule || 'WEEKLY') : null,
        completedAt: parsedStatus === 'COMPLETED' ? new Date() : null,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error) {
    console.error('createAssignment error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create assignment.' });
  }
};

export const updateAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existingAssignment = await prisma.assignment.findFirst({
      where: { id, userId },
    });

    if (!existingAssignment) {
      res.status(404).json({ error: 'Not Found', message: 'Assignment not found or unauthorized.' });
      return;
    }

    const {
      title,
      description,
      courseId,
      dueDate,
      priority,
      status,
      isRecurring,
      recurrenceRule,
    } = req.body;

    if (courseId && courseId !== existingAssignment.courseId) {
      const course = await prisma.course.findFirst({
        where: { id: courseId, userId },
      });
      if (!course) {
        res.status(400).json({ error: 'Bad Request', message: 'Course does not exist.' });
        return;
      }
    }

    const nextStatus = status ? normalizeStatus(status) : existingAssignment.status;
    let completedAt = existingAssignment.completedAt;
    if (status) {
      if (nextStatus === 'COMPLETED' && existingAssignment.status !== 'COMPLETED') {
        completedAt = new Date();
      } else if (nextStatus !== 'COMPLETED') {
        completedAt = null;
      }
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(courseId !== undefined && { courseId }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(priority !== undefined && { priority: normalizePriority(priority) }),
        ...(status !== undefined && { status: nextStatus, completedAt }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurrenceRule !== undefined && { recurrenceRule }),
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    // Bonus feature: If recurring and just marked completed, create the next recurring assignment
    if (
      existingAssignment.status !== 'COMPLETED' &&
      nextStatus === 'COMPLETED' &&
      updatedAssignment.isRecurring &&
      updatedAssignment.recurrenceRule
    ) {
      const currentDue = new Date(updatedAssignment.dueDate);
      const nextDue = new Date(currentDue);
      if (updatedAssignment.recurrenceRule === 'DAILY') {
        nextDue.setDate(nextDue.getDate() + 1);
      } else if (updatedAssignment.recurrenceRule === 'WEEKLY') {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (updatedAssignment.recurrenceRule === 'BIWEEKLY') {
        nextDue.setDate(nextDue.getDate() + 14);
      } else if (updatedAssignment.recurrenceRule === 'MONTHLY') {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }

      await prisma.assignment.create({
        data: {
          userId,
          courseId: updatedAssignment.courseId,
          title: updatedAssignment.title,
          description: updatedAssignment.description,
          dueDate: nextDue,
          priority: updatedAssignment.priority,
          status: 'NOT_STARTED',
          isRecurring: true,
          recurrenceRule: updatedAssignment.recurrenceRule,
        },
      });
    }

    res.status(200).json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error('updateAssignment error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update assignment.' });
  }
};

export const updateAssignmentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { status } = req.body;

    const existingAssignment = await prisma.assignment.findFirst({
      where: { id, userId },
    });

    if (!existingAssignment) {
      res.status(404).json({ error: 'Not Found', message: 'Assignment not found or unauthorized.' });
      return;
    }

    const nextStatus = normalizeStatus(status);
    const completedAt = nextStatus === 'COMPLETED' ? new Date() : null;

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        status: nextStatus,
        completedAt,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    // Auto-create next occurrence if recurring
    if (
      existingAssignment.status !== 'COMPLETED' &&
      nextStatus === 'COMPLETED' &&
      updatedAssignment.isRecurring &&
      updatedAssignment.recurrenceRule
    ) {
      const currentDue = new Date(updatedAssignment.dueDate);
      const nextDue = new Date(currentDue);
      if (updatedAssignment.recurrenceRule === 'DAILY') {
        nextDue.setDate(nextDue.getDate() + 1);
      } else if (updatedAssignment.recurrenceRule === 'WEEKLY') {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (updatedAssignment.recurrenceRule === 'BIWEEKLY') {
        nextDue.setDate(nextDue.getDate() + 14);
      } else if (updatedAssignment.recurrenceRule === 'MONTHLY') {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }

      await prisma.assignment.create({
        data: {
          userId,
          courseId: updatedAssignment.courseId,
          title: updatedAssignment.title,
          description: updatedAssignment.description,
          dueDate: nextDue,
          priority: updatedAssignment.priority,
          status: 'NOT_STARTED',
          isRecurring: true,
          recurrenceRule: updatedAssignment.recurrenceRule,
        },
      });
    }

    res.status(200).json({
      message: 'Status updated successfully',
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error('updateAssignmentStatus error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existingAssignment = await prisma.assignment.findFirst({
      where: { id, userId },
    });

    if (!existingAssignment) {
      res.status(404).json({ error: 'Not Found', message: 'Assignment not found or unauthorized.' });
      return;
    }

    await prisma.assignment.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('deleteAssignment error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete assignment.' });
  }
};