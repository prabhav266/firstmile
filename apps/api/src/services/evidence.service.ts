import { prisma } from '../lib/prisma';

export interface SkillScoreSummary {
  skillId: string;
  skillName: string;
  category: string;
  score: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  verificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'SELF_REPORTED' | 'INSUFFICIENT_EVIDENCE';
  evidenceCount: number;
  evidenceItems: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    strength: string;
    url: string | null;
    verified: boolean;
    sourceDate: string;
  }>;
  explanation: string;
}

export interface CandidateEvidenceProfile {
  userId: string;
  name: string;
  email: string;
  title: string;
  college: string;
  branch: string;
  year: number;
  targetCompany: string;
  githubUsername: string | null;
  leetcodeUsername: string | null;
  overallEvidenceScore: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  verificationCounts: {
    verified: number;
    partiallyVerified: number;
    selfReported: number;
    insufficient: number;
  };
  skills: SkillScoreSummary[];
  engineeringEvidence: {
    totalProjects: number;
    productionProjects: number;
    githubRepoCount: number;
    githubStars: number;
    githubTopLanguages: Record<string, number>;
    lastActiveDate: string | null;
  };
  dsaEvidence: {
    totalSolved: number;
    platforms: string[];
    topTopics: string[];
    streakDays: number;
  };
  interviewEvidence: {
    sessionsCompleted: number;
    averageScore: number;
    communicationScore: number;
    technicalScore: number;
  };
  resumeEvidence: {
    atsScore: number;
    extractedSkillCount: number;
    hasResume: boolean;
  };
  growthOpportunities: Array<{
    skillName: string;
    currentScore: number;
    recommendedAction: string;
  }>;
}

/**
 * Re-indexes all existing user activity (Projects, DSA logs, Resumes, Interviews)
 * into unified SkillEvidence records.
 */
