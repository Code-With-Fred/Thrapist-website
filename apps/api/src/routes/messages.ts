import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Conversation, Message } from '../models/Conversation.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';

const router = Router();

const sendMessageSchema = z.object({ content: z.string().min(1).max(5000) });

// GET / — list conversations for current user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const filter = role === 'client' ? { clientId: userId } : { therapistId: userId };

    const conversations = await Conversation.find(filter).sort({ lastMessageAt: -1 });
    successResponse(res, conversations.map(c => c.toJSON()));
  } catch (err) { next(err); }
});

// GET /:id/messages
router.get('/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const conv = await Conversation.findById(req.params['id']);
    if (!conv) throw new NotFoundError('Conversation not found');

    const isParticipant = role === 'client'
      ? conv.clientId.toString() === userId
      : conv.therapistId.toString() === userId;
    if (!isParticipant) throw new UnauthorizedError('Access denied');

    const messages = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });
    successResponse(res, messages.map(m => m.toJSON()));
  } catch (err) { next(err); }
});

// POST /:id/messages
router.post('/:id/messages', authenticate, validate(sendMessageSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const { content } = req.body as z.infer<typeof sendMessageSchema>;
    const conv = await Conversation.findById(req.params['id']);
    if (!conv) throw new NotFoundError('Conversation not found');

    const isParticipant = role === 'client'
      ? conv.clientId.toString() === userId
      : conv.therapistId.toString() === userId;
    if (!isParticipant) throw new UnauthorizedError('Access denied');

    const message = await Message.create({
      conversationId: conv._id,
      senderId: new mongoose.Types.ObjectId(userId),
      content,
    });

    conv.lastMessage = content;
    conv.lastMessageAt = new Date();
    if (role === 'client') conv.therapistUnread += 1;
    else conv.clientUnread += 1;
    await conv.save();

    successResponse(res, message.toJSON(), 'Message sent', 201);
  } catch (err) { next(err); }
});

// POST /:id/mark-read
router.post('/:id/mark-read', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const conv = await Conversation.findById(req.params['id']);
    if (!conv) throw new NotFoundError('Conversation not found');

    if (role === 'client') conv.clientUnread = 0;
    else conv.therapistUnread = 0;
    await conv.save();

    await Message.updateMany(
      { conversationId: conv._id, senderId: { $ne: new mongoose.Types.ObjectId(userId) }, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    successResponse(res, null, 'Marked as read');
  } catch (err) { next(err); }
});

export default router;
