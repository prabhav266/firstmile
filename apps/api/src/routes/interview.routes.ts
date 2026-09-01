import { Router } from 'express';
import { start, submitAnswer, getFeedback, history } from '../controllers/interview.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/start', start);
router.post('/:id/answer', submitAnswer);
router.post('/answer/:id', submitAnswer); // Alias for frontend request
router.get('/:id/feedback', getFeedback);
router.get('/session/:id', getFeedback); // Alias for frontend request
router.get('/history', history); // Alias for frontend request
router.get('/', history);

export default router;
