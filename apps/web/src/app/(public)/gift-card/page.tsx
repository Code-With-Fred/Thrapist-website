'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check, Heart, Mail, MessageSquare, CreditCard, Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// ─── Stripe setup ─────────────────────────────────────────────────────────────

const stripePromise = loadStripe(process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] ?? '');

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_AMOUNTS = [50, 100, 150, 200];

// ─── Gift card preview ────────────────────────────────────────────────────────

function GiftCardPreview({
  amount,
  recipientEmail,
  message,
}: {
  amount: number;
  recipientEmail: string;
  message: string;
}) {
  return (
    <motion.div
      layout
      className="relative w-full max-w-sm mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #059669 50%, #0d9488 100%)',
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5" />
      </div>

      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-white fill-white" />
            <span className="text-white font-bold text-lg tracking-tight">HealMate</span>
          </div>
          <span className="text-white/70 text-xs uppercase tracking-widest">Gift Card</span>
        </div>

        {/* Amount */}
        <div className="text-center">
          <motion.p
            key={amount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-white font-bold"
            style={{ fontSize: amount >= 100 ? '3rem' : '3.5rem', lineHeight: 1 }}
          >
            ${amount}
          </motion.p>
          {message && (
            <p className="text-white/80 text-xs mt-2 italic max-w-xs mx-auto line-clamp-2">&quot;{message}&quot;</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs">To</p>
            <p className="text-white text-sm font-medium">
              {recipientEmail || 'recipient@email.com'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Redeemable for</p>
            <p className="text-white text-sm font-medium">Therapy Sessions</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Payment form ─────────────────────────────────────────────────────────────

function CheckoutForm({
  amount,
  recipientEmail,
  message,
  onSuccess,
}: {
  amount: number;
  recipientEmail: string;
  message: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const { data } = await api.post('/gift-cards/purchase', {
        amount: amount * 100,
        recipientEmail,
        message,
      });

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.data.clientSecret,
        { payment_method: { card: cardElement } },
      );

      if (stripeError) {
        setError(stripeError.message ?? 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <div className="p-3.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-teal-300 transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#111827',
                  '::placeholder': { color: '#9ca3af' },
                },
              },
            }}
          />
        </div>
        {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-emerald-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay ${amount}.00
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        🔒 Secured by Stripe · 256-bit SSL encryption
      </p>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GiftCardPage() {
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [purchased, setPurchased] = useState(false);

  const displayAmount = isCustom ? (parseInt(customAmount) || 0) : amount;

  const handleCustomAmount = (val: string) => {
    setCustomAmount(val);
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) setAmount(num);
  };

  if (purchased) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-10 h-10 text-teal-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Gift Sent! 🎉</h2>
          <p className="text-gray-500 mb-6">
            Your <strong>${displayAmount}</strong> gift card has been sent to{' '}
            <strong>{recipientEmail}</strong>. They&apos;ll receive an email with instructions on how to redeem it.
          </p>
          <GiftCardPreview amount={displayAmount} recipientEmail={recipientEmail} message={message} />
          <a
            href="/"
            className="block w-full mt-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors text-sm"
          >
            Back to Home
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <Gift className="w-8 h-8 text-teal-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Give the Gift of Healing</h1>
            <p className="text-gray-500 max-w-md mx-auto">
              Send a HealMate gift card — the perfect way to show someone you care about their mental wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: form */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6">
              {/* Amount selector */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Choose Amount</h3>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => { setAmount(amt); setIsCustom(false); }}
                      className={cn(
                        'py-3 rounded-xl border-2 font-semibold text-sm transition-all',
                        !isCustom && amount === amt
                          ? 'border-teal-400 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300',
                      )}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => { setIsCustom(true); handleCustomAmount(e.target.value); }}
                    onFocus={() => setIsCustom(true)}
                    className={cn(
                      'w-full pl-7 pr-4 py-3 border-2 rounded-xl text-sm transition-all focus:outline-none',
                      isCustom ? 'border-teal-400 bg-teal-50' : 'border-gray-200 focus:border-teal-300',
                    )}
                  />
                </div>
              </div>

              {/* Recipient email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Personal Message <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a heartfelt message..."
                    rows={3}
                    maxLength={200}
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/200</p>
              </div>

              {/* Payment */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Payment</h3>
                <CheckoutForm
                  amount={displayAmount}
                  recipientEmail={recipientEmail}
                  message={message}
                  onSuccess={() => setPurchased(true)}
                />
              </div>
            </div>

            {/* Right: preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Preview</h3>
                <GiftCardPreview amount={displayAmount} recipientEmail={recipientEmail} message={message} />
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Why gift therapy?</h3>
                <div className="space-y-3">
                  {[
                    { icon: '💚', title: 'Show you care', desc: 'Mental health is one of the most meaningful gifts you can give.' },
                    { icon: '🔒', title: 'Fully flexible', desc: 'Recipients choose their own therapist and schedule.' },
                    { icon: '♾️', title: 'Never expires', desc: 'Gift cards have no expiration date — use them at any time.' },
                    { icon: '🎁', title: 'Delivered instantly', desc: 'Email delivery within minutes of purchase.' },
                  ].map((b) => (
                    <div key={b.title} className="flex items-start gap-3">
                      <span className="text-xl shrink-0">{b.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{b.title}</p>
                        <p className="text-xs text-gray-500">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}
