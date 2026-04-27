'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Auction } from '@/types';
import CountdownTimer from './CountdownTimer';
import { useState } from 'react';

interface Props {
  auction: Auction;
}

export default function AuctionCard({ auction }: Props) {
  const [currentPrice, setCurrentPrice] = useState(Number(auction.current_price));
  const isActive = auction.status === 'active' && new Date(auction.end_at) > new Date();
  const isPending = auction.status === 'pending';
  const hoursLeft = (new Date(auction.end_at).getTime() - Date.now()) / 3_600_000;
  const isEndingSoon = isActive && hoursLeft < 2;

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className="auction-card block bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm"
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
        {auction.image_url ? (
          <Image
            src={auction.image_url}
            alt={auction.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">
            🏷️
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isActive && <span className="badge-hot">● Live</span>}
          {isEndingSoon && <span className="badge-ending">⚡ Termine bientôt</span>}
          {isPending && (
            <span className="bg-gray-500 text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded uppercase">
              À venir
            </span>
          )}
        </div>

        {/* Bids count badge */}
        {(auction.bids_count ?? 0) > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[0.6rem] px-1.5 py-0.5 rounded-full">
            {auction.bids_count} offre{(auction.bids_count ?? 0) > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-1.5">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight min-h-[2.5rem]">
          {auction.title}
        </h3>

        {/* Price */}
        <div>
          <p className="text-[#ee4d2d] font-bold text-base leading-tight">
            {currentPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          {Number(auction.start_price) < currentPrice && (
            <p className="text-gray-400 text-xs line-through">
              {Number(auction.start_price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
        </div>

        {/* Countdown */}
        {isActive && (
          <div className="flex items-center gap-1 pt-1">
            <span className="text-gray-400 text-[0.6rem] uppercase font-medium">Fin dans</span>
            <CountdownTimer endAt={auction.end_at} compact />
          </div>
        )}
        {isPending && (
          <p className="text-gray-400 text-xs">
            Début: {new Date(auction.end_at).toLocaleDateString('fr-FR')}
          </p>
        )}

        {/* Seller */}
        <p className="text-gray-400 text-[0.65rem] truncate">par {auction.user?.name}</p>
      </div>
    </Link>
  );
}
