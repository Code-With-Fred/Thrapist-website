'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Video,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  X,
  RefreshCw,
  AlertCircle,
  Loader2,
  Star,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { format, parseISO, differenceInMinutes, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/lib/api';

/* ------------------------------------------------------------------ types */
type BookingStatus = 'upcoming' | 'past' | 'cancelled';
type SessionType = 'video' | 'audio' | 'chat';

interface Booking {
  id: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  sessionType: SessionType;
  durationMinutes: number;
  cancellationReason?: string;
  reviewLeft?: boolean;
  therapist: {
    id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
    avatarUrl?: string;
  };
}

/* ---------------------------------------------------------------- helpers */
function formatDate(iso: string): string {
  return format(parseISO(iso), 'EEE, MMM d, yyyy · h:mm a');
}

function minutesUntil(iso: string): number {
  return differenceInMinutes(parseISO(iso), new Date());
}

function isJoinable(iso: string): boolean {
  const mins = minutesUntil(iso);
  return mins <= 15 && mins >= -60;
}

const sessionTypeIcon: Record<SessionType, React.ReactNode> = {
  video: <Video size={14} />,
  audio: <Phone size={14} />,
  chat: <MessageSquare size={14} />,
};

const sessionTypeLabel: Record<SessionType, string> = {
  video: 'Video Session',
  audio: 'Audio Session',
  chat: 'Chat Session',
};

/* ---------------------------------------------------------------- sub-components */
function CountdownBadge({ iso }: { iso: string }) {
  const mins = minutesUntil(iso);
  if (mins < 0) return null;
  if (mins <= 15)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Starting soon
      </span>
    );
  if (mins < 60)
    return (
      <span className="text-xs font-medium text-[#64748B]">in {mins} min</span>
    );
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)
    return (
      <span className="text-xs font-medium text-[#64748B]">in {hrs}h {mins % 60}m</span>
    );
  return (
    <span className="text-xs font-medium text-[#64748B]">in {Math.floor(hrs / 24)}d</span>
  );
}

function TherapistAvatar({ booking }: { booking: Booking }) {
  const initials = `${booking.therapist.firstName[0]}${booking.therapist.lastName[0]}`;
  if (booking.therapist.avatarUrl) {
    return (
      <img
        src={booking.therapist.avatarUrl}
        alt={`Dr. ${booking.therapist.firstName} ${booking.therapist.lastName}`}
        className="w-12 h-12 rounded-2xl object-cover shrink-0"
      />
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
    >
      {initials}
    </div>
  );
}

/* ---------------------------------------------------------------- review modal */
interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmitted: () => void;
}

