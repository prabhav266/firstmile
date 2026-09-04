import axios from 'axios';
import { prisma } from '../lib/prisma';

interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  languages_url: string;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  pushed_at: string;
  topics: string[];
}

interface GitHubUserResponse {
  login: string;
  html_url: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  bio: string | null;
}

export async function syncGitHubData(userId: string, username: string) {
  const cleanUsername = username.trim().replace(/^@/, '');
  if (!cleanUsername) {
    throw new Error('Valid GitHub username is required');
  }

  const headers: Record<string, string> = {
    'User-Agent': 'FIRST-MILE-Evidence-Engine',
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // 1. Fetch GitHub User Profile
  let userRes: GitHubUserResponse;
  try {
    const res = await axios.get<GitHubUserResponse>(`https://api.github.com/users/${cleanUsername}`, {
      headers,
      timeout: 8000,
    });
    userRes = res.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      throw new Error(`GitHub user '@${cleanUsername}' not found on GitHub.`);
    }
    throw new Error(`Failed to query GitHub API: ${err.message}`);
  }

  // 2. Fetch Public Repositories (up to 50 sorted by recent activity)
  let repos: GitHubRepoResponse[] = [];
  try {
    const res = await axios.get<GitHubRepoResponse[]>(
      `https://api.github.com/users/${cleanUsername}/repos?per_page=50&sort=pushed`,
      { headers, timeout: 8000 }
    );
    repos = res.data;
  } catch (err: any) {
    console.warn('[GitHub Sync] Failed to fetch repositories:', err.message);
  }

  // 3. Aggregate Top Languages & Calculate Total Stars
  const languageByteMap: Record<string, number> = {};
  let totalStars = 0;

  for (const repo of repos) {
    totalStars += repo.stargazers_count;
    if (repo.language) {
      languageByteMap[repo.language] = (languageByteMap[repo.language] || 0) + 1;
    }
  }

  // Upsert GitHubAccount in database
  const account = await prisma.gitHubAccount.upsert({
    where: { userId },
    update: {
      username: userRes.login,
      profileUrl: userRes.html_url,
      avatarUrl: userRes.avatar_url,
      publicRepos: userRes.public_repos,
      totalStars,
      followers: userRes.followers,
      bio: userRes.bio,
      topLanguages: languageByteMap,
      lastSyncedAt: new Date(),
    },
    create: {
      userId,
      username: userRes.login,
      profileUrl: userRes.html_url,
      avatarUrl: userRes.avatar_url,
      publicRepos: userRes.public_repos,
      totalStars,
      followers: userRes.followers,
      bio: userRes.bio,
      topLanguages: languageByteMap,
      lastSyncedAt: new Date(),
    },
  });

  // Update user's githubUsername on profile
  await prisma.user.update({
    where: { id: userId },
    data: { githubUsername: userRes.login },
  });

  // Delete previous cached repositories for clean sync
  await prisma.gitHubRepository.deleteMany({
    where: { githubAccountId: account.id },
  });

  // Save parsed repositories
  const repoInserts = repos.slice(0, 30).map((r) => {
    // Complexity heuristic based on stars, forks, topics, and not being a raw fork
    let complexityScore = 55;
    if (r.stargazers_count > 5) complexityScore += 15;
    if (r.forks_count > 2) complexityScore += 10;
    if (r.topics && r.topics.length > 0) complexityScore += 10;
    if (r.fork) complexityScore -= 20;
    complexityScore = Math.min(95, Math.max(30, complexityScore));

    return {
      githubAccountId: account.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      htmlUrl: r.html_url,
      language: r.language,
      topics: r.topics || [],
      stars: r.stargazers_count,
      forks: r.forks_count,
      isFork: r.fork,
      pushedAt: r.pushed_at ? new Date(r.pushed_at) : null,
      hasReadme: true,
      complexityScore,
    };
  });

  if (repoInserts.length > 0) {
    await prisma.gitHubRepository.createMany({
      data: repoInserts,
    });
  }

  // 4. Ingest Skill Evidence from GitHub Repositories
  await ingestGitHubSkillEvidence(userId, repos);

  return account;
}

