import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = new Resend(config.resend.apiKey);
const FROM_EMAIL = 'HealMate <noreply@healmate.app>';

export const emailService = {
  async sendWelcome(email: string, name: string): Promise<void> {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to HealMate!',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #4F7EFF, #6B9FFF); padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 32px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to HealMate</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 12px;">Your mental wellness journey starts here</p>
          </div>
          <p style="color: #0F172A; font-size: 16px;">Hi ${name},</p>
          <p style="color: #64748B;">Thank you for joining HealMate. We're here to support your mental health journey every step of the way.</p>
          <a href="${config.frontendUrl}" style="display: inline-block; background: #4F7EFF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">Get Started</a>
        </div>`,
    });
  },

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your HealMate email',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #0F172A;">Verify your email address</h2>
          <p style="color: #64748B;">Click the button below to verify your email and activate your account.</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #4F7EFF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify Email</a>
          <p style="color: #94A3B8; font-size: 14px; margin-top: 24px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>`,
    });
  },

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your HealMate password',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #0F172A;">Reset your password</h2>
          <p style="color: #64748B;">We received a request to reset your password.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #4F7EFF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
          <p style="color: #94A3B8; font-size: 14px; margin-top: 24px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>`,
    });
  },

  async sendBookingConfirmed(
    clientEmail: string,
    therapistEmail: string,
    clientName: string,
    therapistName: string,
    scheduledAt: Date,
    sessionType: string,
  ): Promise<void> {
    const dateStr = scheduledAt.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
    const html = (recipientName: string) => `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #10B981; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: white; margin: 0;">Session Confirmed!</h2>
        </div>
        <p style="color: #0F172A;">Hi ${recipientName},</p>
        <p style="color: #64748B;">Your ${sessionType} session has been confirmed.</p>
        <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #0F172A;"><strong>Date & Time:</strong> ${dateStr}</p>
          <p style="margin: 8px 0 0; color: #0F172A;"><strong>Format:</strong> ${sessionType}</p>
          ${recipientName === clientName ? `<p style="margin: 8px 0 0; color: #0F172A;"><strong>Therapist:</strong> ${therapistName}</p>` : `<p style="margin: 8px 0 0; color: #0F172A;"><strong>Client:</strong> ${clientName}</p>`}
        </div>
        <a href="${config.frontendUrl}/client/sessions" style="display: inline-block; background: #4F7EFF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Session</a>
      </div>`;
    await Promise.all([
      resend.emails.send({ from: FROM_EMAIL, to: clientEmail, subject: 'Session Confirmed - HealMate', html: html(clientName) }),
      resend.emails.send({ from: FROM_EMAIL, to: therapistEmail, subject: 'New Session Confirmed - HealMate', html: html(therapistName) }),
    ]);
  },

  async sendBookingReminder(email: string, name: string, scheduledAt: Date, hoursUntil: number): Promise<void> {
    const dateStr = scheduledAt.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Session reminder: ${hoursUntil === 1 ? '1 hour' : '24 hours'} away`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #0F172A;">Session Reminder</h2>
          <p style="color: #64748B;">Hi ${name}, your session is coming up in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}!</p>
          <p style="color: #0F172A;"><strong>${dateStr}</strong></p>
          <a href="${config.frontendUrl}/client/sessions" style="display: inline-block; background: #4F7EFF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Join Session</a>
        </div>`,
    });
  },

  async sendBookingCancelled(email: string, name: string, scheduledAt: Date, reason?: string): Promise<void> {
    const dateStr = scheduledAt.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Session Cancelled - HealMate',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #EF4444;">Session Cancelled</h2>
          <p style="color: #64748B;">Hi ${name}, your session on ${dateStr} has been cancelled.</p>
          ${reason ? `<p style="color: #64748B;"><strong>Reason:</strong> ${reason}</p>` : ''}
          <a href="${config.frontendUrl}/therapists" style="display: inline-block; background: #4F7EFF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Book New Session</a>
        </div>`,
    });
  },

  async sendNewMatch(email: string, name: string, matchName: string): Promise<void> {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `You have a new match on HealMate!`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #FF6B9D, #FF8FB3); padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 32px;">
            <h1 style="color: white; margin: 0;">It's a Match! 💕</h1>
          </div>
          <p style="color: #0F172A;">Hi ${name},</p>
          <p style="color: #64748B;">You and <strong>${matchName}</strong> have liked each other! Start a conversation now.</p>
          <a href="${config.frontendUrl}/matches" style="display: inline-block; background: #FF6B9D; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Match</a>
        </div>`,
    });
  },

  async sendGiftCard(recipientEmail: string, senderName: string, code: string, amount: number, message?: string): Promise<void> {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `${senderName} sent you a HealMate gift card!`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #4F7EFF, #FF6B9D); padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 32px;">
            <h1 style="color: white; margin: 0;">🎁 Gift Card</h1>
            <p style="color: white; font-size: 36px; font-weight: 700; margin: 16px 0;">$${(amount / 100).toFixed(2)}</p>
          </div>
          <p style="color: #0F172A;">${senderName} sent you a HealMate gift card!</p>
          ${message ? `<p style="color: #64748B; font-style: italic;">"${message}"</p>` : ''}
          <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <p style="color: #64748B; margin: 0;">Your gift card code:</p>
            <p style="color: #0F172A; font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 8px 0;">${code}</p>
          </div>
          <a href="${config.frontendUrl}/client/wallet" style="display: inline-block; background: #4F7EFF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Redeem Gift Card</a>
        </div>`,
    });
  },

  async sendWalletTopup(email: string, name: string, amount: number): Promise<void> {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Wallet topped up - HealMate',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #10B981;">Wallet Topped Up!</h2>
          <p style="color: #64748B;">Hi ${name}, your HealMate wallet has been credited with <strong>$${(amount / 100).toFixed(2)}</strong>.</p>
          <a href="${config.frontendUrl}/client/wallet" style="display: inline-block; background: #4F7EFF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Wallet</a>
        </div>`,
    });
  },
};
