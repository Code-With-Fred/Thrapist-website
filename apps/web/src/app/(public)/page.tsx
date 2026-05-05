'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Shield, Video, Phone, MapPin, Check, ChevronDown, ChevronUp, Brain, Sparkles, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const rotatingWords = ['Anxiety', 'Depression', 'Stress', 'Trauma', 'Loneliness', 'Burnout'];

const therapyTypes = [
  { title: 'Individual Therapy', desc: 'One-on-one sessions tailored to your personal goals and challenges.', icon: '🧠', href: '/therapy/individual', color: 'from-blue-500 to-blue-600' },
  { title: 'Couples Therapy', desc: 'Strengthen your relationship and improve communication together.', icon: '💑', href: '/therapy/couples', color: 'from-pink-500 to-rose-500' },
  { title: 'Family Therapy', desc: 'Build healthier family dynamics and resolve conflicts.', icon: '👨‍👩‍👧', href: '/therapy/family', color: 'from-green-500 to-emerald-500' },
  { title: 'Group Therapy', desc: 'Connect with others sharing similar experiences in a safe space.', icon: '🤝', href: '/therapy/group', color: 'from-purple-500 to-violet-500' },
  { title: 'Child & Adolescent', desc: 'Specialized support for young people navigating challenges.', icon: '🌱', href: '/therapy/child-adolescent', color: 'from-yellow-500 to-orange-500' },
  { title: 'Initial Consultation', desc: 'A free 15-minute intro session to find the right fit.', icon: '☕', href: '/therapy/initial-consultation', color: 'from-teal-500 to-cyan-500' },
];

const concerns = ['Anxiety', 'Depression', 'Trauma & PTSD', 'Stress', 'Relationship Issues', 'Grief & Loss', 'Self-Esteem', 'Addiction', 'Eating Disorders', 'OCD', 'Bipolar Disorder', 'Anger Management', 'Life Transitions', 'LGBTQ+ Issues', 'Chronic Illness', 'Work Stress', 'Parenting', 'Loneliness', 'Sleep Issues', 'Phobias'];

const faqs = [
  { q: 'How does HealMate match me with a therapist?', a: 'Our AI-powered assessment evaluates your concerns, preferences, budget, and availability to match you with the best-fit licensed therapists.' },
  { q: 'Are all therapists on HealMate licensed?', a: 'Yes. Every therapist undergoes a thorough vetting process verifying their license, credentials, and clinical experience before approval.' },
  { q: 'Is my information private and secure?', a: 'Absolutely. HealMate is HIPAA-compliant and uses 256-bit SSL encryption. Your sessions and personal data are completely confidential.' },
  { q: 'How much does therapy cost on HealMate?', a: 'Session rates vary by therapist, typically $60-$200/session. Many therapists offer sliding scale fees. You can filter by budget when searching.' },
  { q: 'Can I change my therapist if it is not a good fit?', a: 'Yes, absolutely. Finding the right therapist takes time. You can browse and switch therapists at any time at no penalty.' },
  { q: 'What types of sessions are available?', a: 'We offer video sessions, phone sessions, and in-person sessions (where available). You choose what works best for you.' },
  { q: 'Is there a free trial or consultation?', a: 'Many therapists offer a free 15-minute initial consultation. Look for the "Free Consultation" badge on therapist profiles.' },
  { q: 'How do I cancel or reschedule a session?', a: 'You can cancel or reschedule up to 24 hours before your session from your dashboard with no charge. Late cancellations may incur a fee.' },
];

const testimonials = [
  { quote: 'HealMate changed my life. Finding a therapist who truly understands me took less than 10 minutes. I have been in therapy for 6 months now and I am thriving.', name: 'Sarah M.', type: 'Individual Therapy', rating: 5 },
  { quote: 'After years of struggling with anxiety, HealMate matched me with an incredible therapist. The process was so easy and the sessions are life-changing.', name: 'James T.', type: 'Anxiety Support', rating: 5 },
  { quote: 'My husband and I were struggling. HealMate connected us with a couples therapist who helped us rebuild our relationship from the ground up.', name: 'Maria & Carlos R.', type: 'Couples Therapy', rating: 5 },
];

const stats = [
  { label: 'Licensed Therapists', value: '500+' },
  { label: 'Client Satisfaction', value: '98%' },
  { label: 'Sessions Completed', value: '10,000+' },
  { label: 'Available', value: '24/7' },
];

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Our algorithm analyzes 50+ factors to find your perfect therapist match in minutes.', color: 'text-primary bg-primary-50' },
  { icon: Shield, title: 'HIPAA Compliant', desc: 'Your mental health data is protected with enterprise-grade security and full HIPAA compliance.', color: 'text-success bg-green-50' },
  { icon: Clock, title: 'Flexible Scheduling', desc: 'Book sessions that fit your life. Evening, weekend, and same-day appointments available.', color: 'text-warning bg-yellow-50' },
  { icon: Video, title: 'Secure Video Sessions', desc: 'End-to-end encrypted video calls from the comfort of your home or anywhere you choose.', color: 'text-secondary bg-pink-50' },
];

