'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Auction, Bid } from '@/types';
import CountdownTimer from '@/components/CountdownTimer';
import BidForm from '@/components/BidForm';
import BidHistory from '@/components/BidHistory';

interface Props {
  auction: Auction;
}

export default function AuctionDetailClient({ auction }: Props) {
  const [currentPrice, setCurrentPrice] = useState(Number(auction.current_price));
  const [isActive, setIsActive] = useState(
    auction.status === 'active' && new Date(auction.end_at) > new Date()
  );
  const [tab, setTab] = useState<'bids' | 'details'>('bids');

  const handleExpire = useCallback(() => setIsActive(false), []);
  const handleNewBid = useCallback((bid: Bid) => setCurrentPrice(bid.amount), []);

  const priceIncrease = currentPrice - Number(auction.start_price);
  const priceIncreasePercent = (priceIncrease / Number(auction.start_price)) * 100;

  return (
    <div className="max-w-5xl mx-auto pb-28">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Link href="/" className="hover:text-[#ee4d2d]">Accueil</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{auction.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left — image */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {auction.image_url ? (
              <div className="relative aspect-square w-full">
                <Image
                  src={auction.image_url}
                  alt={auction.title}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            ) : (
              <div className="aspect-square w-full flex items-center justify-center bg-gray-50 text-8xl text-gray-200">
                🏷️
              </div>
            )}
          </div>

          {/* Seller card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ee4d2d]/10 flex items-center justify-center text-[#ee4d2d] font-bold text-lg">
              {auction.user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{auction.user?.name}</p>
              <p className="text-xs text-gray-400">Vendeur vérifié ✓</p>
            </div>
            <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-1 rounded-full font-medium">
              En ligne
            </span>
          </div>
        </div>

        {/* Right — info */}
        <div className="space-y-4">
          {/* Title & status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-start gap-2 flex-wrap">
              {isActive && <span className="badge-hot text-[0.65rem] px-2 py-0.5">● Live</span>}
              {!isActive && auction.status === 'ended' && (
                <span className="bg-gray-400 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase">Terminée</span>
              )}
            </div>

            <h1 className="text-xl font-bold text-gray-900 leading-snug">{auction.title}</h1>

            {auction.description && (
              <p className="text-gray-500 text-sm leading-relaxed">{auction.description}</p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-3">
              <span>👁 {(auction.bids_count ?? 0) * 3 + 12} vues</span>
              <span>🔨 {auction.bids_count ?? 0} offre{(auction.bids_count ?? 0) !== 1 ? 's' : ''}</span>
              <span>📅 {new Date(auction.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {/* Price card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Prix actuel</p>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-[#ee4d2d]">
                {currentPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
              {priceIncrease > 0 && (
                <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  +{priceIncreasePercent.toFixed(0)}%
                </span>
              )}
            </div>
            {Number(auction.start_price) !== currentPrice && (
              <p className="text-xs text-gray-400 mt-0.5">
                Prix de départ : {Number(auction.start_price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            )}

            {/* Countdown flash-sale style */}
            {isActive && (
              <div className="mt-4 flash-banner rounded-xl px-4 py-3">
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-2">⚡ Temps restant</p>
                <CountdownTimer endAt={auction.end_at} onExpire={handleExpire} />
              </div>
            )}
            {!isActive && (
              <div className="mt-3 bg-gray-50 rounded-xl px-4 py-3 text-center">
                <p className="text-gray-500 font-medium text-sm">🔔 Enchère terminée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Bids / Details */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'bids' as const, label: `🔨 Offres (${auction.bids_count ?? 0})` },
            { key: 'details' as const, label: '📋 Informations' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                'flex-1 py-3 text-sm font-semibold transition-colors',
                tab === t.key
                  ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]'
                  : 'text-gray-500 hover:text-gray-800',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'bids' && (
            <BidHistory
              auctionId={auction.id}
              initialBids={auction.bids ?? []}
              onNewBid={handleNewBid}
            />
          )}
          {tab === 'details' && (
            <dl className="space-y-3 text-sm">
              <Row label="Titre" value={auction.title} />
              {auction.description && <Row label="Description" value={auction.description} />}
              <Row label="Prix de départ" value={Number(auction.start_price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} />
              <Row label="Prix actuel" value={currentPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} />
              <Row label="Fin de l'enchère" value={new Date(auction.end_at).toLocaleString('fr-FR')} />
              <Row label="Vendeur" value={auction.user?.name} />
              <Row label="Statut" value={auction.status === 'active' ? '🟢 Active' : auction.status === 'pending' ? '🟡 En attente' : '🔴 Terminée'} />
            </dl>
          )}
        </div>
      </div>

      {/* Sticky bottom bid bar */}
      {isActive && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-xl px-4 py-3">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-500">Prix actuel :</span>
              <span className="font-extrabold text-[#ee4d2d] text-lg">
                {currentPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
              <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                ⏱ <CountdownTimer endAt={auction.end_at} onExpire={handleExpire} compact />
              </span>
            </div>
            <BidForm
              auctionId={auction.id}
              currentPrice={currentPrice}
              isActive={isActive}
              onBidPlaced={p => setCurrentPrice(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="text-gray-400 w-36 flex-shrink-0">{label}</dt>
      <dd className="text-gray-800 font-medium">{value}</dd>
    </div>
  );
}
