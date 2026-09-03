import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  createAssignmentSchema,
  updateAssignmentSchema,
  updateStatusSchema,
} from '../controllers/assignments.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

// All assignment routes require authentication
router.use(authenticateToken);

router.get('/', getAssignments);
router.post('/', validateBody(createAssignmentSchema), createAssignment);
router.get('/:id', getAssignmentById);
router.put('/:id', validateBody(updateAssignmentSchema), updateAssignment);
router.patch('/:id/status', validateBody(updateStatusSchema), updateAssignmentStatus);
router.delete('/:id', deleteAssignment);

export default router;