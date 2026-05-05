import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Payment } from '../models/Payment.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { successResponse } from '../utils/response.js';

const router = Router();

// GET /
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const filter = role === 'client' ? { clientId: userId } : { therapistId: userId };
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    successResponse(res, payments.map(p => p.toJSON()));
  } catch (err) { next(err); }
});

export default router;
