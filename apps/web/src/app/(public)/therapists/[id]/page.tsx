import { Metadata } from 'next';
import TherapistProfileClient from './TherapistProfileClient';

interface Props {
  params: { id: string };
  searchParams: { book?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'}/therapists/${params.id}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error('Not found');
    const data = await res.json();
    const t = data.data;
    const name = `${t.firstName} ${t.lastName}`;
    return {
      title: `${name} – Licensed Therapist | HealMate`,
      description: `Book a session with ${name}, ${t.title}. Specializes in ${(t.concerns ?? []).slice(0, 3).join(', ')}. Available for ${(t.sessionTypes ?? []).join(', ')} sessions.`,
      openGraph: {
        title: name,
        description: t.bio ?? '',
        images: t.avatarUrl ? [t.avatarUrl] : [],
      },
    };
  } catch {
    return {
      title: 'Therapist Profile | HealMate',
      description: 'Find and book a session with a licensed therapist on HealMate.',
    };
  }
}

export default function TherapistPage({ params, searchParams }: Props) {
  return <TherapistProfileClient id={params.id} autoOpenBook={searchParams.book === 'consultation'} />;
}
