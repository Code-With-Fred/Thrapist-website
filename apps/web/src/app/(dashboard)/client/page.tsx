'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Wallet,
  MessageSquare,
  Video,
  X,
  Search,
  Plus,
  Bell,
  ArrowRight,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

/* ------------------------------------------------------------------ types */
interface Booking {
  id: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  therapist: { id: string; firstName: string; lastName: string; specialization?: string };
  durationMinutes: number;
}

interface WalletData {
  balance: number;
  currency: string;
}

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'booking' | 'message' | 'system';
}

interface DashboardData {
  upcomingBookings: Booking[];
  totalSessions: number;
  wallet: WalletData;
  unreadMessages: number;
  notifications: Notification[];
}

/* --------------------------------------------------------------- helpers */
function formatScheduled(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
  if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
  return format(date, 'EEE, MMM d · h:mm a');
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount / 100);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const notificationIcon: Record<string, React.ReactNode> = {
  booking: <CalendarDays size={14} />,
  message: <MessageSquare size={14} />,
  system: <Bell size={14} />,
};

/* ---------------------------------------------------------------- component */
export default function ClientDashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const firstName = user?.email?.split('@')[0] ?? 'there';

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [bookingsRes, walletRes, notifRes] = await Promise.all([
        api.get<{ data: { bookings: Booking[]; total: number } }>('/bookings?status=confirmed,pending&limit=10'),
        api.get<{ data: WalletData }>('/wallet'),
        api.get<{ data: { notifications: Notification[]; unreadMessages: number } }>('/notifications?limit=8'),
      ]);

      const allBookings: Booking[] = bookingsRes.data.data.bookings ?? [];
      const upcoming = allBookings
        .filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

      const totalRes = await api.get<{ data: { total: number } }>('/bookings?status=completed');
      const totalSessions: number = totalRes.data.data.total ?? 0;

      setData({
        upcomingBookings: upcoming,
        totalSessions,
        wallet: walletRes.data.data,
        unreadMessages: notifRes.data.data.unreadMessages ?? 0,
        notifications: notifRes.data.data.notifications ?? [],
      });
    } catch {
      setError('Failed to load your dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Session cancelled');
      void fetchData();
    } catch {
      toast.error('Could not cancel session. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-[#E2E8F0] rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-[#E2E8F0]" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white rounded-2xl border border-[#E2E8F0]" />
          <div className="h-64 bg-white rounded-2xl border border-[#E2E8F0]" />
        </div>
      </div>
    );
  }

  /* Error state */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle size={28} color="#EF4444" />
        </div>
        <p className="text-[#0F172A] font-semibold">{error}</p>
        <button
          type="button"
          onClick={() => void fetchData()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  const nextSession = data?.upcomingBookings[0];

  const stats = [
    {
      label: 'Upcoming sessions',
      value: String(data?.upcomingBookings.length ?? 0),
      icon: <CalendarDays size={20} />,
      color: '#4F7EFF',
      bg: 'rgba(79,126,255,0.10)',
      link: '/client/sessions',
    },
    {
      label: 'Wallet balance',
      value: formatCurrency(data?.wallet.balance ?? 0, data?.wallet.currency),
      icon: <Wallet size={20} />,
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.10)',
      link: '/client/wallet',
    },
    {
      label: 'Total sessions',
      value: String(data?.totalSessions ?? 0),
      icon: <TrendingUp size={20} />,
      color: '#FF6B9D',
      bg: 'rgba(255,107,157,0.10)',
      link: '/client/sessions',
    },
    {
      label: 'Unread messages',
      value: String(data?.unreadMessages ?? 0),
      icon: <MessageSquare size={20} />,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.10)',
      link: '/client/messages',
    },
  ];

  const quickActions = [
    { label: 'Find Therapist', icon: <Search size={18} />, href: '/therapists', color: '#4F7EFF' },
    { label: 'Top up Wallet', icon: <Plus size={18} />, href: '/client/wallet', color: '#22C55E' },
    { label: 'View Messages', icon: <MessageSquare size={18} />, href: '/client/messages', color: '#FF6B9D' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome heading */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Welcome back, <span style={{ color: '#4F7EFF' }}>{firstName}</span>!
        </h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          {format(new Date(), "EEEE, MMMM d, yyyy")} · Here&apos;s your wellness overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.link}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-4 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: stat.bg, color: stat.color }}
              >
                {stat.icon}
              </div>
              <ArrowRight
                size={14}
                className="text-[#CBD5E1] group-hover:text-[#64748B] transition-colors mt-1"
              />
            </div>
            <p className="text-2xl font-bold text-[#0F172A] mb-0.5">{stat.value}</p>
            <p className="text-xs text-[#64748B]">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — next session + quick actions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Next session */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="font-semibold text-[#0F172A]">Next Session</h2>
              <Link
                href="/client/sessions"
                className="text-xs font-medium text-[#4F7EFF] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-5">
              {nextSession ? (
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(79,126,255,0.06) 0%, rgba(79,126,255,0.02) 100%)',
                    borderColor: 'rgba(79,126,255,0.20)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
                      >
                        {nextSession.therapist.firstName[0]}{nextSession.therapist.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F172A]">
                          Dr. {nextSession.therapist.firstName} {nextSession.therapist.lastName}
                        </p>
                        {nextSession.therapist.specialization && (
                          <p className="text-xs text-[#64748B]">{nextSession.therapist.specialization}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#4F7EFF]">
                          <Clock size={11} />
                          <span>{formatScheduled(nextSession.scheduledAt)}</span>
                          <span className="text-[#CBD5E1]">·</span>
                          <span>{nextSession.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize shrink-0"
                      style={{
                        background: nextSession.status === 'confirmed' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                        color: nextSession.status === 'confirmed' ? '#16A34A' : '#D97706',
                      }}
                    >
                      {nextSession.status}
                    </span>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <a
                      href={`/session/${nextSession.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                      style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)', boxShadow: '0 3px 10px rgba(79,126,255,0.30)' }}
                    >
                      <Video size={15} /> Join session
                    </a>
                    <button
                      type="button"
                      disabled={cancellingId === nextSession.id}
                      onClick={() => handleCancel(nextSession.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200 disabled:opacity-60"
                    >
                      {cancellingId === nextSession.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-3">
                    <CalendarDays size={24} color="#CBD5E1" />
                  </div>
                  <p className="font-medium text-[#0F172A] mb-1">No upcoming sessions</p>
                  <p className="text-sm text-[#64748B] mb-4">Book a session with a therapist to get started</p>
                  <Link
                    href="/therapists"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
                  >
                    <Search size={14} /> Find a therapist
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h2 className="font-semibold text-[#0F172A] mb-4">Quick actions</h2>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E2E8F0] hover:border-current hover:shadow-sm transition-all duration-200 group text-center"
                  style={{ '--accent': action.color } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = action.color;
                    (e.currentTarget as HTMLAnchorElement).style.background = `${action.color}08`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E2E8F0';
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${action.color}15`, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium text-[#0F172A]">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* More upcoming sessions */}
          {(data?.upcomingBookings.length ?? 0) > 1 && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#0F172A]">Upcoming sessions</h2>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {data?.upcomingBookings.slice(1, 4).map((booking) => (
                  <div key={booking.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
                      >
                        {booking.therapist.firstName[0]}{booking.therapist.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">
                          Dr. {booking.therapist.firstName} {booking.therapist.lastName}
                        </p>
                        <p className="text-xs text-[#64748B]">{formatScheduled(booking.scheduledAt)}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: booking.status === 'confirmed' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                        color: booking.status === 'confirmed' ? '#16A34A' : '#D97706',
                      }}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — activity feed */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="font-semibold text-[#0F172A]">Recent activity</h2>
              {(data?.unreadMessages ?? 0) > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#FF6B9D' }}>
                  {data?.unreadMessages}
                </span>
              )}
            </div>

            {(data?.notifications.length ?? 0) === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell size={28} color="#CBD5E1" className="mx-auto mb-2" />
                <p className="text-sm text-[#64748B]">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {data?.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-5 py-3.5 flex gap-3 hover:bg-[#F8FAFC] transition-colors ${!notif.isRead ? 'bg-[#4F7EFF]/[0.03]' : ''}`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: notif.type === 'booking' ? 'rgba(79,126,255,0.10)' : notif.type === 'message' ? 'rgba(255,107,157,0.10)' : 'rgba(100,116,139,0.10)',
                        color: notif.type === 'booking' ? '#4F7EFF' : notif.type === 'message' ? '#FF6B9D' : '#64748B',
                      }}
                    >
                      {notificationIcon[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!notif.isRead ? 'text-[#0F172A] font-medium' : 'text-[#64748B]'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{timeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: '#4F7EFF' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