export default function HomePage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full opacity-30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-100 rounded-full opacity-20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-2 text-sm text-primary font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Therapist Matching
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-4">
              Find the Right Therapist for{' '}
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="text-gradient-primary block"
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed mb-8">
              Connect with 500+ licensed therapists in minutes. Our AI matches you based on your unique needs, preferences, and schedule.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/assessment" className="btn-primary flex items-center gap-2 text-base">
                Take Free Assessment <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/therapists" className="btn-outline flex items-center gap-2 text-base">
                Browse Therapists
              </Link>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                { icon: Award, text: 'Licensed & Vetted' },
                { icon: Shield, text: 'HIPAA Compliant' },
                { icon: Clock, text: '24/7 Support' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center">
                <div className="text-center p-12">
                  <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-primary-700 font-semibold text-lg">Your mental wellness journey starts here</p>
                </div>
              </div>
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-success rounded-xl flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Match found!</p>
                  <p className="text-sm font-semibold text-text-primary">98% compatibility</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-primary-200 border-2 border-white" />)}
                </div>
                <div>
                  <p className="text-xs text-text-secondary">This week</p>
                  <p className="text-sm font-semibold text-text-primary">247 new matches</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-primary-100 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-14">
            <h2 className="text-text-primary mb-3">Start Your Journey in <span className="text-gradient-primary">3 Simple Steps</span></h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">We make finding the right therapist easy, confidential, and effective.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📋', title: 'Take Our Assessment', desc: 'Answer a few questions about your concerns, preferences, and goals. Takes less than 5 minutes.' },
              { step: '02', icon: '💙', title: 'Get Matched', desc: 'Our AI analyzes your responses and recommends the top 5 therapists best suited for you.' },
              { step: '03', icon: '✨', title: 'Start Healing', desc: 'Book your first session, connect with your therapist, and begin your journey to better mental health.' },
            ].map((item) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative text-center p-8 rounded-2xl bg-background border border-border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-50 text-primary rounded-xl flex items-center justify-center text-xl mx-auto mb-4">{item.icon}</div>
                <div className="absolute top-4 right-4 text-5xl font-bold text-primary-50 select-none">{item.step}</div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">{item.title}</h3>
                <p className="text-text-secondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THERAPY TYPES */}
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center mb-14">
            <h2 className="text-text-primary mb-3">Types of <span className="text-gradient-primary">Therapy We Offer</span></h2>
            <p className="text-text-secondary text-lg">Find the right type of therapy for your unique situation.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapyTypes.map((type, i) => (
              <motion.div key={type.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link href={type.href} className="card-hover block p-6 group">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br', type.color)}>
                    {type.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">{type.title}</h3>
                  <p className="text-text-secondary text-sm mb-4">{type.desc}</p>
                  <span className="text-primary text-sm font-medium flex items-center gap-1">Learn More <ArrowRight className="w-4 h-4" /></span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED THERAPISTS */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-14">
            <h2 className="text-text-primary mb-3">Meet Our <span className="text-gradient-primary">Therapists</span></h2>
            <p className="text-text-secondary text-lg">All therapists are licensed, vetted, and ready to help you.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { name: 'Dr. Sarah Johnson', title: 'Licensed Clinical Psychologist', specialties: ['Anxiety', 'Depression', 'CBT'], rate: 150, rating: 4.9, reviews: 127, types: ['Video', 'Phone'] },
              { name: 'Michael Chen, LMFT', title: 'Marriage & Family Therapist', specialties: ['Couples', 'Trauma', 'EMDR'], rate: 130, rating: 4.8, reviews: 94, types: ['Video', 'In-Person'] },
              { name: 'Dr. Amara Osei', title: 'Psychotherapist', specialties: ['PTSD', 'Grief', 'Stress'], rate: 120, rating: 5.0, reviews: 203, types: ['Video'] },
            ].map((t) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-hover p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{t.name}</h3>
                    <p className="text-text-secondary text-sm">{t.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{t.rating}</span>
                      <span className="text-text-secondary text-xs">({t.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {t.specialties.map(s => <span key={s} className="px-2 py-1 bg-primary-50 text-primary text-xs rounded-full">{s}</span>)}
                </div>
                <div className="flex items-center gap-2 mb-4 text-text-secondary text-sm">
                  {t.types.includes('Video') && <Video className="w-4 h-4" />}
                  {t.types.includes('Phone') && <Phone className="w-4 h-4" />}
                  {t.types.includes('In-Person') && <MapPin className="w-4 h-4" />}
                  <span>{t.types.join(' · ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-semibold">${t.rate}<span className="text-text-secondary text-sm font-normal">/session</span></span>
                  <Link href="/therapists" className="px-4 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary-600 transition-colors">View Profile</Link>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/therapists" className="btn-outline inline-flex items-center gap-2">Browse All Therapists <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

      {/* CONCERNS */}
      <section className="section-padding bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-text-primary mb-3">We Can <span className="text-gradient-primary">Help With...</span></h2>
            <p className="text-text-secondary text-lg">Our therapists specialize in a wide range of mental health concerns.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {concerns.map((concern) => (
              <Link key={concern} href={`/concerns/${concern.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="px-4 py-2 bg-white border border-border rounded-full text-sm font-medium text-text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm">
                {concern}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HEALMATE */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-14">
            <h2 className="text-text-primary mb-3">Why Choose <span className="text-gradient-primary">HealMate</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center p-6">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4', feature.color)}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center mb-14">
            <h2 className="text-text-primary mb-3">What Our <span className="text-gradient-primary">Clients Say</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{t.name}</p>
                  <p className="text-primary text-xs">{t.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-white">
        <div className="container-max max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-text-primary mb-3">Frequently Asked <span className="text-gradient-primary">Questions</span></h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card">
                <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-text-primary pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-text-secondary">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-max text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-primary-100 text-xl mb-8 max-w-2xl mx-auto">Take our free 5-minute assessment and get matched with your ideal therapist today.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/assessment" className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2 text-lg">
                Get Matched Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/therapists" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg">
                Browse Therapists
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
