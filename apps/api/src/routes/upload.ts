import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { cloudinaryService } from '../services/cloudinary.service.js';
import { successResponse } from '../utils/response.js';
import { AppError } from '../utils/errors.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed', 400));
    }
  },
});

// POST /image
router.post(
  '/image',
  authenticate,
  upload.single('image'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file provided' });
        return;
      }

      const { userId } = req.user!;
      const folder = (req.query['folder'] as string) || 'uploads';

      const { url, publicId } = await cloudinaryService.uploadImage(
        req.file.buffer,
        folder,
      );

      successResponse(res, { url, publicId }, 'Image uploaded successfully');
    } catch (err) {
      next(err);
    }
  },
);

export default router;
