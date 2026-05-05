import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TherapistProfile } from '../models/TherapistProfile.js';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireTherapist } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

const listQuerySchema = z.object({
  concerns: z.string().optional(),
  price_min: z.coerce.number().optional(),
  price_max: z.coerce.number().optional(),
  session_type: z.string().optional(),
  gender: z.string().optional(),
  language: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const updateTherapistProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  title: z.string().max(100).optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
  sessionTypes: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
  therapyTypes: z.array(z.string()).optional(),
  sessionRate: z.number().optional(),
  consultationRate: z.number().optional(),
  timezone: z.string().optional(),
  location: z.string().optional(),
  gender: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

const availabilitySchema = z.object({
  slots: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
    isAvailable: z.boolean().default(true),
  })),
});

// GET / — list approved therapists
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = listQuerySchema.parse(req.query);
    const filter: Record<string, unknown> = { isApproved: true };

    if (query.concerns) filter.concerns = { $in: query.concerns.split(',') };
    if (query.session_type) filter.sessionTypes = query.session_type;
    if (query.gender) filter.gender = query.gender;
    if (query.language) filter.languages = query.language;
    if (query.price_min !== undefined || query.price_max !== undefined) {
      filter.sessionRate = {};
      if (query.price_min !== undefined) (filter.sessionRate as Record<string, number>).$gte = query.price_min;
      if (query.price_max !== undefined) (filter.sessionRate as Record<string, number>).$lte = query.price_max;
    }
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { bio: { $regex: query.search, $options: 'i' } },
        { title: { $regex: query.search, $options: 'i' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const [therapists, total] = await Promise.all([
      TherapistProfile.find(filter).skip(skip).limit(query.limit).sort({ rating: -1, reviewCount: -1 }),
      TherapistProfile.countDocuments(filter),
    ]);

    successResponse(res, { therapists: therapists.map(t => t.toJSON()), total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) });
  } catch (err) { next(err); }
});

// --- /me/... routes MUST come before /:id ---

// GET /me/profile
router.get('/me/profile', authenticate, requireTherapist, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await TherapistProfile.findOne({ userId: req.user!.userId });
    if (!profile) throw new NotFoundError('Profile not found');
    successResponse(res, profile.toJSON());
  } catch (err) { next(err); }
});

// PUT /me/profile
router.put('/me/profile', authenticate, requireTherapist, validate(updateTherapistProfileSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await TherapistProfile.findOneAndUpdate(
      { userId: req.user!.userId },
      req.body as z.infer<typeof updateTherapistProfileSchema>,
      { new: true },
    );
    if (!profile) throw new NotFoundError('Profile not found');
    successResponse(res, profile.toJSON(), 'Profile updated');
  } catch (err) { next(err); }
});

// PUT /me/availability
router.put('/me/availability', authenticate, requireTherapist, validate(availabilitySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slots } = req.body as z.infer<typeof availabilitySchema>;
    await TherapistProfile.findOneAndUpdate({ userId: req.user!.userId }, { availability: slots });
    successResponse(res, null, 'Availability updated');
  } catch (err) { next(err); }
});

// GET /me/stats — dashboard stats for the authenticated therapist
router.get('/me/stats', authenticate, requireTherapist, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const therapistId = req.user!.userId;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalSessions,
      thisWeekSessions,
      pendingRequests,
      clientIds,
      monthPayments,
      profile,
      reviews,
    ] = await Promise.all([
      Booking.countDocuments({ therapistId, status: { $in: ['confirmed', 'completed'] } }),
      Booking.countDocuments({ therapistId, status: { $in: ['confirmed', 'completed'] }, scheduledAt: { $gte: startOfWeek } }),
      Booking.countDocuments({ therapistId, status: 'pending' }),
      Booking.distinct('clientId', { therapistId, status: { $in: ['confirmed', 'completed'] } }),
      Payment.find({ therapistId, status: 'completed', createdAt: { $gte: startOfMonth } }).lean(),
      TherapistProfile.findOne({ userId: therapistId }).lean(),
      Review.find({ therapistId }).lean(),
    ]);

    const earningsThisMonth = monthPayments.reduce((sum, p) => sum + (p.therapistPayout ?? 0), 0);
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : (profile?.rating ?? 0);

    successResponse(res, {
      totalSessions,
      totalClients: clientIds.length,
      thisWeekSessions,
      pendingRequests,
      earningsThisMonth,
      currency: 'USD',
      averageRating: Number(averageRating.toFixed(1)),
      totalRatings: reviews.length || (profile?.reviewCount ?? 0),
    });
  } catch (err) { next(err); }
});

// GET /:id — single therapist profile (MUST be after all /me/... routes)
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const therapist = await TherapistProfile.findOne({ userId: req.params['id'] });
    if (!therapist || !therapist.isApproved) throw new NotFoundError('Therapist not found');

    const reviews = await Review.find({ therapistId: req.params['id'] }).sort({ createdAt: -1 }).limit(10);
    successResponse(res, { ...therapist.toJSON(), reviews: reviews.map(r => r.toJSON()) });
  } catch (err) { next(err); }
});

export default router;
