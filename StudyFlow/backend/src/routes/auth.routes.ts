import { Router } from 'express';
import { register, login, getMe, registerSchema, loginSchema } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authenticateToken, getMe);

export default router;