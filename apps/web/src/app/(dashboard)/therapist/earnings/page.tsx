'use client';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, ExternalLink, CalendarDays } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface StatsData {
  earningsThisMonth: number;
  totalSessions: number;
  pendingRequests: number;
  currency: string;
}

interface WalletData {
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
}

function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(cents / 100);
}

export default function TherapistEarningsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: StatsData }>('/therapists/me/stats'),
      api.get<{ data: WalletData }>('/wallet'),
      api.get<{ data: Transaction[] }>('/wallet/transactions'),
    ])
      .then(([statsRes, walletRes, txRes]) => {
        setStats(statsRes.data.data);
        setWallet(walletRes.data.data);
        setTransactions(txRes.data.data ?? []);
      })
      .catch(() => toast.error('Failed to load earnings'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Wallet Balance',
      value: formatCurrency(wallet?.balance ?? 0, wallet?.currency),
      icon: DollarSign,
      color: 'text-success bg-green-50',
    },
    {
      label: 'Earnings This Month',
      value: formatCurrency(stats?.earningsThisMonth ?? 0, stats?.currency),
      icon: TrendingUp,
      color: 'text-primary bg-primary-50',
    },
    {
      label: 'Total Sessions',
      value: String(stats?.totalSessions ?? 0),
      icon: CalendarDays,
      color: 'text-secondary bg-secondary-50',
    },
    {
      label: 'Pending Requests',
      value: String(stats?.pendingRequests ?? 0),
      icon: Clock,
      color: 'text-warning bg-yellow-50',
    },
  ];

  if (loading) return (
    <div className="p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-background rounded-2xl animate-pulse border border-border" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Earnings</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(stat => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-text-secondary text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stripe Connect */}
      <div className="card p-6 mb-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">Stripe Connect</h3>
            <p className="text-slate-300 text-sm">Connect your bank account to receive automatic weekly payouts (85% of session value).</p>
          </div>
          <button className="px-4 py-2 bg-white text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0">
            <ExternalLink className="w-4 h-4" /> Connect Stripe
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-text-primary">Transaction History</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-text-secondary">
            <DollarSign className="w-10 h-10 text-border mx-auto mb-3" />
            <p>No transactions yet. Complete sessions to start earning.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-text-primary text-sm">{tx.description}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-semibold text-sm ${tx.type === 'credit' ? 'text-success' : 'text-error'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
