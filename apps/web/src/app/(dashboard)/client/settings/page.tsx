'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Bell, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const profileSchema = z.object({ firstName: z.string().min(1), lastName: z.string().min(1), phone: z.string().optional(), bio: z.string().optional(), timezone: z.string() });
const passwordSchema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8), confirmPassword: z.string() }).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'password', label: 'Password', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'account', label: 'Account', icon: Trash2 },
];

export default function ClientSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const { user, logout } = useAuthStore();

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: { firstName: '', lastName: '', phone: '', bio: '', timezone: 'UTC' } });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const saveProfile = async (data: ProfileForm) => {
    try {
      setSaving(true);
      await api.put('/clients/profile', data);
      toast.success('Profile updated successfully');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async (data: PasswordForm) => {
    try {
      setSaving(true);
      await api.put('/users/me', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch { toast.error('Failed to change password. Check your current password.'); }
    finally { setSaving(false); }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await api.delete('/users/me');
      logout();
      window.location.href = '/';
    } catch { toast.error('Failed to delete account'); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>
      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left', activeTab === tab.key ? 'bg-primary-50 text-primary' : 'text-text-secondary hover:bg-background hover:text-text-primary')}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 card p-6">
          {activeTab === 'profile' && (
            <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Profile Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-1 block">First Name</label>
                  <input {...profileForm.register('firstName')} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary mb-1 block">Last Name</label>
                  <input {...profileForm.register('lastName')} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary mb-1 block">Email</label>
                <input value={user?.email ?? ''} disabled className="input-field opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary mb-1 block">Phone</label>
                <input {...profileForm.register('phone')} className="input-field" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary mb-1 block">Bio</label>
                <textarea {...profileForm.register('bio')} rows={3} className="input-field resize-none" placeholder="Tell us a little about yourself..." />
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Change Password</h2>
              {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
                <div key={field}>
                  <label className="text-sm font-medium text-text-primary mb-1 block">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
                  <input type="password" {...passwordForm.register(field as 'currentPassword' | 'newPassword' | 'confirmPassword')} className="input-field" />
                  {passwordForm.formState.errors[field as keyof PasswordForm] && (
                    <p className="text-error text-sm mt-1">{passwordForm.formState.errors[field as keyof PasswordForm]?.message}</p>
                  )}
                </div>
              ))}
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Lock className="w-4 h-4" /> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Notification Preferences</h2>
              {[
                { label: 'Session Reminders', desc: 'Get notified 24 hours and 1 hour before your session' },
                { label: 'New Messages', desc: 'Receive notifications for new messages from therapists' },
                { label: 'Booking Updates', desc: 'Stay updated on booking confirmations and changes' },
                { label: 'Marketing Emails', desc: 'Receive tips, resources, and platform updates' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div>
                    <p className="font-medium text-text-primary">{item.label}</p>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'account' && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Account</h2>
              <div className="border border-error rounded-xl p-6 bg-red-50">
                <h3 className="font-semibold text-error mb-2">Delete Account</h3>
                <p className="text-sm text-text-secondary mb-4">Once you delete your account, all your data will be permanently removed. This action cannot be undone.</p>
                <button onClick={deleteAccount} className="px-4 py-2 bg-error text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
