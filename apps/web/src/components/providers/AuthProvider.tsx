'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    // Only validate session if we have a stored token — avoids calling /users/me on public pages
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const initAuth = async () => {
      try {
        const response = await api.get('/users/me');
        const data = response.data as { data: { id: string; email: string; role: 'client' | 'therapist' | 'admin'; isVerified: boolean } };
        setUser(data.data);
      } catch {
        logout();
      }
    };
    initAuth();
  }, [setUser, logout]);

  return <>{children}</>;
}
