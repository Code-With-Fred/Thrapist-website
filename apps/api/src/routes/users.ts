import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { User } from '../models/User.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { TherapistProfile } from '../models/TherapistProfile.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cloudinaryService } from '../services/cloudinary.service.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).optional(),
  bio: z.string().optional(),
  timezone: z.string().max(100).optional(),
  language: z.string().max(10).optional(),
  dateOfBirth: z.string().optional(),
});

// GET /me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    let profile = null;
    if (role === 'client') profile = await ClientProfile.findOne({ userId });
    else if (role === 'therapist') profile = await TherapistProfile.findOne({ userId });

    successResponse(res, { ...user.toJSON(), profile: profile?.toJSON() ?? null });
  } catch (err) { next(err); }
});

// PUT /me
router.put('/me', authenticate, validate(updateProfileSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const body = req.body as z.infer<typeof updateProfileSchema>;

    if (role === 'client') await ClientProfile.findOneAndUpdate({ userId }, body);
    else if (role === 'therapist') await TherapistProfile.findOneAndUpdate({ userId }, body);

    successResponse(res, null, 'Profile updated');
  } catch (err) { next(err); }
});

// POST /me/avatar
router.post('/me/avatar', authenticate, upload.single('avatar'), async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }

    const { url } = await cloudinaryService.uploadImage(req.file.buffer, 'avatars', userId);

    if (role === 'client') await ClientProfile.findOneAndUpdate({ userId }, { avatar: url });
    else await TherapistProfile.findOneAndUpdate({ userId }, { avatar: url });

    successResponse(res, { avatarUrl: url }, 'Avatar updated');
  } catch (err) { next(err); }
});

export default router;
