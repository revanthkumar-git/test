import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/summary', getDashboardSummary);

export default router;