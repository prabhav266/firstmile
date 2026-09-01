import { Router } from 'express';
import { createProject, listProjects, updateProject, deleteProject, recommend } from '../controllers/projects.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', createProject);
router.get('/', listProjects);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/recommend', recommend);

export default router;
