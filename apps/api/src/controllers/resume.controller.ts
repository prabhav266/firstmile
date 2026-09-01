import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error } from '../lib/response';
import { storageService } from '../services/storage.service';
import { analyzeResume } from '../services/ml.proxy';

export async function uploadResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    if (!req.file) {
      return error(res, 'No resume PDF file uploaded', 400);
    }

    // Save to local storage
    const uploadResult = await storageService.upload(req.file, {
      folder: `resumes/${userId}`,
      allowedFormats: ['pdf'],
    });

    // Dynamically extract printable text from the uploaded PDF buffer
    let extractedText = '';
    if (req.file.buffer) {
      const asciiText = req.file.buffer
        .toString('ascii')
        .replace(/[^\x20-\x7E\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (asciiText.length > 50) {
        extractedText = asciiText.slice(0, 4000);
      }
    }

    const rawText = extractedText || `Resume File: ${req.file.originalname}. Candidate: ${req.user?.name || 'Applicant'}. Target Role: Software Engineer.`;

    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: req.file.originalname,
        fileUrl: uploadResult.secureUrl,
        filePath: uploadResult.publicId,
        analysisStatus: 'PENDING',
        rawText: rawText,
      },
    });

    return success(res, resume, 'Resume uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function triggerAnalysis(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const { jobRole } = req.body;

    if (!userId) return error(res, 'Unauthorized', 401);

    const resume = await prisma.resume.findFirst({ where: { id, userId } });
    if (!resume) return error(res, 'Resume record not found', 404);

    // Update status to processing
    await prisma.resume.update({
      where: { id },
      data: { analysisStatus: 'PROCESSING' },
    });

    try {
      const analysisResult = await analyzeResume(resume.rawText || '', jobRole || 'Software Engineer');

      // Update skill levels on student profile based on resume analysis
      const allPossibleSkills = ['JavaScript', 'React', 'Data Structures & Algorithms', 'Python', 'SQL', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'];
      const rawTextLower = (resume.rawText || '').toLowerCase();
      for (const sName of allPossibleSkills) {
        if (rawTextLower.includes(sName.toLowerCase())) {
          const skill = await prisma.skill.findFirst({ where: { name: { equals: sName, mode: 'insensitive' } } });
          if (skill) {
            await prisma.userSkill.upsert({
              where: { userId_skillId: { userId, skillId: skill.id } },
              update: { level: 80 },
              create: { userId, skillId: skill.id, level: 80 },
            });
          }
        }
      }

      const updatedResume = await prisma.resume.update({
        where: { id },
        data: {
          atsScore: analysisResult.ats_score,
          grammarScore: analysisResult.grammar_score,
          resumeRating: analysisResult.resume_rating,
          missingSkills: analysisResult.missing_skills,
          weakBullets: analysisResult.weak_bullets,
          suggestions: analysisResult.suggestions,
          projectSuggestions: analysisResult.project_suggestions,
          analysisStatus: 'COMPLETED',
        },
      });

      return success(res, updatedResume, 'Resume analyzed successfully');
    } catch (err) {
      await prisma.resume.update({
        where: { id },
        data: { analysisStatus: 'FAILED' },
      });
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

export async function getResumes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, resumes, 'Resumes list retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getResume(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) return error(res, 'Unauthorized', 401);

    const resume = await prisma.resume.findFirst({ where: { id, userId } });
    if (!resume) return error(res, 'Resume record not found', 404);

    return success(res, resume, 'Resume retrieved');
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) return error(res, 'Unauthorized', 401);

    const resume = await prisma.resume.findFirst({ where: { id, userId } });
    if (!resume) return error(res, 'Resume record not found', 404);

    if (resume.filePath) {
      await storageService.delete(resume.filePath, `resumes/${userId}`);
    }

    await prisma.resume.delete({ where: { id } });

    return success(res, null, 'Resume record deleted');
  } catch (err) {
    next(err);
  }
}

export async function getReport(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) return error(res, 'Unauthorized', 401);

    const resume = await prisma.resume.findFirst({ where: { id, userId } });
    if (!resume || resume.analysisStatus !== 'COMPLETED') {
      return error(res, 'Resume analysis report not ready', 400);
    }

    // Return structured text report for Phase 1 download. In Phase 2, we generate a formal PDF layout.
    const reportText = `
PATHFORGE AI RESUME ANALYSIS REPORT
===================================
Resume File: ${resume.fileName}
Overall ATS Score: ${resume.atsScore}%
Grammar Rating: ${resume.grammarScore}/10
Overall Rating: ${resume.resumeRating}/10
Generated on: ${resume.createdAt.toLocaleDateString()}

MISSING SKILLS
--------------
${resume.missingSkills.join(', ') || 'None'}

WEAK BULLET POINTS
------------------
${(resume.weakBullets as string[]).map((b: string, i: number) => `${i + 1}. ${b}`).join('\n') || 'None'}

IMPROVEMENT SUGGESTIONS
----------------------
${(resume.suggestions as string[]).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') || 'None'}

RECOMMENDED PROJECTS FOR IMPACT
-------------------------------
${(resume.projectSuggestions as string[]).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') || 'None'}
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="PathForge_Report_${id}.txt"`);
    return res.send(reportText);
  } catch (err) {
    next(err);
  }
}
