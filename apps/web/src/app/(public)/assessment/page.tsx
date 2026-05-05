'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check, Video, Phone, Star,
  ArrowRight, Sparkles, Heart, Clock, Mic
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { cn, formatCurrency, getInitials } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const CONCERNS = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues', 'Grief & Loss',
  'Stress Management', 'Self-Esteem', 'OCD', 'Bipolar Disorder', 'ADHD',
  'Eating Disorders', 'Addiction', 'Anger Management', 'Phobias', 'Sleep Issues',
  'Life Transitions', 'Family Conflict', 'Chronic Illness', 'LGBTQ+ Issues',
  'Burnout',
];

const DURATIONS = [
  { value: 'less_than_month', label: 'Less than a month' },
  { value: '1_6_months', label: '1–6 months' },
  { value: '6_months_2_years', label: '6 months – 2 years' },
  { value: 'more_than_2_years', label: 'More than 2 years' },
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'Mandarin', 'Arabic',
  'Portuguese', 'Hindi', 'German', 'Japanese', 'Korean',
];

const TOTAL_STEPS = 7;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssessmentData {
  concerns: string[];
  duration: string;
  hadTherapy: boolean | null;
  sessionPreference: string;
  budget: number;
  genderPreference: string;
  languages: string[];
}

interface TherapistMatch {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  sessionRate: number;
  matchScore: number;
  concerns: string[];
  sessionTypes: string[];
}

const DEFAULT_DATA: AssessmentData = {
  concerns: [],
  duration: '',
  hadTherapy: null,
  sessionPreference: '',
  budget: 150,
  genderPreference: 'Any',
  languages: [],
};

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-teal-600">Step {step} of {TOTAL_STEPS}</span>
        <span className="text-sm text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"
          initial={false}
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              i + 1 < step ? 'bg-teal-500' : i + 1 === step ? 'bg-teal-400 ring-2 ring-teal-200' : 'bg-gray-200',
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step card ─────────────────────────────────────────────────────────────────

