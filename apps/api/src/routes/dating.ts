import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DatingProfile } from '../models/DatingProfile.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

const profileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  lookingFor: z.string().optional(),
  interests: z.array(z.string()).optional(),
  location: z.string().optional(),
});

// GET /profile — alias for /profile/me (kept for backwards compat)
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await DatingProfile.findOne({ userId: req.user!.userId });
    successResponse(res, profile?.toJSON() ?? null);
  } catch (err) { next(err); }
});

// GET /profile/me
router.get('/profile/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await DatingProfile.findOne({ userId: req.user!.userId });
    successResponse(res, profile?.toJSON() ?? null);
  } catch (err) { next(err); }
});

// POST /profile
router.post('/profile', authenticate, validate(profileSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body as z.infer<typeof profileSchema>;
    const profile = await DatingProfile.findOneAndUpdate(
      { userId: req.user!.userId },
      { ...body, userId: req.user!.userId },
      { upsert: true, new: true },
    );
    successResponse(res, profile.toJSON(), 'Profile saved', 201);
  } catch (err) { next(err); }
});

// GET /browse
router.get('/browse', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profiles = await DatingProfile.find({
      userId: { $ne: req.user!.userId },
      isActive: true,
      isPaused: false,
    }).limit(20);
    successResponse(res, profiles.map(p => p.toJSON()));
  } catch (err) { next(err); }
});

export default router;
