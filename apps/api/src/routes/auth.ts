import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, type StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { config } from '../config/index.js';

// ─── Passport Google Strategy ─────────────────────────────────────────────────

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest,
    async (req, _accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value ?? '';
        const name = profile.displayName ?? '';
        const cookies = req.cookies as Record<string, string | undefined>;
        const role: 'client' | 'therapist' = cookies['pendingRole'] === 'therapist' ? 'therapist' : 'client';
        const result = await authService.googleAuth(profile.id, email, name, role);
        done(null, result as unknown as Express.User);
      } catch (err) {
        done(err as Error);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user as Express.User));

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['client', 'therapist']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth/refresh',
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

const router = Router();

// POST /signup
router.post(
  '/signup',
  authRateLimiter,
  validate(signupSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, role } = req.body as z.infer<typeof signupSchema>;
      const { user, accessToken, refreshToken } = await authService.signup(email, password, role);
      setRefreshCookie(res, refreshToken);
      successResponse(res, { user, accessToken }, 'Account created. Please verify your email.', 201);
    } catch (err) {
      next(err);
    }
  },
);

// POST /login
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as z.infer<typeof loginSchema>;
      const { user, accessToken, refreshToken } = await authService.login(email, password);
      setRefreshCookie(res, refreshToken);
      successResponse(res, { user, accessToken }, 'Login successful');
    } catch (err) {
      next(err);
    }
  },
);

// POST /logout — no auth required so expired tokens can still log out cleanly
router.post(
  '/logout',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Best-effort: try to invalidate server-side refresh token if we can identify the user
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const { verifyAccessToken } = await import('../utils/jwt.js');
          const payload = verifyAccessToken(authHeader.slice(7));
          await authService.logout(payload.userId);
        } catch { /* token invalid/expired — still clear the cookie */ }
      }
      res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
      successResponse(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  },
);

// POST /refresh
router.post(
  '/refresh',
  validate(refreshSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Prefer httpOnly cookie; fall back to body (for non-browser clients)
      const token: string =
        (req.cookies as Record<string, string | undefined>)['refreshToken']
        ?? (req.body as z.infer<typeof refreshSchema>).refreshToken
        ?? '';

      const { accessToken, refreshToken } = await authService.refreshTokens(token);
      setRefreshCookie(res, refreshToken);
      successResponse(res, { accessToken }, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  },
);

// GET /google
router.get('/google', (req: Request, res: Response, next: NextFunction): void => {
  const role = (req.query['role'] as string) === 'therapist' ? 'therapist' : 'client';
  // Store intended role in a short-lived cookie so the strategy can read it on callback
  res.cookie('pendingRole', role, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000, // 5 minutes
  });
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

// GET /google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${config.frontendUrl}/login?error=oauth` }),
  (req: Request, res: Response): void => {
    const result = req.user as unknown as { user: Record<string, unknown>; accessToken: string; refreshToken: string };
    setRefreshCookie(res, result.refreshToken);
    res.clearCookie('pendingRole');
    // Pass token in URL param — cookies can't cross domains (API on Railway, frontend on Vercel)
    res.redirect(`${config.frontendUrl}/oauth-callback?token=${encodeURIComponent(result.accessToken)}`);
  },
);

// POST /verify-email
router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body as z.infer<typeof verifyEmailSchema>;
      await authService.verifyEmail(token);
      successResponse(res, null, 'Email verified successfully');
    } catch (err) {
      next(err);
    }
  },
);

// POST /forgot-password
router.post(
  '/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body as z.infer<typeof forgotPasswordSchema>;
      await authService.forgotPassword(email);
      // Always 200 to prevent email enumeration
      successResponse(res, null, 'If an account with that email exists, a reset link has been sent');
    } catch (err) {
      next(err);
    }
  },
);

// POST /reset-password
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body as z.infer<typeof resetPasswordSchema>;
      await authService.resetPassword(token, password);
      successResponse(res, null, 'Password reset successfully');
    } catch (err) {
      next(err);
    }
  },
);

export default router;
