import { Request, Response, NextFunction } from 'express';
import { success, error } from '../lib/response';
import {
  getCandidateEvidenceProfile,
  ingestAllUserEvidence,
} from '../services/evidence.service';
import { syncGitHubData } from '../services/github.service';

/**
 * Get authenticated user's Candidate Evidence Profile
 */
export async function getMyEvidenceProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const profile = await getCandidateEvidenceProfile(userId);
    return success(res, profile, 'Candidate evidence profile loaded');
  } catch (err) {
    next(err);
  }
}

/**
 * Recruiter endpoint: view candidate's detailed evidence profile
 */
export async function getCandidateEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    const candidateId = req.params.candidateId as string;
    if (!candidateId) return error(res, 'candidateId is required', 400);

    const profile = await getCandidateEvidenceProfile(candidateId);
    return success(res, profile, 'Candidate verified evidence loaded');
  } catch (err) {
    next(err);
  }
}

/**
 * Connect or Sync GitHub profile and update repository evidence
 */
export async function syncGitHub(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const { username } = req.body;
    if (!username || !username.trim()) {
      return error(res, 'GitHub username is required', 400);
    }

    // 1. Fetch & ingest GitHub data
    await syncGitHubData(userId, username.trim());

    // 2. Recalculate complete user evidence graph
    await ingestAllUserEvidence(userId);

    // 3. Return refreshed evidence profile
    const updatedProfile = await getCandidateEvidenceProfile(userId);
    return success(res, updatedProfile, `GitHub @${username} synced and evidence graph updated`, 200);
  } catch (err: any) {
    return error(res, err.message || 'Failed to sync GitHub account', 400);
  }
}

/**
 * Recalculate user evidence on demand
 */
export async function recalculateEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    await ingestAllUserEvidence(userId);
    const updatedProfile = await getCandidateEvidenceProfile(userId);
    return success(res, updatedProfile, 'Evidence graph re-indexed successfully');
  } catch (err) {
    next(err);
  }
}
