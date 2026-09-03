import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../lib/jwt';
import { error } from '../lib/response';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export async function protect(req: Request, res: Response, next: NextFunction) {
  try {
    let token = '';

    // Check auth header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check cookie
    else if (req.cookies && req.cookies['auth-token']) {
      token = req.cookies['auth-token'];
    }

    if (!token) {
      return error(res, 'Authentication token missing or invalid', 401);
    }

    const decoded = await verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      res.clearCookie('auth-token', { path: '/' });
      res.clearCookie('refresh-token', { path: '/' });
      return error(res, 'Token is expired or invalid', 401);
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      res.clearCookie('auth-token', { path: '/' });
      res.clearCookie('refresh-token', { path: '/' });
      return error(res, 'User session expired or user no longer exists. Please sign in.', 401);
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('auth-token', { path: '/' });
    res.clearCookie('refresh-token', { path: '/' });
    return error(res, 'Authentication failed', 401);
  }
}

export function restrictTo(...roles: ('STUDENT' | 'RECRUITER' | 'TPO' | 'ADMIN')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'You do not have permission to perform this action', 403);
    }
    next();
  };
}
