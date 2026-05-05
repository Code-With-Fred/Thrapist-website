'use client';
import { useState, useEffect } from 'react';
import { Search, UserX, Trash2, Users, UserPlus, X, Loader2, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface User { id: string; email: string; role: string; isActive: boolean; isVerified: boolean; createdAt: string; clientProfile?: { firstName: string; lastName: string }; therapistProfile?: { firstName: string; lastName: string }; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      const r = await api.get(`/admin/users?${params}`);
      const d = r.data as { data: { users: User[] } };
      setUsers(d.data.users ?? []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const suspendUser = async (id: string, isActive: boolean) => {
    if (!window.confirm(`${isActive ? 'Suspend' : 'Reactivate'} this user?`)) return;
    try {
      const endpoint = isActive ? `/admin/users/${id}/suspend` : `/admin/users/${id}/unsuspend`;
      await api.post(endpoint);
      toast.success(isActive ? 'User suspended' : 'User reactivated');
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to delete user');
    }
  };

  const createAdmin = async () => {
    if (!adminEmail || !adminPassword) return;
    setCreating(true);
    try {
      await api.post('/admin/create-admin', { email: adminEmail, password: adminPassword });
      toast.success('Admin account created');
      setShowCreateAdmin(false);
      setAdminEmail('');
      setAdminPassword('');
      fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to create admin');
    } finally { setCreating(false); }
  };

  const getName = (u: User) => {
    const p = u.clientProfile ?? u.therapistProfile;
    return p ? `${p.firstName} ${p.lastName}`.trim() || '—' : '—';
  };

  return (
    <div className="p-6">
      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary">Create Admin Account</h3>
              <button onClick={() => setShowCreateAdmin(false)} className="p-1 rounded-lg hover:bg-background transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="input-field w-full"
                />
              </div>
              <p className="text-xs text-text-secondary bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                Admin accounts have full access to the platform. Only create accounts for trusted staff.
              </p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreateAdmin(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-background transition-colors">
                Cancel
              </button>
              <button
                onClick={createAdmin}
                disabled={creating || !adminEmail || adminPassword.length < 8}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><CheckCircle className="w-4 h-4" /> Create Admin</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <span className="text-text-secondary text-sm">{users.length} users shown</span>
        </div>
        <button
          onClick={() => setShowCreateAdmin(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <UserPlus className="w-4 h-4" /> Create Admin
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email..." className="input-field pl-10" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field w-40">
          <option value="all">All Roles</option>
          <option value="client">Clients</option>
          <option value="therapist">Therapists</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-background rounded-xl animate-pulse border border-border" />)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-20"><Users className="w-12 h-12 text-border mx-auto mb-4" /><p className="text-text-secondary">No users found</p></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-background transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary text-sm font-semibold">{user.email[0]?.toUpperCase()}</div>
                      <span className="text-sm font-medium text-text-primary">{getName(user)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', { 'bg-blue-50 text-primary': user.role === 'client', 'bg-green-50 text-success': user.role === 'therapist', 'bg-purple-50 text-purple-600': user.role === 'admin' })}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', user.isActive ? 'bg-green-50 text-success' : 'bg-red-50 text-error')}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => suspendUser(user.id, user.isActive)}
                        className="p-1.5 rounded-lg border border-border hover:bg-background transition-colors"
                        title={user.isActive ? 'Suspend' : 'Reactivate'}
                      >
                        <UserX className="w-4 h-4 text-warning" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1.5 rounded-lg border border-border hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
