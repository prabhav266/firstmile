import { Router } from 'express';
import { getSummary, getHours, getConsistency, logActivity } from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/hours', getHours);
router.get('/consistency', getConsistency);
router.post('/log', logActivity);

export default router;
