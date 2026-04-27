'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await register(name, email, password);
      router.push('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Inscription échouée.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-[#ee4d2d]">
            🔨 Enchères
          </Link>
          <p className="text-gray-400 text-sm mt-1">Créez votre compte gratuitement</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">S&apos;inscrire</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Jean Dupont"
                className="w-full border-2 border-gray-200 focus:border-[#ee4d2d] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="exemple@mail.com"
                className="w-full border-2 border-gray-200 focus:border-[#ee4d2d] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
                <span className="text-gray-400 font-normal ml-1">(min. 8 caractères)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full border-2 border-gray-200 focus:border-[#ee4d2d] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ee4d2d] disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm hover:bg-[#d73211] active:scale-[0.98] transition-all shadow-md shadow-orange-200 mt-2"
            >
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-[0.7rem] text-gray-400 text-center mt-4 leading-relaxed">
            En vous inscrivant, vous acceptez nos{' '}
            <span className="text-[#ee4d2d] cursor-pointer hover:underline">Conditions d&apos;utilisation</span>
          </p>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-3">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#ee4d2d] font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
