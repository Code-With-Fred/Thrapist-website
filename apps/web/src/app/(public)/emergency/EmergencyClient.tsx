'use client';

import { motion } from 'framer-motion';
import { Phone, MessageSquare, Globe, Heart, Shield, ArrowRight, AlertTriangle, Clock, HandHeart } from 'lucide-react';
import Link from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOTLINES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    text: 'Text HOME to 741741',
    description: 'Free, confidential support for people in suicidal crisis or emotional distress. Available 24/7, 365 days a year.',
    available: '24/7',
    icon: Phone,
    color: 'from-rose-500 to-pink-600',
    shadowColor: 'shadow-rose-300',
    href: 'tel:988',
  },
  {
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    text: null,
    description: 'Text with a trained crisis counselor anytime, anywhere. Free and confidential mental health text support.',
    available: '24/7',
    icon: MessageSquare,
    color: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-300',
    href: 'sms:741741?body=HOME',
  },
  {
    name: 'SAMHSA Helpline',
    number: '1-800-662-4357',
    text: null,
    description: 'Free, confidential help for substance use disorders and mental health treatment referrals.',
    available: '24/7',
    icon: Phone,
    color: 'from-blue-500 to-indigo-600',
    shadowColor: 'shadow-blue-300',
    href: 'tel:18006624357',
  },
  {
    name: 'NAMI Helpline',
    number: '1-800-950-6264',
    text: 'Text NAMI to 741741',
    description: 'Information, referrals, and support for individuals and families affected by mental illness.',
    available: 'Mon–Fri, 10am–10pm ET',
    icon: Heart,
    color: 'from-teal-500 to-emerald-600',
    shadowColor: 'shadow-teal-300',
    href: 'tel:18009506264',
  },
  {
    name: 'Trevor Project (LGBTQ+)',
    number: '1-866-488-7386',
    text: 'Text START to 678-678',
    description: 'Crisis intervention and suicide prevention for LGBTQ+ young people. Affirming, accepting, safe.',
    available: '24/7',
    icon: Heart,
    color: 'from-rainbow-500 to-pink-500',
    shadowColor: 'shadow-pink-300',
    href: 'tel:18664887386',
  },
  {
    name: 'Veterans Crisis Line',
    number: '988, then press 1',
    text: 'Text 838255',
    description: 'Dedicated support for veterans, service members, and their families facing mental health challenges.',
    available: '24/7',
    icon: Shield,
    color: 'from-slate-600 to-gray-700',
    shadowColor: 'shadow-gray-400',
    href: 'tel:988',
  },
];

