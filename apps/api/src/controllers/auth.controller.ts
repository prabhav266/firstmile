import { Request, Response, NextFunction, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { success, error } from '../lib/response';
import { z } from 'zod';

function getAuthCookieOptions(maxAge: number): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge,
    path: '/',
  };
}

// Default skills seeded for fresh student profiles
const DEFAULT_SKILLS = [
  { name: 'Data Structures & Algorithms', category: 'DSA' },
  { name: 'Frontend Development', category: 'DEVELOPMENT' },
  { name: 'Backend Development', category: 'DEVELOPMENT' },
  { name: 'Machine Learning', category: 'ML' },
  { name: 'System Design', category: 'SYSTEM_DESIGN' },
  { name: 'Cloud & DevOps', category: 'CLOUD' },
];

// Helper to seed skills for student
async function seedStudentSkills(userId: string) {
  for (const skillData of DEFAULT_SKILLS) {
    const skill = await prisma.skill.upsert({
      where: { name: skillData.name },
      update: {},
      create: { name: skillData.name, category: skillData.category as any },
    });

    await prisma.userSkill.create({
      data: {
        userId,
        skillId: skill.id,
        level: 30,
      },
    });
  }
}

import { validateEmailDomain, sendVerificationEmail } from '../lib/mailer';

// 1. Send 6-Digit Email OTP with Real Domain & Account Existence Validation
export async function sendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, mode } = req.body;
    if (!email || !email.includes('@')) {
      return error(res, 'Valid email address is required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Authenticate that the email domain actually exists and has active MX mail servers
    const domainCheck = await validateEmailDomain(normalizedEmail);
    if (!domainCheck.valid) {
      return error(res, domainCheck.error || 'This email domain does not exist or cannot receive mail.', 400);
    }

    // 2. Check if user account exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, role: true },
    });

    if (mode === 'login' && !existingUser) {
      return error(res, 'No account found with this email. Please create an account first.', 404);
    }

    if (mode === 'register' && existingUser) {
      return error(res, 'An account with this email already exists. Please sign in instead.', 409);
    }

    // 3. Generate cryptographically secure 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 4. Remove any previous active tokens for this email
    await (prisma as any).verificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // 5. Save token to database
    await (prisma as any).verificationToken.create({
      data: {
        email: normalizedEmail,
        code: otpCode,
        expiresAt,
      },
    });

    // 6. Dispatch verification email
    await sendVerificationEmail(normalizedEmail, otpCode);

    return success(res, {
      email: normalizedEmail,
      isExistingUser: !!existingUser,
      role: existingUser?.role || null,
    }, `Verification code successfully sent to ${normalizedEmail}`);
  } catch (err) {
    next(err);
  }
}

// 2. Verify 6-Digit Email OTP & Sign In / Register
export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code, name, role, college, branch, year, company, designation, institutionName, hiringDomain } = req.body;

    if (!email || !code) {
      return error(res, 'Email and 6-digit verification code are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify token
    const tokenRecord = await (prisma as any).verificationToken.findFirst({
      where: {
        email: normalizedEmail,
        code: code.trim(),
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      return error(res, 'Invalid or expired verification code. Please request a new code.', 400);
    }

    // Clean up consumed token
    await (prisma as any).verificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const userRole = (role?.toUpperCase() || 'STUDENT') as any;

    if (!user) {
      // Create new user with selected persona
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || normalizedEmail.split('@')[0],
          role: userRole,
          college,
          branch,
          year: year ? Number(year) : undefined,
          company,
          designation,
          institutionName,
          hiringDomain,
        },
      });

      if (user.role === 'STUDENT') {
        await seedStudentSkills(user.id);
      }
    } else if (role && user.role !== userRole) {
      // Sync user role with explicitly selected persona
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: userRole },
      });
    }

    const payload = { userId: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set auth cookies
    res.cookie('auth-token', accessToken, getAuthCookieOptions(15 * 60 * 1000));
    res.cookie('refresh-token', refreshToken, getAuthCookieOptions(7 * 24 * 60 * 60 * 1000));

    // Determine redirect destination
    let redirectUrl = '/dashboard';
    if (user.role === 'RECRUITER') redirectUrl = '/dashboard/recruiter';
    else if (user.role === 'TPO') redirectUrl = '/dashboard/tpo';
    else if (user.role === 'ADMIN') redirectUrl = '/admin';

    return success(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        company: user.company,
        institutionName: user.institutionName,
      },
      accessToken,
      redirectUrl,
    }, 'Authentication successful');
  } catch (err) {
    next(err);
  }
}

// 3. 1-Click Role Switcher (Instant Persona Preview)
export async function switchRole(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const { targetRole } = req.body;

    if (!userId) return error(res, 'Unauthorized', 401);
    if (!['STUDENT', 'RECRUITER', 'TPO', 'ADMIN'].includes(targetRole)) {
      return error(res, 'Invalid target role', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: targetRole as any },
    });

    const payload = { userId: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role };
    const accessToken = await signAccessToken(payload);

    res.cookie('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    let redirectUrl = '/dashboard';
    if (targetRole === 'RECRUITER') redirectUrl = '/dashboard/recruiter';
    else if (targetRole === 'TPO') redirectUrl = '/dashboard/tpo';
    else if (targetRole === 'ADMIN') redirectUrl = '/admin';

    return success(res, {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      redirectUrl,
    }, `Role switched to ${targetRole}`);
  } catch (err) {
    next(err);
  }
}

