'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface TherapistApplication {
  id: string; userId: string; firstName: string; lastName: string; title: string; licenseType: string; licenseNumber: string; yearsOfExperience: number; concerns: string[]; bio: string; createdAt: string;
}

export default function AdminTherapistsPage() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [therapists, setTherapists] = useState<TherapistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<TherapistApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'pending' ? '/admin/therapists/pending' : `/therapists?approved=${tab === 'approved'}`;
      const r = await api.get(endpoint);
      const d = r.data as { data: TherapistApplication[] };
      setTherapists(d.data);
    } catch { toast.error('Failed to load therapists'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTherapists(); }, [tab]);

  const approve = async (id: string) => {
    try {
      setActionId(id);
      await api.put(`/admin/therapists/${id}/approve`);
      toast.success('Therapist approved');
      setShowModal(null);
      fetchTherapists();
    } catch { toast.error('Failed to approve'); }
    finally { setActionId(null); }
  };

  const reject = async (id: string) => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    try {
      setActionId(id);
      await api.put(`/admin/therapists/${id}/reject`, { reason: rejectReason });
      toast.success('Application rejected');
      setShowModal(null);
      setRejectReason('');
      fetchTherapists();
    } catch { toast.error('Failed to reject'); }
    finally { setActionId(null); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Therapist Management</h1>

      <div className="flex gap-1 bg-background rounded-xl p-1 w-fit border border-border mb-6">
        {(['pending', 'approved', 'rejected'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all', tab === t ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary')}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-background rounded-2xl animate-pulse border border-border" />)}</div>
      ) : therapists.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-12 h-12 text-border mx-auto mb-4" />
          <p className="text-text-secondary">No {tab} therapists</p>
        </div>
      ) : (
        <div className="space-y-4">
          {therapists.map(t => (
            <div key={t.id} className="card p-5 flex flex-col sm:flex-row gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center text-white font-bold flex-shrink-0">{t.firstName[0]}</div>
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-text-primary">{t.firstName} {t.lastName}</h3>
                    <p className="text-text-secondary text-sm">{t.title} · {t.licenseType}</p>
                  </div>
                  <span className="text-xs text-text-secondary">Applied {formatDate(t.createdAt)}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {t.concerns?.slice(0, 4).map(c => <span key={c} className="px-2 py-0.5 bg-primary-50 text-primary text-xs rounded-full">{c}</span>)}
                </div>
                {tab === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => setShowModal(t)} className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-lg text-sm text-text-primary hover:bg-background transition-colors">
                      <Eye className="w-4 h-4" /> Review
                    </button>
                    <button onClick={() => approve(t.id)} disabled={actionId === t.id} className="flex items-center gap-1 px-3 py-1.5 bg-success text-white rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => setShowModal(t)} className="flex items-center gap-1 px-3 py-1.5 bg-error text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-text-primary mb-4">Review: {showModal.firstName} {showModal.lastName}</h2>
            <div className="space-y-3 mb-6 text-sm">
              <div><span className="font-medium text-text-primary">Title:</span> <span className="text-text-secondary">{showModal.title}</span></div>
              <div><span className="font-medium text-text-primary">License:</span> <span className="text-text-secondary">{showModal.licenseType} #{showModal.licenseNumber}</span></div>
              <div><span className="font-medium text-text-primary">Experience:</span> <span className="text-text-secondary">{showModal.yearsOfExperience} years</span></div>
              <div><span className="font-medium text-text-primary">Bio:</span> <p className="text-text-secondary mt-1">{showModal.bio}</p></div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-text-primary mb-1 block">Rejection Reason (required if rejecting)</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} className="input-field resize-none" placeholder="Explain why this application is being rejected..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(null); setRejectReason(''); }} className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-background transition-colors">Cancel</button>
              <button onClick={() => reject(showModal.id)} disabled={!!actionId} className="flex-1 px-4 py-2 bg-error text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">Reject</button>
              <button onClick={() => approve(showModal.id)} disabled={!!actionId} className="flex-1 px-4 py-2 bg-success text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
