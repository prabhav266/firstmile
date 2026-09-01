import { Request, Response, NextFunction } from 'express';
import { error } from '../lib/response';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[SERVER ERROR]', err);

  // Prisma Unique Constraint Conflict
  if (err.code === 'P2002') {
    const fields = err.meta?.target || [];
    return error(res, `Database conflict: duplicate entries for ${fields.join(', ')}`, 409);
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    return error(res, 'Requested database record not found', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'An error occurred';

  return error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
}
