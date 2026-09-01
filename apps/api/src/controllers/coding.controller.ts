import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error, paginated } from '../lib/response';

export async function createLog(req: Request, res: Response, next: NextFunction) {
  try {
    const { platform, problemsSolved, difficulty, topic, notes, date } = req.body;
    const userId = req.user?.userId;

    if (!userId) return error(res, 'Unauthorized', 401);

    const platformMap: Record<string, string> = {
      leetcode: 'LEETCODE',
      codeforces: 'CODEFORCES',
      codechef: 'CODECHEF',
      'striver a2z': 'STRIVER_A2Z',
      striver_a2z: 'STRIVER_A2Z',
      neetcode: 'NEETCODE',
      blind75: 'BLIND75',
    };
    const normalizedPlatform = platformMap[platform?.toLowerCase()] || platform?.toUpperCase();
    const normalizedDifficulty = difficulty ? difficulty.toUpperCase() : undefined;

    const log = await prisma.codingLog.create({
      data: {
        userId,
        platform: normalizedPlatform as any,
        problemsSolved: Number(problemsSolved),
        difficulty: normalizedDifficulty as any,
        topic,
        notes,
        date: date ? new Date(date) : new Date(),
      },
    });

    // Update user streak and analytics
    await trackAnalytics(userId, Number(problemsSolved));

    return success(res, log, 'Coding session logged successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function getLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50; // Increased limit to fetch more/all recent logs
    const skip = (page - 1) * limit;

    const platformQuery = req.query.platform as string | undefined;

    const where: any = { userId };
    if (platformQuery) {
      const platformMap: Record<string, string> = {
        leetcode: 'LEETCODE',
        codeforces: 'CODEFORCES',
        codechef: 'CODECHEF',
        'striver a2z': 'STRIVER_A2Z',
        striver_a2z: 'STRIVER_A2Z',
        neetcode: 'NEETCODE',
        blind75: 'BLIND75',
      };
      const normalized = platformMap[platformQuery.toLowerCase()] || platformQuery.toUpperCase();
      where.platform = normalized;
    }

    const [logs, total] = await prisma.$transaction([
      prisma.codingLog.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.codingLog.count({ where }),
    ]);

    return paginated(res, logs, total, page, limit);
  } catch (err) {
    next(err);
  }
}

export async function getHeatmap(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const logs = await prisma.codingLog.findMany({
      where: { userId },
      select: {
        date: true,
        problemsSolved: true,
      },
    });

    // Group logs by simple date format YYYY-MM-DD
    const heatmap: Record<string, number> = {};
    for (const log of logs) {
      const dateString = log.date.toISOString().split('T')[0];
      heatmap[dateString] = (heatmap[dateString] || 0) + log.problemsSolved;
    }

    return success(res, heatmap, 'Heatmap data retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const logs = await prisma.codingLog.findMany({ where: { userId } });

    const totalSolved = logs.reduce((sum: number, log: any) => sum + log.problemsSolved, 0);

    const platformBreakdown: Record<string, number> = {};
    const difficultyDistribution = { EASY: 0, MEDIUM: 0, HARD: 0 };

    for (const log of logs) {
      platformBreakdown[log.platform] = (platformBreakdown[log.platform] || 0) + log.problemsSolved;
      if (log.difficulty) {
        difficultyDistribution[log.difficulty as 'EASY' | 'MEDIUM' | 'HARD'] += log.problemsSolved;
      }
    }

    return success(res, {
      totalSolved,
      platformBreakdown,
      difficultyDistribution,
    }, 'Stats retrieved');
  } catch (err) {
    next(err);
  }
}

export async function updateLog(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { platform, problemsSolved, difficulty, topic, notes } = req.body;
    const userId = req.user?.userId;

    const log = await prisma.codingLog.findFirst({ where: { id, userId } });
    if (!log) return error(res, 'Log not found', 404);

    const updated = await prisma.codingLog.update({
      where: { id },
      data: {
        platform,
        problemsSolved: problemsSolved !== undefined ? Number(problemsSolved) : undefined,
        difficulty,
        topic,
        notes,
      },
    });

    return success(res, updated, 'Log updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteLog(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    const log = await prisma.codingLog.findFirst({ where: { id, userId } });
    if (!log) return error(res, 'Log not found', 404);

    await prisma.codingLog.delete({ where: { id } });

    return success(res, null, 'Log deleted');
  } catch (err) {
    next(err);
  }
}

async function trackAnalytics(userId: string, problemsSolved: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAnalytics = await prisma.analytics.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (existingAnalytics) {
    await prisma.analytics.update({
      where: { userId_date: { userId, date: today } },
      data: {
        codingHours: existingAnalytics.codingHours + (problemsSolved * 0.3), // approx 20 mins per problem
      },
    });
  } else {
    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const pastAnalytics = await prisma.analytics.findFirst({
      where: { userId, date: yesterday },
    });

    const streak = pastAnalytics ? pastAnalytics.streak + 1 : 1;

    await prisma.analytics.create({
      data: {
        userId,
        date: today,
        codingHours: problemsSolved * 0.3,
        streak,
      },
    });
  }
}

export async function syncLeetCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.body;
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);
    if (!username || typeof username !== 'string' || !username.trim()) {
      return error(res, 'LeetCode username is required', 400);
    }

    const cleanUsername = username.trim();

    // 1. Account Ownership & Lock Verification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, leetcodeUsername: true }
    });

    if (!user) return error(res, 'User not found', 404);

    // If user already linked a handle, verify it matches
    if (user.leetcodeUsername) {
      if (user.leetcodeUsername.toLowerCase() !== cleanUsername.toLowerCase()) {
        return error(
          res,
          `Your PathForge account is already linked to LeetCode handle '@${user.leetcodeUsername}'. You cannot sync someone else's account.`,
          400
        );
      }
    } else {
      // User is linking for the first time: ensure no other account claimed it
      const existingClaim = await prisma.user.findFirst({
        where: {
          leetcodeUsername: { equals: cleanUsername, mode: 'insensitive' },
          id: { not: userId }
        }
      });
      if (existingClaim) {
        return error(
          res,
          `The LeetCode handle '@${cleanUsername}' is already linked to another PathForge AI student account.`,
          400
        );
      }

      // Link username to current user profile
      await prisma.user.update({
        where: { id: userId },
        data: { leetcodeUsername: cleanUsername }
      });
    }

    // 2. Fetch Live Stats from LeetCode GraphQL API
    const axios = (await import('axios')).default;
    const graphqlQuery = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username: cleanUsername }
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 8000
    });

    const userStats = response.data?.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!userStats) {
      return error(res, `LeetCode profile '@${cleanUsername}' not found or has private stats`, 404);
    }

    let liveEasy = 0, liveMedium = 0, liveHard = 0, liveTotal = 0;
    for (const item of userStats) {
      if (item.difficulty === 'All') liveTotal = item.count;
      if (item.difficulty === 'Easy') liveEasy = item.count;
      if (item.difficulty === 'Medium') liveMedium = item.count;
      if (item.difficulty === 'Hard') liveHard = item.count;
    }

    // 3. Compute Incremental Delta (Prevent Duplicate Stacking)
    const existingLogs = await prisma.codingLog.findMany({
      where: { userId, platform: 'LEETCODE' },
      select: { difficulty: true, problemsSolved: true }
    });

    let currentDbEasy = 0, currentDbMedium = 0, currentDbHard = 0;
    for (const log of existingLogs) {
      if (log.difficulty === 'EASY') currentDbEasy += log.problemsSolved;
      else if (log.difficulty === 'MEDIUM') currentDbMedium += log.problemsSolved;
      else if (log.difficulty === 'HARD') currentDbHard += log.problemsSolved;
    }

    const deltaEasy = Math.max(0, liveEasy - currentDbEasy);
    const deltaMedium = Math.max(0, liveMedium - currentDbMedium);
    const deltaHard = Math.max(0, liveHard - currentDbHard);
    const deltaTotal = deltaEasy + deltaMedium + deltaHard;

    const today = new Date();

    if (deltaTotal === 0) {
      return success(
        res,
        {
          username: cleanUsername,
          total: liveTotal,
          easy: liveEasy,
          medium: liveMedium,
          hard: liveHard,
          delta: 0,
          alreadyUpToDate: true
        },
        `LeetCode profile @${cleanUsername} is already up to date (${liveTotal} solved, +0 new problems).`
      );
    }

    // Log ONLY the incremental delta
    if (deltaEasy > 0) {
      await prisma.codingLog.create({
        data: {
          userId,
          platform: 'LEETCODE',
          problemsSolved: deltaEasy,
          difficulty: 'EASY',
          topic: `LeetCode Sync (@${cleanUsername})`,
          date: today
        }
      });
    }
    if (deltaMedium > 0) {
      await prisma.codingLog.create({
        data: {
          userId,
          platform: 'LEETCODE',
          problemsSolved: deltaMedium,
          difficulty: 'MEDIUM',
          topic: `LeetCode Sync (@${cleanUsername})`,
          date: today
        }
      });
    }
    if (deltaHard > 0) {
      await prisma.codingLog.create({
        data: {
          userId,
          platform: 'LEETCODE',
          problemsSolved: deltaHard,
          difficulty: 'HARD',
          topic: `LeetCode Sync (@${cleanUsername})`,
          date: today
        }
      });
    }

    await trackAnalytics(userId, deltaTotal);

    return success(
      res,
      {
        username: cleanUsername,
        total: liveTotal,
        easy: liveEasy,
        medium: liveMedium,
        hard: liveHard,
        delta: deltaTotal,
        alreadyUpToDate: false
      },
      `Synced +${deltaTotal} new LeetCode problem${deltaTotal > 1 ? 's' : ''} for @${cleanUsername}! Total verified: ${liveTotal}.`
    );
  } catch (err: any) {
    return error(res, `Failed to sync LeetCode profile: ${err.message || err}`, 500);
  }
}