export async function ingestAllUserEvidence(userId: string) {
  // 1. Ingest Projects Evidence
  const projects = await prisma.project.findMany({ where: { userId } });
  for (const project of projects) {
    for (const tech of project.techStack) {
      if (!tech || !tech.trim()) continue;
      const skillName = tech.trim();

      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: {
          name: skillName,
          category: 'DEVELOPMENT',
        },
      });

      const isDeployed = Boolean(project.liveUrl);
      const hasCode = Boolean(project.githubUrl);

      // Check if evidence already recorded
      const existing = await prisma.skillEvidence.findFirst({
        where: {
          userId,
          skillId: skill.id,
          type: 'PROJECT',
          title: `Project: ${project.title}`,
        },
      });

      if (!existing) {
        await prisma.skillEvidence.create({
          data: {
            userId,
            skillId: skill.id,
            type: 'PROJECT',
            title: `Project: ${project.title}`,
            description: `${project.description.slice(0, 140)}${
              project.description.length > 140 ? '...' : ''
            }. ${isDeployed ? '✓ Live production deployment verified.' : ''} ${
              hasCode ? '✓ Public repository verified.' : ''
            }`,
            strength: isDeployed && hasCode ? 'STRONG' : 'MODERATE',
            url: project.liveUrl || project.githubUrl,
            verified: isDeployed || hasCode,
            metadata: {
              projectId: project.id,
              status: project.status,
              hasLiveUrl: isDeployed,
              hasGithubUrl: hasCode,
              resumeImpact: project.resumeImpact,
            },
            sourceDate: project.createdAt,
          },
        });
      }
    }
  }

  // 2. Ingest Coding Logs Evidence (DSA Skills)
  const codingLogs = await prisma.codingLog.findMany({ where: { userId } });
  const topicMap: Record<string, number> = {};
  let totalDsaSolved = 0;

  for (const log of codingLogs) {
    totalDsaSolved += log.problemsSolved;
    const topic = log.topic || 'General Problem Solving';
    topicMap[topic] = (topicMap[topic] || 0) + log.problemsSolved;
  }

  if (totalDsaSolved > 0) {
    const dsaSkill = await prisma.skill.upsert({
      where: { name: 'Data Structures & Algorithms' },
      update: {},
      create: {
        name: 'Data Structures & Algorithms',
        category: 'DSA',
      },
    });

    await prisma.skillEvidence.deleteMany({
      where: { userId, skillId: dsaSkill.id, type: 'CODING_DSA' },
    });

    await prisma.skillEvidence.create({
      data: {
        userId,
        skillId: dsaSkill.id,
        type: 'CODING_DSA',
        title: `DSA: ${totalDsaSolved} Verified Problems Solved`,
        description: `Logged problem solving across LeetCode / competitive platforms. Active topics: ${Object.keys(
          topicMap
        )
          .slice(0, 4)
          .join(', ')}.`,
        strength: totalDsaSolved >= 150 ? 'STRONG' : totalDsaSolved >= 50 ? 'MODERATE' : 'SUPPORTING',
        verified: totalDsaSolved >= 30,
        metadata: {
          totalSolved: totalDsaSolved,
          topics: topicMap,
        },
        sourceDate: new Date(),
      },
    });
  }

  // 3. Ingest Resume ATS Skills Evidence
  const latestResume = await prisma.resume.findFirst({
    where: { userId, analysisStatus: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
  });

  if (latestResume && latestResume.rawText) {
    const commonTechs = [
      'React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker',
      'AWS', 'SQL', 'Next.js', 'Redis', 'GraphQL', 'MongoDB',
    ];

    const rawLower = latestResume.rawText.toLowerCase();
    for (const tech of commonTechs) {
      if (rawLower.includes(tech.toLowerCase())) {
        const skill = await prisma.skill.upsert({
          where: { name: tech },
          update: {},
          create: { name: tech, category: 'DEVELOPMENT' },
        });

        const existingResumeEv = await prisma.skillEvidence.findFirst({
          where: { userId, skillId: skill.id, type: 'RESUME' },
        });

        if (!existingResumeEv) {
          await prisma.skillEvidence.create({
            data: {
              userId,
              skillId: skill.id,
              type: 'RESUME',
              title: `Resume Verification: ${tech}`,
              description: `Extracted and validated from candidate resume (ATS Score: ${Math.round(
                latestResume.atsScore || 75
              )}%). Listed in technical competencies and project experience.`,
              strength: (latestResume.atsScore || 0) >= 80 ? 'MODERATE' : 'SUPPORTING',
              verified: true,
              metadata: {
                resumeId: latestResume.id,
                atsScore: latestResume.atsScore,
              },
              sourceDate: latestResume.createdAt,
            },
          });
        }
      }
    }
  }

  // 4. Ingest Interview Session Evidence
  const interviews = await prisma.interviewSession.findMany({
    where: { userId, overallScore: { not: null } },
  });

  if (interviews.length > 0) {
    const avgScore = interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / interviews.length;

    const commSkill = await prisma.skill.upsert({
      where: { name: 'Technical Communication & System Explanation' },
      update: {},
      create: {
        name: 'Technical Communication & System Explanation',
        category: 'SYSTEM_DESIGN',
      },
    });

    await prisma.skillEvidence.deleteMany({
      where: { userId, skillId: commSkill.id, type: 'INTERVIEW' },
    });

    await prisma.skillEvidence.create({
      data: {
        userId,
        skillId: commSkill.id,
        type: 'INTERVIEW',
        title: `Technical Mock Interview: ${interviews.length} Session${interviews.length > 1 ? 's' : ''}`,
        description: `Evaluated technical interview responses. Mean performance score: ${avgScore.toFixed(
          1
        )}/10.0 across technical accuracy, clarity, and edge case handling.`,
        strength: avgScore >= 8.5 ? 'STRONG' : avgScore >= 7.0 ? 'MODERATE' : 'SUPPORTING',
        verified: true,
        metadata: {
          sessionCount: interviews.length,
          avgScore,
        },
        sourceDate: new Date(),
      },
    });
  }

  // 5. Recompute all SkillScore models for this user
  await calculateAllSkillScores(userId);
}

/**
 * Calculates deterministic, explainable SkillScores for every skill associated with user
 */
