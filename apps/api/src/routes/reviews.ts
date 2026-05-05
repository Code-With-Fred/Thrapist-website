import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { TherapistProfile } from '../models/TherapistProfile.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireClient, requireTherapist } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import mongoose from 'mongoose';

const router = Router();

const createReviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  content: z.string().max(2000).optional(),
  isAnonymous: z.boolean().default(false),
});

const replySchema = z.object({ reply: z.string().min(1).max(1000) });

// POST / — leave a review
router.post('/', authenticate, requireClient, validate(createReviewSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.user!;
    const body = req.body as z.infer<typeof createReviewSchema>;

    const booking = await Booking.findOne({ _id: body.bookingId, clientId: userId, status: 'completed' });
    if (!booking) throw new NotFoundError('Completed booking not found');

    const existing = await Review.findOne({ bookingId: body.bookingId });
    if (existing) throw new AppError('Review already submitted for this booking', 409);

    const review = await Review.create({
      clientId: new mongoose.Types.ObjectId(userId),
      therapistId: booking.therapistId,
      bookingId: booking._id,
      rating: body.rating,
      content: body.content,
      isAnonymous: body.isAnonymous,
    });

    // Update therapist average rating
    const stats = await Review.aggregate([
      { $match: { therapistId: booking.therapistId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats[0]) {
      await TherapistProfile.findOneAndUpdate(
        { userId: booking.therapistId },
        { rating: Math.round(stats[0].avg * 10) / 10, reviewCount: stats[0].count },
      );
    }

    successResponse(res, review.toJSON(), 'Review submitted', 201);
  } catch (err) { next(err); }
});

// GET /therapist/:therapistId
router.get('/therapist/:therapistId', async (req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find({ therapistId: req.params['therapistId'] }).sort({ createdAt: -1 });
    successResponse(res, reviews.map(r => r.toJSON()));
  } catch (err) { next(err); }
});

// POST /:id/reply (therapist)
router.post('/:id/reply', authenticate, requireTherapist, validate(replySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params['id'], therapistId: req.user!.userId },
      { therapistReply: (req.body as z.infer<typeof replySchema>).reply, therapistRepliedAt: new Date() },
      { new: true },
    );
    if (!review) throw new NotFoundError('Review not found');
    successResponse(res, review.toJSON(), 'Reply added');
  } catch (err) { next(err); }
});

export default router;
