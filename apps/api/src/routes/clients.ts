import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ClientProfile } from '../models/ClientProfile.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireClient } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

const updateClientSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).optional(),
  bio: z.string().max(2000).optional(),
  timezone: z.string().max(100).optional(),
  language: z.string().max(10).optional(),
  dateOfBirth: z.string().optional(),
});

// GET /profile
router.get('/profile', authenticate, requireClient, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await ClientProfile.findOne({ userId: req.user!.userId });
    if (!profile) throw new NotFoundError('Client profile not found');
    successResponse(res, profile.toJSON());
  } catch (err) { next(err); }
});

// PUT /profile
router.put('/profile', authenticate, requireClient, validate(updateClientSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await ClientProfile.findOneAndUpdate(
      { userId: req.user!.userId },
      req.body as z.infer<typeof updateClientSchema>,
      { new: true },
    );
    if (!profile) throw new NotFoundError('Client profile not found');
    successResponse(res, profile.toJSON(), 'Profile updated');
  } catch (err) { next(err); }
});

export default router;
