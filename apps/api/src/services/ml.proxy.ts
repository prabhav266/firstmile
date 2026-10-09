import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const mlClient = axios.create({
  baseURL: `${ML_SERVICE_URL}/api/v1`,
  timeout: 3500, // default for quick endpoints; resume analysis overrides this (LLM calls are slow)
});

// ==========================================
// 1. RESUME ANALYZER (ATS & Skill Auditing)
// ==========================================
export interface ResumeAnalysisResult {
  ats_score: number;
  grammar_score: number; // 0-10
  resume_rating: number; // 0-10
  missing_skills: string[];
  weak_bullets: string[];
  suggestions: string[];
  project_suggestions: string[];
}

// LLM calls (Gemini) routinely take 5-30s. The old 3.5s timeout always tripped,
// silently dropping every analysis onto the generic fallback below.
const RESUME_ML_TIMEOUT_MS = 60_000;

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasTerm(text: string, term: string) {
  // word-boundary match so "java" doesn't match "javascript", "sql" doesn't match "postgresql", etc.
  return new RegExp(`(?<![a-z0-9])${escapeRegex(term)}(?![a-z0-9])`, 'i').test(text);
}

const SKILL_LABELS: Record<string, string> = {
  aws: 'AWS', sql: 'SQL', postgresql: 'PostgreSQL', mongodb: 'MongoDB', graphql: 'GraphQL', 'ci/cd': 'CI/CD',
  'rest api': 'REST API', 'node.js': 'Node.js', 'next.js': 'Next.js', javascript: 'JavaScript', typescript: 'TypeScript',
};
const prettySkill = (k: string) => SKILL_LABELS[k] || k.replace(/\b\w/g, (c) => c.toUpperCase());

