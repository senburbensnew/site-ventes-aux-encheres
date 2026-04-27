'use client';

import { useEffect, useRef, useState } from 'react';
import { Bid } from '@/types';
import { getSocket } from '@/lib/socket';

interface Props {
  auctionId: number;
  initialBids: Bid[];
  onNewBid?: (bid: Bid) => void;
}

const RANK_STYLES = [
  { bg: 'bg-yellow-50 border-yellow-200', label: '🥇' },
  { bg: 'bg-gray-50 border-gray-200',     label: '🥈' },
  { bg: 'bg-orange-50 border-orange-200', label: '🥉' },
];

export default function BidHistory({ auctionId, initialBids, onNewBid }: Props) {
  const [bids, setBids] = useState<Bid[]>(initialBids);
  const [newBidId, setNewBidId] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newBidId) topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [newBidId]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit('join', auctionId);

    const handler = (data: {
      bid_id: number;
      amount: number;
      bidder_name: string;
      current_price: number;
      created_at: string;
    }) => {
      const newBid: Bid = {
        id: data.bid_id,
        auction_id: auctionId,
        user_id: 0,
        amount: data.amount,
        created_at: data.created_at,
        user: { id: 0, name: data.bidder_name },
      };
      setBids(prev => [newBid, ...prev]);
      setNewBidId(data.bid_id);
      onNewBid?.(newBid);
    };

    socket.on('BidPlaced', handler);
    return () => { socket.off('BidPlaced', handler); };
  }, [auctionId, onNewBid]);

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      <div ref={topRef} />
      {bids.length === 0 && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🏁</p>
          <p className="text-gray-400 text-sm">Soyez le premier à enchérir !</p>
        </div>
      )}
      {bids.map((bid, index) => {
        const rank = RANK_STYLES[index] ?? null;
        const isNew = bid.id === newBidId;
        return (
          <div
            key={bid.id}
            className={[
              'flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm transition-all',
              rank ? rank.bg : 'bg-white border-gray-100',
              isNew ? 'ring-2 ring-[#ee4d2d] ring-offset-1' : '',
            ].join(' ')}
          >
            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
              {rank ? rank.label : `#${index + 1}`}
            </div>
            <div className="w-7 h-7 flex-shrink-0 rounded-full bg-[#ee4d2d]/10 flex items-center justify-center text-xs font-bold text-[#ee4d2d]">
              {bid.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{bid.user.name}</p>
              <p className="text-[0.65rem] text-gray-400">
                {new Date(bid.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-extrabold text-[#ee4d2d]">
                {Number(bid.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              {isNew && (
                <span className="text-[0.6rem] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold">
                  Nouveau
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
