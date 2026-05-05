import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, UserCheck, CalendarDays, Video, ShieldCheck, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Find out how HealMate connects you with licensed therapists in just a few simple steps.',
};

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Tell us what you need',
    description: 'Answer a short assessment about your concerns, preferences, and availability. Our matching system uses your answers to find the right therapist for you.',
    color: '#4F7EFF',
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Get matched instantly',
    description: 'Browse therapist profiles with verified credentials, specialties, session rates, and real patient reviews. Filter by approach, language, and session type.',
    color: '#FF6B9D',
  },
  {
    number: '03',
    icon: CalendarDays,
    title: 'Book your session',
    description: 'Choose a time that works for you, pay securely online, and receive a confirmation with all the details you need.',
    color: '#22C55E',
  },
  {
    number: '04',
    icon: Video,
    title: 'Start your therapy',
    description: 'Join your session by video, audio, or in person. Your therapist is there to listen, support, and help you build lasting change.',
    color: '#F59E0B',
  },
];

const features = [
  'Licensed and verified therapists only',
  'Secure, HIPAA-compliant video sessions',
  'Cancel or reschedule up to 24 hours before',
  'Pay securely — no surprise fees',
  'Match with a new therapist any time',
  'Access your session history and notes',
];

const faqs = [
  {
    q: 'How quickly can I get started?',
    a: 'You can complete the assessment, choose a therapist, and book a session in under 10 minutes. Most therapists have availability within the same week.',
  },
  {
    q: 'What types of therapy are available?',
    a: 'We offer CBT, DBT, EMDR, psychodynamic therapy, couples therapy, and more. Filter by approach when searching for a therapist.',
  },
  {
    q: 'Is my information kept private?',
    a: 'Yes. All sessions are encrypted and we are fully HIPAA compliant. Your personal information and session details are never shared without your consent.',
  },
  {
    q: 'What if I want to change my therapist?',
    a: 'No problem. You can switch therapists at any time from your dashboard with no penalties.',
  },
  {
    q: 'Do you accept insurance?',
    a: 'We currently process payments directly. We provide receipts you can submit to insurance providers for potential reimbursement.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F0F4FF] via-white to-[#FFF0F6] py-20 sm:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #4F7EFF, transparent)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #FF6B9D, transparent)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{ background: '#4F7EFF15', color: '#4F7EFF' }}>
            Simple. Secure. Effective.
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0F172A] mb-6 leading-tight">
            Therapy that fits <span style={{ background: 'linear-gradient(135deg, #4F7EFF, #FF6B9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>your life</span>
          </h1>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto mb-10">
            From your first search to your first session — we make it easy to find the right therapist and start feeling better.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/assessment" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95" style={{ background: 'linear-gradient(135deg, #4F7EFF, #6B94FF)', boxShadow: '0 4px 14px rgba(79,126,255,0.35)' }}>
              Take the Assessment <ArrowRight size={16} />
            </Link>
            <Link href="/therapists" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:border-[#4F7EFF]/40 hover:shadow-sm transition-all">
              Browse Therapists
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-4">Four steps to better mental health</h2>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto">Getting started is easier than you think.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative bg-white rounded-2xl border border-[#E2E8F0] p-8 hover:shadow-lg hover:border-transparent transition-all duration-300 group">
                <div className="flex items-start gap-5">
                  <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${step.color}15` }}>
                    <Icon size={26} style={{ color: step.color }} />
                  </div>
                  <div>
                    <span className="text-5xl font-black opacity-5 absolute top-6 right-8 select-none" style={{ color: step.color }}>{step.number}</span>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: step.color }}>Step {step.number}</p>
                    <h3 className="text-lg font-bold text-[#0F172A] mb-2">{step.title}</h3>
                    <p className="text-[#64748B] text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Everything you need, nothing you don&apos;t</h2>
              <p className="text-[#64748B] mb-8">HealMate is built around your wellbeing — secure, flexible, and always on your terms.</p>
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#0F172A]">
                    <CheckCircle2 size={18} className="shrink-0" style={{ color: '#22C55E' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #4F7EFF, #6B94FF)' }}>
                Create a free account <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, label: 'HIPAA Compliant', sub: 'Your data is always protected', color: '#4F7EFF' },
                { icon: Star, label: '4.9 / 5 Rating', sub: 'From thousands of clients', color: '#F59E0B' },
                { icon: UserCheck, label: '500+ Therapists', sub: 'All licensed & verified', color: '#22C55E' },
                { icon: Video, label: 'Video & Audio', sub: 'Flexible session formats', color: '#FF6B9D' },
              ].map(({ icon: Icon, label, sub, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 text-center hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${color}15` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <p className="font-semibold text-[#0F172A] text-sm">{label}</p>
                  <p className="text-[#64748B] text-xs mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-3">Common questions</h2>
          <p className="text-[#64748B]">Still curious? We&apos;ve got answers.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
              <h3 className="font-semibold text-[#0F172A] mb-2">{faq.q}</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-[#64748B]">
          More questions?{' '}
          <Link href="/faqs" className="text-[#4F7EFF] font-medium hover:underline">See all FAQs</Link>
          {' '}or{' '}
          <Link href="/contact" className="text-[#4F7EFF] font-medium hover:underline">contact us</Link>.
        </p>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center rounded-3xl p-12" style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #FF6B9D 100%)' }}>
          <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-white/80 mb-8">Take our 2-minute assessment and get matched with the right therapist today.</p>
          <Link href="/assessment" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold bg-white transition-all hover:shadow-lg active:scale-95" style={{ color: '#4F7EFF' }}>
            Find my therapist <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