function StepWrapper({ children, direction }: { children: React.ReactNode; direction: number }) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={Math.random()}
        custom={direction}
        initial={{ x: direction * 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -direction * 60, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-lg mx-auto"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Therapist Match Card ─────────────────────────────────────────────────────

function MatchCard({ therapist }: { therapist: TherapistMatch }) {
  const name = `${therapist.firstName} ${therapist.lastName}`;
  const initials = getInitials(therapist.firstName, therapist.lastName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all"
    >
      <div className="flex gap-4 mb-4">
        <div className="relative shrink-0">
          {therapist.avatarUrl ? (
            <Image src={therapist.avatarUrl} alt={name} width={56} height={56} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold">
              {initials}
            </div>
          )}
          <div className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {therapist.matchScore}%
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{therapist.title}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium">{therapist.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({therapist.reviewCount})</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-gray-900">{formatCurrency(therapist.sessionRate)}</p>
          <p className="text-xs text-gray-400">/session</p>
        </div>
      </div>

      {/* Match score bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Match score</span>
          <span className="text-teal-600 font-semibold">{therapist.matchScore}% match</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${therapist.matchScore}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/therapists/${therapist.id}?book=consultation`}
          className="flex-1 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium text-center hover:bg-teal-600 transition-colors"
        >
          Book Now
        </Link>
        <Link
          href={`/therapists/${therapist.id}`}
          className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium text-center hover:bg-gray-50 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<AssessmentData>(DEFAULT_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState<TherapistMatch[] | null>(null);

  const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS)); };
  const goPrev = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  const toggleConcern = (c: string) => {
    setData((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(c)
        ? prev.concerns.filter((x) => x !== c)
        : prev.concerns.length < 5 ? [...prev.concerns, c] : prev.concerns,
    }));
  };

  const toggleLanguage = (l: string) => {
    setData((prev) => ({
      ...prev,
      languages: prev.languages.includes(l)
        ? prev.languages.filter((x) => x !== l)
        : [...prev.languages, l],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/assessments', data);
      setMatches(res.data.data.matches ?? []);
    } catch {
      // Fallback mock matches
      setMatches([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading screen
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <Sparkles className="w-16 h-16 text-teal-400" />
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl font-semibold text-gray-800"
          >
            Finding your perfect match...
          </motion.p>
          <p className="text-gray-500 mt-2">Analyzing your preferences and needs</p>
        </div>
      </div>
    );
  }

  // Results page
  if (matches !== null) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-teal-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">We found your matches!</h1>
            <p className="text-gray-500">Based on your preferences, here are your top therapist matches</p>
          </motion.div>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">No exact matches yet. Browse all therapists to find the right fit.</p>
              <Link href="/therapists" className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors">
                Browse Therapists
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((m) => <MatchCard key={m.id} therapist={m} />)}
              <div className="text-center pt-4">
                <Link href="/therapists" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
                  Browse all therapists <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <ProgressBar step={step} />

        <StepWrapper direction={direction}>
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What brings you here?</h2>
              <p className="text-gray-500 mb-6">Select up to 5 concerns that resonate with you</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {CONCERNS.map((c) => {
                  const selected = data.concerns.includes(c);
                  const maxed = data.concerns.length >= 5 && !selected;
                  return (
                    <button
                      key={c}
                      onClick={() => toggleConcern(c)}
                      disabled={maxed}
                      className={cn(
                        'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                        selected
                          ? 'bg-teal-500 text-white border-teal-500'
                          : maxed
                          ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600',
                      )}
                    >
                      {selected && <Check className="inline w-3 h-3 mr-1" />}
                      {c}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mb-6 text-center">{data.concerns.length}/5 selected</p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How long have you been dealing with this?</h2>
              <p className="text-gray-500 mb-6">This helps us find therapists with the right experience</p>
              <div className="space-y-3">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setData((prev) => ({ ...prev, duration: d.value }))}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all',
                      data.duration === d.value
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                    )}
                  >
                    <span className="font-medium text-gray-800">{d.label}</span>
                    {data.duration === d.value && <Check className="w-5 h-5 text-teal-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Have you tried therapy before?</h2>
              <p className="text-gray-500 mb-6">This helps us personalize your experience</p>
              <div className="grid grid-cols-2 gap-4">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => setData((prev) => ({ ...prev, hadTherapy: val }))}
                    className={cn(
                      'flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all',
                      data.hadTherapy === val
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                    )}
                  >
                    <span className="text-4xl">{val ? '✅' : '🌱'}</span>
                    <span className="font-semibold text-gray-800">{val ? 'Yes' : 'No'}</span>
                    <span className="text-xs text-gray-400 text-center">
                      {val ? 'I have experience with therapy' : "It's my first time"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How do you prefer to connect?</h2>
              <p className="text-gray-500 mb-6">Choose your preferred session format</p>
              <div className="space-y-3">
                {[
                  { value: 'video', label: 'Video', sub: 'Face-to-face from anywhere', icon: <Video className="w-6 h-6" /> },
                  { value: 'phone', label: 'Phone', sub: 'Voice-only, extra privacy', icon: <Phone className="w-6 h-6" /> },
                  { value: 'either', label: 'Either', sub: "I'm flexible — show all options", icon: <Mic className="w-6 h-6" /> },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setData((prev) => ({ ...prev, sessionPreference: opt.value }))}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all',
                      data.sessionPreference === opt.value
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                    )}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                      data.sessionPreference === opt.value ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500',
                    )}>
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{opt.label}</p>
                      <p className="text-sm text-gray-500">{opt.sub}</p>
                    </div>
                    {data.sessionPreference === opt.value && <Check className="w-5 h-5 text-teal-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What is your budget per session?</h2>
              <p className="text-gray-500 mb-8">We have therapists at every price point</p>
              <div className="text-center mb-6">
                <motion.p
                  key={data.budget}
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-bold text-teal-600"
                >
                  ${data.budget}
                </motion.p>
                <p className="text-gray-400 text-sm mt-1">per session</p>
              </div>
              <div className="px-4">
                <input
                  type="range"
                  min={50}
                  max={300}
                  step={10}
                  value={data.budget}
                  onChange={(e) => setData((prev) => ({ ...prev, budget: Number(e.target.value) }))}
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>$50</span>
                  <span>$300</span>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2">
                {[80, 120, 200].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setData((prev) => ({ ...prev, budget: amt }))}
                    className={cn(
                      'py-2.5 rounded-xl border text-sm font-medium transition-all',
                      data.budget === amt
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'border-gray-200 text-gray-600 hover:border-teal-300',
                    )}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Therapist gender preference?</h2>
              <p className="text-gray-500 mb-6">Your comfort matters most</p>
              <div className="grid grid-cols-2 gap-3">
                {['Any', 'Male', 'Female', 'Non-binary'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setData((prev) => ({ ...prev, genderPreference: g }))}
                    className={cn(
                      'p-4 rounded-2xl border-2 text-center font-medium transition-all',
                      data.genderPreference === g
                        ? 'border-teal-400 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                    )}
                  >
                    <div className="text-2xl mb-1">
                      {g === 'Any' ? '🌈' : g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🏳️‍🌈'}
                    </div>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Language preference?</h2>
              <p className="text-gray-500 mb-6">We have therapists who speak many languages</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {LANGUAGES.map((l) => {
                  const selected = data.languages.includes(l);
                  return (
                    <button
                      key={l}
                      onClick={() => toggleLanguage(l)}
                      className={cn(
                        'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                        selected
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300',
                      )}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-gray-400 text-center">
                {data.languages.length === 0 ? 'Select all that apply (or skip for any language)' : `${data.languages.join(', ')} selected`}
              </p>
            </div>
          )}
        </StepWrapper>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 max-w-lg mx-auto">
          <button
            onClick={goPrev}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all',
              step === 1 ? 'opacity-0 pointer-events-none' : 'border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < TOTAL_STEPS ? (
            <button
              onClick={goNext}
              disabled={
                (step === 1 && data.concerns.length === 0) ||
                (step === 2 && !data.duration) ||
                (step === 3 && data.hadTherapy === null) ||
                (step === 4 && !data.sessionPreference)
              }
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-200"
            >
              <Sparkles className="w-4 h-4" /> Find My Match
            </button>
          )}
        </div>

        {/* Skip */}
        {step === 7 && (
          <div className="text-center mt-4">
            <button onClick={handleSubmit} className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors">
              Skip & show all therapists
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
