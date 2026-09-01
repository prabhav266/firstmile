import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { error } from '../lib/response';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formattedErrors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return error(res, 'Validation error', 400, formattedErrors);
      }
      return error(res, 'Internal validation error', 400);
    }
  };
}
