import { Router } from 'express';
import { getCurrent, generate, updateGoal } from '../controllers/planner.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/current', getCurrent);
router.post('/generate', generate);
router.put('/:id/goal', updateGoal);

export default router;
