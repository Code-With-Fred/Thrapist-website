import crypto from 'crypto';
import { User } from '../models/User.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { TherapistProfile } from '../models/TherapistProfile.js';
import { Wallet } from '../models/Wallet.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { emailService } from './email.service.js';
import { AppError, UnauthorizedError, ConflictError } from '../utils/errors.js';

export const authService = {
  async signup(email: string, password: string, role: 'client' | 'therapist') {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ConflictError('An account with this email already exists');

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({ email, passwordHash, role, verificationToken, verificationTokenExpires });

    if (role === 'client') {
      await ClientProfile.create({ userId: user._id, firstName: '', lastName: '' });
    } else {
      await TherapistProfile.create({ userId: user._id, firstName: '', lastName: '' });
    }
    await Wallet.create({ userId: user._id });

    await emailService.sendVerificationEmail(email, verificationToken).catch(() => {});

    const accessToken = signAccessToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });
    user.refreshToken = refreshToken;
    await user.save();

    return { user: user.toJSON(), accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +refreshToken');
    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedError('Account is suspended');
    if (!user.passwordHash) throw new UnauthorizedError('Please sign in with Google');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const accessToken = signAccessToken({ userId: user.id, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    user.refreshToken = refreshToken;
    await user.save();

    return { user: user.toJSON(), accessToken, refreshToken };
  },

  async googleAuth(googleId: string, email: string, name: string, requestedRole: 'client' | 'therapist' = 'client') {
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        // Existing email account — link Google to it, preserve existing role
        user.googleId = googleId;
        user.isVerified = true;
        await user.save();
      } else {
        // Brand new user — create with the requested role
        const [firstName, ...rest] = name.split(' ');
        user = await User.create({ email: email.toLowerCase(), googleId, role: requestedRole, isVerified: true });
        if (requestedRole === 'therapist') {
          await TherapistProfile.create({ userId: user._id, firstName: firstName ?? name, lastName: rest.join(' ') });
        } else {
          await ClientProfile.create({ userId: user._id, firstName: firstName ?? name, lastName: rest.join(' ') });
        }
        await Wallet.create({ userId: user._id });
        await emailService.sendWelcome(email, firstName ?? name).catch(() => {});
      }
    }

    if (!user!.isActive) throw new UnauthorizedError('Account is suspended');

    const accessToken = signAccessToken({ userId: user!.id, role: user!.role, email: user!.email });
    const refreshToken = signRefreshToken({ userId: user!.id });

    user!.refreshToken = refreshToken;
    await user!.save();

    return { user: user!.toJSON(), accessToken, refreshToken };
  },

  async refreshTokens(refreshToken: string) {
    let payload: { userId: string };
    try { payload = verifyRefreshToken(refreshToken); }
    catch { throw new UnauthorizedError('Invalid refresh token'); }

    const user = await User.findById(payload.userId).select('+refreshToken');
    if (!user || !user.isActive) throw new UnauthorizedError('Account not found or suspended');
    if (user.refreshToken !== refreshToken) throw new UnauthorizedError('Refresh token revoked');

    const newAccessToken = signAccessToken({ userId: user.id, role: user.role, email: user.email });
    const newRefreshToken = signRefreshToken({ userId: user.id });

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async verifyEmail(token: string) {
    const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: new Date() } });
    if (!user) throw new AppError('Invalid or expired verification token', 400);

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  },

  async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return;

    user.resetToken = crypto.randomBytes(32).toString('hex');
    user.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await emailService.sendPasswordReset(email, user.resetToken).catch(() => {});
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: new Date() } });
    if (!user) throw new AppError('Invalid or expired reset token', 400);

    user.passwordHash = await hashPassword(newPassword);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.refreshToken = undefined; // invalidate all active sessions
    await user.save();
  },

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  },
};
