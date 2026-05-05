'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronLeft, ChevronRight, Plus, Trash2, Upload,
  User, GraduationCap, Heart, DollarSign, ClipboardCheck, Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const CONCERNS = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues', 'Grief & Loss',
  'Stress Management', 'Self-Esteem', 'OCD', 'Bipolar Disorder', 'ADHD',
  'Eating Disorders', 'Addiction', 'Anger Management', 'Phobias', 'Sleep Issues',
  'Life Transitions', 'Family Conflict', 'LGBTQ+ Issues', 'Burnout', 'Parenting',
];

const THERAPY_TYPES = [
  'Cognitive Behavioral Therapy (CBT)', 'EMDR', 'Dialectical Behavior Therapy (DBT)',
  'Psychodynamic Therapy', 'Mindfulness-Based Therapy', 'Acceptance & Commitment Therapy (ACT)',
  'Family Systems Therapy', 'Solution-Focused Therapy', 'Narrative Therapy', 'Gestalt Therapy',
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'Mandarin', 'Cantonese', 'Arabic',
  'Portuguese', 'Hindi', 'German', 'Korean', 'Japanese', 'Italian',
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu', 'Europe/London',
  'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
];

const LICENSE_TYPES = [
  'LCSW – Licensed Clinical Social Worker',
  'LPC – Licensed Professional Counselor',
  'LMFT – Licensed Marriage and Family Therapist',
  'PhD – Doctor of Philosophy (Psychology)',
  'PsyD – Doctor of Psychology',
  'LMHC – Licensed Mental Health Counselor',
  'MD – Psychiatrist',
  'Other',
];

const TOTAL_STEPS = 5;

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  // Step 1
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  // Step 2
  licenseType: z.string().min(1, 'License type is required'),
  licenseNumber: z.string().min(3, 'License number is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  yearsOfExperience: z.number().min(0).max(50),
  education: z.array(z.object({
    degree: z.string().min(2),
    institution: z.string().min(2),
    year: z.string().optional(),
  })).min(1, 'At least one education entry is required'),
  // Step 3
  concerns: z.array(z.string()).min(1, 'Select at least one specialty'),
  therapyTypes: z.array(z.string()).min(1, 'Select at least one therapy type'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  sessionTypes: z.array(z.string()).min(1, 'Select at least one session type'),
  timezone: z.string().min(1, 'Timezone is required'),
  // Step 4
  sessionRate: z.number().min(10, 'Session rate must be at least $10'),
  consultationRate: z.number().min(0),
  bio: z.string().min(100, 'Bio must be at least 100 characters').max(2000),
});

