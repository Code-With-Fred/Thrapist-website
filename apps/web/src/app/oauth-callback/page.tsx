'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]!) : null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    const token = getCookie('oauthToken');

    if (!token) {
      toast.error('Google sign-in failed. Please try again.');
      router.push('/login?error=oauth');
      return;
    }

    try {
      // Decode JWT payload (base64url → base64 → JSON)
      const base64 = token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64)) as {
        userId: string;
        email: string;
        role: 'client' | 'therapist' | 'admin';
      };

      setAccessToken(token);
      setUser({ id: payload.userId, email: payload.email, role: payload.role, isVerified: true });

      // Clear the short-lived cookie immediately
      deleteCookie('oauthToken');

      toast.success('Signed in with Google!');

      if (payload.role === 'therapist') router.push('/therapist');
      else if (payload.role === 'admin') router.push('/admin');
      else router.push('/client');
    } catch {
      toast.error('Google sign-in failed. Please try again.');
      router.push('/login?error=oauth');
    }
  }, [router, setUser, setAccessToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-5">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-text-primary font-semibold text-lg">Completing sign in…</p>
        <p className="text-text-secondary text-sm mt-1">Connecting your Google account</p>
      </div>
    </div>
  );
}
