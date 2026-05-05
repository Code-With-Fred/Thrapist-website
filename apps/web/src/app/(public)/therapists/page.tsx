'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, ChevronDown, Star, Video, Phone, MapPin,
  ChevronLeft, ChevronRight, CheckCircle2, Globe, Calendar
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { cn, formatCurrency, getInitials } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const CONCERNS = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Relationship Issues', 'Grief & Loss',
  'Stress Management', 'Self-Esteem', 'OCD', 'Bipolar Disorder', 'ADHD',
  'Eating Disorders', 'Addiction', 'Anger Management', 'Phobias', 'Sleep Issues',
  'Life Transitions', 'Family Conflict', 'Chronic Illness', 'LGBTQ+ Issues',
  'Career Challenges', 'Parenting', 'Burnout', 'Loneliness', 'Identity',
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'Mandarin', 'Cantonese', 'Arabic',
  'Portuguese', 'Hindi', 'Urdu', 'Korean', 'Japanese', 'German',
];

const SESSION_TYPES = ['Video', 'Phone', 'In-Person'] as const;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const GENDERS = ['Any', 'Male', 'Female', 'Non-binary'] as const;
const SORT_OPTIONS = [
  { value: 'best_match', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'experience', label: 'Most Experienced' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  concerns: string[];
  sessionTypes: string[];
  sessionRate: number;
  yearsOfExperience: number;
  location?: string;
  isVerified: boolean;
  languages: string[];
}

interface FiltersState {
  concerns: string[];
  priceMin: number;
  priceMax: number;
  sessionTypes: string[];
  gender: string;
  languages: string[];
  days: string[];
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TherapistCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-gray-200 rounded-full w-20" />)}
      </div>
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="flex gap-2">
          <div className="h-9 bg-gray-200 rounded-xl w-24" />
          <div className="h-9 bg-gray-200 rounded-xl w-32" />
        </div>
      </div>
    </div>
  );
}

// ─── Therapist Card ───────────────────────────────────────────────────────────

