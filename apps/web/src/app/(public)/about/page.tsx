'use client';

import { motion } from 'framer-motion';
import { Heart, Shield, Users, Sparkles, Star, Award, Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────

const TEAM = [
  {
    name: 'Dr. Sarah Mitchell',
    role: 'Co-founder & CEO',
    bio: 'Former clinical psychologist with 15 years of practice. Sarah founded HealMate after seeing first-hand how difficult it was for people to access quality mental healthcare.',
    avatar: null,
    initials: 'SM',
  },
  {
    name: 'James Okafor',
    role: 'Co-founder & CTO',
    bio: 'Engineer and mental health advocate who lost a close friend to untreated depression. James built the technology platform that powers HealMate\'s matching algorithm.',
    avatar: null,
    initials: 'JO',
  },
  {
    name: 'Dr. Priya Sharma',
    role: 'Chief Clinical Officer',
    bio: 'Board-certified psychiatrist and researcher specializing in teletherapy outcomes. Priya leads our clinical quality standards and therapist vetting process.',
    avatar: null,
    initials: 'PS',
  },
];

const VALUES = [
  {
    icon: Heart,
    title: 'Compassion First',
    desc: 'Every decision we make starts with empathy — for our clients, our therapists, and our team. Mental health is deeply personal, and we treat it that way.',
    color: 'text-rose-500 bg-rose-50',
  },
  {
    icon: Shield,
    title: 'Privacy & Safety',
    desc: 'End-to-end encryption, HIPAA compliance, and zero data selling. Your sessions are between you and your therapist — always.',
    color: 'text-indigo-500 bg-indigo-50',
  },
  {
    icon: Users,
    title: 'Radical Accessibility',
    desc: 'Quality therapy shouldn\'t depend on your zip code or income. We work to make mental healthcare available to everyone who needs it.',
    color: 'text-teal-500 bg-teal-50',
  },
  {
    icon: Sparkles,
    title: 'Evidence-Based Care',
    desc: 'Every therapist on our platform is licensed, verified, and trained in evidence-based practices. We don\'t compromise on clinical quality.',
    color: 'text-amber-500 bg-amber-50',
  },
];

const STATS = [
  { value: '50,000+', label: 'People helped' },
  { value: '2,000+', label: 'Licensed therapists' },
  { value: '98%', label: 'Client satisfaction' },
  { value: '4.9★', label: 'Average rating' },
];

const JOURNEY = [
  { year: '2020', title: 'The Idea', desc: 'After a global pandemic made in-person therapy impossible for millions, our founders set out to build the future of mental healthcare.' },
  { year: '2021', title: 'First Launch', desc: 'HealMate launched with 50 therapists in three cities. Within 6 months, we\'d helped 1,000 people find their first therapist.' },
  { year: '2022', title: 'National Expansion', desc: 'Expanded to all 50 states and added group therapy, couples counseling, and our AI-powered matching system.' },
  { year: '2023', title: 'International', desc: 'Launched in Canada, the UK, and Australia. Added multilingual support for 12 languages and 30+ specialties.' },
  { year: '2024', title: 'Today', desc: 'Over 50,000 clients served, 2,000+ therapists, and continuing to grow with our mission: making mental healthcare accessible to all.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay },
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp()} className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4 fill-teal-400" /> Our Mission
          </motion.div>
          <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Mental healthcare for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
              everyone, everywhere
            </span>
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
            HealMate was built on a simple belief: every person deserves access to quality mental healthcare,
            regardless of where they live, what they earn, or what they&apos;re going through.
            We&apos;re here to make that possible.
          </motion.p>
          <motion.div {...fadeUp(0.3)} className="flex flex-wrap justify-center gap-4">
            <Link href="/assessment" className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors inline-flex items-center gap-2">
              Find a Therapist <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/join-as-therapist" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Join as a Therapist
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fadeUp(i * 0.1)} className="text-center">
              <p className="text-4xl font-bold text-teal-600 mb-1">{s.value}</p>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What we stand for</h2>
            <p className="text-gray-500">The principles that guide every decision we make</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  {...fadeUp(i * 0.1)}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl ${v.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Meet the team</h2>
            <p className="text-gray-500">The people behind HealMate&apos;s mission</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                {...fadeUp(i * 0.1)}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
                  {member.initials}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-teal-600 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey / story */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our journey</h2>
            <p className="text-gray-500">From an idea to a movement</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-teal-100 hidden sm:block" />
            <div className="space-y-8">
              {JOURNEY.map((j, i) => (
                <motion.div key={j.year} {...fadeUp(i * 0.1)} className="flex gap-6 sm:gap-8">
                  <div className="shrink-0 text-right w-14">
                    <span className="text-teal-600 font-bold text-sm">{j.year}</span>
                  </div>
                  <div className="relative sm:pl-6">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-teal-400 hidden sm:block ring-2 ring-white ring-offset-2 ring-offset-gray-50" />
                    <h3 className="font-bold text-gray-900 mb-1">{j.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{j.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-600 to-emerald-600">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <Globe className="w-12 h-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to start your journey?</h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands of people who have found hope, healing, and resilience with HealMate.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/assessment" className="px-8 py-3.5 bg-white text-teal-600 font-bold rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
                Take the Assessment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/therapists" className="px-8 py-3.5 border border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-colors">
                Browse Therapists
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