/** Deterministic fallback used only if the Python ML service is unreachable. */
export function heuristicResumeAnalysis(rawText: string, jobRole: string): ResumeAnalysisResult {
  const text = rawText || '';
  const lower = text.toLowerCase();
  const wordCount = (lower.match(/[a-z0-9+#.]+/g) || []).length;

  const skillBank = [
    'python', 'java', 'javascript', 'typescript', 'react', 'node.js', 'express', 'sql', 'postgresql',
    'mongodb', 'git', 'docker', 'aws', 'rest api', 'graphql', 'redis', 'ci/cd', 'kubernetes',
    'data structures', 'algorithms', 'system design', 'next.js', 'tailwind',
  ];
  const found = skillBank.filter((k) => hasTerm(lower, k));
  const missing = skillBank.filter((k) => !hasTerm(lower, k));

  const hasSection = (...names: string[]) => names.some((n) => hasTerm(lower, n));
  const sectionHits = [
    hasSection('experience', 'internship', 'work history'),
    hasSection('education'),
    hasSection('skills', 'technical skills'),
    hasSection('projects', 'project'),
  ].filter(Boolean).length;

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const wordsIn = (l: string) => l.split(/\s+/).filter(Boolean).length;
  const bulletLines = lines.filter((l) => /^[•\-*–]/.test(l) || (wordsIn(l) >= 9 && l.length < 260 && !/[|@]/.test(l)));
  const quantified = bulletLines.filter((l) => /\d+\s*(%|\+|x\b|ms\b|k\b|users|requests|seconds)|\$\s?\d|\b\d{2,}\b/i.test(l));
  const weakStart = /^(?:[•\-*–]\s*)?(responsible for|worked on|helped|assisted|involved in|handled|did|made|tried)\b/i;
  const weakBullets = bulletLines
    .filter((l) => weakStart.test(l) || !quantified.includes(l))
    .slice(0, 4)
    .map((l) => (l.length > 140 ? l.slice(0, 137) + '...' : l));

  const metricRatio = bulletLines.length ? quantified.length / bulletLines.length : 0;

  let ats = 30;
  ats += Math.min(30, (found.length / 12) * 30); // keyword coverage
  ats += sectionHits * 5; // standard sections present (max 20)
  ats += Math.min(10, metricRatio * 20); // quantified impact
  if (wordCount >= 250) ats += 10;
  else if (wordCount >= 120) ats += 5;
  if (wordCount < 150) ats = Math.min(ats, 70); // a very short resume cannot be 'ATS-strong'
  ats = Math.round(Math.min(95, Math.max(20, ats)));

  // Grammar/formatting (0-10): simple, honest signals only.
  let grammar = 9;
  if (/ {3,}/.test(rawText)) grammar -= 0.5;
  const lowercaseStarts = lines.filter((l) => /^[a-z]/.test(l) && l.length > 40).length;
  grammar -= Math.min(2, lowercaseStarts * 0.3);
  if (sectionHits < 3) grammar -= 1;
  grammar = Math.max(4, Math.round(grammar * 10) / 10);

  const rating = Math.round(Math.min(10, Math.max(1, ats / 10 * 0.8 + grammar * 0.2)) * 10) / 10;

  const suggestions: string[] = [];
  if (missing.length) suggestions.push(`Add relevant keywords for ${jobRole} where you genuinely have the experience: ${missing.slice(0, 4).map(prettySkill).join(', ')}.`);
  if (metricRatio < 0.4) suggestions.push('Quantify more bullets (e.g. "Reduced API latency by 35%", "served 2,000+ users").');
  if (sectionHits < 4) suggestions.push('Use standard section headings so ATS parsers can find them: Education, Skills, Projects, Experience.');
  if (wordCount < 150) suggestions.push('Your resume is very short — expand project bullets with the problem, your approach and the result.');
  suggestions.push('Keep a single-column layout without tables, text boxes or images.');

  return {
    ats_score: ats,
    grammar_score: grammar,
    resume_rating: rating,
    missing_skills: missing.slice(0, 6).map(prettySkill),
    weak_bullets: weakBullets,
    suggestions,
    project_suggestions: [
      `Production-style ${jobRole} project: REST API + database + Docker + deployed live demo`,
      'Rate-limited API gateway with Redis caching and load tests',
    ],
  };
}

export async function analyzeResume(rawText: string, jobRole: string): Promise<ResumeAnalysisResult> {
  try {
    const response = await mlClient.post(
      '/resume/analyze',
      { raw_text: rawText, job_role: jobRole },
      { timeout: RESUME_ML_TIMEOUT_MS }
    );
    return response.data;
  } catch (err: any) {
    console.warn(`[ML Proxy] Resume ML service failed (${err?.code || err?.message}); using heuristic engine`);
    return heuristicResumeAnalysis(rawText, jobRole);
  }
}

// ==========================================
// 2. PLACEMENT ROADMAP GENERATOR
// ==========================================
export async function generateRoadmap(data: {
  targetCompany: string;
  targetPackage: number;
  currentYear: number;
  branch: string;
  knownSkills: string[];
}) {
  try {
    const response = await mlClient.post('/roadmap/generate', {
      target_company: data.targetCompany,
      target_package: data.targetPackage,
      current_year: data.currentYear,
      branch: data.branch,
      known_skills: data.knownSkills,
    });
    return response.data;
  } catch (err: any) {
    console.warn('[ML Proxy] Python ML service unreachable, using intelligent Roadmap heuristics engine');

    return {
      timeline: '6 Months (Sprint to Placement)',
      daily_plan: {
        morning: '1 DSA Medium Problem on LeetCode/Codeforces (Focus: Sliding Window, Trees, Graphs)',
        afternoon: 'System Architecture & Core CS Fundamentals (DBMS, OS, Computer Networks)',
        evening: 'Hands-on Production Project Engineering & Code Review',
      },
      weekly_plan: {
        week1: 'Array Manipulation, 2-Pointers, Fast/Slow Pointers & Prefix Sums',
        week2: 'Recursion, Backtracking & Tree Traversals (BFS/DFS)',
        week3: 'Dynamic Programming Patterns: 0/1 Knapsack, Longest Common Subsequence',
        week4: 'Graph Algorithms: Topological Sort, Dijkstra, Disjoint Set Union',
        week5: 'High-Level System Design: Load Balancing, Caching, Sharding, CAP Theorem',
        week6: 'Low-Level Design & Object-Oriented Design Patterns',
        week7: 'Live Mock Technical Interviews & Behavioral Star Method drills',
        week8: 'Resume Fine-tuning & Cold Outreach / Referral Sprints',
      },
      monthly_plan: {
        month1: 'Master 75 Core LeetCode Patterns + Re-implement Core Data Structures',
        month2: 'Build 1 Full-Stack Production System with CI/CD and Docker Deployment',
        month3: 'Complete Low-Level & High-Level System Design Mastery',
        month4: 'Weekly Peer Mock Interviews + Resume Polish for Target Tier-1 Companies',
        month5: 'Aggressive Placement Applications, OA Sprints, and Onsite Preparation',
        month6: 'Offer Negotiation & Counter-Offer Strategy',
      },
    };
  }
}

// ==========================================
// 3. PROJECT RECOMMENDER
// ==========================================
export async function recommendProjects(skills: string[], careerGoal: string) {
  try {
    const response = await mlClient.post('/projects/recommend', {
      skills,
      career_goal: careerGoal,
      experience_level: 'intermediate',
    });
    return response.data;
  } catch (err: any) {
    console.warn('[ML Proxy] Python ML service unreachable, using intelligent Project heuristics engine');

    return [
      {
        title: 'Distributed Real-Time Message Broker & Event Log',
        description: 'A lightweight distributed pub/sub broker built with TCP streaming, partitioned log storage, and consensus health checks.',
        techStack: ['TypeScript', 'Node.js', 'Docker', 'Redis', 'PostgreSQL'],
        resumeImpact: 94,
        difficulty: 'ADVANCED',
        estimatedWeeks: 3,
      },
      {
        title: 'AI-Powered Collaborative Code Canvas & Compiler',
        description: 'Multiplayer collaborative code editor with sandboxed Docker code execution, AST parsing, and AST syntax highlights.',
        techStack: ['Next.js', 'WebSockets', 'TailwindCSS', 'Docker', 'Prisma'],
        resumeImpact: 91,
        difficulty: 'INTERMEDIATE',
        estimatedWeeks: 2,
      },
      {
        title: 'High-Throughput Rate Limiter & API Gateway',
        description: 'Scalable reverse proxy implementing Token Bucket and Leaky Bucket algorithms with sub-millisecond Redis latency.',
        techStack: ['Go', 'Redis', 'Express', 'Prometheus', 'Grafana'],
        resumeImpact: 88,
        difficulty: 'INTERMEDIATE',
        estimatedWeeks: 2,
      },
    ];
  }
}

// ==========================================
// 4. PLACEMENT READINESS CALCULATOR
// ==========================================
export async function calculateReadiness(data: {
  dsaSolved: number;
  mlHours: number;
  projectsCount: number;
  resumeScore: number;
  streak: number;
  skillLevels: Record<string, number>;
}) {
  try {
    const response = await mlClient.post('/readiness/score', {
      dsa_problems_solved: data.dsaSolved,
      ml_hours: data.mlHours,
      project_count: data.projectsCount,
      resume_score: data.resumeScore,
      coding_streak: data.streak,
      skill_levels: data.skillLevels,
    });
    return response.data;
  } catch (err: any) {
    console.warn('[ML Proxy] Python ML service unreachable, using intelligent Readiness heuristics engine');

    // Industry formula: DSA (35%) + Projects (25%) + Resume (20%) + Consistency (20%)
    const dsaComponent = Math.min(35, (data.dsaSolved / 150) * 35);
    const projectsComponent = Math.min(25, (data.projectsCount / 4) * 25);
    const resumeComponent = Math.min(20, (data.resumeScore / 100) * 20);
    const consistencyComponent = Math.min(20, (data.streak / 30) * 20);

    const overallScore = Math.min(99, Math.round(dsaComponent + projectsComponent + resumeComponent + consistencyComponent + 15));

    let tier = 'BRONZE';
    if (overallScore >= 85) tier = 'TIER_1_ELITE';
    else if (overallScore >= 70) tier = 'GOLD_PLACEMENT_READY';
    else if (overallScore >= 50) tier = 'SILVER_DEVELOPING';

    return {
      overall_score: overallScore,
      tier,
      breakdown: {
        dsa_score: Math.round(dsaComponent),
        project_score: Math.round(projectsComponent),
        resume_score: Math.round(resumeComponent),
        consistency_score: Math.round(consistencyComponent),
        skill_depth_score: 78,
      },
      insights: [
        data.dsaSolved > 50
          ? 'Strong DSA momentum. Focus on Graph and Dynamic Programming algorithms.'
          : 'Increase DSA practice: target 2-3 medium problems per day to clear technical OAs.',
        data.projectsCount >= 2
          ? 'Solid project portfolio. Ensure codebases have READMEs, architecture diagrams, and live demos.'
          : 'Add at least 2 full-stack, deployed production projects to stand out to recruiters.',
      ],
      recommendations: [
        'Complete the Top 50 LeetCode interview pattern study list.',
        'Conduct 2 peer mock interviews to strengthen communication under pressure.',
        'Target ATS resume score above 85% before applying to top companies.',
      ],
    };
  }
}

// ==========================================
// 5. INTERVIEW ANSWER EVALUATOR
// ==========================================
export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  role: string,
  difficulty: string
) {
  try {
    const response = await mlClient.post('/interview/evaluate', {
      question,
      answer,
      role,
      difficulty,
    });
    return response.data;
  } catch (err: any) {
    console.warn('[ML Proxy] Python ML service unreachable, using intelligent Interview heuristics engine');

    const words = (answer || '').trim().split(/\s+/).filter(Boolean).length;
    let score = 7.0;

    if (words < 15) {
      score = 4.5;
      return {
        score,
        feedback: 'Your answer is quite brief. In technical interviews, provide structural depth: state the concept, explain the trade-offs, and cite a practical engineering scenario.',
      };
    }

    if (words > 40) score += 1.5;
    if (answer.toLowerCase().includes('because') || answer.toLowerCase().includes('example') || answer.toLowerCase().includes('performance')) {
      score += 1.0;
    }

    score = Math.min(9.8, Math.max(5.0, score));

    return {
      score: Number(score.toFixed(1)),
      feedback: `Solid explanation for a ${difficulty.toLowerCase()} ${role} question. You effectively touched on core mechanics. To reach a 10/10, consider mentioning edge-case failure modes and time/space complexity trade-offs.`,
    };
  }
}
