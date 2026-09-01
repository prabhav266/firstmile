import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error } from '../lib/response';
import { evaluateInterviewAnswer } from '../services/ml.proxy';

export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { role, company, difficulty } = req.body;

    if (!userId) return error(res, 'Unauthorized', 401);

    // Initial questions list compiled based on selected role
    const initialQuestions = [
      { id: 1, question: 'Tell me about yourself and your technical background.', answer: '', aiScore: null, feedback: '' },
      { id: 2, question: 'What is the difference between processes and threads?', answer: '', aiScore: null, feedback: '' },
      { id: 3, question: 'How do you handle conflict in a technical project team?', answer: '', aiScore: null, feedback: '' },
    ];

    const session = await prisma.interviewSession.create({
      data: {
        userId,
        role: role || 'Software Engineer',
        company: company || 'General Tech',
        difficulty: difficulty || 'MEDIUM',
        questions: initialQuestions,
      },
    });

    return success(res, session, 'Interview session started', 201);
  } catch (err) {
    next(err);
  }
}

export async function submitAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string; // Session ID
    const { questionId, answer } = req.body;
    const userId = req.user?.userId;

    const session = await prisma.interviewSession.findFirst({ where: { id, userId } });
    if (!session) return error(res, 'Session not found', 404);

    const questions = session.questions as any[];
    const qIndex = questions.findIndex(q => q.id === Number(questionId));

    if (qIndex === -1) {
      return error(res, 'Question not found in this session', 404);
    }

    const evaluation = await evaluateInterviewAnswer(
      questions[qIndex].question,
      answer,
      session.role,
      session.difficulty
    );

    questions[qIndex].answer = answer;
    questions[qIndex].aiScore = evaluation.score;
    questions[qIndex].feedback = evaluation.feedback;

    // Check if interview is completed
    const pendingQuestions = questions.filter(q => q.answer === '');
    const overallScore = pendingQuestions.length === 0
      ? questions.reduce((sum, q) => sum + (q.aiScore || 0), 0) / questions.length
      : null;

    const updated = await prisma.interviewSession.update({
      where: { id },
      data: {
        questions,
        overallScore,
        feedback: overallScore ? `Interview completed. Average score: ${overallScore.toFixed(1)}/10. Key strengths include communication correctness.` : undefined,
      },
    });

    return success(res, updated, 'Answer evaluated successfully');
  } catch (err) {
    next(err);
  }
}

export async function getFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    const session = await prisma.interviewSession.findFirst({ where: { id, userId } });
    if (!session) return error(res, 'Session not found', 404);

    return success(res, session, 'Feedback retrieved');
  } catch (err) {
    next(err);
  }
}

export async function history(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, sessions, 'Interview history loaded');
  } catch (err) {
    next(err);
  }
}
