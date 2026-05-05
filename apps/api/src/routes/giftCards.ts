import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';

const router = Router();

// Stub — gift cards require Stripe integration
router.post('/', authenticate, async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    successResponse(res, null, 'Gift cards coming soon', 501);
  } catch (err) { next(err); }
});

export default router;
