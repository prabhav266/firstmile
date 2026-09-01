import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error } from '../lib/response';

export async function getSkills(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    return success(res, userSkills, 'Skills retrieved successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateSkills(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { skills } = req.body; // Array of { skillId: string, level: number }

    if (!userId) return error(res, 'Unauthorized', 401);

    const updates = [];
    for (const s of skills) {
      updates.push(
        prisma.userSkill.updateMany({
          where: { userId, skillId: s.skillId },
          data: { level: Number(s.level) },
        })
      );
    }

    await prisma.$transaction(updates);

    return success(res, null, 'Skills updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function getGraphData(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    // Format for Recharts radar chart (subject: string, score: number, fullMark: 100)
    const graphData = userSkills.map((us: any) => ({
      subject: us.skill.name,
      score: us.level,
      fullMark: 100,
    }));

    return success(res, graphData, 'Graph data compiled successfully');
  } catch (err) {
    next(err);
  }
}

export async function createSkill(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!userId) return error(res, 'Unauthorized', 401);
    if (!name || !name.trim()) return error(res, 'Skill name is required', 400);

    // Find or create skill in skills table
    let skill = await prisma.skill.findUnique({
      where: { name: name.trim() },
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name: name.trim(),
          category: 'DEVELOPMENT', // Default category
        },
      });
    }

    // Associate with user if not already associated
    const userSkill = await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId: skill.id } },
      update: {},
      create: {
        userId,
        skillId: skill.id,
        level: 50, // Default level
      },
      include: { skill: true },
    });

    return success(res, userSkill, 'Skill added successfully');
  } catch (err) {
    next(err);
  }
}
