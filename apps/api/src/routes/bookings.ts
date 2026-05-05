import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { TherapistProfile } from '../models/TherapistProfile.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { Wallet, WalletTransaction } from '../models/Wallet.js';
import { Payment } from '../models/Payment.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireClient, requireTherapist } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError, AppError, UnauthorizedError } from '../utils/errors.js';
import { config } from '../config/index.js';
import { emailService } from '../services/email.service.js';

const router = Router();

const createBookingSchema = z.object({
  therapistId: z.string(),
  sessionType: z.enum(['video', 'audio', 'in_person']),
  therapyType: z.string().min(1),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(30).max(120).default(60),
  notes: z.string().optional(),
});

const cancelSchema = z.object({ reason: z.string().optional() });
const rescheduleSchema = z.object({ scheduledAt: z.string().datetime() });

// POST / — create booking
router.post('/', authenticate, requireClient, validate(createBookingSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.user!;
    const body = req.body as z.infer<typeof createBookingSchema>;

    const therapist = await TherapistProfile.findOne({ userId: body.therapistId, isApproved: true, isAvailable: true });
    if (!therapist) throw new NotFoundError('Therapist not found or unavailable');

    const price = therapist.sessionRate;
    const platformFee = Math.round(price * config.platformFeePercent / 100);

    const booking = await Booking.create({
      clientId: new mongoose.Types.ObjectId(userId),
      therapistId: new mongoose.Types.ObjectId(body.therapistId),
      sessionType: body.sessionType,
      therapyType: body.therapyType,
      scheduledAt: new Date(body.scheduledAt),
      durationMinutes: body.durationMinutes,
      notes: body.notes,
      price,
      status: 'confirmed',
    });

    await Payment.create({
      bookingId: booking._id,
      clientId: new mongoose.Types.ObjectId(userId),
      therapistId: new mongoose.Types.ObjectId(body.therapistId),
      amount: price,
      platformFee,
      therapistPayout: price - platformFee,
      status: 'pending',
    });

    successResponse(res, booking.toJSON(), 'Booking created', 201);
  } catch (err) { next(err); }
});

// GET / — list my bookings (populated)
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const filter = role === 'client' ? { clientId: userId } : { therapistId: userId };
    const bookings = await Booking.find(filter).sort({ scheduledAt: -1 }).lean();

    // Populate the other party's profile info
    const enriched = await Promise.all(bookings.map(async (b) => {
      if (role === 'therapist') {
        const profile = await import('../models/ClientProfile.js').then(m =>
          m.ClientProfile.findOne({ userId: b.clientId }).lean()
        );
        const user = await import('../models/User.js').then(m =>
          m.User.findById(b.clientId).select('email').lean()
        );
        return { ...b, id: b._id.toString(), client: { id: b.clientId.toString(), firstName: profile?.firstName, lastName: profile?.lastName, email: (user as { email?: string })?.email ?? '' } };
      } else {
        const profile = await import('../models/TherapistProfile.js').then(m =>
          m.TherapistProfile.findOne({ userId: b.therapistId }).lean()
        );
        return { ...b, id: b._id.toString(), therapist: { id: b.therapistId.toString(), firstName: (profile as { firstName?: string })?.firstName, lastName: (profile as { lastName?: string })?.lastName } };
      }
    }));

    successResponse(res, enriched);
  } catch (err) { next(err); }
});

// POST /:id/confirm (therapist only)
router.post('/:id/confirm', authenticate, requireTherapist, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findOne({ _id: req.params['id'], therapistId: req.user!.userId });
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.status !== 'pending') throw new AppError('Only pending bookings can be confirmed', 400);
    booking.status = 'confirmed';
    await booking.save();
    successResponse(res, booking.toJSON(), 'Booking confirmed');
  } catch (err) { next(err); }
});

// POST /:id/decline (therapist only)
router.post('/:id/decline', authenticate, requireTherapist, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findOne({ _id: req.params['id'], therapistId: req.user!.userId });
    if (!booking) throw new NotFoundError('Booking not found');
    if (!['pending', 'confirmed'].includes(booking.status)) throw new AppError('Cannot decline this booking', 400);
    booking.status = 'cancelled';
    booking.cancelReason = 'Declined by therapist';
    await booking.save();
    successResponse(res, booking.toJSON(), 'Booking declined');
  } catch (err) { next(err); }
});

// GET /:id — single booking
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const booking = await Booking.findById(req.params['id']);
    if (!booking) throw new NotFoundError('Booking not found');

    const isOwner = role === 'client' ? booking.clientId.toString() === userId : booking.therapistId.toString() === userId;
    if (!isOwner) throw new UnauthorizedError('Access denied');

    successResponse(res, booking.toJSON());
  } catch (err) { next(err); }
});

// POST /:id/cancel
router.post('/:id/cancel', authenticate, validate(cancelSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const booking = await Booking.findById(req.params['id']);
    if (!booking) throw new NotFoundError('Booking not found');

    const isOwner = role === 'client' ? booking.clientId.toString() === userId : booking.therapistId.toString() === userId;
    if (!isOwner) throw new UnauthorizedError('Access denied');
    if (!['pending', 'confirmed'].includes(booking.status)) throw new AppError('Booking cannot be cancelled', 400);

    const { reason } = req.body as z.infer<typeof cancelSchema>;
    booking.status = 'cancelled';
    booking.cancelReason = reason;
    booking.canceledAt = new Date();
    await booking.save();

    successResponse(res, booking.toJSON(), 'Booking cancelled');
  } catch (err) { next(err); }
});

// POST /:id/reschedule
router.post('/:id/reschedule', authenticate, requireClient, validate(rescheduleSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findOne({ _id: req.params['id'], clientId: req.user!.userId });
    if (!booking) throw new NotFoundError('Booking not found');
    if (!['pending', 'confirmed'].includes(booking.status)) throw new AppError('Cannot reschedule', 400);

    booking.scheduledAt = new Date((req.body as z.infer<typeof rescheduleSchema>).scheduledAt);
    await booking.save();

    successResponse(res, booking.toJSON(), 'Booking rescheduled');
  } catch (err) { next(err); }
});

// POST /:id/complete (therapist only)
router.post('/:id/complete', authenticate, requireTherapist, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = await Booking.findOne({ _id: req.params['id'], therapistId: req.user!.userId, status: 'confirmed' });
    if (!booking) throw new NotFoundError('Booking not found');

    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    await Payment.findOneAndUpdate({ bookingId: booking._id }, { status: 'completed' });

    const therapistWallet = await Wallet.findOne({ userId: booking.therapistId });
    if (therapistWallet) {
      const payment = await Payment.findOne({ bookingId: booking._id });
      therapistWallet.balance += payment?.therapistPayout ?? 0;
      await therapistWallet.save();
      await WalletTransaction.create({
        walletId: therapistWallet._id,
        type: 'credit',
        amount: payment?.therapistPayout ?? 0,
        description: 'Session payment',
        referenceId: booking.id,
        referenceType: 'booking',
      });
    }

    successResponse(res, booking.toJSON(), 'Session completed');
  } catch (err) { next(err); }
});

export default router;
