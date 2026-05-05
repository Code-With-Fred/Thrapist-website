import { Router, Response, NextFunction } from 'express';
import { Wallet, WalletTransaction } from '../models/Wallet.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

// GET /
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user!.userId });
    if (!wallet) throw new NotFoundError('Wallet not found');
    successResponse(res, wallet.toJSON());
  } catch (err) { next(err); }
});

// GET /transactions
router.get('/transactions', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user!.userId });
    if (!wallet) throw new NotFoundError('Wallet not found');

    const transactions = await WalletTransaction.find({ walletId: wallet._id }).sort({ createdAt: -1 }).limit(50);
    successResponse(res, transactions.map(t => t.toJSON()));
  } catch (err) { next(err); }
});

export default router;
