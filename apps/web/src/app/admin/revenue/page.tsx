'use client';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Gift } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface RevenueData { totalRevenue: number; monthRevenue: number; lastMonthRevenue: number; giftCardRevenue: number; transactions: { id: string; amount: number; type: string; status: string; createdAt: string }[]; }

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/revenue').then(r => { const d = r.data as { data: RevenueData }; setData(d.data); }).catch(() => toast.error('Failed to load revenue data')).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Revenue', value: data?.totalRevenue ?? 0, icon: DollarSign, color: 'bg-green-50 text-success' },
    { label: 'This Month', value: data?.monthRevenue ?? 0, icon: TrendingUp, color: 'bg-blue-50 text-primary' },
    { label: 'Last Month', value: data?.lastMonthRevenue ?? 0, icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
    { label: 'Gift Cards', value: data?.giftCardRevenue ?? 0, icon: Gift, color: 'bg-pink-50 text-secondary' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Revenue</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            {loading ? <div className="h-7 w-20 bg-background rounded animate-pulse mb-1" /> : <p className="text-xl font-bold text-text-primary">{formatCurrency(card.value)}</p>}
            <p className="text-text-secondary text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Simple bar chart */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-text-primary mb-4">Revenue Trend (Last 7 Days)</h3>
        {loading ? <div className="h-32 bg-background rounded-xl animate-pulse" /> : (
          <div className="flex items-end gap-2 h-32">
            {[65, 80, 45, 90, 70, 85, 100].map((pct, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary rounded-t-lg transition-all" style={{ height: `${pct}%` }} />
                <span className="text-xs text-text-secondary">{['M','T','W','T','F','S','S'][i]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-border"><h3 className="font-semibold text-text-primary">Recent Transactions</h3></div>
        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-background rounded-xl animate-pulse" />)}</div>
        ) : !data?.transactions?.length ? (
          <div className="p-8 text-center text-text-secondary">No transactions yet</div>
        ) : (
          <div className="divide-y divide-border">
            {data.transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary capitalize">{tx.type.replace('_', ' ')}</p>
                  <p className="text-xs text-text-secondary">{formatDate(tx.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">{formatCurrency(tx.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'succeeded' ? 'bg-green-50 text-success' : 'bg-yellow-50 text-warning'}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
