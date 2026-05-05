'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Lock, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch('password', '');

  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength] ?? '';
  const strengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'][passwordStrength] ?? '';

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setApiError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }
    setIsLoading(true);
    setApiError('');
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Password reset failed. The link may have expired.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /* Invalid token — no token in URL */
  if (!token) {
    return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-[#E2E8F0] p-10 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(239,68,68,0.10)' }}>
              <AlertCircle size={38} color="#EF4444" strokeWidth={1.6} />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Invalid reset link</h1>
            <p className="text-sm text-[#64748B] mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="w-full inline-block py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)', boxShadow: '0 4px 14px rgba(79,126,255,0.35)' }}
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* Success state */
  if (isSuccess) {
    return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-[#E2E8F0] p-10 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(34,197,94,0.10)' }}>
              <CheckCircle2 size={42} color="#22C55E" strokeWidth={1.6} />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Password reset!</h1>
            <p className="text-sm text-[#64748B] mb-6">
              Your password has been successfully updated. Redirecting you to login…
            </p>
            <Link
              href="/login"
              className="text-sm font-medium text-[#4F7EFF] hover:underline"
            >
              Go to login now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-[#E2E8F0] p-8">
          {/* Heading */}
          <div className="mb-7">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(79,126,255,0.10)' }}>
              <ShieldCheck size={24} color="#4F7EFF" strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Set new password</h1>
            <p className="text-sm text-[#64748B]">
              Choose a strong password to secure your account.
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                New password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 characters"
                  {...register('password')}
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-[#0F172A] placeholder-[#94A3B8] bg-[#F8FAFC] outline-none transition focus:bg-white focus:border-[#4F7EFF] focus:ring-2 focus:ring-[#4F7EFF]/20 ${
                    errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-200/40' : 'border-[#E2E8F0]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= passwordStrength ? strengthColor : '#E2E8F0' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}

              {/* Requirements list */}
              <ul className="mt-2.5 space-y-1">
                {[
                  { ok: password.length >= 8, label: 'At least 8 characters' },
                  { ok: /[A-Z]/.test(password), label: 'One uppercase letter' },
                  { ok: /[0-9]/.test(password), label: 'One number' },
                ].map(({ ok, label }) => (
                  <li key={label} className="flex items-center gap-1.5 text-xs" style={{ color: ok ? '#22C55E' : '#94A3B8' }}>
                    <CheckCircle2 size={11} />
                    {label}
                  </li>
                ))}
              </ul>

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Confirm new password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-[#0F172A] placeholder-[#94A3B8] bg-[#F8FAFC] outline-none transition focus:bg-white focus:border-[#4F7EFF] focus:ring-2 focus:ring-[#4F7EFF]/20 ${
                    errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-200/40' : 'border-[#E2E8F0]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: isLoading ? '#94A3B8' : 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)',
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(79,126,255,0.35)',
              }}
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Resetting password…</>
              ) : (
                'Reset password'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            Remember it now?{' '}
            <Link href="/login" className="font-semibold text-[#4F7EFF] hover:text-[#3b67e8] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
