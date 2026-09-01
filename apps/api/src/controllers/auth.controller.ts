import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { success, error } from '../lib/response';
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    year: z.number().int().min(1).max(4).optional(),
    branch: z.string().optional(),
    college: z.string().optional(),
    targetCompany: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, year, branch, college, targetCompany } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return error(res, 'User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        year,
        branch,
        college,
        targetCompany,
      },
    });

    // Seed default skills for radar chart
    const defaultSkills = [
      { name: 'Data Structures & Algorithms', category: 'DSA' },
      { name: 'Frontend Development', category: 'DEVELOPMENT' },
      { name: 'Backend Development', category: 'DEVELOPMENT' },
      { name: 'Machine Learning', category: 'ML' },
      { name: 'System Design', category: 'SYSTEM_DESIGN' },
      { name: 'Cloud & DevOps', category: 'CLOUD' },
    ];

    for (const skillData of defaultSkills) {
      const skill = await prisma.skill.upsert({
        where: { name: skillData.name },
        update: {},
        create: { name: skillData.name, category: skillData.category as any },
      });

      await prisma.userSkill.create({
        data: {
          userId: user.id,
          skillId: skill.id,
          level: 30, // Default baseline level
        },
      });
    }

    const payload = { userId: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set cookies
    res.cookie('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return success(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
    }, 'Registration successful', 211);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return error(res, 'Invalid email or password', 401);
    }

    const payload = { userId: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { refreshToken: null },
      });
    }

    res.clearCookie('auth-token');
    res.clearCookie('refresh-token');

    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies['refresh-token'];
    if (!token) {
      return error(res, 'Refresh token missing', 401);
    }

    const decoded = await verifyRefreshToken(token);
    if (!decoded) {
      return error(res, 'Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.refreshToken !== token) {
      return error(res, 'Invalid refresh session', 401);
    }

    const payload = { userId: user.id, email: user.email, name: user.name, role: user.role };
    const newAccessToken = await signAccessToken(payload);

    res.cookie('auth-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return success(res, { accessToken: newAccessToken }, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return error(res, 'Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        year: true,
        branch: true,
        college: true,
        targetCompany: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return error(res, 'User not found', 404);
    }

    return success(res, user, 'User details retrieved');
  } catch (err) {
    next(err);
  }
}
