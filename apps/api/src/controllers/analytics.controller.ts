import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error } from '../lib/response';

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const codingStats = await prisma.codingLog.aggregate({
      where: { userId },
      _sum: { problemsSolved: true },
      _count: { id: true },
    });

    const mlStats = await prisma.mLLog.aggregate({
      where: { userId },
      _sum: { hoursSpent: true },
    });

    const resume = await prisma.resume.findFirst({
      where: { userId, analysisStatus: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      select: { atsScore: true },
    });

    const latestAnalytics = await prisma.analytics.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { streak: true, placementScore: true },
    });

    return success(res, {
      problemsSolved: codingStats._sum.problemsSolved || 0,
      totalCodingSessions: codingStats._count.id || 0,
      mlHours: mlStats._sum.hoursSpent || 0,
      resumeScore: resume?.atsScore || 0,
      streak: latestAnalytics?.streak || 0,
      placementScore: latestAnalytics?.placementScore || 40.0, // baseline
    }, 'Analytics summary loaded');
  } catch (err) {
    next(err);
  }
}

export async function getHours(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const analytics = await prisma.analytics.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      take: 30, // Last 30 days
    });

    const formattedData = analytics.map((a: any) => ({
      date: a.date.toISOString().split('T')[0],
      studyHours: a.studyHours,
      codingHours: a.codingHours,
      mlHours: a.mlHours,
    }));

    return success(res, formattedData, 'Study hours data fetched');
  } catch (err) {
    next(err);
  }
}

export async function getConsistency(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const analytics = await prisma.analytics.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const currentStreak = analytics[0]?.streak || 0;
    const maxStreak = Math.max(...analytics.map((a: any) => a.streak), 0);

    return success(res, {
      currentStreak,
      maxStreak,
    }, 'Consistency stats calculated');
  } catch (err) {
    next(err);
  }
}

export async function logActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { studyHours, codingHours, mlHours } = req.body;

    if (!userId) return error(res, 'Unauthorized', 401);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.analytics.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        studyHours: studyHours !== undefined ? Number(studyHours) : undefined,
        codingHours: codingHours !== undefined ? Number(codingHours) : undefined,
        mlHours: mlHours !== undefined ? Number(mlHours) : undefined,
      },
      create: {
        userId,
        date: today,
        studyHours: Number(studyHours || 0),
        codingHours: Number(codingHours || 0),
        mlHours: Number(mlHours || 0),
      },
    });

    return success(res, record, 'Daily activity logged');
  } catch (err) {
    next(err);
  }
}