function TherapistCard({ therapist }: { therapist: Therapist }) {
  const name = `${therapist.firstName} ${therapist.lastName}`;
  const initials = getInitials(therapist.firstName, therapist.lastName);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-teal-100 transition-all duration-300 flex flex-col"
    >
      {/* Header */}
      <div className="flex gap-4 mb-4">
        <div className="relative shrink-0">
          {therapist.avatarUrl ? (
            <Image
              src={therapist.avatarUrl}
              alt={name}
              width={64}
              height={64}
              className="rounded-full object-cover w-16 h-16"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
          )}
          {therapist.isVerified && (
            <CheckCircle2 className="absolute -bottom-1 -right-1 w-5 h-5 text-teal-500 bg-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          <p className="text-sm text-gray-500 truncate">{therapist.title}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-gray-700">{therapist.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({therapist.reviewCount} reviews)</span>
          </div>
          {therapist.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 truncate">{therapist.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Session type icons */}
      <div className="flex gap-2 mb-3">
        {therapist.sessionTypes.includes('Video') && (
          <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            <Video className="w-3 h-3" /> Video
          </span>
        )}
        {therapist.sessionTypes.includes('Phone') && (
          <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
            <Phone className="w-3 h-3" /> Phone
          </span>
        )}
        {therapist.sessionTypes.includes('In-Person') && (
          <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
            <MapPin className="w-3 h-3" /> In-Person
          </span>
        )}
      </div>

      {/* Concerns */}
      <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
        {therapist.concerns.slice(0, 4).map((c) => (
          <span key={c} className="text-xs bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-full">
            {c}
          </span>
        ))}
        {therapist.concerns.length > 4 && (
          <span className="text-xs text-teal-600 px-1">+{therapist.concerns.length - 4} more</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
        <div>
          <span className="font-bold text-gray-900 text-lg">{formatCurrency(therapist.sessionRate)}</span>
          <span className="text-xs text-gray-400"> /session</span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/therapists/${therapist.id}`}
            className="text-sm font-medium text-teal-600 border border-teal-200 px-3 py-1.5 rounded-xl hover:bg-teal-50 transition-colors"
          >
            View Profile
          </Link>
          <Link
            href={`/therapists/${therapist.id}?book=consultation`}
            className="text-sm font-medium text-white bg-teal-500 px-3 py-1.5 rounded-xl hover:bg-teal-600 transition-colors whitespace-nowrap"
          >
            Free Consult
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ meta, onPage }: { meta: PaginationMeta; onPage: (p: number) => void }) {
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1);
  const visible = pages.filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1);

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPage(meta.page - 1)}
        disabled={meta.page === 1}
        className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        return (
          <span key={p} className="flex items-center gap-1">
            {prev && p - prev > 1 && <span className="px-1 text-gray-400">…</span>}
            <button
              onClick={() => onPage(p)}
              className={cn(
                'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
                p === meta.page
                  ? 'bg-teal-500 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        onClick={() => onPage(meta.page + 1)}
        disabled={meta.page === meta.totalPages}
        className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function FilterSidebar({
  filters,
  onChange,
  onClear,
}: {
  filters: FiltersState;
  onChange: (f: Partial<FiltersState>) => void;
  onClear: () => void;
}) {
  const [concernSearch, setConcernSearch] = useState('');
  const [langSearch, setLangSearch] = useState('');

  const filteredConcerns = CONCERNS.filter((c) =>
    c.toLowerCase().includes(concernSearch.toLowerCase()),
  );
  const filteredLangs = LANGUAGES.filter((l) =>
    l.toLowerCase().includes(langSearch.toLowerCase()),
  );

  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const activeCount =
    filters.concerns.length +
    filters.sessionTypes.length +
    filters.languages.length +
    filters.days.length +
    (filters.gender !== 'Any' ? 1 : 0) +
    (filters.priceMax < 300 || filters.priceMin > 0 ? 1 : 0);

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-500" />
          Filters
          {activeCount > 0 && (
            <span className="bg-teal-100 text-teal-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Concerns */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Concerns</h3>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={concernSearch}
            onChange={(e) => setConcernSearch(e.target.value)}
            placeholder="Search concerns..."
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
          {filteredConcerns.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.concerns.includes(c)}
                onChange={() => onChange({ concerns: toggle(filters.concerns, c) })}
                className="rounded border-gray-300 text-teal-500 focus:ring-teal-300"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Price per session
          <span className="ml-2 text-teal-600 font-semibold">
            ${filters.priceMin} – ${filters.priceMax === 300 ? '300+' : filters.priceMax}
          </span>
        </h3>
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={300}
            step={10}
            value={filters.priceMax}
            onChange={(e) => onChange({ priceMax: Number(e.target.value) })}
            className="w-full accent-teal-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$0</span>
            <span>$300+</span>
          </div>
        </div>
      </div>

      {/* Session Type */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Session Type</h3>
        <div className="space-y-1.5">
          {SESSION_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.sessionTypes.includes(t)}
                onChange={() => onChange({ sessionTypes: toggle(filters.sessionTypes, t) })}
                className="rounded border-gray-300 text-teal-500 focus:ring-teal-300"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors flex items-center gap-1.5">
                {t === 'Video' && <Video className="w-3.5 h-3.5 text-blue-400" />}
                {t === 'Phone' && <Phone className="w-3.5 h-3.5 text-green-400" />}
                {t === 'In-Person' && <MapPin className="w-3.5 h-3.5 text-purple-400" />}
                {t}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Therapist Gender</h3>
        <div className="space-y-1.5">
          {GENDERS.map((g) => (
            <label key={g} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="gender"
                value={g}
                checked={filters.gender === g}
                onChange={() => onChange({ gender: g })}
                className="border-gray-300 text-teal-500 focus:ring-teal-300"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{g}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Language</h3>
        <div className="relative mb-2">
          <Globe className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={langSearch}
            onChange={(e) => setLangSearch(e.target.value)}
            placeholder="Search languages..."
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin pr-1">
          {filteredLangs.map((l) => (
            <label key={l} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.languages.includes(l)}
                onChange={() => onChange({ languages: toggle(filters.languages, l) })}
                className="rounded border-gray-300 text-teal-500 focus:ring-teal-300"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Availability</span>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => onChange({ days: toggle(filters.days, d) })}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                filters.days.includes(d)
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Default filters ──────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FiltersState = {
  concerns: [],
  priceMin: 0,
  priceMax: 300,
  sessionTypes: [],
  gender: 'Any',
  languages: [],
  days: [],
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TherapistsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'best_match');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>(() => {
    return {
      concerns: searchParams.get('concerns')?.split(',').filter(Boolean) ?? [],
      priceMin: Number(searchParams.get('priceMin') ?? 0),
      priceMax: Number(searchParams.get('priceMax') ?? 300),
      sessionTypes: searchParams.get('sessionTypes')?.split(',').filter(Boolean) ?? [],
      gender: searchParams.get('gender') ?? 'Any',
      languages: searchParams.get('languages')?.split(',').filter(Boolean) ?? [],
      days: searchParams.get('days')?.split(',').filter(Boolean) ?? [],
    };
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTherapists = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 12,
        sort,
        ...(search && { q: search }),
        ...(filters.concerns.length && { concerns: filters.concerns.join(',') }),
        ...(filters.priceMax < 300 && { priceMax: filters.priceMax * 100 }),
        ...(filters.priceMin > 0 && { priceMin: filters.priceMin * 100 }),
        ...(filters.sessionTypes.length && { sessionTypes: filters.sessionTypes.join(',') }),
        ...(filters.gender !== 'Any' && { gender: filters.gender }),
        ...(filters.languages.length && { languages: filters.languages.join(',') }),
        ...(filters.days.length && { days: filters.days.join(',') }),
      };
      const res = await api.get('/therapists', { params });
      setTherapists(res.data.data.therapists ?? []);
      setMeta(res.data.data.meta ?? { total: 0, page: 1, limit: 12, totalPages: 1 });
    } catch {
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  }, [search, sort, filters]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTherapists(1);
      // Sync URL params
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (sort !== 'best_match') params.set('sort', sort);
      if (filters.concerns.length) params.set('concerns', filters.concerns.join(','));
      if (filters.priceMax < 300) params.set('priceMax', String(filters.priceMax));
      if (filters.sessionTypes.length) params.set('sessionTypes', filters.sessionTypes.join(','));
      if (filters.gender !== 'Any') params.set('gender', filters.gender);
      if (filters.languages.length) params.set('languages', filters.languages.join(','));
      if (filters.days.length) params.set('days', filters.days.join(','));
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, sort, filters, fetchTherapists, router]);

  const handleFilterChange = (partial: Partial<FiltersState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  // Active filter chips
  const activeChips: { label: string; onRemove: () => void }[] = [
    ...filters.concerns.map((c) => ({
      label: c,
      onRemove: () => handleFilterChange({ concerns: filters.concerns.filter((x) => x !== c) }),
    })),
    ...filters.sessionTypes.map((t) => ({
      label: t,
      onRemove: () => handleFilterChange({ sessionTypes: filters.sessionTypes.filter((x) => x !== t) }),
    })),
    ...filters.languages.map((l) => ({
      label: l,
      onRemove: () => handleFilterChange({ languages: filters.languages.filter((x) => x !== l) }),
    })),
    ...filters.days.map((d) => ({
      label: d,
      onRemove: () => handleFilterChange({ days: filters.days.filter((x) => x !== d) }),
    })),
    ...(filters.gender !== 'Any' ? [{ label: filters.gender, onRemove: () => handleFilterChange({ gender: 'Any' }) }] : []),
    ...((filters.priceMax < 300 || filters.priceMin > 0)
      ? [{ label: `$${filters.priceMin}–$${filters.priceMax}`, onRemove: () => handleFilterChange({ priceMin: 0, priceMax: 300 }) }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Therapist</h1>
          <p className="text-gray-500">Connect with licensed therapists who match your needs</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search + sort bar */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, specialty, or concern..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm bg-white"
                />
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeChips.length > 0 && (
                  <span className="bg-teal-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeChips.length}
                  </span>
                )}
              </button>
            </div>

            {/* Results info + chips */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${meta.total} therapist${meta.total !== 1 ? 's' : ''} found`}
              </span>
              {activeChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full border border-teal-100"
                >
                  {chip.label}
                  <button onClick={chip.onRemove} className="hover:text-teal-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {activeChips.length > 0 && (
                <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 12 }).map((_, i) => <TherapistCardSkeleton key={i} />)}
              </div>
            ) : therapists.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No therapists found</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  Try adjusting your filters or search terms to find the right therapist for you.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition-colors"
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                    {therapists.map((t) => <TherapistCard key={t.id} therapist={t} />)}
                  </div>
                </AnimatePresence>
                {meta.totalPages > 1 && (
                  <Pagination meta={meta} onPage={(p) => fetchTherapists(p)} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />
              </div>
              <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
                >
                  Show {meta.total} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
