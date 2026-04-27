import { notFound } from 'next/navigation';
import { Auction } from '@/types';
import AuctionDetailClient from './AuctionDetailClient';

async function getAuction(id: string): Promise<Auction | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auction = await getAuction(id);
  if (!auction) notFound();

  return <AuctionDetailClient auction={auction} />;
}
