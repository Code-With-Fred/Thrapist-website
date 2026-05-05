'use client';
import { useState, useEffect } from 'react';
import { Heart, X, MapPin, Sparkles, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

interface DatingProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  bio?: string;
  interests: string[];
  photos: string[];
  location?: string;
}

function displayName(p: DatingProfile): string {
  return `${p.firstName}${p.lastName ? ` ${p.lastName}` : ''}`.trim();
}

function calculateAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function ConnectPage() {
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myProfile, setMyProfile] = useState<DatingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [liking, setLiking] = useState(false);
  const [matchedName, setMatchedName] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<{ data: DatingProfile | null }>('/dating/profile/me')
        .then(r => setMyProfile(r.data.data))
        .catch(() => {}),
      api.get<{ data: DatingProfile[] }>('/dating/browse')
        .then(r => setProfiles(r.data.data ?? []))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleLike = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;
    try {
      setLiking(true);
      const res = await api.post<{ data: { isMatch: boolean } }>('/matches/like', {
        targetUserId: profile.userId,
      });
      if (res.data.data.isMatch) {
        setMatchedName(displayName(profile));
        setShowMatch(true);
      }
      setCurrentIndex(prev => prev + 1);
    } catch {
      toast.error('Failed to like profile');
    } finally {
      setLiking(false);
    }
  };

  const handlePass = () => setCurrentIndex(prev => prev + 1);

  const currentProfile = profiles[currentIndex];

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-16">
      <Navbar />
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-80 h-[500px] bg-white rounded-3xl shadow-xl animate-pulse" />
      </div>
    </div>
  );

  if (!myProfile) return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-16">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-10 shadow-xl">
          <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" fill="white" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Create Your Profile</h2>
          <p className="text-text-secondary mb-8">Set up your dating profile to start connecting with others on your wellness journey.</p>
          <Link href="/connect/create-profile" className="btn-secondary block text-center py-4 text-base">
            Create Dating Profile
          </Link>
          <p className="text-xs text-text-secondary mt-4">This is completely separate from your therapy profile.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-16">
      <Navbar />

      {/* Match Modal */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">It&apos;s a Match!</h2>
            <p className="text-text-secondary mb-6">You and {matchedName} liked each other. Start a conversation!</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMatch(false)}
                className="flex-1 px-4 py-3 border border-border rounded-xl font-medium text-text-secondary hover:bg-background transition-colors"
              >
                Keep Browsing
              </button>
              <Link
                href="/matches"
                className="flex-1 px-4 py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary-600 transition-colors text-center"
              >
                View Matches
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Heart className="w-6 h-6 text-secondary" fill="currentColor" /> Connect
          </h1>
          <button className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-background transition-colors">
            <Filter className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {!currentProfile ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">You&apos;ve seen everyone!</h3>
            <p className="text-text-secondary mb-6">Check back later for new profiles in your area.</p>
            <Link href="/matches" className="btn-secondary inline-block">View Your Matches</Link>
          </div>
        ) : (
          <>
            <div className="card overflow-hidden mb-6 shadow-xl">
              <div className="h-96 bg-gradient-to-br from-secondary-100 to-purple-200 relative">
                {currentProfile.photos?.[0] ? (
                  <img src={currentProfile.photos[0]} alt={displayName(currentProfile)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-8xl font-bold text-white/60">{currentProfile.firstName[0]}</div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-6 text-white">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {displayName(currentProfile)}
                        {calculateAge(currentProfile.birthDate) !== null && `, ${calculateAge(currentProfile.birthDate)}`}
                      </h2>
                      {currentProfile.location && (
                        <div className="flex items-center gap-1 text-sm opacity-90">
                          <MapPin className="w-4 h-4" />{currentProfile.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {currentProfile.bio && (
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">{currentProfile.bio}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {(currentProfile.interests ?? []).slice(0, 6).map(i => (
                    <span key={i} className="px-3 py-1 bg-secondary-50 text-secondary text-xs rounded-full font-medium">{i}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-8">
              <button
                onClick={handlePass}
                disabled={liking}
                className="w-16 h-16 rounded-full bg-white border-2 border-border shadow-md flex items-center justify-center hover:border-error hover:text-error transition-all hover:scale-110 disabled:opacity-50"
              >
                <X className="w-7 h-7" />
              </button>
              <button
                onClick={handleLike}
                disabled={liking}
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50',
                  liking ? 'bg-secondary/60' : 'bg-secondary hover:bg-secondary-600',
                )}
              >
                <Heart className="w-9 h-9 text-white" fill="white" />
              </button>
            </div>

            <p className="text-center text-text-secondary text-sm mt-4">
              {profiles.length - currentIndex - 1} profile{profiles.length - currentIndex - 1 !== 1 ? 's' : ''} left
            </p>
          </>
        )}
      </div>
    </div>
  );
}
