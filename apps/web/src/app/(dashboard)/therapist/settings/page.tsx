'use client';
import { useState, useEffect } from 'react';
import { Save, User, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const CONCERNS = ['Anxiety', 'Depression', 'Trauma & PTSD', 'Stress', 'Relationship Issues', 'Grief & Loss', 'Self-Esteem', 'Addiction', 'Eating Disorders', 'OCD', 'Bipolar Disorder', 'Anger Management', 'Life Transitions', 'LGBTQ+ Issues', 'Chronic Illness', 'Work Stress', 'Parenting', 'Loneliness', 'Sleep Issues', 'Phobias'];
const THERAPY_TYPES = ['Individual Therapy', 'Couples Therapy', 'Family Therapy', 'Group Therapy', 'Child & Adolescent Therapy', 'Initial Consultation'];
const SESSION_TYPES = ['video', 'audio', 'in_person'];

interface ProfileData {
  firstName?: string;
  lastName?: string;
  title?: string;
  bio?: string;
  location?: string;
  sessionRate?: number;
  consultationRate?: number;
  concerns?: string[];
  therapyTypes?: string[];
  sessionTypes?: string[];
}

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'specialties', label: 'Specialties', icon: BookOpen },
];

export default function TherapistSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<ProfileData>({});
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedTherapyTypes, setSelectedTherapyTypes] = useState<string[]>([]);
  const [selectedSessionTypes, setSelectedSessionTypes] = useState<string[]>(['video']);

  useEffect(() => {
    api.get('/therapists/me/profile')
      .then(r => {
        const d = r.data as { data: ProfileData };
        const p = d.data;
        setProfile(p);
        setSelectedConcerns(p.concerns ?? []);
        setSelectedTherapyTypes(p.therapyTypes ?? []);
        setSelectedSessionTypes(p.sessionTypes?.length ? p.sessionTypes : ['video']);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    // Convert numeric fields
    if (data['sessionRate']) data['sessionRate'] = Number(data['sessionRate']) as unknown as FormDataEntryValue;
    if (data['consultationRate']) data['consultationRate'] = Number(data['consultationRate']) as unknown as FormDataEntryValue;
    try {
      setSaving(true);
      await api.put('/therapists/me/profile', data);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const saveSpecialties = async () => {
    try {
      setSaving(true);
      await api.put('/therapists/me/profile', {
        concerns: selectedConcerns,
        therapyTypes: selectedTherapyTypes,
        sessionTypes: selectedSessionTypes,
      });
      toast.success('Specialties updated');
    } catch { toast.error('Failed to update specialties'); }
    finally { setSaving(false); }
  };

  const toggle = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>
      <div className="flex gap-6">
        <nav className="w-44 flex-shrink-0 space-y-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left', activeTab === tab.key ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-background')}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 card p-6">
          {activeTab === 'profile' && (
            <form onSubmit={saveProfile} className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Profile Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-1 block">First Name</label>
                  <input type="text" name="firstName" defaultValue={profile.firstName ?? ''} placeholder="First name" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary mb-1 block">Last Name</label>
                  <input type="text" name="lastName" defaultValue={profile.lastName ?? ''} placeholder="Last name" className="input-field" />
                </div>
              </div>
              {[
                { name: 'bio', label: 'Professional Bio', type: 'textarea', placeholder: 'Describe your approach, experience, and how you help clients...', value: profile.bio ?? '' },
                { name: 'title', label: 'Professional Title', type: 'text', placeholder: 'e.g. Licensed Clinical Psychologist', value: profile.title ?? '' },
                { name: 'location', label: 'Location', type: 'text', placeholder: 'City, State', value: profile.location ?? '' },
                { name: 'sessionRate', label: 'Session Rate (USD)', type: 'number', placeholder: '150', value: String(profile.sessionRate ?? '') },
                { name: 'consultationRate', label: 'Consultation Rate (USD, 0 = free)', type: 'number', placeholder: '0', value: String(profile.consultationRate ?? '') },
              ].map(field => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-text-primary mb-1 block">{field.label}</label>
                  {field.type === 'textarea'
                    ? <textarea name={field.name} rows={4} placeholder={field.placeholder} defaultValue={field.value} className="input-field resize-none" />
                    : <input type={field.type} name={field.name} placeholder={field.placeholder} defaultValue={field.value} className="input-field" />
                  }
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'specialties' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Specialties & Session Types</h2>
              <div>
                <p className="text-sm font-medium text-text-primary mb-2">Concerns You Specialize In</p>
                <div className="flex flex-wrap gap-2">
                  {CONCERNS.map(c => (
                    <button key={c} type="button" onClick={() => toggle(selectedConcerns, setSelectedConcerns, c)} className={cn('px-3 py-1.5 rounded-full text-sm border-2 transition-all', selectedConcerns.includes(c) ? 'border-primary bg-primary text-white' : 'border-border text-text-secondary hover:border-primary')}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-2">Therapy Types Offered</p>
                <div className="flex flex-wrap gap-2">
                  {THERAPY_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => toggle(selectedTherapyTypes, setSelectedTherapyTypes, t)} className={cn('px-3 py-1.5 rounded-full text-sm border-2 transition-all', selectedTherapyTypes.includes(t) ? 'border-primary bg-primary text-white' : 'border-border text-text-secondary hover:border-primary')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-2">Session Formats</p>
                <div className="flex gap-3">
                  {SESSION_TYPES.map(s => (
                    <button key={s} type="button" onClick={() => toggle(selectedSessionTypes, setSelectedSessionTypes, s)} className={cn('px-4 py-2 rounded-xl text-sm font-medium border-2 capitalize transition-all', selectedSessionTypes.includes(s) ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-secondary hover:border-primary')}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveSpecialties} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Specialties'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
