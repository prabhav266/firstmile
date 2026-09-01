import { Router } from 'express';
import { generate, list, get, remove } from '../controllers/roadmap.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/generate', generate);
router.get('/', list);
router.get('/:id', get);
router.delete('/:id', remove);

export default router;
