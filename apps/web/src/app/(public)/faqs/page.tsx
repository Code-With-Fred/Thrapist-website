'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, BookOpen, Lock, CreditCard, UserCheck, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items: FaqItem[];
}

const CATEGORIES: FaqCategory[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: BookOpen,
    color: 'text-teal-600 bg-teal-50',
    items: [
      {
        q: 'How does HealMate work?',
        a: 'HealMate connects you with licensed therapists for video, phone, or in-person sessions. Start by taking our quick assessment to get matched with therapists who fit your needs, then book a session directly through the platform. All sessions are confidential and conducted by licensed professionals.',
      },
      {
        q: 'Is HealMate right for me?',
        a: 'HealMate is for anyone who wants to improve their mental wellbeing — whether you\'re dealing with a specific challenge like anxiety or depression, going through a life transition, or simply want ongoing support for personal growth. If you\'re experiencing a mental health emergency, please call 988 or 911 immediately.',
      },
      {
        q: 'How do I find the right therapist?',
        a: 'You can either take our 7-step assessment (which takes about 3 minutes) to get personalized matches, or browse our full therapist directory using filters like specialty, session type, price, language, and availability. Each therapist profile includes their background, approach, and client reviews.',
      },
      {
        q: 'Can I switch therapists?',
        a: 'Absolutely. Finding the right fit is important. You can switch therapists at any time from your dashboard — no explanation needed. We make it easy to explore your options until you find the therapist who feels right for you.',
      },
      {
        q: 'What if I\'ve never tried therapy before?',
        a: 'That\'s completely okay — many of our clients are starting therapy for the first time. Our assessment is designed to help first-timers as much as experienced therapy-goers. Most therapists offer a free consultation call so you can get comfortable before committing to a full session.',
      },
    ],
  },
  {
    id: 'sessions',
    label: 'Sessions & Booking',
    icon: MessageCircle,
    color: 'text-blue-600 bg-blue-50',
    items: [
      {
        q: 'How long is a typical session?',
        a: 'Standard therapy sessions are 50 minutes long. Some therapists offer 30-minute or 80-minute sessions as well. You can see the session duration options on each therapist\'s profile before booking.',
      },
      {
        q: 'How do I book a session?',
        a: 'Navigate to your therapist\'s profile, select your preferred session type (video or phone), pick a date from the calendar, choose an available time slot, and confirm your booking. You\'ll receive a confirmation email with all the details.',
      },
      {
        q: 'Can I reschedule or cancel?',
        a: 'Yes. You can reschedule or cancel sessions up to 24 hours before your scheduled time at no charge. Cancellations within 24 hours may incur a late cancellation fee (typically 50% of the session rate). You can manage bookings from your dashboard.',
      },
      {
        q: 'What technology do I need for video sessions?',
        a: 'You just need a device with a camera and microphone (smartphone, tablet, or computer) and a stable internet connection. We recommend using Google Chrome or Firefox for the best experience. No app download is required.',
      },
      {
        q: 'Can I do sessions from anywhere?',
        a: 'Video and phone sessions can be done from anywhere with a reliable internet or phone connection. For in-person sessions, availability depends on the therapist\'s location. Note that some therapists are licensed only in specific states, which may affect telehealth availability.',
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Lock,
    color: 'text-indigo-600 bg-indigo-50',
    items: [
      {
        q: 'Is everything I share confidential?',
        a: 'Yes. All sessions are protected by therapist-client confidentiality. Therapists are legally and ethically bound to keep your sessions private. The only exceptions are situations where there\'s a risk of harm to yourself or others — which your therapist will explain in your first session.',
      },
      {
        q: 'Is HealMate HIPAA compliant?',
        a: 'Yes. HealMate is fully HIPAA-compliant. Our video infrastructure uses end-to-end encryption, your data is stored securely, and we never sell your personal information or therapy content to third parties.',
      },
      {
        q: 'Who can see my therapy sessions?',
        a: 'Only you and your therapist have access to your session. HealMate staff cannot view session content. We use zero-knowledge encryption for messaging, and video sessions are not recorded by default.',
      },
      {
        q: 'What data does HealMate collect?',
        a: 'We collect only what\'s necessary to provide our service: your contact information, booking history, and payment details (processed securely by Stripe). We never collect therapy content. You can request a full data export or deletion at any time.',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing & Payments',
    icon: CreditCard,
    color: 'text-emerald-600 bg-emerald-50',
    items: [
      {
        q: 'How much does therapy cost?',
        a: 'Therapist rates vary based on their experience, location, and specialty — typically ranging from $60 to $250 per session. You can filter therapists by price range on our directory. Many therapists also offer sliding scale fees for those who need financial flexibility.',
      },
      {
        q: 'Does HealMate accept insurance?',
        a: 'We currently support out-of-network benefits. You can request a superbill (receipt for insurance reimbursement) from your therapist after sessions. We\'re actively working on in-network insurance integrations for major providers.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through Stripe, as well as HealMate gift cards. FSA and HSA cards are also accepted for eligible expenses.',
      },
      {
        q: 'When am I charged?',
        a: 'Payment is charged at the time of booking. If you cancel within the allowed window (more than 24 hours before), you\'ll receive a full refund within 3–5 business days.',
      },
      {
        q: 'Are HealMate gift cards refundable?',
        a: 'Gift cards are non-refundable but never expire. They can be used for any session type or therapist on the platform and are transferable if needed.',
      },
    ],
  },
  {
    id: 'therapists',
    label: 'For Therapists',
    icon: UserCheck,
    color: 'text-violet-600 bg-violet-50',
    items: [
      {
        q: 'How do I join as a therapist?',
        a: 'Visit our "Join as a Therapist" page and complete the 5-step application. We\'ll verify your credentials (license type, number, and expiry) and review your profile. Most applications are processed within 2–3 business days.',
      },
      {
        q: 'What are the requirements to join?',
        a: 'You must hold a valid, active license to practice therapy in your state or country (LCSW, LPC, LMFT, PhD, PsyD, LMHC, or MD). You must have at least 1 year of post-licensure experience and carry professional liability insurance.',
      },
      {
        q: 'How does the payment work for therapists?',
        a: 'You set your own session rates. HealMate takes a platform fee (a percentage of each session), and you keep the rest. Earnings are deposited directly to your bank account via Stripe Connect within 2 business days after each session.',
      },
      {
        q: 'Can I set my own schedule?',
        a: 'Yes. You have full control over your availability calendar. You can block out vacations, set recurring hours, and adjust your schedule at any time from your therapist dashboard.',
      },
      {
        q: 'Does HealMate provide malpractice insurance?',
        a: 'No — therapists are required to maintain their own professional liability insurance. We recommend a minimum of $1M per occurrence / $3M aggregate coverage.',
      },
    ],
  },
];

// ─── Accordion item ────────────────────────────────────────────────────────────

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full text-left py-4 flex items-start justify-between gap-4 hover:text-teal-600 transition-colors"
      >
        <span className={cn('font-medium text-sm sm:text-base leading-snug', isOpen ? 'text-teal-600' : 'text-gray-900')}>
          {item.q}
        </span>
        <ChevronDown
          className={cn('w-5 h-5 shrink-0 text-gray-400 mt-0.5 transition-transform duration-300', isOpen && 'rotate-180 text-teal-500')}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-gray-600 leading-relaxed pr-8">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function FaqsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const searchResults = search
    ? CATEGORIES.flatMap((cat) =>
        cat.items
          .filter(
            (item) =>
              item.q.toLowerCase().includes(search.toLowerCase()) ||
              item.a.toLowerCase().includes(search.toLowerCase()),
          )
          .map((item) => ({ ...item, category: cat.label })),
      )
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-2xl mb-5"
          >
            <HelpCircle className="w-7 h-7 text-teal-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 mb-8"
          >
            Find answers to common questions about HealMate
          </motion.p>
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-md mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {searchResults !== null ? (
          /* Search results */
          <div>
            <p className="text-sm text-gray-500 mb-6">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &quot;{search}&quot;
            </p>
            {searchResults.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-4">No results found. Try a different search term.</p>
                <button onClick={() => setSearch('')} className="text-teal-600 hover:underline text-sm">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                {searchResults.map((item, i) => (
                  <div key={i} className="p-4">
                    <p className="text-xs font-medium text-teal-500 mb-1">{item.category}</p>
                    <AccordionItem
                      item={item}
                      isOpen={!!openItems[`search-${i}`]}
                      onToggle={() => toggleItem(`search-${i}`)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Category tabs + accordion */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar nav */}
            <nav className="lg:w-56 shrink-0">
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:whitespace-normal text-left',
                        activeCategory === cat.id
                          ? 'bg-teal-50 text-teal-700 border border-teal-100'
                          : 'text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', cat.color)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* FAQ accordion */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {CATEGORIES.filter((c) => c.id === activeCategory).map((cat) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', cat.color)}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{cat.label}</h2>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 px-6 divide-y divide-gray-50">
                      {cat.items.map((item, i) => (
                        <AccordionItem
                          key={i}
                          item={item}
                          isOpen={!!openItems[`${cat.id}-${i}`]}
                          onToggle={() => toggleItem(`${cat.id}-${i}`)}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Still need help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl p-8 text-center"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-500 mb-6">Our support team is here to help. We typically respond within 2 hours.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors text-sm"
            >
              Contact Support
            </Link>
            <Link
              href="/assessment"
              className="px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Find a Therapist
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
