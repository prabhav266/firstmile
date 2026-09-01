import { Router } from 'express';
import { getScore } from '../controllers/readiness.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/score', getScore);
router.get('/', getScore);

export default router;
