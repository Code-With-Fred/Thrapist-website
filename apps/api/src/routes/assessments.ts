import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { TherapistProfile } from '../models/TherapistProfile.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';

const router = Router();

const submitSchema = z.object({
  concerns: z.array(z.string()).min(1),
  sessionType: z.enum(['video', 'audio', 'in_person']).optional(),
  gender: z.string().optional(),
  priceMax: z.number().optional(),
  language: z.string().optional(),
});

// POST /submit
router.post('/submit', authenticate, validate(submitSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body as z.infer<typeof submitSchema>;
    const filter: Record<string, unknown> = { isApproved: true };

    if (body.concerns.length) filter.concerns = { $in: body.concerns };
    if (body.sessionType) filter.sessionTypes = body.sessionType;
    if (body.gender) filter.gender = body.gender;
    if (body.priceMax) filter.sessionRate = { $lte: body.priceMax };
    if (body.language) filter.languages = body.language;

    const matches = await TherapistProfile.find(filter).sort({ rating: -1, reviewCount: -1 }).limit(5);
    successResponse(res, { matches: matches.map(t => t.toJSON()) });
  } catch (err) { next(err); }
});

export default router;
