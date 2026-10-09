import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadResume, triggerAnalysis, getResumes, getResume, deleteResume, getReport } from '../controllers/resume.controller';
import { protect } from '../middleware/auth.middleware';
import { error } from '../lib/response';

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB — matches the limit shown in the UI

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx') return cb(null, true);
    cb(new Error('UNSUPPORTED_RESUME_TYPE'));
  },
});

// Turn multer errors into clear 4xx responses instead of generic 500s.
function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('resume')(req, res, (err: any) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return error(res, 'File is too large. Maximum size is 5MB.', 413);
    if (err.message === 'UNSUPPORTED_RESUME_TYPE') return error(res, 'Unsupported file type. Please upload a PDF or DOCX.', 415);
    return error(res, err.message || 'Upload failed', 400);
  });
}

const router = Router();

router.use(protect);

router.post('/upload', handleUpload, uploadResume);
router.post('/:id/analyze', triggerAnalysis);
router.get('/', getResumes);
router.get('/:id', getResume);
router.get('/:id/report', getReport);
router.delete('/:id', deleteResume);

export default router;
