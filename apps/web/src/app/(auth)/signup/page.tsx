'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  Heart,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Role = 'client' | 'therapist';

const signupSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[0-9]/, 'Must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupResponse {
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: 'client' | 'therapist' | 'admin';
      isVerified: boolean;
    };
    message?: string;
  };
}

const roleCards: { role: Role; label: string; description: string; icon: React.ReactNode; gradient: string; accent: string }[] = [
  {
    role: 'client',
    label: 'I want therapy',
    description: 'Find the right therapist and start your mental wellness journey today.',
    icon: <Heart size={36} strokeWidth={1.8} />,
    gradient: 'linear-gradient(135deg, rgba(79,126,255,0.12) 0%, rgba(79,126,255,0.04) 100%)',
    accent: '#4F7EFF',
  },
  {
    role: 'therapist',
    label: 'I am a therapist',
    description: 'Join our platform to connect with clients and grow your practice.',
    icon: <Briefcase size={36} strokeWidth={1.8} />,
    gradient: 'linear-gradient(135deg, rgba(255,107,157,0.12) 0%, rgba(255,107,157,0.04) 100%)',
    accent: '#FF6B9D',
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { acceptTerms: false },
  });

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

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const onSubmit = async (data: SignupFormData) => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      const res = await api.post<SignupResponse>('/auth/signup', {
        email: data.email,
        password: data.password,
        role: selectedRole,
      });
      const { accessToken, user } = res.data.data;
      setAccessToken(accessToken);
      setUser(user);
      toast.success('Account created! Please verify your email.');
      router.push('/verify-email');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/google?role=${selectedRole ?? 'client'}`;

  return (
    <div className="flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-[#E2E8F0] p-8">

          {/* Step 1 — Role selection */}
          {step === 1 && (
            <>
              <div className="mb-7 text-center">
                <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Create your account</h1>
                <p className="text-sm text-[#64748B]">How would you like to use HealMate?</p>
              </div>

              <div className="space-y-4">
                {roleCards.map(({ role, label, description, icon, gradient, accent }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className="w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 group relative overflow-hidden"
                    style={{
                      borderColor: selectedRole === role ? accent : '#E2E8F0',
                      background: gradient,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = accent;
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${accent}22`;
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = selectedRole === role ? accent : '#E2E8F0';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                        style={{ color: accent, background: `${accent}15` }}
                      >
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[#0F172A] text-base">{label}</p>
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                            style={{
                              borderColor: accent,
                              background: selectedRole === role ? accent : 'transparent',
                            }}
                          >
                            {selectedRole === role && (
                              <CheckCircle2 size={12} color="white" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-[#64748B] mt-1 leading-snug">{description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-xs text-[#64748B] font-medium">or</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              <a
                href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'}/auth/google?role=client`}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-sm font-medium text-[#0F172A] transition-all duration-200 hover:border-[#4F7EFF]/40 hover:shadow-sm"
              >
                <GoogleIcon />
                Continue with Google as Client
              </a>

              <p className="mt-6 text-center text-sm text-[#64748B]">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[#4F7EFF] hover:text-[#3b67e8] transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}

          {/* Step 2 — Credentials form */}
          {step === 2 && (
            <>
              <div className="mb-7">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors mb-4"
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      color: selectedRole === 'therapist' ? '#FF6B9D' : '#4F7EFF',
                      background: selectedRole === 'therapist' ? '#FF6B9D15' : '#4F7EFF15',
                    }}
                  >
                    {selectedRole === 'therapist' ? <Briefcase size={20} /> : <Heart size={20} />}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-[#0F172A]">Create your account</h1>
                    <p className="text-xs text-[#64748B] capitalize">Joining as {selectedRole}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                {/* Email */}
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
                        errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-200/40' : 'border-[#E2E8F0]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Password
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
                            style={{
                              background: i <= passwordStrength ? strengthColor : '#E2E8F0',
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: strengthColor }}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
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

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] text-[#4F7EFF] cursor-pointer accent-[#4F7EFF]"
                    />
                    <span className="text-sm text-[#64748B] leading-snug">
                      I agree to HealMate&apos;s{' '}
                      <Link href="/terms" className="text-[#4F7EFF] hover:underline font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-[#4F7EFF] hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.acceptTerms.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
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
                      <Loader2 size={16} className="animate-spin" /> Creating account…
                    </>
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-xs text-[#64748B] font-medium">or</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              <a
                href={googleAuthUrl}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-sm font-medium text-[#0F172A] transition-all duration-200 hover:border-[#4F7EFF]/40 hover:shadow-sm"
              >
                <GoogleIcon />
                Sign up as {selectedRole === 'therapist' ? 'Therapist' : 'Client'} with Google
              </a>

              <p className="mt-5 text-center text-sm text-[#64748B]">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[#4F7EFF] hover:text-[#3b67e8] transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
