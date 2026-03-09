import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token is required'));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.companyId = decoded.companyId;
    next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};
