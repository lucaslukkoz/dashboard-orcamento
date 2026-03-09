import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: true,
      message: err.message,
    });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({
    error: true,
    message: 'Internal server error',
  });
};
