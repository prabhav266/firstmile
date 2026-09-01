import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { success, error } from '../lib/response';

export async function getCurrent(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const weekRecord = await prisma.plannerWeek.findUnique({
      where: { userId_weekStart: { userId, weekStart: startOfWeek } },
    });

    if (!weekRecord) {
      // Mock initial layout for Phase 1
      const initialSchedule = {
        mon: [{ time: '09:00', task: 'Classes', type: 'CLASSES' }, { time: '17:00', task: 'Coding Problems', type: 'CODING' }],
        tue: [{ time: '09:00', task: 'Classes', type: 'CLASSES' }, { time: '18:00', task: 'ML Notebooks', type: 'ML' }],
        wed: [{ time: '09:00', task: 'Classes', type: 'CLASSES' }, { time: '17:00', task: 'Coding Problems', type: 'CODING' }],
        thu: [{ time: '09:00', task: 'Classes', type: 'CLASSES' }, { time: '18:00', task: 'ML Notebooks', type: 'ML' }],
        fri: [{ time: '09:00', task: 'Classes', type: 'CLASSES' }, { time: '17:00', task: 'Project Build', type: 'PROJECTS' }],
        sat: [{ time: '10:00', task: 'Revision', type: 'REVISION' }],
        sun: [{ time: '11:00', task: 'Mock Test', type: 'CODING' }],
      };

      const initialGoals = [
        { title: 'Solve 10 Leetcode problems', completed: false },
        { title: 'Watch 3 Andrew Ng lectures', completed: false },
        { title: 'Refactor portfolio project', completed: false },
      ];

      const newWeek = await prisma.plannerWeek.create({
        data: {
          userId,
          weekStart: startOfWeek,
          schedule: initialSchedule,
          goals: initialGoals,
        },
      });

      return success(res, newWeek, 'Timetable initialized successfully');
    }

    return success(res, weekRecord, 'Current planner retrieved');
  } catch (err) {
    next(err);
  }
}

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, 'Unauthorized', 401);

    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // Call ML/LLM services in later phases to generate optimized schedules
    // For Phase 1, we seed/regenerate a randomized structure.
    const generatedSchedule = {
      mon: [{ time: '08:00', task: 'Gym', type: 'GYM' }, { time: '10:00', task: 'College Classes', type: 'CLASSES' }, { time: '18:00', task: 'Leetcode Blind 75', type: 'CODING' }],
      tue: [{ time: '10:00', task: 'College Classes', type: 'CLASSES' }, { time: '17:00', task: 'ML Course work', type: 'ML' }],
      wed: [{ time: '08:00', task: 'Gym', type: 'GYM' }, { time: '10:00', task: 'College Classes', type: 'CLASSES' }, { time: '19:00', task: 'System Design study', type: 'REVISION' }],
      thu: [{ time: '10:00', task: 'College Classes', type: 'CLASSES' }, { time: '18:00', task: 'ML Kaggle Competition', type: 'ML' }],
      fri: [{ time: '10:00', task: 'Classes', type: 'CLASSES' }, { time: '16:00', task: 'Project Architecture', type: 'PROJECTS' }],
      sat: [{ time: '10:00', task: 'Coding Hackathon', type: 'CODING' }, { time: '16:00', task: 'Revision', type: 'REVISION' }],
      sun: [{ time: '12:00', task: 'Mock placement test', type: 'CODING' }],
    };

    const generatedGoals = [
      { title: 'Complete coding sprint', completed: false },
      { title: 'Log 8 study hours', completed: false },
      { title: 'Update resume design', completed: false },
    ];

    const updated = await prisma.plannerWeek.upsert({
      where: { userId_weekStart: { userId, weekStart: startOfWeek } },
      update: {
        schedule: generatedSchedule,
        goals: generatedGoals,
      },
      create: {
        userId,
        weekStart: startOfWeek,
        schedule: generatedSchedule,
        goals: generatedGoals,
      },
    });

    return success(res, updated, 'Weekly planner optimized by AI');
  } catch (err) {
    next(err);
  }
}

export async function updateGoal(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string; // PlannerWeek ID
    const { index, completed } = req.body;
    const userId = req.user?.userId;

    const planner = await prisma.plannerWeek.findFirst({ where: { id, userId } });
    if (!planner) return error(res, 'Planner record not found', 404);

    const goalsList = planner.goals as any[];
    if (goalsList && goalsList[index]) {
      goalsList[index].completed = completed;
    }

    const updated = await prisma.plannerWeek.update({
      where: { id },
      data: { goals: goalsList },
    });

    return success(res, updated, 'Goal completion updated');
  } catch (err) {
    next(err);
  }
}
