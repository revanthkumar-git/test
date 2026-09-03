import { Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required').trim(),
  instructor: z.string().min(1, 'Instructor name is required').trim(),
  code: z.string().trim().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/, 'Invalid color format').optional().default('#3B82F6'),
  icon: z.string().optional().default('book'),
});

export const updateCourseSchema = z.object({
  name: z.string().min(1, 'Course name cannot be empty').trim().optional(),
  instructor: z.string().min(1, 'Instructor name cannot be empty').trim().optional(),
  code: z.string().trim().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/, 'Invalid color format').optional(),
  icon: z.string().optional(),
});

export const getCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const courses = await prisma.course.findMany({
      where: { userId },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({ courses });
  } catch (error) {
    console.error('getCourses error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch courses.' });
  }
};

export const getCourseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const course = await prisma.course.findFirst({
      where: { id, userId },
      include: {
        assignments: {
          orderBy: { dueDate: 'asc' },
        },
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Not Found', message: 'Course not found.' });
      return;
    }

    res.status(200).json({ course });
  } catch (error) {
    console.error('getCourseById error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, instructor, code, color, icon } = req.body;

    const course = await prisma.course.create({
      data: {
        userId,
        name,
        instructor,
        code: code || null,
        color: color || '#3B82F6',
        icon: icon || 'book',
      },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('createCourse error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create course.' });
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existingCourse = await prisma.course.findFirst({
      where: { id, userId },
    });

    if (!existingCourse) {
      res.status(404).json({ error: 'Not Found', message: 'Course not found or unauthorized.' });
      return;
    }

    const { name, instructor, code, color, icon } = req.body;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(instructor !== undefined && { instructor }),
        ...(code !== undefined && { code }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
      },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('updateCourse error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update course.' });
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existingCourse = await prisma.course.findFirst({
      where: { id, userId },
    });

    if (!existingCourse) {
      res.status(404).json({ error: 'Not Found', message: 'Course not found or unauthorized.' });
      return;
    }

    await prisma.course.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Course deleted successfully along with its assignments.',
    });
  } catch (error) {
    console.error('deleteCourse error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete course.' });
  }
};