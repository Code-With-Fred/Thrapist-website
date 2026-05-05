import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

const therapyData: Record<string, { title: string; subtitle: string; description: string; benefits: string[]; faq: { q: string; a: string }[] }> = {
  individual: { title: 'Individual Therapy', subtitle: 'One-on-one support tailored to you', description: 'Individual therapy gives you a private, confidential space to explore your thoughts, feelings, and behaviors with a licensed therapist. Sessions are entirely focused on your personal goals and challenges.', benefits: ['Personalized attention and customized treatment', 'Safe, confidential space to be yourself', 'Evidence-based approaches (CBT, DBT, EMDR, etc.)', 'Flexible scheduling to fit your life', 'Video, phone, or in-person options'], faq: [{ q: 'How often should I attend individual therapy?', a: 'Most people start with weekly sessions. As you progress, you may move to bi-weekly or monthly sessions.' }, { q: 'How long does individual therapy last?', a: 'This depends on your goals. Brief therapy may last 8-12 sessions; longer-term therapy can continue for months or years.' }] },
  couples: { title: 'Couples Therapy', subtitle: 'Strengthen your relationship together', description: 'Couples therapy helps partners improve communication, resolve conflicts, rebuild trust, and deepen their connection. Whether you are facing a specific challenge or want to proactively strengthen your bond, couples therapy can help.', benefits: ['Improve communication patterns', 'Resolve conflicts constructively', 'Rebuild trust and intimacy', 'Navigate life transitions together', 'Strengthen emotional connection'], faq: [{ q: 'Can we attend couples therapy online?', a: 'Yes! All our couples therapists offer secure video sessions you can attend from home together.' }, { q: 'Should we try couples therapy before deciding to separate?', a: 'Many couples find therapy helpful before making major decisions. It provides clarity and tools regardless of the outcome.' }] },
  family: { title: 'Family Therapy', subtitle: 'Healing and growth for the whole family', description: 'Family therapy addresses the dynamics and patterns within the family system. It helps family members communicate better, resolve conflicts, and support each other through challenges.', benefits: ['Improve family communication', 'Resolve long-standing conflicts', 'Support a family member in crisis', 'Navigate major life changes', 'Build stronger family bonds'], faq: [{ q: 'Do all family members need to attend?', a: 'Ideally yes, but therapy can begin with whoever is willing. The therapist will work to involve all members over time.' }] },
  group: { title: 'Group Therapy', subtitle: 'Heal and grow in community', description: 'Group therapy brings together people with similar challenges to share experiences, offer support, and learn coping skills together. Led by a licensed therapist, groups provide a unique healing environment.', benefits: ['Connect with others who understand', 'Learn from shared experiences', 'More affordable than individual therapy', 'Build social skills and support network', 'Reduce feelings of isolation'], faq: [{ q: 'Is group therapy as effective as individual therapy?', a: 'Research shows group therapy is as effective as individual therapy for many conditions, and offers unique benefits around community and shared experience.' }] },
  'child-adolescent': { title: 'Child & Adolescent Therapy', subtitle: 'Specialized support for young people', description: 'Children and teenagers face unique challenges as they grow. Our specialized therapists use age-appropriate techniques to help young people navigate emotional, behavioral, and developmental challenges.', benefits: ['Age-appropriate therapeutic techniques', 'Family involvement when beneficial', 'School performance and social skills support', 'Trauma-informed approaches', 'Safe environment for self-expression'], faq: [{ q: 'How do I know if my child needs therapy?', a: 'Signs include changes in behavior, academic struggles, withdrawal, emotional outbursts, or expressing persistent sadness or anxiety.' }] },
  'initial-consultation': { title: 'Initial Consultation', subtitle: 'A no-pressure first step', description: 'Not sure where to start? An initial consultation is a free or low-cost 15-minute call with a therapist to discuss your needs, ask questions, and see if it is a good fit - no commitment required.', benefits: ['Free or very low cost', 'No commitment required', 'Ask all your questions', 'Get a sense of the therapist\'s style', 'Clarify your goals and options'], faq: [{ q: 'What happens during an initial consultation?', a: 'You will briefly describe what is bringing you to therapy, ask questions about the therapist\'s approach, and get a sense of whether you are a good fit.' }] },
};

interface Props { params: Promise<{ type: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const data = therapyData[type];
  return { title: data?.title ?? 'Therapy', description: data?.description };
}

export default async function TherapyTypePage({ params }: Props) {
  const { type } = await params;
  const data = therapyData[type] ?? therapyData['individual'];

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-50 to-white section-padding">
        <div className="container-max max-w-4xl">
          <p className="text-primary font-medium mb-3">{data.subtitle}</p>
          <h1 className="text-5xl font-bold text-text-primary mb-4">{data.title}</h1>
          <p className="text-xl text-text-secondary leading-relaxed mb-8 max-w-2xl">{data.description}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/assessment" className="btn-primary flex items-center gap-2">Get Matched <ArrowRight className="w-5 h-5" /></Link>
            <Link href={`/therapists?type=${type}`} className="btn-outline">Browse Therapists</Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-max max-w-4xl grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Benefits of {data.title}</h2>
            <ul className="space-y-3">
              {data.benefits.map(b => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Common Questions</h2>
            <div className="space-y-4">
              {data.faq.map(item => (
                <div key={item.q} className="card p-4">
                  <p className="font-semibold text-text-primary mb-2 text-sm">{item.q}</p>
                  <p className="text-text-secondary text-sm">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary text-white">
        <div className="container-max text-center max-w-2xl">
          <h2 className="text-white mb-4">Start with {data.title} Today</h2>
          <p className="text-primary-100 mb-8">Take our free assessment to get matched with the right therapist for you.</p>
          <Link href="/assessment" className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
            Take Free Assessment <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
