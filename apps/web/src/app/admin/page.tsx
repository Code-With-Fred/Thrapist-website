'use client';
import { useEffect, useState } from 'react';
import { Users, UserCheck, Calendar, DollarSign, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';

interface AdminStats { totalUsers: number; activeTherapists: number; sessionsToday: number; revenueMonth: number; pendingApprovals: number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: AdminStats }>('/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'bg-blue-50 text-primary', href: '/admin/users' },
    { label: 'Active Therapists', value: stats?.activeTherapists ?? 0, icon: UserCheck, color: 'bg-green-50 text-success', href: '/admin/therapists' },
    { label: 'Sessions Today', value: stats?.sessionsToday ?? 0, icon: Calendar, color: 'bg-purple-50 text-purple-600', href: '/admin/revenue' },
    { label: 'Revenue (Month)', value: formatCurrency(stats?.revenueMonth ?? 0), icon: DollarSign, color: 'bg-yellow-50 text-warning', href: '/admin/revenue' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals ?? 0, icon: Clock, color: 'bg-red-50 text-error', href: '/admin/therapists' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-secondary">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map(card => (
          <Link key={card.label} href={card.href} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            {loading ? <div className="h-8 w-16 bg-background rounded animate-pulse mb-1" /> : <p className="text-2xl font-bold text-text-primary">{card.value}</p>}
            <p className="text-text-secondary text-sm">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Pending Therapist Approvals</h3>
            <Link href="/admin/therapists" className="text-primary text-sm hover:underline">View All</Link>
          </div>
          {stats?.pendingApprovals === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No pending approvals</p>
          ) : (
            <p className="text-text-secondary text-sm"><span className="font-semibold text-error">{stats?.pendingApprovals}</span> therapists awaiting review</p>
          )}
          <Link href="/admin/therapists" className="mt-4 block w-full text-center py-2 bg-primary-50 text-primary rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors">
            Review Applications
          </Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Manage Users', href: '/admin/users' },
              { label: 'Review Therapists', href: '/admin/therapists' },
              { label: 'Dating Moderation', href: '/admin/moderation' },
              { label: 'Revenue Reports', href: '/admin/revenue' },
            ].map(action => (
              <Link key={action.label} href={action.href} className="flex items-center justify-between p-3 rounded-xl hover:bg-background transition-colors group">
                <span className="text-sm text-text-primary group-hover:text-primary transition-colors">{action.label}</span>
                <span className="text-text-secondary group-hover:text-primary transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
