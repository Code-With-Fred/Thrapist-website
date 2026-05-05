'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Loader2, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import api from '@/lib/api';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setApiError('');
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-[#E2E8F0] p-10 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(79,126,255,0.10)' }}
            >
              <Send size={36} color="#4F7EFF" strokeWidth={1.6} />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Check your inbox</h1>
            <p className="text-sm text-[#64748B] leading-relaxed mb-4">
              We&apos;ve sent a password reset link to{' '}
              <span className="font-semibold text-[#0F172A]">{submittedEmail}</span>. The link
              expires in 30 minutes.
            </p>
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-sm text-[#64748B] mb-8 text-left space-y-1.5">
              <p className="font-medium text-[#0F172A]">Didn&apos;t get the email?</p>
              <p>Check your spam or junk folder.</p>
              <button
                type="button"
                onClick={() => { setIsSuccess(false); setSubmittedEmail(''); }}
                className="text-[#4F7EFF] font-medium hover:underline"
              >
                Try a different email address
              </button>
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              <ArrowLeft size={15} /> Back to login
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
          {/* Back link */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors mb-6"
          >
            <ArrowLeft size={15} /> Back to login
          </Link>

          {/* Icon + Heading */}
          <div className="mb-7">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(79,126,255,0.10)' }}
            >
              <Mail size={24} color="#4F7EFF" strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Forgot password?</h1>
            <p className="text-sm text-[#64748B] leading-relaxed">
              No worries. Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {/* API Error banner */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-[#0F172A] placeholder-[#94A3B8] bg-[#F8FAFC] outline-none transition focus:bg-white focus:border-[#4F7EFF] focus:ring-2 focus:ring-[#4F7EFF]/20 ${
                    errors.email
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-200/40'
                      : 'border-[#E2E8F0]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: isLoading
                  ? '#94A3B8'
                  : 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)',
                boxShadow: isLoading ? 'none' : '0 4px 14px rgba(79,126,255,0.35)',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending reset link…
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            Remember your password?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#4F7EFF] hover:text-[#3b67e8] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
