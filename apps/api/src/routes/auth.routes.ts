import { Router } from 'express';
import { register, login, logout, refresh, me, registerSchema, loginSchema } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.get('/me', protect, me);

export default router;
