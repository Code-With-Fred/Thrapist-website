'use client';
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';
import { calculateAge } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import toast from 'react-hot-toast';

interface Match { id: string; profile1Id: string; profile2Id: string; createdAt: string; otherProfile?: { id: string; displayName: string; dateOfBirth: string; photos: string[]; location: string; bio: string; }; }

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches').then(r => { const d = r.data as { data: Match[] }; setMatches(d.data); }).catch(() => toast.error('Failed to load matches')).finally(() => setLoading(false));
  }, []);

  const unmatch = async (matchId: string) => {
    if (!window.confirm('Unmatch this person?')) return;
    try {
      await api.delete(`/dating/matches/${matchId}`);
      setMatches(prev => prev.filter(m => m.id !== matchId));
      toast.success('Unmatched');
    } catch { toast.error('Failed to unmatch'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Your Matches</h1>
            <p className="text-text-secondary text-sm">{matches.length} {matches.length === 1 ? 'match' : 'matches'}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] bg-white rounded-2xl animate-pulse shadow" />)}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-border mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">No matches yet</h3>
            <p className="text-text-secondary mb-6">Start swiping to find your connections</p>
            <Link href="/connect" className="btn-secondary inline-block">Start Connecting</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {matches.map(match => {
              const other = match.otherProfile;
              if (!other) return null;
              return (
                <div key={match.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="aspect-square relative bg-gradient-to-br from-secondary-100 to-purple-200">
                    {other.photos[0] ? (
                      <img src={other.photos[0]} alt={other.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/60">{other.displayName[0]}</div>
                    )}
                    <button onClick={() => unmatch(match.id)} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-text-primary text-sm">{other.displayName}, {calculateAge(other.dateOfBirth)}</p>
                    <p className="text-xs text-text-secondary mb-3">{other.location}</p>
                    <Link href={`/matches/${match.id}/chat`} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary text-white rounded-xl text-xs font-medium hover:bg-secondary-600 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" /> Message
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
