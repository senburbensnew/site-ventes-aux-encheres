'use client';

import { useState, FormEvent } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Props {
  auctionId: number;
  currentPrice: number;
  isActive: boolean;
  onBidPlaced?: (newPrice: number) => void;
}

const QUICK_INCREMENTS = [
  { label: '+5%',  factor: 0.05 },
  { label: '+10%', factor: 0.10 },
  { label: '+20%', factor: 0.20 },
  { label: '+50%', factor: 0.50 },
];

export default function BidForm({ auctionId, currentPrice, isActive, onBidPlaced }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount]         = useState('');
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  if (!isActive) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
        <p className="text-3xl mb-2">🔔</p>
        <p className="text-gray-600 font-medium">Cette enchère est terminée.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#fff2ef] rounded-xl p-6 text-center border border-orange-100">
        <p className="text-3xl mb-2">🔑</p>
        <p className="text-gray-700 mb-3 text-sm">Connectez-vous pour placer une offre</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-[#ee4d2d] text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#d73211] transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const setQuickAmount = (factor: number) => {
    const val = currentPrice * (1 + factor);
    setAmount(val.toFixed(2));
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const parsed = parseFloat(amount);

    if (isNaN(parsed) || parsed <= currentPrice) {
      setError(`Offre insuffisante — minimum: ${(currentPrice + 0.01).toFixed(2)} €`);
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/auctions/${auctionId}/bids`, { amount: parsed });
      setAmount('');
      setSuccess(true);
      onBidPlaced?.(parsed);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Échec de l'offre.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick bid buttons */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
          Enchère rapide
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_INCREMENTS.map(inc => (
            <button
              key={inc.label}
              type="button"
              onClick={() => setQuickAmount(inc.factor)}
              className="border border-[#ee4d2d] text-[#ee4d2d] text-sm font-semibold py-1.5 rounded-lg hover:bg-[#fff2ef] transition-colors"
            >
              {inc.label}
              <span className="block text-[0.6rem] text-gray-400 font-normal">
                {(currentPrice * (1 + inc.factor)).toFixed(0)} €
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">
            Montant personnalisé
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
              <input
                type="number"
                step="0.01"
                min={currentPrice + 0.01}
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(''); }}
                placeholder={(currentPrice + 1).toFixed(2)}
                className="w-full border-2 border-gray-200 focus:border-[#ee4d2d] rounded-xl pl-8 pr-4 py-3 text-sm outline-none transition-colors font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#ee4d2d] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#d73211] active:scale-95 transition-all shadow-md shadow-orange-200"
            >
              {submitting ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Envoi…
                </span>
              ) : '🔨 Enchérir'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs px-3 py-2 rounded-lg">
            <span>✅</span> Offre placée avec succès !
          </div>
        )}
      </form>
    </div>
  );
}
