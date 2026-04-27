'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';

interface FormState {
  title: string;
  description: string;
  image_url: string;
  start_price: string;
  end_at: string;
}

export default function CreateAuctionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    image_url: '',
    start_price: '',
    end_at: '',
  });
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (!user) {
    router.replace('/login');
    return null;
  }

  const set = (field: keyof FormState) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      const res = await api.post('/auctions', {
        title:       form.title,
        description: form.description || null,
        image_url:   form.image_url || null,
        start_price: parseFloat(form.start_price),
        end_at:      form.end_at,
      });
      router.push(`/auctions/${res.data.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de créer l'enchère.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Créer une enchère</h1>
        <p className="text-gray-400 text-sm mt-1">Remplissez les informations pour mettre votre article aux enchères</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Top bar */}
        <div className="flash-banner px-6 py-3 flex items-center gap-2">
          <span className="text-white font-bold text-sm">🔨 Nouvelle enchère</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Image preview */}
          {form.image_url && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
              <Image
                src={form.image_url}
                alt="Aperçu"
                fill
                className="object-contain"
                onError={() => setForm(prev => ({ ...prev, image_url: '' }))}
              />
              <div className="absolute top-2 right-2">
                <span className="bg-green-500 text-white text-[0.65rem] px-2 py-0.5 rounded-full font-bold">✓ Image valide</span>
              </div>
            </div>
          )}

          <Field label="Titre de l'article" required>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              required
              placeholder="Ex: iPhone 14 Pro Max 256 Go"
              className={inputCls}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              placeholder="Décrivez votre article en détail : état, caractéristiques, accessoires inclus…"
              className={inputCls}
            />
          </Field>

          <Field label="URL de l'image">
            <input
              type="url"
              value={form.image_url}
              onChange={set('image_url')}
              placeholder="https://exemple.com/image.jpg"
              className={inputCls}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Prix de départ (€)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.start_price}
                  onChange={set('start_price')}
                  required
                  placeholder="0.00"
                  className={`${inputCls} pl-8`}
                />
              </div>
            </Field>

            <Field label="Date et heure de fin" required>
              <input
                type="datetime-local"
                value={form.end_at}
                onChange={set('end_at')}
                required
                className={inputCls}
              />
            </Field>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Tips */}
          <div className="bg-[#fff2ef] rounded-xl p-4 border border-orange-100 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-[#ee4d2d] mb-1">💡 Conseils pour réussir votre enchère</p>
            <p>• Utilisez un titre clair et précis avec la marque et le modèle</p>
            <p>• Ajoutez une belle photo de votre article</p>
            <p>• Fixez un prix de départ attractif pour attirer plus d&apos;enchérisseurs</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#ee4d2d] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#d73211] active:scale-[0.99] transition-all shadow-md shadow-orange-200"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Création en cours…
              </span>
            ) : '🚀 Mettre en vente'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  'w-full border-2 border-gray-200 focus:border-[#ee4d2d] rounded-xl px-4 py-3 text-sm outline-none transition-colors';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-[#ee4d2d] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
