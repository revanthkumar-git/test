import { Router } from 'express';
import { exportICalendar } from '../controllers/calendar.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/export.ics', exportICalendar);

export default router;