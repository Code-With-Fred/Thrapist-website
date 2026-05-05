import { Router, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { successResponse } from '../utils/response.js';

const router = Router();

// GET /
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user!.userId }).sort({ createdAt: -1 }).limit(50);
    successResponse(res, notifications.map(n => n.toJSON()));
  } catch (err) { next(err); }
});

// POST /:id/read
router.post('/:id/read', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params['id'], userId: req.user!.userId },
      { isRead: true, readAt: new Date() },
    );
    successResponse(res, null, 'Marked as read');
  } catch (err) { next(err); }
});

// POST /read-all
router.post('/read-all', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user!.userId, isRead: false }, { isRead: true, readAt: new Date() });
    successResponse(res, null, 'All marked as read');
  } catch (err) { next(err); }
});

export default router;
