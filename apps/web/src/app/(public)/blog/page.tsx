'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Tag, ArrowRight, Search, BookOpen, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ─── Mock data ────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: number;
  tag: string;
  imageColor: string;
  featured?: boolean;
}

const POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding Anxiety: What Your Body Is Trying to Tell You',
    excerpt: 'Anxiety is your nervous system\'s way of protecting you. But when it goes into overdrive, it can feel overwhelming. Learn how to listen to your body\'s signals and what you can do about them.',
    author: 'Dr. Sarah Mitchell',
    authorRole: 'Clinical Psychologist',
    publishedAt: '2024-05-01',
    readTime: 8,
    tag: 'Anxiety',
    imageColor: 'from-blue-400 to-indigo-500',
    featured: true,
  },
  {
    id: '2',
    title: '7 Evidence-Based Ways to Manage Depression Without Medication',
    excerpt: 'While medication can be life-saving for many, there are powerful complementary strategies that research shows can meaningfully improve depression symptoms.',
    author: 'Dr. Priya Sharma',
    authorRole: 'Psychiatrist',
    publishedAt: '2024-04-28',
    readTime: 10,
    tag: 'Depression',
    imageColor: 'from-violet-400 to-purple-500',
  },
  {
    id: '3',
    title: 'How to Choose the Right Therapist for You',
    excerpt: 'The therapeutic relationship is one of the strongest predictors of success in therapy. Here\'s what to look for and the questions to ask before committing.',
    author: 'James Okafor',
    authorRole: 'Mental Health Advocate',
    publishedAt: '2024-04-22',
    readTime: 6,
    tag: 'Getting Started',
    imageColor: 'from-teal-400 to-emerald-500',
  },
  {
    id: '4',
    title: 'The Science of Trauma: Why Your Brain Gets Stuck',
    excerpt: 'Trauma isn\'t just about bad memories — it physically changes how your brain processes information. Understanding this can help you feel less alone and more empowered to heal.',
    author: 'Dr. Sarah Mitchell',
    authorRole: 'Clinical Psychologist',
    publishedAt: '2024-04-18',
    readTime: 12,
    tag: 'Trauma',
    imageColor: 'from-rose-400 to-pink-500',
  },
  {
    id: '5',
    title: 'Couples Therapy: When to Go and What to Expect',
    excerpt: 'Many couples wait too long to seek help. Research suggests the average couple waits 6 years after problems start before seeking therapy. Here\'s your guide.',
    author: 'Dr. Priya Sharma',
    authorRole: 'Psychiatrist',
    publishedAt: '2024-04-14',
    readTime: 7,
    tag: 'Relationships',
    imageColor: 'from-amber-400 to-orange-500',
  },
  {
    id: '6',
    title: 'Burnout Is Not Laziness: How to Recognize and Recover',
    excerpt: 'The WHO recognizes burnout as a legitimate occupational phenomenon. Yet many people still blame themselves for it. Here\'s the truth about burnout and the path back.',
    author: 'James Okafor',
    authorRole: 'Mental Health Advocate',
    publishedAt: '2024-04-10',
    readTime: 9,
    tag: 'Stress',
    imageColor: 'from-slate-400 to-gray-500',
  },
  {
    id: '7',
    title: 'ADHD in Adults: The Symptoms Nobody Talks About',
    excerpt: 'ADHD looks different in adults — especially women. Beyond hyperactivity and inattention, there are lesser-known presentations that often go undiagnosed for decades.',
    author: 'Dr. Sarah Mitchell',
    authorRole: 'Clinical Psychologist',
    publishedAt: '2024-04-05',
    readTime: 11,
    tag: 'ADHD',
    imageColor: 'from-yellow-400 to-amber-500',
  },
  {
    id: '8',
    title: 'Mindfulness for Beginners: A Practical 5-Minute Practice',
    excerpt: 'You don\'t need to meditate for an hour a day to see benefits. Science shows that even 5 minutes of mindfulness practice can measurably reduce stress and anxiety.',
    author: 'Dr. Priya Sharma',
    authorRole: 'Psychiatrist',
    publishedAt: '2024-04-01',
    readTime: 5,
    tag: 'Mindfulness',
    imageColor: 'from-cyan-400 to-teal-500',
  },
  {
    id: '9',
    title: 'Grief Has No Timeline: Healing at Your Own Pace',
    excerpt: 'The stages of grief aren\'t linear, and there\'s no "right" way to grieve. A compassionate guide to understanding loss and allowing yourself to heal.',
    author: 'James Okafor',
    authorRole: 'Mental Health Advocate',
    publishedAt: '2024-03-28',
    readTime: 8,
    tag: 'Grief',
    imageColor: 'from-blue-300 to-blue-500',
  },
  {
    id: '10',
    title: 'The Mental Health Benefits of Good Sleep',
    excerpt: 'Sleep and mental health are deeply intertwined. Improving your sleep quality can be one of the most impactful interventions for anxiety, depression, and mood disorders.',
    author: 'Dr. Sarah Mitchell',
    authorRole: 'Clinical Psychologist',
    publishedAt: '2024-03-22',
    readTime: 7,
    tag: 'Sleep',
    imageColor: 'from-indigo-300 to-indigo-500',
  },
  {
    id: '11',
    title: 'How to Support a Loved One with Mental Illness',
    excerpt: 'Watching someone you love struggle with mental illness can feel helpless and overwhelming. Here\'s a practical, compassionate guide to being a meaningful source of support.',
    author: 'Dr. Priya Sharma',
    authorRole: 'Psychiatrist',
    publishedAt: '2024-03-15',
    readTime: 9,
    tag: 'Relationships',
    imageColor: 'from-pink-400 to-rose-500',
  },
  {
    id: '12',
    title: 'Starting Therapy: Everything You Need to Know for Your First Session',
    excerpt: 'First therapy sessions can feel daunting. Knowing what to expect — and what you\'re allowed to say or not say — can make all the difference in getting the most out of it.',
    author: 'James Okafor',
    authorRole: 'Mental Health Advocate',
    publishedAt: '2024-03-10',
    readTime: 6,
    tag: 'Getting Started',
    imageColor: 'from-green-400 to-emerald-500',
  },
];

