'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, CheckCircle2, MapPin, Video, Phone, Globe, GraduationCap,
  Clock, ChevronLeft, ChevronRight, Calendar, Award, MessageCircle, Heart,
  ThumbsUp, Shield
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import api from '@/lib/api';
import { cn, formatCurrency, getInitials } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Education {
  degree: string;
  institution: string;
  year?: number;
}

interface SessionFormat {
  type: 'Video' | 'Phone' | 'In-Person';
  rate: number;
  durationMinutes: number;
}

interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  concerns: string[];
  therapyTypes: string[];
  sessionFormats: SessionFormat[];
  education: Education[];
  languages: string[];
  location?: string;
  isVerified: boolean;
  bio: string;
  yearsOfExperience: number;
  sessionRate: number;
  consultationRate: number;
}

interface Review {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  content: string;
  createdAt: string;
  helpful: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Props {
  id: string;
  autoOpenBook: boolean;
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(sz, i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200')}
        />
      ))}
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
          <div className="w-28 h-28 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-7 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-40" />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-40 border border-gray-100" />)}
        </div>
        <div className="bg-white rounded-2xl h-96 border border-gray-100" />
      </div>
    </div>
  );
}

// ─── Similar therapist card ───────────────────────────────────────────────────

function SimilarCard({ t }: { t: Therapist }) {
  return (
    <Link href={`/therapists/${t.id}`} className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-teal-100 transition-all">
      <div className="flex gap-3 mb-3">
        {t.avatarUrl ? (
          <Image src={t.avatarUrl} alt={`${t.firstName} ${t.lastName}`} width={48} height={48} className="rounded-full object-cover w-12 h-12" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold">
            {getInitials(t.firstName, t.lastName)}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900 text-sm">{t.firstName} {t.lastName}</p>
          <p className="text-xs text-gray-500">{t.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-600">{t.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-teal-600 font-semibold">{formatCurrency(t.sessionRate)} / session</p>
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TherapistProfileClient({ id, autoOpenBook }: Props) {
  const router = useRouter();
  const bookingRef = useRef<HTMLDivElement>(null);

  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similar, setSimilar] = useState<Therapist[]>([]);
  const [availability, setAvailability] = useState<Record<string, TimeSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);

  // Booking state
  const [selectedFormat, setSelectedFormat] = useState<'Video' | 'Phone'>('Video');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, rRes, aRes] = await Promise.all([
          api.get(`/therapists/${id}`),
          api.get(`/therapists/${id}/reviews`, { params: { page: 1, limit: 5 } }),
          api.get(`/therapists/${id}/availability`),
        ]);
        setTherapist(tRes.data.data);
        setReviews(rRes.data.data.reviews ?? []);
        setReviewTotal(rRes.data.data.total ?? 0);
        setAvailability(aRes.data.data ?? {});

        // Fetch similar (best effort)
        try {
          const sRes = await api.get('/therapists', { params: { limit: 3, sort: 'rating' } });
          setSimilar((sRes.data.data.therapists ?? []).filter((t: Therapist) => t.id !== id));
        } catch { /* ignore */ }
      } catch {
        // Will show error state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (autoOpenBook && bookingRef.current) {
      setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 800);
    }
  }, [autoOpenBook, loading]);

  const loadMoreReviews = async () => {
    const nextPage = reviewPage + 1;
    const res = await api.get(`/therapists/${id}/reviews`, { params: { page: nextPage, limit: 5 } });
    setReviews((prev) => [...prev, ...(res.data.data.reviews ?? [])]);
    setReviewPage(nextPage);
  };

  if (loading) return <ProfileSkeleton />;
  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Therapist not found</h2>
          <Link href="/therapists" className="text-teal-600 hover:underline">Back to directory</Link>
        </div>
      </div>
    );
  }

  const name = `${therapist.firstName} ${therapist.lastName}`;
  const initials = getInitials(therapist.firstName, therapist.lastName);
  const selectedFormatData = therapist.sessionFormats?.find((f) => f.type === selectedFormat);
  const todaySlots = availability[format(selectedDate, 'yyyy-MM-dd')] ?? [];

  // Rating distribution mock
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: star === 5 ? 70 : star === 4 ? 18 : star === 3 ? 7 : star === 2 ? 3 : 2,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to therapists
        </button>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative shrink-0">
              {therapist.avatarUrl ? (
                <Image
                  src={therapist.avatarUrl}
                  alt={name}
                  width={112}
                  height={112}
                  className="w-28 h-28 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-3xl">
                  {initials}
                </div>
              )}
              {therapist.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-teal-500 rounded-full p-1">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
                    {therapist.isVerified && (
                      <span className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 mt-1">{therapist.title}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={therapist.rating} size="md" />
                      <span className="font-semibold text-gray-800">{therapist.rating.toFixed(1)}</span>
                      <span className="text-gray-400 text-sm">({therapist.reviewCount} reviews)</span>
                    </div>
                    {therapist.location && (
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin className="w-4 h-4" />
                        {therapist.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Award className="w-4 h-4 text-teal-400" />
                      {therapist.yearsOfExperience}+ years experience
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(therapist.sessionRate)}</p>
                  <p className="text-sm text-gray-400">per session</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT column */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-teal-500" /> About
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{therapist.bio}</p>
            </motion.section>

            {/* Specialties */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" /> Specialties
              </h2>
              <div className="flex flex-wrap gap-2">
                {therapist.concerns.map((c) => (
                  <span key={c} className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-sm font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </motion.section>

            {/* Therapy types */}
            {therapist.therapyTypes?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Therapy Approaches</h2>
                <div className="grid grid-cols-2 gap-2">
                  {therapist.therapyTypes.map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Session formats */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> Session Options
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(therapist.sessionFormats ?? []).map((fmt) => (
                  <div key={fmt.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      {fmt.type === 'Video' && <Video className="w-4 h-4 text-blue-500" />}
                      {fmt.type === 'Phone' && <Phone className="w-4 h-4 text-green-500" />}
                      {fmt.type === 'In-Person' && <MapPin className="w-4 h-4 text-purple-500" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fmt.type}</p>
                        <p className="text-xs text-gray-400">{fmt.durationMinutes} min</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(fmt.rate)}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Education */}
            {therapist.education?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="bg-white rounded-2xl border border-gray-100 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" /> Education
                </h2>
                <div className="space-y-3">
                  {therapist.education.map((ed, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{ed.degree}</p>
                        <p className="text-sm text-gray-500">{ed.institution}{ed.year ? ` · ${ed.year}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Languages */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-400" /> Languages Spoken
              </h2>
              <div className="flex flex-wrap gap-2">
                {therapist.languages.map((l) => (
                  <span key={l} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-600">
                    {l}
                  </span>
                ))}
              </div>
            </motion.section>

            {/* Reviews */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Client Reviews <span className="text-gray-400 font-normal">({reviewTotal})</span>
              </h2>

              {/* Rating summary */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-5xl font-bold text-gray-900">{therapist.rating.toFixed(1)}</p>
                  <StarRating rating={therapist.rating} size="md" />
                  <p className="text-sm text-gray-400 mt-1">{reviewTotal} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {dist.map((d) => (
                    <div key={d.star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">{d.star}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${d.pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {review.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{review.authorName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <StarRating rating={review.rating} />
                              <span className="text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.content}</p>
                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors">
                          <ThumbsUp className="w-3 h-3" /> Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {reviews.length < reviewTotal && (
                <button
                  onClick={loadMoreReviews}
                  className="w-full mt-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Load more reviews
                </button>
              )}
            </motion.section>
          </div>

          {/* RIGHT column – Booking card */}
          <div className="lg:col-span-1">
            <div ref={bookingRef} className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-500" /> Book a Session
              </h3>

              {/* Session type */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Session type</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['Video', 'Phone'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedFormat(t)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all',
                        selectedFormat === t
                          ? 'border-teal-400 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300',
                      )}
                    >
                      {t === 'Video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date picker */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Select date</p>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {next7Days.map((day) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => { setSelectedDate(day); setSelectedSlot(null); }}
                      className={cn(
                        'flex flex-col items-center min-w-[44px] p-2 rounded-xl border text-xs transition-all shrink-0',
                        isSameDay(day, selectedDate)
                          ? 'border-teal-400 bg-teal-50 text-teal-700 font-semibold'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300',
                      )}
                    >
                      <span className="text-gray-400 text-xs">{format(day, 'EEE')}</span>
                      <span className="font-bold text-base">{format(day, 'd')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div className="mb-5">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Available times</p>
                {todaySlots.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No slots available for this date</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                    {todaySlots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={cn(
                          'py-1.5 rounded-lg text-xs font-medium transition-all',
                          !slot.available
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : selectedSlot === slot.time
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600',
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              {selectedFormatData && (
                <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-4">
                  <span className="text-sm text-gray-600">Session fee</span>
                  <span className="font-bold text-gray-900">{formatCurrency(selectedFormatData.rate)}</span>
                </div>
              )}

              {/* CTA buttons */}
              <Link
                href={selectedSlot ? `/book/${id}?format=${selectedFormat}&date=${format(selectedDate, 'yyyy-MM-dd')}&time=${selectedSlot}` : '#'}
                className={cn(
                  'block w-full py-3 rounded-xl font-semibold text-center text-sm transition-all mb-2',
                  selectedSlot
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none',
                )}
              >
                Book Session
              </Link>
              <Link
                href={`/book/${id}?type=consultation`}
                className="block w-full py-3 rounded-xl font-medium text-center text-sm border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors"
              >
                Free Consultation
              </Link>

              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Secure & confidential
              </p>
            </div>
          </div>
        </div>

        {/* Similar therapists */}
        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Similar Therapists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similar.slice(0, 3).map((t) => <SimilarCard key={t.id} t={t} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
