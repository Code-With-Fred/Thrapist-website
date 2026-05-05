import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { default: 'HealMate', template: '%s | HealMate' },
  description: 'Your mental wellness journey starts here.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
      {/* Gradient background layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,126,255,0.18) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 50% at 80% 100%, rgba(255,107,157,0.12) 0%, transparent 60%), ' +
            'radial-gradient(ellipse 50% 40% at 10% 80%, rgba(79,126,255,0.10) 0%, transparent 55%)',
        }}
      />

      {/* Decorative blurred circles */}
      <div
        aria-hidden="true"
        className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4F7EFF 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-100px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF6B9D 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className="relative z-10 mb-8 flex flex-col items-center select-none">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200"
            style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #FF6B9D 100%)' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span
            className="text-2xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #4F7EFF 0%, #FF6B9D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            HealMate
          </span>
        </Link>
      </div>

      {/* Page content */}
      <div className="relative z-10 w-full">{children}</div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-xs text-[#64748B]">
        &copy; {new Date().getFullYear()} HealMate. All rights reserved.
      </p>
    </div>
  );
}