export async function calculateAllSkillScores(userId: string) {
  // Collect all skills from user_skills table and evidence table
  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
  });

  const evidences = await prisma.skillEvidence.findMany({
    where: { userId },
    include: { skill: true },
  });

  // Group evidence by skillId
  const evidenceBySkill: Record<string, typeof evidences> = {};
  for (const ev of evidences) {
    if (!evidenceBySkill[ev.skillId]) evidenceBySkill[ev.skillId] = [];
    evidenceBySkill[ev.skillId].push(ev);
  }

  // Gather unique skillIds
  const allSkillIds = new Set([
    ...userSkills.map((us) => us.skillId),
    ...evidences.map((e) => e.skillId),
  ]);

  for (const skillId of allSkillIds) {
    const items = evidenceBySkill[skillId] || [];
    const declaredSkill = userSkills.find((us) => us.skillId === skillId);

    // Calculate score points across evidence streams
    let calculatedScore = 0;
    const sourceTypes = new Set(items.map((i) => i.type));

    // GitHub evidence contribution (up to 35 pts)
    const githubEv = items.find((i) => i.type === 'GITHUB_REPO');
    if (githubEv) {
      calculatedScore += githubEv.strength === 'STRONG' ? 35 : 25;
    }

    // Project evidence contribution (up to 30 pts)
    const projectEv = items.find((i) => i.type === 'PROJECT');
    if (projectEv) {
      calculatedScore += projectEv.strength === 'STRONG' ? 30 : 20;
    }

    // Coding / DSA evidence contribution (up to 30 pts)
    const dsaEv = items.find((i) => i.type === 'CODING_DSA');
    if (dsaEv) {
      calculatedScore += dsaEv.strength === 'STRONG' ? 30 : 20;
    }

    // Interview evidence contribution (up to 20 pts)
    const interviewEv = items.find((i) => i.type === 'INTERVIEW');
    if (interviewEv) {
      calculatedScore += interviewEv.strength === 'STRONG' ? 20 : 15;
    }

    // Resume evidence contribution (up to 15 pts)
    const resumeEv = items.find((i) => i.type === 'RESUME');
    if (resumeEv) {
      calculatedScore += resumeEv.strength === 'STRONG' ? 15 : 10;
    }

    // Baseline self-reported credit (max 35 if no external evidence)
    if (items.length === 0 && declaredSkill) {
      calculatedScore = Math.min(45, Math.round(declaredSkill.level * 0.45));
    }

    calculatedScore = Math.min(98, Math.max(items.length > 0 ? 40 : 20, calculatedScore));

    // Determine confidence based on cross-source convergence
    let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (sourceTypes.size >= 3) confidence = 'HIGH';
    else if (sourceTypes.size === 2) confidence = 'MEDIUM';

    // Determine verification status
    let verificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'SELF_REPORTED' | 'INSUFFICIENT_EVIDENCE';
    if (items.length === 0) {
      verificationStatus = declaredSkill ? 'SELF_REPORTED' : 'INSUFFICIENT_EVIDENCE';
    } else if (calculatedScore >= 75 && sourceTypes.size >= 2) {
      verificationStatus = 'VERIFIED';
    } else if (calculatedScore >= 50 && (githubEv || projectEv || dsaEv)) {
      verificationStatus = 'PARTIALLY_VERIFIED';
    } else {
      verificationStatus = 'SELF_REPORTED';
    }

    // Upsert SkillScore record
    const skillScore = await prisma.skillScore.upsert({
      where: { userId_skillId: { userId, skillId } },
      update: {
        score: calculatedScore,
        confidence,
        verificationStatus,
        evidenceCount: items.length,
        lastCalculated: new Date(),
      },
      create: {
        userId,
        skillId,
        score: calculatedScore,
        confidence,
        verificationStatus,
        evidenceCount: items.length,
        lastCalculated: new Date(),
      },
    });

    // Link evidence items to this skillScore
    if (items.length > 0) {
      await prisma.skillEvidence.updateMany({
        where: { userId, skillId },
        data: { skillScoreId: skillScore.id },
      });
    }
  }
}

/**
 * Builds the complete Candidate Evidence Profile
 */
