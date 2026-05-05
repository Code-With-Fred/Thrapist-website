import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { TherapistProfile } from '../models/TherapistProfile.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { Wallet } from '../models/Wallet.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { hashPassword } from '../utils/bcrypt.js';

const router = Router();
router.use(authenticate, requireAdmin);

const rejectTherapistSchema = z.object({ reason: z.string().min(1) });
const suspendUserSchema = z.object({ reason: z.string().optional() });
const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// GET /stats
router.get('/stats', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

    const [totalUsers, activeTherapists, sessionsToday, revenueResult, pendingApprovals] = await Promise.all([
      User.countDocuments({ isActive: true }),
      TherapistProfile.countDocuments({ isApproved: true, isAvailable: true }),
      Booking.countDocuments({ scheduledAt: { $gte: startOfToday, $lte: endOfToday } }),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$platformFee' } } },
      ]),
      TherapistProfile.countDocuments({ isApproved: false }),
    ]);

    successResponse(res, {
      totalUsers,
      activeTherapists,
      sessionsToday,
      revenueMonth: (revenueResult[0]?.total ?? 0) as number,
      pendingApprovals,
    });
  } catch (err) { next(err); }
});

// GET /revenue
router.get('/revenue', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const startOfLastMonth = new Date(startOfMonth); startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const [totalResult, monthResult, lastMonthResult, recentPayments] = await Promise.all([
      Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$platformFee' } } }]),
      Payment.aggregate([{ $match: { status: 'completed', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$platformFee' } } }]),
      Payment.aggregate([{ $match: { status: 'completed', createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$platformFee' } } }]),
      Payment.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    successResponse(res, {
      totalRevenue: (totalResult[0]?.total ?? 0) as number,
      monthRevenue: (monthResult[0]?.total ?? 0) as number,
      lastMonthRevenue: (lastMonthResult[0]?.total ?? 0) as number,
      giftCardRevenue: 0,
      transactions: recentPayments.map(p => ({
        id: (p._id as { toString(): string }).toString(),
        amount: p.platformFee,
        type: 'session_payment',
        status: p.status,
        createdAt: p.createdAt,
      })),
    });
  } catch (err) { next(err); }
});

// GET /dating/reported
router.get('/dating/reported', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    successResponse(res, []);
  } catch (err) { next(err); }
});

// POST /dating/profiles/:id/suspend
router.post('/dating/profiles/:id/suspend', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { DatingProfile } = await import('../models/DatingProfile.js');
    const profile = await DatingProfile.findByIdAndUpdate(req.params['id'], { isActive: false }, { new: true });
    if (!profile) throw new NotFoundError('Dating profile not found');
    successResponse(res, null, 'Dating profile suspended');
  } catch (err) { next(err); }
});

// GET /users
router.get('/users', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query['page'] as string) ?? '1');
    const limit = 20;
    const rawSearch = req.query['search'] as string | undefined;
    // Escape regex special chars to prevent ReDoS
    const search = rawSearch ? rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : undefined;
    const filter = search ? { $or: [{ email: { $regex: search, $options: 'i' } }] } : {};

    const [users, total] = await Promise.all([
      User.find(filter).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    successResponse(res, { users: users.map(u => u.toJSON()), total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /therapists/pending
router.get('/therapists/pending', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pending = await TherapistProfile.find({ isApproved: false }).sort({ createdAt: -1 });
    successResponse(res, pending.map(t => t.toJSON()));
  } catch (err) { next(err); }
});

// POST /therapists/:id/approve
router.post('/therapists/:id/approve', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await TherapistProfile.findOneAndUpdate(
      { userId: req.params['id'] },
      { isApproved: true },
      { new: true },
    );
    if (!profile) throw new NotFoundError('Therapist not found');
    successResponse(res, profile.toJSON(), 'Therapist approved');
  } catch (err) { next(err); }
});

// POST /therapists/:id/reject
router.post('/therapists/:id/reject', validate(rejectTherapistSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body as z.infer<typeof rejectTherapistSchema>;
    const profile = await TherapistProfile.findOneAndUpdate(
      { userId: req.params['id'] },
      { isApproved: false, rejectionReason: reason },
      { new: true },
    );
    if (!profile) throw new NotFoundError('Therapist not found');
    successResponse(res, null, 'Therapist rejected');
  } catch (err) { next(err); }
});

// POST /users/:id/suspend
router.post('/users/:id/suspend', validate(suspendUserSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params['id'], { isActive: false }, { new: true });
    if (!user) throw new NotFoundError('User not found');
    successResponse(res, user.toJSON(), 'User suspended');
  } catch (err) { next(err); }
});

// POST /users/:id/unsuspend
router.post('/users/:id/unsuspend', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params['id'], { isActive: true }, { new: true });
    if (!user) throw new NotFoundError('User not found');
    successResponse(res, user.toJSON(), 'User unsuspended');
  } catch (err) { next(err); }
});

// DELETE /users/:id
router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params['id']);
    if (!user) throw new NotFoundError('User not found');
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        res.status(400).json({ success: false, message: 'Cannot delete the last admin account' });
        return;
      }
    }
    await Promise.all([
      User.findByIdAndDelete(req.params['id']),
      ClientProfile.findOneAndDelete({ userId: req.params['id'] }),
      TherapistProfile.findOneAndDelete({ userId: req.params['id'] }),
      Wallet.findOneAndDelete({ userId: req.params['id'] }),
    ]);
    successResponse(res, null, 'User deleted');
  } catch (err) { next(err); }
});

// POST /create-admin
router.post('/create-admin', validate(createAdminSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as z.infer<typeof createAdminSchema>;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ConflictError('An account with this email already exists');

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
      isVerified: true,
      isActive: true,
    });
    await Wallet.create({ userId: user._id });

    successResponse(res, user.toJSON(), 'Admin account created', 201);
  } catch (err) { next(err); }
});

export default router;
