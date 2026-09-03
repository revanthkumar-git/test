import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  toggleSubtask,
  createAssignmentSchema,
  updateAssignmentSchema,
  updateStatusSchema,
} from '../controllers/assignments.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(authenticateToken);

router.get('/', getAssignments);
router.post('/', validateBody(createAssignmentSchema), createAssignment);
router.get('/:id', getAssignmentById);
router.put('/:id', validateBody(updateAssignmentSchema), updateAssignment);
router.patch('/:id/status', validateBody(updateStatusSchema), updateAssignmentStatus);
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);
router.delete('/:id', deleteAssignment);

export default router;