import { Router } from 'express';
import multer from 'multer';
import { uploadResume, triggerAnalysis, getResumes, getResume, deleteResume, getReport } from '../controllers/resume.controller';
import { protect } from '../middleware/auth.middleware';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.post('/:id/analyze', triggerAnalysis);
router.get('/', getResumes);
router.get('/:id', getResume);
router.get('/:id/report', getReport);
router.delete('/:id', deleteResume);

export default router;
