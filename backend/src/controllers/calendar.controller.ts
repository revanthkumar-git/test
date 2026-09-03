import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateICalendar } from '../services/calendar.service';

export const exportICalendar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const assignments = await prisma.assignment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const icsContent = generateICalendar(assignments, `${req.user!.name}'s StudyFlow Calendar`);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="studyflow-assignments.ics"');
    res.status(200).send(icsContent);
  } catch (error) {
    console.error('exportICalendar error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Failed to export calendar.' });
  }
};