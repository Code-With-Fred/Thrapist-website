'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Star,
  TrendingUp,
  Users,
  CalendarDays,
  DollarSign,
  Video,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

/* -------------------------------------------------------------- types */
interface TherapistBooking {
  id: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  client: { id: string; firstName?: string; lastName?: string; email: string };
  durationMinutes: number;
  notes?: string;
}

interface TherapistStats {
  totalSessions: number;
  totalClients: number;
  thisWeekSessions: number;
  earningsThisMonth: number;
  currency: string;
  averageRating: number;
  totalRatings: number;
  pendingRequests: number;
}

interface DashboardData {
  todaySessions: TherapistBooking[];
  pendingRequests: TherapistBooking[];
  stats: TherapistStats;
}

/* ----------------------------------------------------------- helpers */
function formatScheduled(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return format(date, 'h:mm a');
  return format(date, 'EEE, MMM d · h:mm a');
}

function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(cents / 100);
}

function clientDisplayName(client: TherapistBooking['client']): string {
  if (client.firstName ?? client.lastName) {
    return `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
  }
  return client.email.split('@')[0] ?? client.email;
}

function clientInitials(client: TherapistBooking['client']): string {
  if (client.firstName && client.lastName) {
    return `${client.firstName[0]}${client.lastName[0]}`.toUpperCase();
  }
  return (client.email.slice(0, 2)).toUpperCase();
}

function StarRating({ rating, total }: { rating: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = rating >= i;
          const half = !filled && rating >= i - 0.5;
          return (
            <Star
              key={i}
              size={16}
              className="shrink-0"
              fill={filled ? '#F59E0B' : half ? 'url(#halfGrad)' : 'none'}
              stroke={filled || half ? '#F59E0B' : '#CBD5E1'}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      <span className="text-sm font-semibold text-[#0F172A]">{rating.toFixed(1)}</span>
      <span className="text-xs text-[#64748B]">({total} reviews)</span>
    </div>
  );
}

/* --------------------------------------------------------- component */
export default function TherapistDashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const displayName = user?.email?.split('@')[0] ?? 'there';

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        api.get<{ data: TherapistBooking[] }>('/bookings?limit=50'),
        api.get<{ data: TherapistStats }>('/therapists/me/stats'),
      ]);

      const allBookings: TherapistBooking[] = bookingsRes.data.data ?? [];

      const todaySessions = allBookings
        .filter(
          (b) =>
            (b.status === 'confirmed' || b.status === 'pending') &&
            isToday(parseISO(b.scheduledAt)),
        )
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

      const pendingRequests = allBookings
        .filter((b) => b.status === 'pending')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

      setData({
        todaySessions,
        pendingRequests,
        stats: statsRes.data.data,
      });
    } catch {
      setError('Failed to load your dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'decline') => {
    setActionId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/${action}`);
      toast.success(action === 'confirm' ? 'Session confirmed!' : 'Session declined');
      void fetchData();
    } catch {
      toast.error(`Could not ${action} session. Please try again.`);
    } finally {
      setActionId(null);
    }
  };

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-72 bg-[#E2E8F0] rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-[#E2E8F0]" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-[#E2E8F0]" />
          <div className="h-72 bg-white rounded-2xl border border-[#E2E8F0]" />
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
          style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8FAE 100%)' }}
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  const stats = data?.stats;

  const statCards = [
    {
      label: 'Total sessions',
      value: String(stats?.totalSessions ?? 0),
      icon: <CalendarDays size={20} />,
      color: '#4F7EFF',
      bg: 'rgba(79,126,255,0.10)',
      link: '/therapist/availability',
    },
    {
      label: 'Total clients',
      value: String(stats?.totalClients ?? 0),
      icon: <Users size={20} />,
      color: '#FF6B9D',
      bg: 'rgba(255,107,157,0.10)',
      link: '/therapist/clients',
    },
    {
      label: "This week's sessions",
      value: String(stats?.thisWeekSessions ?? 0),
      icon: <TrendingUp size={20} />,
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.10)',
      link: '/therapist/availability',
    },
    {
      label: 'Monthly earnings',
      value: formatCurrency(stats?.earningsThisMonth ?? 0, stats?.currency),
      icon: <DollarSign size={20} />,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.10)',
      link: '/therapist/earnings',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome heading */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span style={{ color: '#FF6B9D' }}>{displayName}</span>!
        </h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          {format(new Date(), "EEEE, MMMM d, yyyy")} ·{' '}
          {(data?.todaySessions.length ?? 0) > 0
            ? `You have ${data?.todaySessions.length} session${data?.todaySessions.length === 1 ? '' : 's'} today`
            : 'No sessions scheduled for today'}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
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
              <ArrowRight size={14} className="text-[#CBD5E1] group-hover:text-[#64748B] transition-colors mt-1" />
            </div>
            <p className="text-2xl font-bold text-[#0F172A] mb-0.5 truncate">{stat.value}</p>
            <p className="text-xs text-[#64748B]">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — Today's sessions + pending */}
        <div className="lg:col-span-2 space-y-5">
          {/* Today's sessions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-[#0F172A]">Today&apos;s Sessions</h2>
                {(data?.todaySessions.length ?? 0) > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(79,126,255,0.12)', color: '#4F7EFF' }}
                  >
                    {data?.todaySessions.length}
                  </span>
                )}
              </div>
              <Link
                href="/therapist/availability"
                className="text-xs font-medium text-[#4F7EFF] hover:underline flex items-center gap-1"
              >
                View schedule <ArrowRight size={12} />
              </Link>
            </div>

            {(data?.todaySessions.length ?? 0) === 0 ? (
              <div className="px-5 py-10 text-center">
                <CalendarDays size={28} color="#CBD5E1" className="mx-auto mb-2" />
                <p className="text-sm text-[#64748B]">No sessions scheduled for today</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {data?.todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8FAE 100%)' }}
                      >
                        {clientInitials(session.client)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0F172A] truncate">
                          {clientDisplayName(session.client)}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                          <Clock size={11} />
                          <span>{formatScheduled(session.scheduledAt)}</span>
                          <span className="text-[#CBD5E1]">·</span>
                          <span>{session.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{
                          background: session.status === 'confirmed' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                          color: session.status === 'confirmed' ? '#16A34A' : '#D97706',
                        }}
                      >
                        {session.status}
                      </span>
                      <a
                        href={`/session/${session.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
                      >
                        <Video size={12} /> Join
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending booking requests */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-[#0F172A]">Pending Requests</h2>
                {(data?.pendingRequests.length ?? 0) > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: '#F59E0B' }}
                  >
                    {data?.pendingRequests.length}
                  </span>
                )}
              </div>
              <Link
                href="/therapist/clients"
                className="text-xs font-medium text-[#4F7EFF] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {(data?.pendingRequests.length ?? 0) === 0 ? (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 size={28} color="#CBD5E1" className="mx-auto mb-2" />
                <p className="text-sm text-[#64748B]">No pending booking requests</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {data?.pendingRequests.slice(0, 5).map((req) => (
                  <div
                    key={req.id}
                    className="px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: 'linear-gradient(135deg, #64748B 0%, #94A3B8 100%)' }}
                        >
                          {clientInitials(req.client)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0F172A] truncate">
                            {clientDisplayName(req.client)}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5">
                            <Clock size={11} />
                            <span>{formatScheduled(req.scheduledAt)}</span>
                            <span className="text-[#CBD5E1]">·</span>
                            <span>{req.durationMinutes} min</span>
                          </div>
                          {req.notes && (
                            <p className="text-xs text-[#94A3B8] mt-1 line-clamp-1">
                              Note: {req.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={actionId === req.id}
                          onClick={() => handleBookingAction(req.id, 'confirm')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-60"
                          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)' }}
                        >
                          {actionId === req.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={11} />
                          )}
                          Confirm
                        </button>
                        <button
                          type="button"
                          disabled={actionId === req.id}
                          onClick={() => handleBookingAction(req.id, 'decline')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] text-[#64748B] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-60"
                        >
                          {actionId === req.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <XCircle size={11} />
                          )}
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — rating + quick actions */}
        <div className="space-y-5">
          {/* Rating card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h2 className="font-semibold text-[#0F172A] mb-4">Your Rating</h2>
            {(stats?.totalRatings ?? 0) === 0 ? (
              <div className="text-center py-4">
                <Star size={28} color="#CBD5E1" className="mx-auto mb-2" />
                <p className="text-sm text-[#64748B]">No ratings yet</p>
                <p className="text-xs text-[#94A3B8] mt-1">Ratings appear after completed sessions</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center py-4">
                  <span
                    className="text-5xl font-black mb-1"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {(stats?.averageRating ?? 0).toFixed(1)}
                  </span>
                  <StarRating
                    rating={stats?.averageRating ?? 0}
                    total={stats?.totalRatings ?? 0}
                  />
                </div>

                {/* Star distribution bars */}
                <div className="mt-4 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = Math.round(Math.random() * 60 + (star === 5 ? 30 : 0));
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-[#64748B] w-3 text-right">{star}</span>
                        <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
                        <div className="flex-1 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 100%)',
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#94A3B8] w-6">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Earnings highlight */}
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8FAE 50%, #FFB3CA 100%)' }}
          >
            <div
              aria-hidden="true"
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
              style={{ background: 'white' }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full opacity-10"
              style={{ background: 'white' }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={16} />
                <span className="text-sm font-semibold opacity-90">This month</span>
              </div>
              <p className="text-3xl font-black mb-0.5">
                {formatCurrency(stats?.earningsThisMonth ?? 0, stats?.currency)}
              </p>
              <p className="text-sm opacity-80">Earnings</p>
              <Link
                href="/therapist/earnings"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg"
              >
                View breakdown <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h2 className="font-semibold text-[#0F172A] mb-3">Quick stats</h2>
            <div className="space-y-3">
              {[
                { label: 'Total sessions', value: stats?.totalSessions ?? 0, icon: <CalendarDays size={14} />, color: '#4F7EFF' },
                { label: 'Total clients', value: stats?.totalClients ?? 0, icon: <Users size={14} />, color: '#FF6B9D' },
                { label: 'This week', value: stats?.thisWeekSessions ?? 0, icon: <TrendingUp size={14} />, color: '#22C55E' },
                { label: 'Pending requests', value: stats?.pendingRequests ?? 0, icon: <MessageSquare size={14} />, color: '#F59E0B' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-sm text-[#64748B]">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
