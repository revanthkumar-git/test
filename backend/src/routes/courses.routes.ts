import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createCourseSchema,
  updateCourseSchema,
} from '../controllers/courses.controller';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

// All course routes require authentication
router.use(authenticateToken);

router.get('/', getCourses);
router.post('/', validateBody(createCourseSchema), createCourse);
router.get('/:id', getCourseById);
router.put('/:id', validateBody(updateCourseSchema), updateCourse);
router.delete('/:id', deleteCourse);

export default router;