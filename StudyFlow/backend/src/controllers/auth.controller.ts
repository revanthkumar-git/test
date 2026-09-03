import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required').trim(),
  university: z.string().trim().optional(),
  major: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  studyGoal: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').trim().optional(),
  university: z.string().trim().optional().nullable(),
  major: z.string().trim().optional().nullable(),
  semester: z.string().trim().optional().nullable(),
  studyGoal: z.string().trim().optional().nullable(),
  avatarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/, 'Invalid color').optional(),
});

const generateToken = (user: { id: string; email: string; name: string }): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    secret,
    { expiresIn: expiresIn as any }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, university, major, semester, studyGoal } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        university: university || null,
        major: major || null,
        semester: semester || null,
        studyGoal: studyGoal || null,
        avatarColor: '#6366F1',
        streakDays: 1,
      },
      select: {
        id: true,
        email: true,
        name: true,
        university: true,
        major: true,
        semester: true,
        studyGoal: true,
        avatarColor: true,
        streakDays: true,
        createdAt: true,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to register user.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
      return;
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      major: user.major,
      semester: user.semester,
      studyGoal: user.studyGoal,
      avatarColor: user.avatarColor,
      streakDays: user.streakDays,
      createdAt: user.createdAt,
    };

    const token = generateToken(safeUser);

    res.status(200).json({
      message: 'Login successful',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to log in.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        university: true,
        major: true,
        semester: true,
        studyGoal: true,
        avatarColor: true,
        streakDays: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, university, major, semester, studyGoal, avatarColor } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(university !== undefined && { university }),
        ...(major !== undefined && { major }),
        ...(semester !== undefined && { semester }),
        ...(studyGoal !== undefined && { studyGoal }),
        ...(avatarColor !== undefined && { avatarColor }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        university: true,
        major: true,
        semester: true,
        studyGoal: true,
        avatarColor: true,
        streakDays: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update profile.' });
  }
};