// 4. Traditional Password Register (Fallback)
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role, college, branch, year, targetCompany, company, designation, institutionName, hiringDomain } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return error(res, 'User with this email already exists', 400);
    }

    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
    const userRole = (role?.toUpperCase() || 'STUDENT') as any;

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        role: userRole,
        year: year ? Number(year) : undefined,
        branch,
        college,
        targetCompany,
        company,
        designation,
        institutionName,
        hiringDomain,
      },
    });

    if (user.role === 'STUDENT') {
      await seedStudentSkills(user.id);
    }

    const payload = { userId: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie('auth-token', accessToken, getAuthCookieOptions(15 * 60 * 1000));
    res.cookie('refresh-token', refreshToken, getAuthCookieOptions(7 * 24 * 60 * 60 * 1000));

    let redirectUrl = '/dashboard';
    if (user.role === 'RECRUITER') redirectUrl = '/dashboard/recruiter';
    else if (user.role === 'TPO') redirectUrl = '/dashboard/tpo';
    else if (user.role === 'ADMIN') redirectUrl = '/admin';

    return success(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      redirectUrl,
    }, 'Account registered successfully', 201);
  } catch (err) {
    next(err);
  }
}

// 5. Traditional Password Login (Fallback)
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return error(res, 'Invalid email or password', 401);
      }
    }

    const payload = { userId: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie('auth-token', accessToken, getAuthCookieOptions(15 * 60 * 1000));
    res.cookie('refresh-token', refreshToken, getAuthCookieOptions(7 * 24 * 60 * 60 * 1000));

    let redirectUrl = '/dashboard';
    if (user.role === 'RECRUITER') redirectUrl = '/dashboard/recruiter';
    else if (user.role === 'TPO') redirectUrl = '/dashboard/tpo';
    else if (user.role === 'ADMIN') redirectUrl = '/admin';

    return success(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      redirectUrl,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

// 6. Get Current User Profile
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return error(res, 'Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        year: true,
        branch: true,
        college: true,
        company: true,
        designation: true,
        institutionName: true,
        hiringDomain: true,
        leetcodeUsername: true,
        githubUsername: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.clearCookie('auth-token', { path: '/' });
      res.clearCookie('refresh-token', { path: '/' });
      return error(res, 'User session expired or not found', 401);
    }

    return success(res, user, 'Profile fetched successfully');
  } catch (err) {
    next(err);
  }
}

// 6b. Update User Profile
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return error(res, 'Unauthorized', 401);
    }

    const {
      name,
      college,
      branch,
      year,
      targetCompany,
      leetcodeUsername,
      githubUsername,
      company,
      designation,
      hiringDomain,
      institutionName,
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(college !== undefined && { college: college.trim() }),
        ...(branch !== undefined && { branch: branch.trim() }),
        ...(year !== undefined && { year: year ? Number(year) : null }),
        ...(targetCompany !== undefined && { targetCompany: targetCompany.trim() }),
        ...(leetcodeUsername !== undefined && { leetcodeUsername: leetcodeUsername.trim() || null }),
        ...(githubUsername !== undefined && { githubUsername: githubUsername.trim() || null }),
        ...(company !== undefined && { company: company.trim() }),
        ...(designation !== undefined && { designation: designation.trim() }),
        ...(hiringDomain !== undefined && { hiringDomain: hiringDomain.trim() }),
        ...(institutionName !== undefined && { institutionName: institutionName.trim() }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        year: true,
        branch: true,
        college: true,
        company: true,
        designation: true,
        institutionName: true,
        hiringDomain: true,
        leetcodeUsername: true,
        githubUsername: true,
        targetCompany: true,
        createdAt: true,
      },
    });

    return success(res, updatedUser, 'Profile updated successfully');
  } catch (err: any) {
    if (err.code === 'P2002') {
      return error(res, 'Username (LeetCode or GitHub) is already linked to another account', 400);
    }
    next(err);
  }
}

// 7. Logout
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;

    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { refreshToken: null },
        });
      } catch (e) {
        // User record already deleted or not found
      }
    }

    res.clearCookie('auth-token', { path: '/' });
    res.clearCookie('refresh-token', { path: '/' });

    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

// 8. Refresh Token
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies['refresh-token'];
    if (!token) {
      return error(res, 'Refresh token not found', 401);
    }

    const decoded = await verifyRefreshToken(token);
    if (!decoded) {
      return error(res, 'Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== token) {
      return error(res, 'Invalid refresh token', 401);
    }

    const payload = { userId: user.id, email: user.email, name: user.name, role: user.role };
    const newAccessToken = await signAccessToken(payload);
    const newRefreshToken = await signRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.cookie('auth-token', newAccessToken, getAuthCookieOptions(15 * 60 * 1000));
    res.cookie('refresh-token', newRefreshToken, getAuthCookieOptions(7 * 24 * 60 * 60 * 1000));

    return success(res, { accessToken: newAccessToken }, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
}
