import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error } from '../lib/response';
import { recommendProjects } from '../services/ml.proxy';

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { title, description, techStack, githubUrl, liveUrl, status } = req.body;

    if (!userId) return error(res, 'Unauthorized', 401);

    const project = await prisma.project.create({
      data: {
        userId,
        title,
        description,
        techStack,
        githubUrl,
        liveUrl,
        status: status || 'IDEA',
        resumeImpact: Math.floor(Math.random() * 40) + 50, // Mock impact calculation
      },
    });

    return success(res, project, 'Project created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, projects, 'Projects list retrieved');
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const { title, description, techStack, githubUrl, liveUrl, status, resumeImpact } = req.body;

    const project = await prisma.project.findFirst({ where: { id, userId } });
    if (!project) return error(res, 'Project not found', 404);

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        techStack,
        githubUrl,
        liveUrl,
        status,
        resumeImpact,
      },
    });

    return success(res, updated, 'Project updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    const project = await prisma.project.findFirst({ where: { id, userId } });
    if (!project) return error(res, 'Project not found', 404);

    await prisma.project.delete({ where: { id } });

    return success(res, null, 'Project deleted');
  } catch (err) {
    next(err);
  }
}

export async function recommend(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { careerGoal } = req.body;

    if (!userId) return error(res, 'Unauthorized', 401);

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });
    const knownSkills = userSkills.map((us: any) => us.skill.name);

    const recommendations = await recommendProjects(knownSkills, careerGoal || 'Full Stack Engineer');

    return success(res, recommendations, 'AI recommendations loaded');
  } catch (err) {
    next(err);
  }
}