type FormData = z.infer<typeof schema>;

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { icon: User, label: 'Personal' },
  { icon: GraduationCap, label: 'Credentials' },
  { icon: Heart, label: 'Specialties' },
  { icon: DollarSign, label: 'Rates' },
  { icon: ClipboardCheck, label: 'Review' },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between mb-10 relative">
      <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 z-0" />
      <div
        className="absolute left-0 top-5 h-0.5 bg-teal-400 z-0 transition-all duration-500"
        style={{ width: `${((current - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
      />
      {STEPS.map((s, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex flex-col items-center gap-1.5 z-10">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
              done ? 'bg-teal-500 border-teal-500 text-white' :
              active ? 'bg-white border-teal-400 text-teal-600 shadow-lg shadow-teal-100' :
              'bg-white border-gray-200 text-gray-400',
            )}>
              {done ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className={cn('text-xs font-medium hidden sm:block', active ? 'text-teal-600' : done ? 'text-gray-500' : 'text-gray-300')}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Toggle multi-select helper ───────────────────────────────────────────────

function MultiChipSelect({
  options, selected, onChange, maxSelect,
}: {
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
  maxSelect?: number;
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((x) => x !== val));
    } else if (!maxSelect || selected.length < maxSelect) {
      onChange([...selected, val]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const sel = selected.includes(o);
        const maxed = maxSelect && selected.length >= maxSelect && !sel;
        return (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            disabled={!!maxed}
            className={cn(
              'px-3 py-1.5 rounded-full border text-sm transition-all',
              sel ? 'bg-teal-500 text-white border-teal-500' :
              maxed ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' :
              'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600',
            )}
          >
            {sel && <Check className="inline w-3 h-3 mr-1" />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

// ─── Form field wrapper ───────────────────────────────────────────────────────

function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all';

// ─── Main component ───────────────────────────────────────────────────────────

export default function JoinAsTherapistPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      yearsOfExperience: 1,
      education: [{ degree: '', institution: '', year: '' }],
      concerns: [],
      therapyTypes: [],
      languages: ['English'],
      sessionTypes: [],
      sessionRate: 120,
      consultationRate: 0,
      country: 'United States',
    },
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: 'education',
  });

  const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS)); };
  const goPrev = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/signup', {
        ...data,
        role: 'therapist',
        sessionRate: data.sessionRate * 100,
        consultationRate: data.consultationRate * 100,
      });
      setSubmitted(true);
    } catch {
      // Handle error
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-teal-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Thank you for applying to join HealMate. Our team will review your application and credentials within 2–3 business days.
            You&apos;ll receive an email at <strong>{getValues('email')}</strong> with next steps.
          </p>
          <div className="bg-teal-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <p className="text-sm font-medium text-teal-800">What happens next:</p>
            {['Application review (1–2 days)', 'Credential verification (1–2 days)', 'Profile setup & onboarding', 'Start seeing clients!'].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-teal-700">
                <div className="w-5 h-5 rounded-full bg-teal-200 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                {s}
              </div>
            ))}
          </div>
          <a href="/" className="block w-full py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors text-sm">
            Back to Home
          </a>
        </motion.div>
      </div>
    );
  }

  const values = getValues();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> Join our network of therapists
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Apply as a Therapist</h1>
          <p className="text-gray-500 mt-2">Help people heal while building your practice</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8">
          <StepIndicator current={step} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ x: direction * 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -direction * 50, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* ── Step 1: Personal Info ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First Name" error={errors.firstName?.message} required>
                        <input {...register('firstName')} className={inputCls} placeholder="Jane" />
                      </Field>
                      <Field label="Last Name" error={errors.lastName?.message} required>
                        <input {...register('lastName')} className={inputCls} placeholder="Smith" />
                      </Field>
                    </div>
                    <Field label="Email Address" error={errors.email?.message} required>
                      <input {...register('email')} type="email" className={inputCls} placeholder="jane@example.com" />
                    </Field>
                    <Field label="Phone Number" error={errors.phone?.message} required>
                      <input {...register('phone')} type="tel" className={inputCls} placeholder="+1 (555) 000-0000" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="City" error={errors.city?.message} required>
                        <input {...register('city')} className={inputCls} placeholder="New York" />
                      </Field>
                      <Field label="State / Province" error={errors.state?.message} required>
                        <input {...register('state')} className={inputCls} placeholder="NY" />
                      </Field>
                    </div>
                    <Field label="Country" error={errors.country?.message} required>
                      <input {...register('country')} className={inputCls} placeholder="United States" />
                    </Field>
                  </div>
                )}

                {/* ── Step 2: Credentials ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Credentials & Qualifications</h2>
                    <Field label="License Type" error={errors.licenseType?.message} required>
                      <select {...register('licenseType')} className={inputCls}>
                        <option value="">Select license type...</option>
                        {LICENSE_TYPES.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="License Number" error={errors.licenseNumber?.message} required>
                        <input {...register('licenseNumber')} className={inputCls} placeholder="LCS-12345" />
                      </Field>
                      <Field label="License Expiry" error={errors.licenseExpiry?.message} required>
                        <input {...register('licenseExpiry')} type="date" className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Years of Experience" error={errors.yearsOfExperience?.message} required>
                      <input {...register('yearsOfExperience', { valueAsNumber: true })} type="number" min={0} max={50} className={inputCls} />
                    </Field>

                    {/* Education entries */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">Education <span className="text-rose-500">*</span></label>
                        <button
                          type="button"
                          onClick={() => appendEdu({ degree: '', institution: '', year: '' })}
                          className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                      <div className="space-y-3">
                        {eduFields.map((field, i) => (
                          <div key={field.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-xl">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input
                                {...register(`education.${i}.degree`)}
                                className={cn(inputCls, 'bg-white')}
                                placeholder="Degree (e.g. MA Psychology)"
                              />
                              <input
                                {...register(`education.${i}.institution`)}
                                className={cn(inputCls, 'bg-white')}
                                placeholder="Institution"
                              />
                              <input
                                {...register(`education.${i}.year`)}
                                className={cn(inputCls, 'bg-white')}
                                placeholder="Year (e.g. 2018)"
                              />
                            </div>
                            {eduFields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEdu(i)}
                                className="p-2 text-gray-400 hover:text-rose-500 transition-colors mt-0.5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {errors.education && <p className="mt-1 text-xs text-rose-500">{errors.education.message}</p>}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Specialties ── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Specialties & Availability</h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Areas of Specialty <span className="text-rose-500">*</span>
                      </label>
                      <MultiChipSelect
                        options={CONCERNS}
                        selected={watch('concerns')}
                        onChange={(v) => setValue('concerns', v)}
                      />
                      {errors.concerns && <p className="mt-1 text-xs text-rose-500">{errors.concerns.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Therapy Approaches <span className="text-rose-500">*</span>
                      </label>
                      <MultiChipSelect
                        options={THERAPY_TYPES}
                        selected={watch('therapyTypes')}
                        onChange={(v) => setValue('therapyTypes', v)}
                      />
                      {errors.therapyTypes && <p className="mt-1 text-xs text-rose-500">{errors.therapyTypes.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Languages <span className="text-rose-500">*</span>
                      </label>
                      <MultiChipSelect
                        options={LANGUAGES}
                        selected={watch('languages')}
                        onChange={(v) => setValue('languages', v)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Formats <span className="text-rose-500">*</span>
                      </label>
                      <MultiChipSelect
                        options={['Video', 'Phone', 'In-Person']}
                        selected={watch('sessionTypes')}
                        onChange={(v) => setValue('sessionTypes', v)}
                      />
                      {errors.sessionTypes && <p className="mt-1 text-xs text-rose-500">{errors.sessionTypes.message}</p>}
                    </div>

                    <Field label="Your Timezone" error={errors.timezone?.message} required>
                      <select {...register('timezone')} className={inputCls}>
                        <option value="">Select timezone...</option>
                        {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
                      </select>
                    </Field>
                  </div>
                )}

                {/* ── Step 4: Rates + Bio ── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Session Rates & Profile</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Session Rate (USD)" error={errors.sessionRate?.message} required>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                          <input
                            {...register('sessionRate', { valueAsNumber: true })}
                            type="number"
                            min={10}
                            max={1000}
                            className={cn(inputCls, 'pl-7')}
                            placeholder="120"
                          />
                        </div>
                      </Field>
                      <Field label="Free Consultation Rate" error={errors.consultationRate?.message}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                          <input
                            {...register('consultationRate', { valueAsNumber: true })}
                            type="number"
                            min={0}
                            className={cn(inputCls, 'pl-7')}
                            placeholder="0"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Set $0 for free consultations</p>
                      </Field>
                    </div>

                    <Field label="Professional Bio" error={errors.bio?.message} required>
                      <textarea
                        {...register('bio')}
                        rows={5}
                        className={cn(inputCls, 'resize-none')}
                        placeholder="Write a warm, welcoming bio that describes your approach to therapy, your background, and what clients can expect when working with you..."
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {watch('bio')?.length ?? 0}/2000 characters (min 100)
                      </p>
                    </Field>

                    {/* Avatar upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          Upload photo
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={() => setAvatarPreview(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">JPG, PNG or WebP. Max 5MB. Square photos work best.</p>
                    </div>
                  </div>
                )}

                {/* ── Step 5: Review ── */}
                {step === 5 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Review & Submit</h2>

                    {[
                      {
                        title: 'Personal Info',
                        items: [
                          { label: 'Name', value: `${values.firstName} ${values.lastName}` },
                          { label: 'Email', value: values.email },
                          { label: 'Phone', value: values.phone },
                          { label: 'Location', value: `${values.city}, ${values.state}, ${values.country}` },
                        ],
                      },
                      {
                        title: 'Credentials',
                        items: [
                          { label: 'License', value: values.licenseType },
                          { label: 'License #', value: values.licenseNumber },
                          { label: 'Experience', value: `${values.yearsOfExperience} years` },
                        ],
                      },
                      {
                        title: 'Specialties',
                        items: [
                          { label: 'Concerns', value: values.concerns?.join(', ') },
                          { label: 'Languages', value: values.languages?.join(', ') },
                          { label: 'Session Types', value: values.sessionTypes?.join(', ') },
                        ],
                      },
                      {
                        title: 'Rates',
                        items: [
                          { label: 'Session Rate', value: `$${values.sessionRate}/session` },
                          { label: 'Consultation', value: values.consultationRate === 0 ? 'Free' : `$${values.consultationRate}` },
                        ],
                      },
                    ].map((section) => (
                      <div key={section.title} className="bg-gray-50 rounded-2xl p-4">
                        <h3 className="font-semibold text-gray-800 mb-3 text-sm">{section.title}</h3>
                        <div className="space-y-2">
                          {section.items.map((item) => (
                            <div key={item.label} className="flex justify-between text-sm">
                              <span className="text-gray-500">{item.label}</span>
                              <span className="text-gray-900 font-medium text-right max-w-xs truncate">{item.value || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
                      <p className="text-sm text-teal-800">
                        By submitting, you confirm that all information provided is accurate and you agree to HealMate&apos;s{' '}
                        <a href="/terms" className="underline">Terms of Service</a> and{' '}
                        <a href="/privacy" className="underline">Privacy Policy</a>.
                        Your credentials will be verified before your profile goes live.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
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
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:from-teal-600 hover:to-emerald-600 disabled:opacity-60 transition-all shadow-lg shadow-teal-200"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <><Check className="w-4 h-4" /> Submit Application</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
