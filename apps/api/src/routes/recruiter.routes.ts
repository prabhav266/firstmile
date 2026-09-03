import { Router } from 'express';
import {
  searchTalent,
  getPipeline,
  bookmarkCandidate,
  sendOutreach,
} from '../controllers/recruiter.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Recruiter discovery and outreach routes (Strictly Recruiter & Admin)
router.get('/candidates', protect, restrictTo('RECRUITER', 'ADMIN'), searchTalent);
router.get('/pipeline', protect, restrictTo('RECRUITER', 'ADMIN'), getPipeline);
router.post('/bookmark', protect, restrictTo('RECRUITER', 'ADMIN'), bookmarkCandidate);
router.post('/outreach', protect, restrictTo('RECRUITER', 'ADMIN'), sendOutreach);

export default router;
