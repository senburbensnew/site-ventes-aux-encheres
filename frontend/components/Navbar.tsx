'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main navbar */}
      <div className="navbar-gradient shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-1.5">
            <span className="text-white text-2xl font-extrabold tracking-tight drop-shadow">
              🔨 Enchères
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="flex h-9 bg-white rounded overflow-hidden shadow-inner">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Chercher un article, une catégorie..."
                className="flex-1 px-4 text-sm text-gray-800 outline-none"
              />
              <button
                type="submit"
                className="px-4 bg-[#fb4e29] hover:bg-[#d73211] text-white transition-colors flex items-center"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {!loading && (
              user ? (
                <>
                  <Link
                    href="/auctions/create"
                    className="hidden sm:flex items-center gap-1 bg-white text-[#ee4d2d] text-xs font-bold px-3 py-1.5 rounded hover:bg-orange-50 transition-colors"
                  >
                    <span className="text-base">+</span> Vendre
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(o => !o)}
                      className="flex items-center gap-1.5 text-white text-sm hover:text-orange-100"
                    >
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:block max-w-24 truncate">{user.name}</span>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                      </svg>
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded shadow-lg border border-gray-100 py-1 z-50">
                        <Link href="/auctions/create" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:hidden">
                          + Nouvelle enchère
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/register" className="text-white text-sm hover:text-orange-100 font-medium">
                    S&apos;inscrire
                  </Link>
                  <span className="text-white/40">|</span>
                  <Link href="/login" className="text-white text-sm hover:text-orange-100 font-medium">
                    Connexion
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* Category sub-nav */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-6 overflow-x-auto text-xs font-medium text-gray-600 h-9 no-scrollbar">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                href={`/?cat=${encodeURIComponent(cat.label)}`}
                className="flex-shrink-0 flex items-center gap-1 hover:text-[#ee4d2d] transition-colors whitespace-nowrap"
              >
                <span>{cat.icon}</span> {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

const CATEGORIES = [
  { icon: '⚡', label: 'Flash Sale' },
  { icon: '📱', label: 'Électronique' },
  { icon: '👗', label: 'Mode' },
  { icon: '🏠', label: 'Maison & Déco' },
  { icon: '🚗', label: 'Auto & Moto' },
  { icon: '⌚', label: 'Montres & Bijoux' },
  { icon: '🎮', label: 'Gaming' },
  { icon: '📚', label: 'Livres & Arts' },
  { icon: '🌿', label: 'Jardin' },
  { icon: '🎁', label: 'Autres' },
];
