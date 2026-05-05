import { Router, Response, NextFunction } from 'express';
import { Booking } from '../models/Booking.js';
import { TherapistProfile } from '../models/TherapistProfile.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError, UnauthorizedError, AppError } from '../utils/errors.js';
import { dailyService } from '../services/daily.service.js';
import { config } from '../config/index.js';

const router = Router();

// POST /:bookingId/start — called when participant joins session page
router.post('/:bookingId/start', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const booking = await Booking.findById(req.params['bookingId']);
    if (!booking) throw new NotFoundError('Booking not found');

    const isParticipant = role === 'client'
      ? booking.clientId.toString() === userId
      : booking.therapistId.toString() === userId;
    if (!isParticipant) throw new UnauthorizedError('Access denied');

    if (!['confirmed', 'completed'].includes(booking.status)) {
      throw new AppError('Session is not available. It must be confirmed before joining.', 400);
    }

    // Create Daily.co room if it doesn't exist yet
    if (!booking.roomUrl) {
      if (!config.daily.apiKey || config.daily.apiKey === 'your_daily_api_key') {
        throw new AppError('Video sessions are not configured. Please set DAILY_API_KEY in the server environment.', 503);
      }
      const expiresAt = new Date(booking.scheduledAt.getTime() + (booking.durationMinutes + 30) * 60 * 1000);
      const room = await dailyService.createRoom(booking.id, expiresAt);
      booking.roomUrl = room.url;
      booking.roomName = room.name;
      await booking.save();
    }

    // Generate a meeting token for this participant
    let token = '';
    if (config.daily.apiKey && config.daily.apiKey !== 'your_daily_api_key') {
      const isOwner = role === 'therapist';
      token = await dailyService.createToken(booking.roomName!, userId, isOwner);
    }

    // Fetch therapist profile for the session header
    const therapistProfile = await TherapistProfile.findOne({ userId: booking.therapistId }).lean();

    successResponse(res, {
      roomUrl: booking.roomUrl,
      token,
      booking: {
        scheduledAt: booking.scheduledAt.toISOString(),
        durationMinutes: booking.durationMinutes,
        sessionType: booking.sessionType,
        therapistProfile: therapistProfile
          ? { firstName: therapistProfile.firstName, lastName: therapistProfile.lastName }
          : undefined,
      },
    });
  } catch (err) { next(err); }
});

// POST /:bookingId/end — called when participant clicks "End Session"
router.post('/:bookingId/end', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const booking = await Booking.findById(req.params['bookingId']);
    if (!booking) throw new NotFoundError('Booking not found');

    const isParticipant = role === 'client'
      ? booking.clientId.toString() === userId
      : booking.therapistId.toString() === userId;
    if (!isParticipant) throw new UnauthorizedError('Access denied');

    successResponse(res, null, 'Session ended');
  } catch (err) { next(err); }
});

// GET /:bookingId/join — legacy endpoint kept for backwards compat
router.get('/:bookingId/join', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const booking = await Booking.findById(req.params['bookingId']);
    if (!booking) throw new NotFoundError('Booking not found');

    const isParticipant = role === 'client'
      ? booking.clientId.toString() === userId
      : booking.therapistId.toString() === userId;
    if (!isParticipant) throw new UnauthorizedError('Access denied');

    if (!booking.roomUrl) {
      if (!config.daily.apiKey || config.daily.apiKey === 'your_daily_api_key') {
        throw new AppError('Video sessions are not configured.', 503);
      }
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const room = await dailyService.createRoom(booking.id, expiresAt);
      booking.roomUrl = room.url;
      booking.roomName = room.name;
      await booking.save();
    }

    successResponse(res, { roomUrl: booking.roomUrl, roomName: booking.roomName });
  } catch (err) { next(err); }
});

export default router;
