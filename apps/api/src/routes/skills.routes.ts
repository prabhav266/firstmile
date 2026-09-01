import { Router } from 'express';
import { getSkills, updateSkills, getGraphData, createSkill } from '../controllers/skills.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getSkills);
router.post('/', createSkill);
router.put('/', updateSkills);
router.put('/update', updateSkills);
router.get('/graph', getGraphData);

export default router;
