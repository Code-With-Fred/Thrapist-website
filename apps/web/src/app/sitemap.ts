import { MetadataRoute } from 'next';

const CONCERNS = ['anxiety', 'depression', 'trauma-ptsd', 'stress', 'relationship-issues', 'grief-loss', 'self-esteem', 'addiction', 'eating-disorders', 'ocd', 'bipolar-disorder', 'anger-management', 'life-transitions', 'lgbtq-issues', 'chronic-illness', 'work-stress', 'parenting', 'loneliness', 'sleep-issues', 'phobias'];
const THERAPY_TYPES = ['individual', 'couples', 'family', 'group', 'child-adolescent', 'initial-consultation'];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://healmate.app';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/therapists`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/assessment`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/faqs`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/emergency`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/gift-card`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/join-as-therapist`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/hipaa`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];

  const concernRoutes: MetadataRoute.Sitemap = CONCERNS.map(concern => ({
    url: `${baseUrl}/concerns/${concern}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const therapyRoutes: MetadataRoute.Sitemap = THERAPY_TYPES.map(type => ({
    url: `${baseUrl}/therapy/${type}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...concernRoutes, ...therapyRoutes];
}
