import { Router } from 'express';
import {
  getBatchOverview,
  getStudentsRoster,
  getCampusDrives,
  createCampusDrive,
  exportDossierCsv,
} from '../controllers/tpo.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// TPO Portal routes (Strictly TPO & Admin)
router.get('/overview', protect, restrictTo('TPO', 'ADMIN'), getBatchOverview);
router.get('/students', protect, restrictTo('TPO', 'ADMIN'), getStudentsRoster);
router.get('/drives', protect, restrictTo('TPO', 'RECRUITER', 'ADMIN'), getCampusDrives);
router.post('/drives', protect, restrictTo('TPO', 'ADMIN'), createCampusDrive);
router.get('/export-csv', protect, restrictTo('TPO', 'ADMIN'), exportDossierCsv);

export default router;
