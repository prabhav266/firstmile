import { Router } from 'express';
import { createLog, getLogs, getStats } from '../controllers/mlTracker.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/log', createLog);
router.get('/logs', getLogs);
router.get('/stats', getStats);

// Support direct calls under /api/ml-logs
router.post('/', createLog);
router.get('/', getLogs);

export default router;