function ReviewModal({ booking, onClose, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      await api.post(`/bookings/${booking.id}/review`, { rating, comment });
      toast.success('Review submitted!');
      onSubmitted();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#0F172A]">Leave a Review</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B]">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-[#64748B] mb-4">
          How was your session with Dr. {booking.therapist.firstName} {booking.therapist.lastName}?
        </p>
        <form onSubmit={(e) => { void handleSubmit(e); }}>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  fill={n <= rating ? '#F59E0B' : 'none'}
                  color={n <= rating ? '#F59E0B' : '#CBD5E1'}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F7EFF]/30 resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- reschedule modal */
interface RescheduleModalProps {
  booking: Booking;
  onClose: () => void;
  onRescheduled: () => void;
}

function RescheduleModal({ booking, onClose, onRescheduled }: RescheduleModalProps) {
  const [datetime, setDatetime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datetime) { toast.error('Please pick a date and time'); return; }
    setLoading(true);
    try {
      await api.patch(`/bookings/${booking.id}/reschedule`, { scheduledAt: new Date(datetime).toISOString() });
      toast.success('Session rescheduled!');
      onRescheduled();
    } catch {
      toast.error('Could not reschedule session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#0F172A]">Reschedule Session</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B]">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-[#64748B] mb-4">
          Select a new date and time for your session with Dr.{' '}
          {booking.therapist.firstName} {booking.therapist.lastName}.
        </p>
        <form onSubmit={(e) => { void handleSubmit(e); }}>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F7EFF]/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirm Reschedule
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================================================================ main page */
export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchBookings = useCallback(async (tab: BookingStatus) => {
    setLoading(true);
    setError('');
    try {
      const statusMap: Record<BookingStatus, string> = {
        upcoming: 'pending,confirmed',
        past: 'completed',
        cancelled: 'cancelled',
      };
      const res = await api.get<{ data: { bookings: Booking[] } }>(
        `/bookings?status=${statusMap[tab]}&limit=50`
      );
      const raw = res.data.data.bookings ?? [];
      const filtered =
        tab === 'upcoming'
          ? raw.filter((b) => !isPast(parseISO(b.scheduledAt)) || isJoinable(b.scheduledAt))
          : raw;
      setBookings(filtered);
    } catch {
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBookings(activeTab);
  }, [activeTab, fetchBookings]);

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Session cancelled');
      void fetchBookings(activeTab);
    } catch {
      toast.error('Could not cancel session');
    } finally {
      setCancellingId(null);
    }
  };

  const tabs: { key: BookingStatus; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const emptyMessages: Record<BookingStatus, { title: string; sub: string }> = {
    upcoming: { title: 'No upcoming sessions', sub: 'Book a session with a therapist to get started.' },
    past: { title: 'No past sessions yet', sub: 'Your completed sessions will appear here.' },
    cancelled: { title: 'No cancelled sessions', sub: 'Any cancelled sessions will appear here.' },
  };

  return (
    <>
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => { setReviewBooking(null); void fetchBookings(activeTab); }}
        />
      )}
      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onRescheduled={() => { setRescheduleBooking(null); void fetchBookings(activeTab); }}
        />
      )}

      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">My Sessions</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Manage your therapy sessions</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#F1F5F9] rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-[#E2E8F0]" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle size={22} color="#EF4444" />
            </div>
            <p className="text-[#0F172A] font-semibold">{error}</p>
            <button
              type="button"
              onClick={() => void fetchBookings(activeTab)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">
              <Calendar size={24} color="#CBD5E1" />
            </div>
            <p className="font-semibold text-[#0F172A]">{emptyMessages[activeTab].title}</p>
            <p className="text-sm text-[#64748B]">{emptyMessages[activeTab].sub}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-md hover:shadow-slate-200/60 transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <TherapistAvatar booking={booking} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-[#0F172A]">
                            Dr. {booking.therapist.firstName} {booking.therapist.lastName}
                          </p>
                          {booking.therapist.specialization && (
                            <p className="text-xs text-[#64748B]">{booking.therapist.specialization}</p>
                          )}
                        </div>
                        {activeTab === 'upcoming' && <CountdownBadge iso={booking.scheduledAt} />}
                        {activeTab === 'past' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                            Completed
                          </span>
                        )}
                        {activeTab === 'cancelled' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                            Cancelled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-[#64748B]">
                          <Calendar size={12} />
                          <span>{formatDate(booking.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#64748B]">
                          <Clock size={12} />
                          <span>{booking.durationMinutes} min</span>
                        </div>
                        <div
                          className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(79,126,255,0.08)', color: '#4F7EFF' }}
                        >
                          {sessionTypeIcon[booking.sessionType]}
                          <span>{sessionTypeLabel[booking.sessionType]}</span>
                        </div>
                      </div>

                      {booking.cancellationReason && activeTab === 'cancelled' && (
                        <p className="text-xs text-[#64748B] mt-2 italic">
                          Reason: {booking.cancellationReason}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                      className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] transition-colors shrink-0"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${expandedId === booking.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Action buttons */}
                  {expandedId === booking.id && (
                    <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex flex-wrap gap-2">
                      {activeTab === 'upcoming' && (
                        <>
                          {isJoinable(booking.scheduledAt) && (
                            <a
                              href={`/session/${booking.id}`}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                              style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
                            >
                              {sessionTypeIcon[booking.sessionType]}
                              Join Session
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setRescheduleBooking(booking)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[#E2E8F0] text-[#64748B] hover:border-[#4F7EFF] hover:text-[#4F7EFF] transition-colors"
                          >
                            <RotateCcw size={14} />
                            Reschedule
                          </button>
                          <button
                            type="button"
                            disabled={cancellingId === booking.id}
                            onClick={() => void handleCancel(booking.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-60"
                          >
                            {cancellingId === booking.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <X size={14} />
                            )}
                            Cancel
                          </button>
                        </>
                      )}

                      {activeTab === 'past' && !booking.reviewLeft && (
                        <button
                          type="button"
                          onClick={() => setReviewBooking(booking)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8FB3 100%)' }}
                        >
                          <Star size={14} />
                          Leave Review
                        </button>
                      )}
                      {activeTab === 'past' && booking.reviewLeft && (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <Star size={12} fill="#16A34A" color="#16A34A" />
                          Review submitted
                        </span>
                      )}

                      {activeTab === 'cancelled' && (
                        <a
                          href={`/therapists/${booking.therapist.id}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #6B94FF 100%)' }}
                        >
                          <RefreshCw size={14} />
                          Book Again
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
