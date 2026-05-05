'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface SessionData { roomUrl: string; token: string; booking: { scheduledAt: string; durationMinutes: number; sessionType: string; therapistProfile?: { firstName: string; lastName: string } } }

export default function SessionPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startSession = async () => {
      try {
        const r = await api.post(`/sessions/${bookingId}/start`);
        const d = r.data as { data: SessionData };
        setSessionData(d.data);
      } catch (err) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message ?? 'Failed to start session');
        toast.error('Failed to join session');
      } finally {
        setLoading(false);
      }
    };
    startSession();
  }, [bookingId]);

  const endSession = async () => {
    try {
      await api.post(`/sessions/${bookingId}/end`);
      toast.success('Session ended');
      router.push('/client/sessions');
    } catch {
      router.push('/client/sessions');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">Setting up your session...</p>
        <p className="text-slate-400 text-sm mt-2">This will only take a moment</p>
      </div>
    </div>
  );

  if (error) {
    const isNotConfigured = error.toLowerCase().includes('not configured');
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Unable to Join Session</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          {isNotConfigured && (
            <p className="text-slate-500 text-sm mb-6 bg-slate-800 rounded-xl px-4 py-3">
              To enable video sessions, add your <strong className="text-slate-300">DAILY_API_KEY</strong> to the API <code className="text-primary">.env</code> file. Get a free key at <strong className="text-slate-300">daily.co</strong>.
            </p>
          )}
          <button onClick={() => router.push('/client/sessions')} className="flex items-center gap-2 mx-auto bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  const therapistName = sessionData?.booking.therapistProfile
    ? `${sessionData.booking.therapistProfile.firstName} ${sessionData.booking.therapistProfile.lastName}`
    : 'Your Therapist';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${sessionData?.booking.sessionType === 'video' ? 'bg-primary' : 'bg-success'}`}>
            {sessionData?.booking.sessionType === 'video' ? <Video className="w-4 h-4 text-white" /> : <Phone className="w-4 h-4 text-white" />}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Session with {therapistName}</p>
            <p className="text-slate-400 text-xs">{sessionData?.booking.durationMinutes} min · {sessionData?.booking.sessionType}</p>
          </div>
        </div>
        <button onClick={endSession} className="px-4 py-2 bg-error text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">End Session</button>
      </div>

      {/* Daily.co iframe */}
      <div className="flex-1">
        {sessionData?.roomUrl && (
          <iframe
            src={`${sessionData.roomUrl}?t=${sessionData.token}`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
            style={{ minHeight: 'calc(100vh - 70px)' }}
            title="Video Session"
          />
        )}
      </div>
    </div>
  );
}
