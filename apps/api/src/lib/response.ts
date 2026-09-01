import { Response } from 'express';

export function success(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function error(res: Response, message: string = 'An error occurred', statusCode: number = 500, errors: any = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

export function paginated(res: Response, data: any[], total: number, page: number, limit: number) {
  return res.status(200).json({
    success: true,
    message: 'Data retrieved successfully',
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
