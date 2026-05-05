'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, ArrowRight, User, MapPin, Sparkles, Check, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';

const INTERESTS = [
  'Mindfulness', 'Yoga', 'Meditation', 'Hiking', 'Reading', 'Music',
  'Art', 'Cooking', 'Travel', 'Fitness', 'Photography', 'Writing',
  'Gaming', 'Movies', 'Dancing', 'Volunteering', 'Nature', 'Cycling',
];

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Prefer not to say'];

export default function CreateDatingProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    location: '',
    bio: '',
    interests: [] as string[],
    lookingFor: 'friendship' as 'friendship' | 'relationship' | 'both',
  });

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : prev.interests.length < 10
          ? [...prev.interests, interest]
          : prev.interests,
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post('/dating/profile', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        birthDate: form.birthDate || undefined,
        gender: form.gender || undefined,
        location: form.location.trim() || undefined,
        bio: form.bio.trim() || undefined,
        interests: form.interests,
        lookingFor: form.lookingFor,
      });
      toast.success('Profile created! Start connecting.');
      router.push('/connect');
    } catch {
      toast.error('Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canProceedStep1 = form.firstName.trim().length >= 2 && form.gender;
  const canProceedStep2 = form.bio.trim().length >= 20 && form.location.trim().length >= 2;
  const canSubmit = form.interests.length >= 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C026D3 100%)' }}>
              <Heart size={26} color="white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Create Your Dating Profile</h1>
            <p className="text-[#64748B] text-sm mt-1">Connect with others on their wellness journey</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: s < step ? '#22C55E' : s === step ? 'linear-gradient(135deg, #FF6B9D, #C026D3)' : '#E2E8F0',
                    color: s <= step ? 'white' : '#94A3B8',
                  }}
                >
                  {s < step ? <Check size={14} /> : s}
                </div>
                {s < 3 && <div className="w-10 h-0.5 rounded-full" style={{ background: s < step ? '#22C55E' : '#E2E8F0' }} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">

            {/* Step 1 — Basic info */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-semibold text-[#0F172A] mb-1 flex items-center gap-2">
                    <User size={18} style={{ color: '#FF6B9D' }} /> The basics
                  </h2>
                  <p className="text-xs text-[#64748B]">This is separate from your therapy profile.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                      placeholder="First name"
                      maxLength={50}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Last name</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                      placeholder="Last name"
                      maxLength={50}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Date of birth</label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={e => setForm(p => ({ ...p, birthDate: e.target.value }))}
                    max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GENDERS.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, gender: g }))}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
                        style={{
                          borderColor: form.gender === g ? '#FF6B9D' : '#E2E8F0',
                          background: form.gender === g ? '#FFF0F6' : 'white',
                          color: form.gender === g ? '#FF6B9D' : '#64748B',
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C026D3 100%)' }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2 — About you */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-semibold text-[#0F172A] mb-1 flex items-center gap-2">
                    <MapPin size={18} style={{ color: '#FF6B9D' }} /> About you
                  </h2>
                  <p className="text-xs text-[#64748B]">Help others get to know you.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="City, State"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Bio <span className="text-red-500">*</span>
                    <span className="text-[#94A3B8] font-normal ml-1">({form.bio.length}/300)</span>
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell people a bit about yourself and your wellness journey..."
                    maxLength={300}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                  />
                  {form.bio.length > 0 && form.bio.length < 20 && (
                    <p className="text-xs text-amber-500 mt-1">Please write at least 20 characters.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">I&apos;m looking for</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['friendship', 'relationship', 'both'] as const).map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, lookingFor: opt }))}
                        className="px-3 py-2.5 rounded-xl text-xs font-medium border transition-all capitalize"
                        style={{
                          borderColor: form.lookingFor === opt ? '#FF6B9D' : '#E2E8F0',
                          background: form.lookingFor === opt ? '#FFF0F6' : 'white',
                          color: form.lookingFor === opt ? '#FF6B9D' : '#64748B',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="button"
                    disabled={!canProceedStep2}
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C026D3 100%)' }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Interests */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-semibold text-[#0F172A] mb-1 flex items-center gap-2">
                    <Sparkles size={18} style={{ color: '#FF6B9D' }} /> Your interests
                  </h2>
                  <p className="text-xs text-[#64748B]">Pick at least 1, up to 10. These help find better matches.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => {
                    const selected = form.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                        style={{
                          borderColor: selected ? '#FF6B9D' : '#E2E8F0',
                          background: selected ? 'linear-gradient(135deg, #FF6B9D, #C026D3)' : 'white',
                          color: selected ? 'white' : '#64748B',
                        }}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>

                {form.interests.length > 0 && (
                  <p className="text-xs text-[#64748B]">{form.interests.length} selected</p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    type="button"
                    disabled={!canSubmit || saving}
                    onClick={handleSubmit}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C026D3 100%)' }}
                  >
                    {saving ? (
                      <><Loader2 size={15} className="animate-spin" /> Creating profile…</>
                    ) : (
                      <>Create Profile <Heart size={15} fill="white" /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-[#94A3B8] mt-6">
            Changed your mind?{' '}
            <Link href="/connect" className="text-[#FF6B9D] hover:underline font-medium">Go back</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
