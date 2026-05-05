'use client';
import { useState, useEffect } from 'react';
import { Shield, Ban, CheckCircle, Flag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Report { id: string; reportedProfileId: string; reportedUser?: { displayName: string; location: string }; reporterName?: string; reason: string; createdAt: string; }

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dating/reported').then(r => { const d = r.data as { data: Report[] }; setReports(d.data); }).catch(() => toast.error('Failed to load reports')).finally(() => setLoading(false));
  }, []);

  const dismissReport = async (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    toast.success('Report dismissed');
  };

  const suspendProfile = async (profileId: string) => {
    if (!window.confirm('Suspend this dating profile?')) return;
    try {
      await api.post(`/admin/dating/profiles/${profileId}/suspend`);
      toast.success('Profile suspended');
      setReports(prev => prev.filter(r => r.reportedProfileId !== profileId));
    } catch { toast.error('Failed to suspend profile'); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-error" /></div>
        <div><h1 className="text-2xl font-bold text-text-primary">Dating Moderation</h1><p className="text-text-secondary text-sm">{reports.length} active reports</p></div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-background rounded-2xl animate-pulse border border-border" />)}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary">All clear!</h3>
          <p className="text-text-secondary">No reported profiles to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0"><Flag className="w-5 h-5 text-error" /></div>
                  <div>
                    <p className="font-semibold text-text-primary">{report.reportedUser?.displayName ?? 'Unknown User'}</p>
                    <p className="text-text-secondary text-sm">{report.reportedUser?.location}</p>
                    <p className="text-error text-sm mt-1"><strong>Reason:</strong> {report.reason}</p>
                    {report.reporterName && <p className="text-text-secondary text-xs mt-1">Reported by: {report.reporterName}</p>}
                    <p className="text-text-secondary text-xs">{formatDate(report.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => dismissReport(report.id)} className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-background transition-colors">Dismiss</button>
                  <button onClick={() => suspendProfile(report.reportedProfileId)} className="px-3 py-1.5 bg-error text-white rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center gap-1">
                    <Ban className="w-4 h-4" /> Suspend
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
