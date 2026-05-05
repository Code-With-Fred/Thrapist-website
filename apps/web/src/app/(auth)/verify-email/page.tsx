'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, MailCheck } from 'lucide-react';
import api from '@/lib/api';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error';

interface VerifyResponse {
  data: { message?: string };
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('idle');
      return;
    }

    const verify = async () => {
      setStatus('loading');
      try {
        await api.post<VerifyResponse>('/auth/verify-email', { token });
        setStatus('success');
        setTimeout(() => router.push('/login'), 3500);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Verification failed. The link may have expired.';
        setErrorMessage(msg);
        setStatus('error');
      }
    };

    void verify();
  }, [token, router]);

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-[#E2E8F0] p-10 text-center">

          {/* No token — instructions */}
          {status === 'idle' && !token && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, rgba(79,126,255,0.12) 0%, rgba(79,126,255,0.06) 100%)' }}>
                <MailCheck size={38} color="#4F7EFF" strokeWidth={1.6} />
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Verify your email</h1>
              <p className="text-sm text-[#64748B] leading-relaxed mb-6">
                We&apos;ve sent a verification link to your email address. Please check your inbox
                (and spam folder) and click the link to activate your account.
              </p>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 text-sm text-[#64748B] mb-6">
                Didn&apos;t receive the email?{' '}
                <button
                  type="button"
                  className="text-[#4F7EFF] font-medium hover:underline"
                  onClick={async () => {
                    try {
                      await api.post('/auth/resend-verification');
                      setStatus('idle');
                    } catch {
                      /* noop */
                    }
                  }}
                >
                  Resend verification
                </button>
              </div>
              <Link
                href="/login"
                className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                Back to login
              </Link>
            </>
          )}

          {/* Loading */}
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(79,126,255,0.08)' }}>
                <Loader2 size={38} color="#4F7EFF" className="animate-spin" strokeWidth={1.6} />
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Verifying your email…</h1>
              <p className="text-sm text-[#64748B]">Just a moment while we confirm your account.</p>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(34,197,94,0.10)' }}>
                <CheckCircle2 size={42} color="#22C55E" strokeWidth={1.6} />
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Email verified!</h1>
              <p className="text-sm text-[#64748B] mb-6">
                Your account has been successfully verified. You&apos;ll be redirected to login
                shortly.
              </p>
              <div className="w-full bg-[#E2E8F0] rounded-full h-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#22C55E]"
                  style={{ animation: 'progress 3.5s linear forwards' }}
                />
              </div>
              <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
              <p className="mt-4 text-xs text-[#64748B]">Redirecting to login…</p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-medium text-[#4F7EFF] hover:underline"
              >
                Go to login now
              </Link>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(239,68,68,0.10)' }}>
                <XCircle size={42} color="#EF4444" strokeWidth={1.6} />
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Verification failed</h1>
              <p className="text-sm text-[#64748B] mb-6 leading-relaxed">
                {errorMessage}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/signup"
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)', boxShadow: '0 4px 14px rgba(79,126,255,0.35)' }}
                >
                  Create a new account
                </Link>
                <Link
                  href="/login"
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#64748B] text-center border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all duration-200"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
