import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error } from '../lib/response';

export async function createLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { course, hoursSpent, topicCovered, notebookUrl, projectName } = req.body;

    if (!userId) return error(res, 'Unauthorized', 401);

    const log = await prisma.mLLog.create({
      data: {
        userId,
        course,
        hoursSpent: Number(hoursSpent),
        topicCovered,
        notebookUrl,
        projectName,
      },
    });

    // Update student activity logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAnalytics = await prisma.analytics.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existingAnalytics) {
      await prisma.analytics.update({
        where: { userId_date: { userId, date: today } },
        data: { mlHours: existingAnalytics.mlHours + Number(hoursSpent) },
      });
    } else {
      await prisma.analytics.create({
        data: {
          userId,
          date: today,
          mlHours: Number(hoursSpent),
        },
      });
    }

    return success(res, log, 'ML tracker logged successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function getLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const logs = await prisma.mLLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return success(res, logs, 'ML tracker logs retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const logs = await prisma.mLLog.findMany({ where: { userId } });

    const totalHours = logs.reduce((sum: number, l: any) => sum + l.hoursSpent, 0);
    const courseBreakdown: Record<string, number> = {};

    for (const log of logs) {
      courseBreakdown[log.course] = (courseBreakdown[log.course] || 0) + log.hoursSpent;
    }

    return success(res, {
      totalHours,
      courseBreakdown,
    }, 'ML statistics fetched');
  } catch (err) {
    next(err);
  }
}