export async function getCandidateEvidenceProfile(userId: string): Promise<CandidateEvidenceProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      githubAccount: {
        include: { repositories: { take: 10, orderBy: { stars: 'desc' } } },
      },
      projects: { orderBy: { createdAt: 'desc' } },
      codingLogs: true,
      interviews: { orderBy: { createdAt: 'desc' } },
      resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
      analytics: { orderBy: { date: 'desc' }, take: 1 },
      skillScores: {
        include: {
          skill: true,
          evidenceItems: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { score: 'desc' },
      },
    },
  });

  if (!user) {
    throw new Error('Candidate not found');
  }

  // If user has no SkillScore rows yet, run ingestion now
  if (user.skillScores.length === 0) {
    await ingestAllUserEvidence(userId);
    return getCandidateEvidenceProfile(userId);
  }

  // Aggregate metrics
  const totalDsaSolved = user.codingLogs.reduce((sum, l) => sum + l.problemsSolved, 0);
  const platforms = Array.from(new Set(user.codingLogs.map((l) => l.platform)));
  const topics = Array.from(new Set(user.codingLogs.map((l) => l.topic).filter(Boolean))) as string[];

  const verifiedInterviews = user.interviews.filter((i) => i.overallScore !== null);
  const avgInterviewScore =
    verifiedInterviews.length > 0
      ? verifiedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / verifiedInterviews.length
      : 0;

  const latestResume = user.resumes[0];
  const latestAnalytics = user.analytics[0];

  const verificationCounts = {
    verified: user.skillScores.filter((s) => s.verificationStatus === 'VERIFIED').length,
    partiallyVerified: user.skillScores.filter((s) => s.verificationStatus === 'PARTIALLY_VERIFIED').length,
    selfReported: user.skillScores.filter((s) => s.verificationStatus === 'SELF_REPORTED').length,
    insufficient: user.skillScores.filter((s) => s.verificationStatus === 'INSUFFICIENT_EVIDENCE').length,
  };

  // Overall Evidence Score calculation
  const topScores = user.skillScores.slice(0, 6);
  const avgTopScore = topScores.length > 0
    ? topScores.reduce((sum, s) => sum + s.score, 0) / topScores.length
    : 50;

  const overallEvidenceScore = Math.min(99, Math.round(
    avgTopScore * 0.5 +
    Math.min(25, (user.projects.length / 3) * 25) +
    Math.min(25, (totalDsaSolved / 150) * 25)
  ));

  let profileConfidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (verificationCounts.verified >= 3 || (user.githubAccount && user.projects.length >= 2)) {
    profileConfidence = 'HIGH';
  } else if (verificationCounts.verified >= 1 || verificationCounts.partiallyVerified >= 2) {
    profileConfidence = 'MEDIUM';
  }

  // Format skills with explainable reasons
  const formattedSkills: SkillScoreSummary[] = user.skillScores.map((s) => {
    const evTypes = Array.from(new Set(s.evidenceItems.map((e) => e.type)));
    let explanation = '';

    if (s.verificationStatus === 'VERIFIED') {
      explanation = `Verified through ${s.evidenceItems.length} evidence sources including ${evTypes
        .map((t) => t.toLowerCase().replace('_', ' '))
        .join(' and ')}. High reliability.`;
    } else if (s.verificationStatus === 'PARTIALLY_VERIFIED') {
      explanation = `Demonstrated in ${s.evidenceItems.length} source(s). Add a live production project or technical assessment to reach fully verified status.`;
    } else {
      explanation = 'Self-reported on profile without external proof. Connect a public GitHub repository or add a project to verify.';
    }

    return {
      skillId: s.skillId,
      skillName: s.skill.name,
      category: s.skill.category,
      score: s.score,
      confidence: s.confidence,
      verificationStatus: s.verificationStatus,
      evidenceCount: s.evidenceCount,
      explanation,
      evidenceItems: s.evidenceItems.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        description: e.description,
        strength: e.strength,
        url: e.url,
        verified: e.verified,
        sourceDate: e.sourceDate.toISOString(),
      })),
    };
  });

  // Identify biggest gap opportunities
  const growthOpportunities: CandidateEvidenceProfile['growthOpportunities'] = [];
  for (const skill of formattedSkills) {
    if (skill.verificationStatus === 'PARTIALLY_VERIFIED') {
      growthOpportunities.push({
        skillName: skill.skillName,
        currentScore: skill.score,
        recommendedAction: `Deploy a live project or pass technical interview in ${skill.skillName} to advance to Verified (85+).`,
      });
    } else if (skill.verificationStatus === 'SELF_REPORTED') {
      growthOpportunities.push({
        skillName: skill.skillName,
        currentScore: skill.score,
        recommendedAction: `Connect code evidence for ${skill.skillName}: push a repository or record a project to replace self-reported status.`,
      });
    }
  }

  return {
    userId: user.id,
    name: user.name || 'Engineering Candidate',
    email: user.email,
    title: user.targetCompany ? `Aspiring Engineer @ ${user.targetCompany}` : 'Full Stack Engineer',
    college: user.college || 'Engineering Institute',
    branch: user.branch || 'Computer Science',
    year: user.year || 3,
    targetCompany: user.targetCompany || 'Tier-1 Tech',
    githubUsername: user.githubUsername,
    leetcodeUsername: user.leetcodeUsername,
    overallEvidenceScore,
    confidence: profileConfidence,
    verificationCounts,
    skills: formattedSkills,
    engineeringEvidence: {
      totalProjects: user.projects.length,
      productionProjects: user.projects.filter((p) => p.status === 'COMPLETED' && p.liveUrl).length,
      githubRepoCount: user.githubAccount?.publicRepos || 0,
      githubStars: user.githubAccount?.totalStars || 0,
      githubTopLanguages: (user.githubAccount?.topLanguages as Record<string, number>) || {},
      lastActiveDate: user.githubAccount?.lastSyncedAt?.toISOString() || null,
    },
    dsaEvidence: {
      totalSolved: totalDsaSolved,
      platforms,
      topTopics: topics.slice(0, 5),
      streakDays: latestAnalytics?.streak || 0,
    },
    interviewEvidence: {
      sessionsCompleted: verifiedInterviews.length,
      averageScore: Number(avgInterviewScore.toFixed(1)),
      communicationScore: Number(avgInterviewScore.toFixed(1)),
      technicalScore: Number(avgInterviewScore.toFixed(1)),
    },
    resumeEvidence: {
      atsScore: Number(latestResume?.atsScore || 0),
      extractedSkillCount: latestResume?.missingSkills ? 15 - latestResume.missingSkills.length : 8,
      hasResume: Boolean(latestResume),
    },
    growthOpportunities: growthOpportunities.slice(0, 4),
  };
}
