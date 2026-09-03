import { Router } from 'express';
import { createLog, getLogs, getHeatmap, getStats, updateLog, deleteLog, syncLeetCode, syncGitHub } from '../controllers/coding.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/log', createLog);
router.post('/logs', createLog);
router.post('/problems', createLog);

router.post('/sync-leetcode', syncLeetCode);
router.post('/sync/leetcode', syncLeetCode);
router.post('/sync-github', syncGitHub);
router.post('/sync/github', syncGitHub);

router.get('/logs', getLogs);
router.get('/problems', getLogs);
router.get('/heatmap', getHeatmap);
router.get('/stats', getStats);

router.put('/log/:id', updateLog);
router.put('/logs/:id', updateLog);
router.put('/problems/:id', updateLog);

router.delete('/log/:id', deleteLog);
router.delete('/logs/:id', deleteLog);
router.delete('/problems/:id', deleteLog);

export default router;
