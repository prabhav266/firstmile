import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error } from '../lib/response';
import { generateRoadmap } from '../services/ml.proxy';

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { targetCompany, targetPackage, currentYear, branch } = req.body;

    if (!userId) return error(res, 'Unauthorized', 401);

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });
    const knownSkills = userSkills.map((us: any) => us.skill.name);

    const mlResult = await generateRoadmap({
      targetCompany: targetCompany || 'FAANG',
      targetPackage: Number(targetPackage || 12),
      currentYear: Number(currentYear || 3),
      branch: branch || 'Computer Science',
      knownSkills,
    });

    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        targetCompany: targetCompany || 'FAANG',
        targetPackage: Number(targetPackage || 12),
        currentYear: Number(currentYear || 3),
        branch: branch || 'Computer Science',
        knownSkills,
        dailyPlan: mlResult.daily_plan || {},
        weeklyPlan: mlResult.weekly_plan || {},
        monthlyPlan: mlResult.monthly_plan || {},
        timeline: mlResult.timeline || '6 Months',
      },
    });

    return success(res, roadmap, 'Roadmap generated successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, roadmaps, 'Roadmaps retrieved');
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) return error(res, 'Unauthorized', 401);

    const roadmap = await prisma.roadmap.findFirst({ where: { id, userId } });
    if (!roadmap) return error(res, 'Roadmap not found', 404);

    return success(res, roadmap, 'Roadmap details loaded');
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) return error(res, 'Unauthorized', 401);

    const roadmap = await prisma.roadmap.findFirst({ where: { id, userId } });
    if (!roadmap) return error(res, 'Roadmap not found', 404);

    await prisma.roadmap.delete({ where: { id } });

    return success(res, null, 'Roadmap removed');
  } catch (err) {
    next(err);
  }
}
