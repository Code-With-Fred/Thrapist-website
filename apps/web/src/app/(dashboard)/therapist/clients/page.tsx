'use client';
import { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ClientSummary {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  sessionCount: number;
  lastSession?: string;
}

export default function TherapistClientsPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: { id: string; scheduledAt: string; status: string; client: { id: string; firstName?: string; lastName?: string; email: string } }[] }>('/bookings')
      .then(r => {
        const bookings = r.data.data ?? [];
        // Deduplicate by client id, count sessions
        const map = new Map<string, ClientSummary>();
        for (const b of bookings) {
          if (!b.client) continue;
          const cid = b.client.id;
          const existing = map.get(cid);
          if (existing) {
            existing.sessionCount++;
            if (!existing.lastSession || b.scheduledAt > existing.lastSession) {
              existing.lastSession = b.scheduledAt;
            }
          } else {
            map.set(cid, {
              id: cid,
              firstName: b.client.firstName,
              lastName: b.client.lastName,
              email: b.client.email,
              sessionCount: 1,
              lastSession: b.scheduledAt,
            });
          }
        }
        setClients(Array.from(map.values()));
      })
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const name = `${c.firstName ?? ''} ${c.lastName ?? ''} ${c.email}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const displayName = (c: ClientSummary) => {
    const n = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
    return n || c.email.split('@')[0];
  };

  const initials = (c: ClientSummary) => {
    if (c.firstName && c.lastName) return `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();
    return c.email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">My Clients</h1>
        <span className="text-text-secondary text-sm">{clients.length} total</span>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-background rounded-2xl animate-pulse border border-border" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-border mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">{search ? 'No clients found' : 'No clients yet'}</h3>
          <p className="text-text-secondary">Your clients will appear here once they book sessions with you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(client => (
            <div key={client.id} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                {initials(client)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">{displayName(client)}</h3>
                <p className="text-xs text-text-secondary truncate">{client.email}</p>
                <div className="flex gap-3 mt-1 text-sm text-text-secondary">
                  <span>{client.sessionCount} session{client.sessionCount !== 1 ? 's' : ''}</span>
                  {client.lastSession && (
                    <span>Last: {new Date(client.lastSession).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 text-success text-xs rounded-full font-medium shrink-0">Active</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
