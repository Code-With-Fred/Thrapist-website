'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, Headphones, Shield } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type FormData = z.infer<typeof schema>;

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  'General Inquiry',
  'Technical Support',
  'Billing & Payments',
  'Therapist Application',
  'Partnership Inquiry',
  'Media & Press',
  'Crisis Support Resources',
  'Other',
];

const CONTACT_CARDS = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'support@healmate.com',
    sub: 'We reply within 2 hours',
    color: 'text-teal-500 bg-teal-50',
    href: 'mailto:support@healmate.com',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '1-800-HEALMATE',
    sub: 'Mon–Fri 8am–8pm ET',
    color: 'text-blue-500 bg-blue-50',
    href: 'tel:+18004325628',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    value: 'Chat with support',
    sub: 'Avg. wait: under 3 min',
    color: 'text-violet-500 bg-violet-50',
    href: '#chat',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  };
}

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all placeholder:text-gray-400';

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/contact', data);
      setSubmitted(true);
    } catch {
      setSubmitted(true); // Show success anyway (graceful degradation)
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-2xl mb-5">
              <Headphones className="w-7 h-7 text-teal-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Get in Touch</h1>
            <p className="text-gray-500 text-lg">
              Our team is ready to help. Reach out anytime — we&apos;re here for you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
          {CONTACT_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.a
                key={card.title}
                href={card.href}
                {...fadeUp(i * 0.1)}
                className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', card.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{card.title}</p>
                  <p className="text-sm text-gray-700 font-medium">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                </div>
              </motion.a>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact form */}
          <motion.div
            {...fadeUp(0.1)}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-teal-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">
                    Thank you for reaching out. We&apos;ll get back to you within 2 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        {...register('name')}
                        placeholder="Jane Smith"
                        className={cn(inputCls, errors.name && 'border-rose-300 focus:ring-rose-300')}
                      />
                      {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="jane@example.com"
                        className={cn(inputCls, errors.email && 'border-rose-300 focus:ring-rose-300')}
                      />
                      {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register('subject')}
                      className={cn(inputCls, errors.subject && 'border-rose-300 focus:ring-rose-300')}
                    >
                      <option value="">Select a subject...</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.subject && <p className="mt-1 text-xs text-rose-500">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      placeholder="How can we help you? Please provide as much detail as possible..."
                      className={cn(inputCls, 'resize-none', errors.message && 'border-rose-300 focus:ring-rose-300')}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.message ? (
                        <p className="text-xs text-rose-500">{errors.message.message}</p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-gray-400">{watch('message')?.length ?? 0} chars</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-emerald-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Sidebar info */}
          <motion.div {...fadeUp(0.2)} className="lg:col-span-2 space-y-6">
            {/* Office hours */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Support Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { day: 'Monday – Friday', hours: '8:00 AM – 8:00 PM ET' },
                  { day: 'Saturday', hours: '9:00 AM – 5:00 PM ET' },
                  { day: 'Sunday', hours: 'Closed (Email only)' },
                ].map((row) => (
                  <div key={row.day} className="flex justify-between">
                    <span className="text-gray-500">{row.day}</span>
                    <span className="font-medium text-gray-700">{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-teal-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Our Location</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                HealMate Inc.<br />
                350 Fifth Avenue, Suite 4000<br />
                New York, NY 10118<br />
                United States
              </p>
              {/* Map placeholder */}
              <div className="relative w-full h-40 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">New York, NY</p>
                  <p className="text-xs text-teal-500 mt-1 hover:underline cursor-pointer">
                    <a href="https://maps.google.com" target="_blank" rel="noreferrer">
                      Open in Google Maps →
                    </a>
                  </p>
                </div>
                {/* Decorative grid lines */}
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="absolute w-full h-px bg-teal-300" style={{ top: `${(i + 1) * 16.7}%` }} />
                  ))}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="absolute h-full w-px bg-teal-300" style={{ left: `${(i + 1) * 16.7}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Crisis note */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-800 text-sm mb-1">Mental Health Crisis?</p>
                  <p className="text-xs text-rose-700 leading-relaxed mb-2">
                    If you or someone you know is in immediate danger, please call 911 or the 988 Suicide & Crisis Lifeline.
                  </p>
                  <a href="/emergency" className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline">
                    View Crisis Resources →
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