const RESOURCES = [
  {
    title: 'Immediate Actions',
    items: [
      'If you or someone is in immediate danger — call 911 now.',
      'Stay with the person if you believe they may harm themselves.',
      'Remove access to any potential means of harm.',
      'Call a crisis hotline — you don\'t have to face this alone.',
    ],
    icon: AlertTriangle,
    color: 'bg-rose-50 border-rose-200 text-rose-800',
    iconColor: 'text-rose-500',
  },
  {
    title: 'Signs Someone Needs Help',
    items: [
      'Talking about wanting to die or feeling hopeless',
      'Withdrawing from friends and activities',
      'Giving away possessions',
      'Extreme mood swings or sudden calmness after depression',
    ],
    icon: Heart,
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    iconColor: 'text-amber-500',
  },
  {
    title: 'How to Help a Friend',
    items: [
      'Listen without judgment — your presence matters',
      'Ask directly if they\'re thinking about suicide',
      'Help them connect with professional support',
      'Follow up — check in regularly after the crisis',
    ],
    icon: HandHeart,
    color: 'bg-teal-50 border-teal-200 text-teal-800',
    iconColor: 'text-teal-500',
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EmergencyClient() {
  return (
    <div className="min-h-screen bg-white">
      {/* Emergency banner */}
      <div className="bg-rose-600 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm sm:text-base">
              If you are in immediate danger — Call 911 right now
            </span>
          </div>
          <a
            href="tel:911"
            className="bg-white text-rose-600 px-5 py-1.5 rounded-full font-bold text-sm hover:bg-rose-50 transition-colors"
          >
            Call 911
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-teal-900 via-teal-800 to-teal-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
              <Heart className="w-10 h-10 text-white fill-white/50" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              You Are Not Alone
            </h1>
            <p className="text-teal-100 text-xl leading-relaxed mb-6 max-w-xl mx-auto">
              Whatever you&apos;re going through right now — there are people who care about you
              and want to help. Reaching out is an act of courage, not weakness.
            </p>
            <p className="text-white/70 text-sm">
              Help is available right now, for free, 24 hours a day, 7 days a week.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 988 featured call-out */}
      <section className="py-12 px-4 bg-rose-50 border-b border-rose-100">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border-2 border-rose-300 p-6 sm:p-8 shadow-xl shadow-rose-100"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="w-10 h-10 text-rose-500" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-rose-500 text-sm font-semibold uppercase tracking-widest mb-1">
                  National Crisis Line
                </p>
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-2 tracking-tight">988</h2>
                <p className="text-xl font-bold text-gray-800 mb-1">Suicide & Crisis Lifeline</p>
                <p className="text-gray-500 text-sm mb-4">
                  Call or text <strong>988</strong> — free, confidential, available 24/7/365.
                  You can also chat online at <strong>988lifeline.org</strong>
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <a
                    href="tel:988"
                    className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                  >
                    <Phone className="w-4 h-4" /> Call 988 Now
                  </a>
                  <a
                    href="sms:988?body=HELLO"
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Text 988
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All hotlines */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Crisis Resources</h2>
            <p className="text-gray-500">Specialized support for every situation</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HOTLINES.map((h, i) => {
              const Icon = h.icon;
              return (
                <motion.div
                  key={h.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all flex flex-col"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${h.color} mb-4 shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{h.name}</h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-400">{h.available}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{h.description}</p>
                  <div className="space-y-2">
                    <a
                      href={h.href}
                      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${h.color} hover:opacity-90 transition-opacity shadow-md ${h.shadowColor}`}
                    >
                      <Phone className="w-4 h-4" />
                      {h.number}
                    </a>
                    {h.text && (
                      <p className="text-center text-xs text-gray-400">{h.text}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resources section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Help</h2>
            <p className="text-gray-500">Guidance for navigating a mental health crisis</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RESOURCES.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border p-5 ${r.color}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-5 h-5 ${r.iconColor}`} />
                    <h3 className="font-bold">{r.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {r.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* International resources */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <Globe className="w-10 h-10 text-teal-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">International Resources</h2>
            <p className="text-gray-500 text-sm">Mental health support available worldwide</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { country: '🇬🇧 United Kingdom', lines: ['Samaritans: 116 123', 'Crisis Text: Text SHOUT to 85258'] },
              { country: '🇦🇺 Australia', lines: ['Lifeline: 13 11 14', 'Beyond Blue: 1300 22 4636'] },
              { country: '🇨🇦 Canada', lines: ['Crisis Services Canada: 1-833-456-4566', 'Kids Help Phone: 1-800-668-6868'] },
              { country: '🌍 International', lines: ['findahelpline.com', 'befrienders.org'] },
            ].map((c) => (
              <motion.div
                key={c.country}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-4"
              >
                <p className="font-semibold text-gray-900 mb-2">{c.country}</p>
                {c.lines.map((l) => (
                  <p key={l} className="text-sm text-gray-600">{l}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Affirmation + CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-700 to-teal-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="w-12 h-12 text-teal-200 mx-auto mb-6 fill-teal-200/30" />
            <h2 className="text-3xl font-bold mb-4">You matter. Your life matters.</h2>
            <p className="text-teal-100 text-lg leading-relaxed mb-8">
              Struggling doesn&apos;t mean failing. Asking for help is one of the bravest things you can do.
              Whatever you&apos;re feeling right now — it can get better. There are people who want to walk
              with you through this.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:988"
                className="flex items-center gap-2 px-8 py-4 bg-white text-teal-700 rounded-xl font-bold hover:bg-teal-50 transition-colors text-lg shadow-xl"
              >
                <Phone className="w-5 h-5" /> Call 988 Now
              </a>
              <Link
                href="/therapists"
                className="flex items-center gap-2 px-8 py-4 bg-teal-600 border border-teal-400 text-white rounded-xl font-medium hover:bg-teal-500 transition-colors"
              >
                Find a Therapist <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