export async function syncGitHub(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.body;
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);
    if (!username || typeof username !== 'string' || !username.trim()) {
      return error(res, 'GitHub username is required', 400);
    }

    const cleanUsername = username.trim();

    // 1. Account Ownership & Lock Verification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, githubUsername: true }
    });

    if (!user) return error(res, 'User not found', 404);

    if (user.githubUsername) {
      if (user.githubUsername.toLowerCase() !== cleanUsername.toLowerCase()) {
        return error(
          res,
          `Your PathForge account is already linked to GitHub handle '@${user.githubUsername}'. You cannot sync someone else's account.`,
          400
        );
      }
    } else {
      const existingClaim = await prisma.user.findFirst({
        where: {
          githubUsername: { equals: cleanUsername, mode: 'insensitive' },
          id: { not: userId }
        }
      });
      if (existingClaim) {
        return error(
          res,
          `The GitHub handle '@${cleanUsername}' is already linked to another PathForge AI student account.`,
          400
        );
      }

      await prisma.user.update({
        where: { id: userId },
        data: { githubUsername: cleanUsername }
      });
    }

    // 2. Fetch Live GitHub Push Events
    const axios = (await import('axios')).default;
    const response = await axios.get(`https://api.github.com/users/${cleanUsername}/events/public`, {
      headers: { 'User-Agent': 'PathForge-AI-Client' },
      timeout: 8000
    });

    const pushEvents = (response.data || []).filter((evt: any) => evt.type === 'PushEvent');
    const commitCount = pushEvents.reduce((acc: number, evt: any) => acc + (evt.payload?.commits?.length || 1), 0);

    if (commitCount === 0) {
      return success(
        res,
        { username: cleanUsername, commitCount: 0, delta: 0 },
        `GitHub handle @${cleanUsername} is up to date (no new public push events found).`
      );
    }

    // Check if we already logged these commits today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingTodayLog = await prisma.codingLog.findFirst({
      where: {
        userId,
        platform: 'LEETCODE',
        topic: `GitHub Commit Activity (@${cleanUsername})`,
        date: { gte: today }
      }
    });

    if (existingTodayLog) {
      const deltaCommits = Math.max(0, commitCount - existingTodayLog.problemsSolved);
      if (deltaCommits === 0) {
        return success(
          res,
          { username: cleanUsername, commitCount, delta: 0 },
          `GitHub activity for @${cleanUsername} is already up to date today.`
        );
      }
      await prisma.codingLog.update({
        where: { id: existingTodayLog.id },
        data: { problemsSolved: commitCount }
      });
      await trackAnalytics(userId, deltaCommits);

      return success(
        res,
        { username: cleanUsername, commitCount, delta: deltaCommits },
        `Synced +${deltaCommits} new GitHub commit${deltaCommits > 1 ? 's' : ''} for @${cleanUsername}!`
      );
    }

    await prisma.codingLog.create({
      data: {
        userId,
        platform: 'LEETCODE',
        problemsSolved: commitCount,
        difficulty: 'MEDIUM',
        topic: `GitHub Commit Activity (@${cleanUsername})`,
        notes: `Synced ${commitCount} commits from public GitHub events`,
        date: new Date()
      }
    });

    await trackAnalytics(userId, commitCount);

    return success(
      res,
      { username: cleanUsername, commitCount, delta: commitCount },
      `Synced ${commitCount} GitHub commits for @${cleanUsername}!`
    );
  } catch (err: any) {
    return error(res, `Failed to sync GitHub profile: ${err.message || err}`, 500);
  }
}


