'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Tag,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  CreditCard,
} from 'lucide-react';
import { CANONICAL_CARDS, CanonicalCard } from '@/data/canonicalCatalog';
import { formatArs, formatUsd, calculateMedianDiffPercentage } from '@/lib/currency';

export default function SellPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [selectedCardCode, setSelectedCardCode] = useState('OP01-025');
  const [condition, setCondition] = useState<'NM' | 'LP' | 'MP' | 'HP' | 'DMG'>('NM');
  const [priceArs, setPriceArs] = useState<number>(32000);
  const [quantity, setQuantity] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedCard =
    CANONICAL_CARDS.find((c) => c.code === selectedCardCode) || CANONICAL_CARDS[0];

  // Cotización estimada para cálculo
  const mepRate = 1548.7;
  const cardMedianArs = selectedCard.currentMedianUsd * mepRate;
  const diffPct = calculateMedianDiffPercentage(priceArs / mepRate, selectedCard.currentMedianUsd);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardCode: selectedCardCode,
          condition,
          priceArs,
          quantity,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al crear la publicación.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/catalog/${selectedCardCode}`);
      }, 1500);
    } catch {
      setError('Error al conectar con el servidor.');
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Cargando formulario de venta...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-sky-400 flex items-center justify-center mx-auto">
          <Tag className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Iniciá sesión para publicar cartas a la venta
        </h2>
        <p className="text-xs text-slate-500">
          Para garantizar la seguridad de compradores y vendedores, se requiere una cuenta verificada.
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Publicar Carta para la Venta
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Publicá tu carta fijando tu propio precio en ARS con referencia a la mediana internacional de TCGplayer.
        </p>
      </div>

      {/* KYC / Mercado Pago Warning if not connected */}
      {!user.mpConnected && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-amber-800 dark:text-amber-200">
              <p className="font-bold">Mercado Pago no conectado</p>
              <p className="text-amber-700 dark:text-amber-300">
                Para que los compradores puedan abonar y el dinero se acredite directamente en tu cuenta, debés vincular Mercado Pago en tu perfil antes de publicar.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" /> Conectar Mercado Pago
          </Link>
        </div>
      )}

      {/* Error Callout */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Callout */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>¡Publicación creada exitosamente! Redirigiendo a la carta...</span>
        </div>
      )}

      {/* Main Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-6 shadow-sm space-y-5">
          {/* Card Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Seleccionar Carta del Catálogo Oficial
            </label>
            <select
              value={selectedCardCode}
              onChange={(e) => setSelectedCardCode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CANONICAL_CARDS.map((card) => (
                <option key={card.id} value={card.code}>
                  [{card.code}] {card.name} — {card.setName} ({card.rarity})
                </option>
              ))}
            </select>
          </div>

          {/* Condition Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Estado / Condición de la Carta
              </label>
              <span className="text-[10px] text-slate-400">Escala estándar TCG</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { code: 'NM', label: 'Near Mint', desc: 'Impecable' },
                { code: 'LP', label: 'Lightly Played', desc: 'Leve desgaste' },
                { code: 'MP', label: 'Moderate', desc: 'Bordes visibles' },
                { code: 'HP', label: 'Heavy', desc: 'Jugada/Rayada' },
                { code: 'DMG', label: 'Damaged', desc: 'Doblada/Rotura' },
              ].map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCondition(c.code as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    condition === c.code
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-bold ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xs block font-mono font-bold">{c.code}</span>
                  <span className="text-[9px] block text-slate-400 truncate">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price & Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tu Precio de Venta (ARS $)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-mono text-slate-400 font-bold text-sm">
                  $
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  step={100}
                  value={priceArs}
                  onChange={(e) => setPriceArs(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Cantidad Disponible
              </label>
              <input
                type="number"
                required
                min={1}
                max={50}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Detalles del Vendedor (Opcional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detallá si incluye toploader, estado de centrado, método de envío o entrega en puntos de encuentro..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !user.mpConnected}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Publicando...' : 'Publicar Carta en el Marketplace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Live Price Comparison Preview (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Comparativa vs TCGplayer
            </h3>

            {/* Selected Card Mini Preview */}
            <div className="flex gap-3 items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0A1128]">
              <img
                src={selectedCard.imageUrl}
                alt={selectedCard.name}
                className="w-12 h-16 object-cover rounded-lg shadow-sm"
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400">{selectedCard.code}</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedCard.name}
                </p>
                <p className="text-[10px] text-slate-500">{selectedCard.setName}</p>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Mediana TCGplayer:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatUsd(selectedCard.currentMedianUsd)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>Equivalente ARS (MEP):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatArs(cardMedianArs)}
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">Tu Precio Publicado:</span>
                <span className="font-mono text-base font-black text-blue-600 dark:text-sky-400">
                  {formatArs(priceArs)}
                </span>
              </div>
            </div>

            {/* Margin / Deal Badge */}
            <div
              className={`p-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 ${
                diffPct <= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {diffPct <= 0 ? (
                <>
                  <TrendingDown className="w-4 h-4" />
                  <span>🔥 Tu precio está {Math.abs(diffPct)}% por debajo de la mediana</span>
                </>
              ) : (
                <span>⚠️ Tu precio está +{diffPct}% por encima de la mediana</span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-tight text-center">
              Las publicaciones a buen precio aparecen destacadas con badge de descuento en el catálogo general.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
