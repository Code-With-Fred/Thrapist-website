'use client';
import { useState, useEffect } from 'react';
import { Save, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const min = i % 2 === 0 ? '00' : '30';
  if (hour > 20) return null;
  const label = hour < 12 ? `${hour}:${min} AM` : hour === 12 ? `12:${min} PM` : `${hour - 12}:${min} PM`;
  return { value: `${String(hour).padStart(2, '0')}:${min}`, label };
}).filter(Boolean) as { value: string; label: string }[];

interface AvailabilitySlot { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean; }

export default function TherapistAvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(() =>
    DAYS.map((_, i) => ({ dayOfWeek: i, startTime: '09:00', endTime: '17:00', isAvailable: i >= 1 && i <= 5 }))
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/therapists/me/profile').then(r => {
      const d = r.data as { data: { availability?: AvailabilitySlot[] } };
      if (d.data.availability?.length) setAvailability(d.data.availability);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleDay = (dayIndex: number) => {
    setAvailability(prev => prev.map((slot, i) => i === dayIndex ? { ...slot, isAvailable: !slot.isAvailable } : slot));
  };

  const updateTime = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => prev.map((slot, i) => i === dayIndex ? { ...slot, [field]: value } : slot));
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      await api.put('/therapists/me/availability', { slots: availability });
      toast.success('Availability saved successfully');
    } catch { toast.error('Failed to save availability'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-6"><div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-background rounded-2xl animate-pulse border border-border" />)}</div></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Availability</h1>
        <button onClick={saveAvailability} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="p-4 bg-primary-50 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <p className="text-sm text-primary font-medium">Toggle days on/off and set your working hours for each day.</p>
        </div>
        <div className="divide-y divide-border">
          {DAYS.map((day, i) => {
            const slot = availability[i];
            if (!slot) return null;
            return (
              <div key={day} className={cn('flex items-center gap-4 p-4 transition-colors', slot.isAvailable ? 'bg-white' : 'bg-background')}>
                <button
                  onClick={() => toggleDay(i)}
                  className={cn('w-12 h-6 rounded-full transition-all flex-shrink-0 relative', slot.isAvailable ? 'bg-primary' : 'bg-border')}
                >
                  <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm', slot.isAvailable ? 'left-7' : 'left-1')} />
                </button>
                <div className={cn('w-28 font-medium text-sm', slot.isAvailable ? 'text-text-primary' : 'text-text-secondary')}>{day}</div>
                {slot.isAvailable ? (
                  <div className="flex items-center gap-2 flex-1">
                    <select value={slot.startTime} onChange={e => updateTime(i, 'startTime', e.target.value)} className="input-field py-2 text-sm">
                      {TIME_SLOTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <span className="text-text-secondary text-sm">to</span>
                    <select value={slot.endTime} onChange={e => updateTime(i, 'endTime', e.target.value)} className="input-field py-2 text-sm">
                      {TIME_SLOTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="text-text-secondary text-sm italic">Unavailable</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-text-primary mb-1">Availability Summary</h3>
        <p className="text-sm text-text-secondary mb-3">Your current available days:</p>
        <div className="flex flex-wrap gap-2">
          {availability.filter(s => s.isAvailable).map(s => (
            <span key={s.dayOfWeek} className="px-3 py-1.5 bg-primary-50 text-primary text-sm rounded-xl font-medium">
              {DAYS[s.dayOfWeek]}: {s.startTime} – {s.endTime}
            </span>
          ))}
          {!availability.some(s => s.isAvailable) && <p className="text-text-secondary text-sm">No days selected. Toggle days above to set your availability.</p>}
        </div>
      </div>
    </div>
  );
}
