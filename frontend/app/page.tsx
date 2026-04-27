import { Auction } from '@/types';
import AuctionCard from '@/components/AuctionCard';
import Link from 'next/link';

async function getAuctions(): Promise<Auction[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const auctions = await getAuctions();
  const active = auctions.filter(a => a.status === 'active');
  const pending = auctions.filter(a => a.status === 'pending');

  return (
    <div className="space-y-6 pb-10">

      {/* Hero flash-sale banner */}
      <div className="flash-banner rounded-xl overflow-hidden relative min-h-[140px] flex items-center px-8 shadow-md">
        <div className="relative z-10">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">Enchères en direct</p>
          <h1 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight drop-shadow-md">
            Trouvez des deals<br />uniques aux enchères
          </h1>
          <Link
            href="#auctions"
            className="mt-4 inline-block bg-white text-[#ee4d2d] text-sm font-bold px-6 py-2 rounded-full shadow hover:bg-orange-50 transition-colors"
          >
            Voir les enchères →
          </Link>
        </div>
        {/* decorative circles */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full translate-x-16 translate-y-16 pointer-events-none" />
        <div className="absolute right-24 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 pointer-events-none" />
      </div>

      {/* Trust badges row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TRUST_BADGES.map(b => (
          <div key={b.label} className="bg-white rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
            <span className="text-2xl">{b.icon}</span>
            <div>
              <p className="text-xs font-bold text-gray-800">{b.label}</p>
              <p className="text-[11px] text-gray-400">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active auctions */}
      <section id="auctions">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flash-banner w-1.5 h-6 rounded-full" />
            <h2 className="text-lg font-bold text-gray-900">⚡ Enchères en cours</h2>
            {active.length > 0 && (
              <span className="badge-hot px-2 py-0.5">{active.length} live</span>
            )}
          </div>
          <Link href="/auctions/create" className="text-xs text-[#ee4d2d] hover:underline font-medium">
            + Créer une enchère
          </Link>
        </div>

        {active.length === 0 ? (
          <EmptyState message="Aucune enchère active pour le moment." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {active.map(auction => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </section>

      {/* Pending auctions */}
      {pending.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 rounded-full bg-gray-300" />
            <h2 className="text-lg font-bold text-gray-900">🕐 Bientôt disponibles</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {pending.map(auction => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl py-16 text-center border border-dashed border-gray-200">
      <p className="text-5xl mb-4">🏷️</p>
      <p className="text-gray-400 text-sm">{message}</p>
      <Link
        href="/auctions/create"
        className="mt-4 inline-block bg-[#ee4d2d] text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-[#d73211] transition-colors"
      >
        Créer la première enchère
      </Link>
    </div>
  );
}

const TRUST_BADGES = [
  { icon: '🔒', label: 'Paiement sécurisé', sub: 'Transactions protégées' },
  { icon: '⚡', label: 'Temps réel', sub: 'Enchères en direct' },
  { icon: '🤝', label: 'Vendeurs vérifiés', sub: 'Comptes authentifiés' },
  { icon: '🏆', label: 'Meilleur prix', sub: 'Gagnez aux enchères' },
];
