'use client';
import { useState, useEffect } from 'react';
import { Wallet, Plus, Gift, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface WalletData { id: string; balance: number; currency: string; }
interface Transaction { id: string; amount: number; type: 'credit' | 'debit'; description: string; reference: string; createdAt: string; }

const presetAmounts = [2500, 5000, 10000, 20000];

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [giftCode, setGiftCode] = useState('');
  const [processingTopup, setProcessingTopup] = useState(false);
  const [processingRedeem, setProcessingRedeem] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/wallet').then(r => { const d = r.data as { data: WalletData }; setWallet(d.data); }),
      api.get('/wallet/transactions').then(r => { const d = r.data as { data: Transaction[] }; setTransactions(d.data); }),
    ]).catch(() => toast.error('Failed to load wallet')).finally(() => setLoading(false));
  }, []);

  const handleTopup = async () => {
    const amount = customAmount ? parseInt(customAmount) * 100 : topupAmount;
    try {
      setProcessingTopup(true);
      await api.post('/wallet/topup', { amount, currency: 'USD' });
      toast.success('Wallet topped up successfully!');
      setShowTopup(false);
      setCustomAmount('');
      const r = await api.get('/wallet');
      const d = r.data as { data: WalletData };
      setWallet(d.data);
      const r2 = await api.get('/wallet/transactions');
      const d2 = r2.data as { data: Transaction[] };
      setTransactions(d2.data);
    } catch { toast.error('Top-up failed. Please try again.'); }
    finally { setProcessingTopup(false); }
  };

  const handleRedeem = async () => {
    if (!giftCode.trim()) return;
    try {
      setProcessingRedeem(true);
      await api.post('/gift-cards/redeem', { code: giftCode.trim() });
      toast.success('Gift card redeemed successfully!');
      setGiftCode('');
      const r = await api.get('/wallet');
      const d = r.data as { data: WalletData };
      setWallet(d.data);
    } catch { toast.error('Invalid or expired gift card code.'); }
    finally { setProcessingRedeem(false); }
  };

  if (loading) return <div className="p-6"><div className="h-48 bg-background rounded-2xl animate-pulse" /></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-white mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 opacity-80" />
          <span className="text-primary-100 font-medium">Available Balance</span>
        </div>
        <p className="text-5xl font-bold mb-6">{formatCurrency(wallet?.balance ?? 0)}</p>
        <div className="flex gap-3">
          <button onClick={() => setShowTopup(!showTopup)} className="bg-white text-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Top Up
          </button>
        </div>
      </div>

      {/* Top Up Panel */}
      {showTopup && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary" /> Add Funds</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {presetAmounts.map(a => (
              <button key={a} onClick={() => { setTopupAmount(a); setCustomAmount(''); }} className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${topupAmount === a && !customAmount ? 'border-primary bg-primary-50 text-primary' : 'border-border text-text-secondary hover:border-primary'}`}>
                {formatCurrency(a)}
              </button>
            ))}
          </div>
          <input type="number" placeholder="Custom amount ($)" value={customAmount} onChange={e => { setCustomAmount(e.target.value); setTopupAmount(0); }} className="input-field mb-4" min="5" max="1000" />
          <button onClick={handleTopup} disabled={processingTopup} className="btn-primary w-full disabled:opacity-50">
            {processingTopup ? 'Processing...' : `Add ${customAmount ? `$${customAmount}` : formatCurrency(topupAmount)}`}
          </button>
        </div>
      )}

      {/* Redeem Gift Card */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-secondary" /> Redeem Gift Card</h3>
        <div className="flex gap-3">
          <input type="text" placeholder="Enter gift card code" value={giftCode} onChange={e => setGiftCode(e.target.value.toUpperCase())} className="input-field flex-1" maxLength={20} />
          <button onClick={handleRedeem} disabled={processingRedeem || !giftCode.trim()} className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary-600 transition-colors disabled:opacity-50 whitespace-nowrap">
            {processingRedeem ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-text-primary">Transaction History</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-text-secondary">No transactions yet</div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-background transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-success' : 'bg-red-50 text-error'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{tx.description}</p>
                    <p className="text-xs text-text-secondary">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <span className={`font-semibold ${tx.type === 'credit' ? 'text-success' : 'text-error'}`}>
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
