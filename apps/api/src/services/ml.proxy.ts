import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://ml:8000';

const mlClient = axios.create({
  baseURL: `${ML_SERVICE_URL}/api/v1`,
  timeout: 30000, // 30 seconds for heavy Gemini queries
});

export async function analyzeResume(rawText: string, jobRole: string) {
  try {
    const response = await mlClient.post('/resume/analyze', {
      raw_text: rawText,
      job_role: jobRole,
    });
    return response.data;
  } catch (err: any) {
    console.error('[ML Proxy Error] Resume analysis failed:', err.message);
    throw new Error('ML Service failed to analyze resume');
  }
}

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
    console.error('[ML Proxy Error] Roadmap generation failed:', err.message);
    throw new Error('ML Service failed to generate roadmap');
  }
}

export async function recommendProjects(skills: string[], careerGoal: string) {
  try {
    const response = await mlClient.post('/projects/recommend', {
      skills,
      career_goal: careerGoal,
      experience_level: 'intermediate',
    });
    return response.data;
  } catch (err: any) {
    console.error('[ML Proxy Error] Projects recommendation failed:', err.message);
    throw new Error('ML Service failed to recommend projects');
  }
}

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
    console.error('[ML Proxy Error] Readiness calculation failed:', err.message);
    throw new Error('ML Service failed to calculate placement readiness score');
  }
}

export async function evaluateInterviewAnswer(question: string, answer: string, role: string, difficulty: string) {
  try {
    const response = await mlClient.post('/interview/evaluate', {
      question,
      answer,
      role,
      difficulty,
    });
    return response.data;
  } catch (err: any) {
    console.error('[ML Proxy Error] Interview evaluation failed:', err.message);
    throw new Error('ML Service failed to evaluate interview answer');
  }
}
