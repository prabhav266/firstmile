import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error } from '../lib/response';
import { calculateReadiness } from '../services/ml.proxy';

export async function getScore(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    // Fetch parameters
    const logs = await prisma.codingLog.findMany({ where: { userId } });
    const dsaSolved = logs.reduce((sum: number, l: any) => sum + l.problemsSolved, 0);

    const mlLogs = await prisma.mLLog.findMany({ where: { userId } });
    const mlHours = mlLogs.reduce((sum: number, l: any) => sum + l.hoursSpent, 0);

    const projectsCount = await prisma.project.count({ where: { userId } });

    const latestResume = await prisma.resume.findFirst({
      where: { userId, analysisStatus: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
    });
    const resumeScore = latestResume?.atsScore ? Number(latestResume.atsScore) : 0.0;

    const latestAnalytics = await prisma.analytics.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    const streak = latestAnalytics?.streak || 0;

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });
    const skillLevels: Record<string, number> = {};
    for (const us of userSkills) {
      skillLevels[us.skill.name] = us.level;
    }

    const latestInterview = await prisma.interviewSession.findFirst({
      where: { userId, overallScore: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    const communicationScore = latestInterview?.overallScore ? Number(latestInterview.overallScore) : 0.0;

    const scoreData = await calculateReadiness({
      dsaSolved,
      mlHours,
      projectsCount,
      resumeScore,
      streak,
      skillLevels,
    });

    // Update score in analytics table
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.analytics.upsert({
      where: { userId_date: { userId, date: today } },
      update: { placementScore: scoreData.overall_score },
      create: { userId, date: today, placementScore: scoreData.overall_score },
    });

    return success(res, {
      ...scoreData,
      resume_score: resumeScore,
      communication_score: communicationScore,
    }, 'Placement readiness score calculated');
  } catch (err) {
    next(err);
  }
}
