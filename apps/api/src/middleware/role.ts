import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { ForbiddenError } from '../utils/errors.js';

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ForbiddenError('Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}

export const requireClient = requireRole('client');
export const requireTherapist = requireRole('therapist');
export const requireAdmin = requireRole('admin');
export const requireClientOrTherapist = requireRole('client', 'therapist');
