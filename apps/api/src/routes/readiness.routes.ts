import { Router } from 'express';
import { getScore, getHistory } from '../controllers/readiness.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/score', getScore);
router.get('/history', getHistory);
router.get('/', getScore);

export default router;