async function ingestGitHubSkillEvidence(userId: string, repos: GitHubRepoResponse[]) {
  // Map common languages and topics to canonical Skill names
  const skillMappings: Record<string, { skillName: string; category: any }> = {
    TypeScript: { skillName: 'TypeScript', category: 'DEVELOPMENT' },
    JavaScript: { skillName: 'JavaScript', category: 'DEVELOPMENT' },
    Python: { skillName: 'Python', category: 'DEVELOPMENT' },
    Go: { skillName: 'Go', category: 'DEVELOPMENT' },
    Java: { skillName: 'Java', category: 'DEVELOPMENT' },
    'C++': { skillName: 'C++', category: 'DEVELOPMENT' },
    Rust: { skillName: 'Rust', category: 'DEVELOPMENT' },
    HTML: { skillName: 'HTML/CSS', category: 'DEVELOPMENT' },
    CSS: { skillName: 'HTML/CSS', category: 'DEVELOPMENT' },
    SQL: { skillName: 'SQL', category: 'DATABASE' },
    PostgreSQL: { skillName: 'PostgreSQL', category: 'DATABASE' },
    Docker: { skillName: 'Docker', category: 'CLOUD' },
    React: { skillName: 'React', category: 'DEVELOPMENT' },
    'Next.js': { skillName: 'Next.js', category: 'DEVELOPMENT' },
  };

  // Tally evidence per skill
  const skillEvidenceMap: Record<string, {
    canonicalName: string;
    category: any;
    matchingRepos: GitHubRepoResponse[];
    totalStars: number;
  }> = {};

  for (const repo of repos) {
    const candidateTerms = [
      repo.language,
      ...(repo.topics || []),
      ...(repo.name ? repo.name.split(/[-_]/) : []),
    ].filter(Boolean) as string[];

    for (const term of candidateTerms) {
      // Find matching key case-insensitively
      const matchedKey = Object.keys(skillMappings).find(
        (k) => k.toLowerCase() === term.toLowerCase()
      );

      if (matchedKey) {
        const mapping = skillMappings[matchedKey];
        if (!skillEvidenceMap[mapping.skillName]) {
          skillEvidenceMap[mapping.skillName] = {
            canonicalName: mapping.skillName,
            category: mapping.category,
            matchingRepos: [],
            totalStars: 0,
          };
        }

        if (!skillEvidenceMap[mapping.skillName].matchingRepos.some((r) => r.id === repo.id)) {
          skillEvidenceMap[mapping.skillName].matchingRepos.push(repo);
          skillEvidenceMap[mapping.skillName].totalStars += repo.stargazers_count;
        }
      }
    }
  }

  // Upsert Skills & Evidence items
  for (const skillKey of Object.keys(skillEvidenceMap)) {
    const info = skillEvidenceMap[skillKey];

    // Ensure canonical skill exists in database
    const skill = await prisma.skill.upsert({
      where: { name: info.canonicalName },
      update: {},
      create: {
        name: info.canonicalName,
        category: info.category,
      },
    });

    const repoCount = info.matchingRepos.length;
    const topRepo = info.matchingRepos[0];

    // Delete older GitHub evidence items for this skill to avoid stale duplicates
    await prisma.skillEvidence.deleteMany({
      where: {
        userId,
        skillId: skill.id,
        type: 'GITHUB_REPO',
      },
    });

    // Create fresh verified GitHub evidence
    await prisma.skillEvidence.create({
      data: {
        userId,
        skillId: skill.id,
        type: 'GITHUB_REPO',
        title: `GitHub: ${repoCount} Public Repositor${repoCount === 1 ? 'y' : 'ies'} with ${info.canonicalName}`,
        description: `Primary codebase: ${topRepo.name} (${topRepo.stargazers_count}★, pushed ${
          topRepo.pushed_at ? new Date(topRepo.pushed_at).toLocaleDateString() : 'recently'
        }). Confirmed via public repository code analysis.`,
        strength: repoCount >= 3 || info.totalStars >= 5 ? 'STRONG' : 'MODERATE',
        url: topRepo.html_url,
        metadata: {
          repoCount,
          totalStars: info.totalStars,
          topRepoName: topRepo.name,
          pushedAt: topRepo.pushed_at,
        },
        verified: true,
        sourceDate: topRepo.pushed_at ? new Date(topRepo.pushed_at) : new Date(),
      },
    });
  }
}
