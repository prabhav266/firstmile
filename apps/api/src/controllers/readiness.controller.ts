import { Request, Response, NextFunction } from 'express';
import { success, error } from '../lib/response';
import {
  calculateMultiDimensionalReadiness,
  getReadinessHistory,
} from '../services/readiness.service';

/**
 * Get Multi-Dimensional Placement Readiness Score with employer tier weighting
 */
export async function getScore(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const { targetTier, targetRole } = req.query;

    const readinessData = await calculateMultiDimensionalReadiness(
      userId,
      typeof targetTier === 'string' ? targetTier : 'TIER_1',
      typeof targetRole === 'string' ? targetRole : 'FULL_STACK'
    );

    return success(res, readinessData, 'Placement readiness score calculated');
  } catch (err) {
    next(err);
  }
}

/**
 * Get historical readiness progression snapshots
 */
export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const history = await getReadinessHistory(userId);
    return success(res, history, 'Readiness historical progression retrieved');
  } catch (err) {
    next(err);
  }
}