const ALL_TAGS = ['All', ...Array.from(new Set(POSTS.map((p) => p.tag))).sort()];
const POSTS_PER_PAGE = 6;

// ─── Card components ──────────────────────────────────────────────────────────

function PostImagePlaceholder({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' | 'lg' }) {
  const h = size === 'lg' ? 'h-64 sm:h-80' : size === 'md' ? 'h-44' : 'h-32';
  return (
    <div className={`w-full ${h} bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center`}>
      <BookOpen className="w-10 h-10 text-white/60" />
    </div>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative overflow-hidden">
          <div className={`w-full h-64 lg:h-full min-h-64 bg-gradient-to-br ${post.imageColor} flex items-center justify-center`}>
            <TrendingUp className="w-16 h-16 text-white/50" />
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <span className="inline-block bg-teal-50 text-teal-600 text-xs font-semibold px-3 py-1 rounded-full mb-4 self-start">
            {post.tag}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-teal-600 transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-500 leading-relaxed mb-6 text-sm">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min read</span>
              </div>
            </div>
            <Link
              href={`/blog/${post.id}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Read <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group flex flex-col"
    >
      <PostImagePlaceholder color={post.imageColor} />
      <div className="p-5 flex flex-col flex-1">
        <span className="inline-block bg-gray-50 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full mb-3 self-start border border-gray-100">
          {post.tag}
        </span>
        <h3 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-teal-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-xs font-semibold text-gray-700">{post.author}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{post.readTime}m</span>
            </div>
          </div>
          <Link
            href={`/blog/${post.id}`}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-0.5 transition-colors"
          >
            Read <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const featured = POSTS.find((p) => p.featured)!;
  const rest = POSTS.filter((p) => !p.featured);

  const filtered = useMemo(() => {
    return rest.filter((p) => {
      const matchTag = activeTag === 'All' || p.tag === activeTag;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        p.tag.toLowerCase().includes(search.toLowerCase());
      return matchTag && matchSearch;
    });
  }, [activeTag, search, rest]);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const handleTagChange = (tag: string) => { setActiveTag(tag); setPage(1); };
  const handleSearch = (val: string) => { setSearch(val); setPage(1); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-600 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" /> HealMate Journal
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Mental Health Insights</h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Evidence-based articles, personal stories, and expert advice to support your mental wellbeing journey.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Featured post */}
        {activeTag === 'All' && !search && <div className="mb-8"><FeaturedPost post={featured} /></div>}

        {/* Search + Tags */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagChange(tag)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border',
                  activeTag === tag
                    ? 'bg-teal-500 text-white border-teal-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600',
                )}
              >
                {tag !== 'All' && <Tag className="w-3 h-3" />}
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400 mb-5">
          {filtered.length} article{filtered.length !== 1 ? 's' : ''}
          {activeTag !== 'All' && ` in "${activeTag}"`}
          {search && ` matching "${search}"`}
        </p>

        {/* Grid */}
        {paginated.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-400 text-sm mb-4">Try a different tag or search term.</p>
            <button
              onClick={() => { handleTagChange('All'); handleSearch(''); }}
              className="text-teal-600 hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {paginated.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
                  p === page ? 'bg-teal-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-2">Stay informed</h3>
          <p className="text-teal-100 mb-6 text-sm max-w-sm mx-auto">
            Get our weekly mental health insights delivered straight to your inbox. No spam, ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none placeholder:text-gray-400"
            />
            <button className="px-5 py-3 bg-teal-800 text-white rounded-xl font-medium text-sm hover:bg-teal-900 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-teal-200 mt-3">Unsubscribe anytime · No spam</p>
        </motion.div>
      </div>
    </div>
  );
}
