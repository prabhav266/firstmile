import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getMyEvidenceProfile,
  getCandidateEvidence,
  syncGitHub,
  recalculateEvidence,
} from '../controllers/evidence.controller';

const router = Router();

// All evidence endpoints require an authenticated session
router.use(protect);

router.get('/profile', getMyEvidenceProfile);
router.get('/candidate/:candidateId', getCandidateEvidence);
router.post('/sync-github', syncGitHub);
router.post('/recalculate', recalculateEvidence);

export default router;
