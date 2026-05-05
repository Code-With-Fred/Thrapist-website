import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { DatingMatch, DatingMessage } from '../models/DatingProfile.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';

const router = Router();

const likeSchema = z.object({ targetUserId: z.string() });
const sendMessageSchema = z.object({ content: z.string().min(1).max(2000) });

// POST /like
router.post('/like', authenticate, validate(likeSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { targetUserId } = req.body as z.infer<typeof likeSchema>;

    const reciprocalLike = await DatingMatch.findOne({ user1Id: targetUserId, user2Id: userId, status: 'pending' });
    if (reciprocalLike) {
      reciprocalLike.status = 'matched';
      reciprocalLike.matchedAt = new Date();
      await reciprocalLike.save();
      successResponse(res, { match: reciprocalLike.toJSON(), isMatch: true }, "It's a match!");
    } else {
      const like = await DatingMatch.create({
        user1Id: new mongoose.Types.ObjectId(userId),
        user2Id: new mongoose.Types.ObjectId(targetUserId),
        status: 'pending',
      });
      successResponse(res, { match: like.toJSON(), isMatch: false }, 'Like sent');
    }
  } catch (err) { next(err); }
});

// GET / — my matches
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.user!;
    const matches = await DatingMatch.find({
      $or: [{ user1Id: userId }, { user2Id: userId }],
      status: 'matched',
    }).sort({ matchedAt: -1 });
    successResponse(res, matches.map(m => m.toJSON()));
  } catch (err) { next(err); }
});

// GET /:id/messages
router.get('/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.user!;
    const match = await DatingMatch.findOne({ _id: req.params['id'], status: 'matched' });
    if (!match) throw new NotFoundError('Match not found');

    const isParticipant = match.user1Id.toString() === userId || match.user2Id.toString() === userId;
    if (!isParticipant) throw new UnauthorizedError('Access denied');

    const messages = await DatingMessage.find({ matchId: match._id }).sort({ createdAt: 1 });
    successResponse(res, messages.map(m => m.toJSON()));
  } catch (err) { next(err); }
});

// POST /:id/messages
router.post('/:id/messages', authenticate, validate(sendMessageSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.user!;
    const match = await DatingMatch.findOne({ _id: req.params['id'], status: 'matched' });
    if (!match) throw new NotFoundError('Match not found');

    const isParticipant = match.user1Id.toString() === userId || match.user2Id.toString() === userId;
    if (!isParticipant) throw new UnauthorizedError('Access denied');

    const message = await DatingMessage.create({
      matchId: match._id,
      senderId: new mongoose.Types.ObjectId(userId),
      content: (req.body as z.infer<typeof sendMessageSchema>).content,
    });

    match.lastActivity = new Date();
    await match.save();

    successResponse(res, message.toJSON(), 'Message sent', 201);
  } catch (err) { next(err); }
});

export default router;
