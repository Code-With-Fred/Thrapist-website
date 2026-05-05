import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

const concernData: Record<string, { title: string; description: string; symptoms: string[]; howHelps: string[] }> = {
  anxiety: { title: 'Anxiety', description: 'Anxiety is one of the most common mental health conditions, affecting millions of people worldwide. It involves persistent worry, fear, and nervousness that can interfere with daily life.', symptoms: ['Excessive worrying', 'Restlessness or feeling on edge', 'Difficulty concentrating', 'Sleep problems', 'Physical symptoms like rapid heartbeat'], howHelps: ['Cognitive Behavioral Therapy (CBT) to challenge anxious thoughts', 'Mindfulness and relaxation techniques', 'Exposure therapy for phobias', 'Developing healthy coping strategies'] },
  depression: { title: 'Depression', description: 'Depression is a serious mood disorder that affects how you feel, think, and handle daily activities. It is more than just feeling sad - it is a persistent condition that requires professional support.', symptoms: ['Persistent sad or empty mood', 'Loss of interest in activities', 'Changes in appetite or weight', 'Sleep disturbances', 'Feelings of worthlessness'], howHelps: ['Identifying and addressing negative thought patterns', 'Building mood-stabilizing routines', 'Processing underlying causes', 'Developing emotional resilience'] },
};

const defaultConcern = { title: '', description: 'Our licensed therapists specialize in helping people navigate this challenge through evidence-based therapy approaches.', symptoms: ['Emotional distress', 'Impact on daily functioning', 'Relationship challenges', 'Physical symptoms', 'Difficulty coping'], howHelps: ['Evidence-based therapeutic approaches', 'Personalized treatment plans', 'Building coping skills', 'Ongoing support and guidance'] };

interface Props { params: Promise<{ concern: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { concern } = await params;
  const data = concernData[concern];
  const title = data?.title ?? concern.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${title} Therapy & Counseling`,
    description: `Find licensed therapists specializing in ${title.toLowerCase()} on HealMate. Get matched with the right therapist and start your healing journey.`,
  };
}

export default async function ConcernPage({ params }: Props) {
  const { concern } = await params;
  const data = concernData[concern] ?? defaultConcern;
  const title = data.title || concern.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-white section-padding">
        <div className="container-max max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-2 text-sm text-primary font-medium mb-6">Specialized Therapy</div>
          <h1 className="text-5xl font-bold text-text-primary mb-4">{title} <span className="text-gradient-primary">Therapy & Support</span></h1>
          <p className="text-xl text-text-secondary leading-relaxed mb-8">{data.description}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/assessment" className="btn-primary flex items-center gap-2">Get Matched <ArrowRight className="w-5 h-5" /></Link>
            <Link href={`/therapists?concern=${concern}`} className="btn-outline">Browse Therapists</Link>
          </div>
        </div>
      </section>

      {/* Symptoms */}
      <section className="section-padding bg-white">
        <div className="container-max max-w-4xl grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Common Signs & Symptoms</h2>
            <ul className="space-y-3">
              {data.symptoms.map(s => (
                <li key={s} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-error" />
                  </div>
                  <span className="text-text-secondary">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">How Therapy Helps</h2>
            <ul className="space-y-3">
              {data.howHelps.map(h => (
                <li key={h} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-white">
        <div className="container-max text-center max-w-2xl">
          <h2 className="text-white mb-4">Ready to Get Help with {title}?</h2>
          <p className="text-primary-100 mb-8">Take our free 5-minute assessment and get matched with a therapist who specializes in {title.toLowerCase()}.</p>
          <Link href="/assessment" className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
            Find My Therapist <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
