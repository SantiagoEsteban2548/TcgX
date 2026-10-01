import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCardByCode,
} from '@/lib/catalog';
import { formatArs, formatUsd } from '@/lib/currency';
import {
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Bookmark,
  PlusCircle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function CardDetailPage({ params }: Props) {
  const { code } = await params;

  // Enriquecer con valores actuales
  const card = getCardByCode(code);

  if (!card) {
    notFound();
  }

  const getRarityBadge = (rarity: string) => {
    const styles: Record<string, string> = {
      SEC: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      SR: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      R: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      L: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      UC: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      C: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
    };
    return (
      <span
        className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
          styles[rarity] || styles.C
        }`}
      >
        {rarity}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
        </Link>
      </div>

      {/* Main Card View Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Card Artwork Preview (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative aspect-[1/1.4] w-full max-w-sm mx-auto rounded-3xl overflow-hidden bg-slate-100 dark:bg-[#0A1128] border-2 border-slate-200 dark:border-[#1B2A4A] shadow-2xl shadow-blue-500/10">
            <img
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Arte e información oficial de Bandai Namco</span>
          </div>
        </div>

        {/* Card Details & Live TCGplayer Pricing (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Card Header */}
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm bg-slate-100 dark:bg-[#0F1E36] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                {card.code}
              </span>
              {getRarityBadge(card.rarity)}
              <span className="text-xs font-semibold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                {card.setName} ({card.setCode})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {card.name}
            </h1>
          </div>

          {/* Gameplay Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Tipo</span>
              <span className="font-bold text-slate-900 dark:text-white">{card.type}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Color</span>
              <span className="font-bold text-slate-900 dark:text-white">{card.color}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Costo</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {card.cost !== null ? card.cost : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Poder</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {card.power !== null ? card.power : '—'}
              </span>
            </div>
          </div>

          {/* Card Effect Text */}
          {card.effectText && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Texto de Efecto Oficial
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {card.effectText}
              </p>
            </div>
          )}

          {/* TCGplayer Pricing Panel */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-[#0F1E36] dark:to-[#070C1E] border-2 border-blue-500/20 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-sky-400" /> Precios de Referencia TCGplayer
              </h2>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> Sync TCGCSV
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mediana (Obligatoria para lanzamiento) */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#0A1128] border border-slate-200 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 block">
                  Mediana TCGplayer
                </span>
                <span className="text-2xl font-mono font-black text-slate-900 dark:text-white block">
                  {formatUsd(card.currentMedianUsd)}
                </span>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ARS (MEP):</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatArs(card.medianArsMep)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ARS (Blue):</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                      {formatArs(card.medianArsBlue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mercado */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#0A1128] border border-slate-200 dark:border-slate-800/80 space-y-1">
                <span className="text-[10px] font-semibold uppercase text-purple-600 dark:text-purple-400 block">
                  Precio de Mercado
                </span>
                <span className="text-2xl font-mono font-black text-slate-900 dark:text-white block">
                  {formatUsd(card.currentMarketUsd)}
                </span>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ARS (MEP):</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {formatArs(card.marketArsMep)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ARS (Blue):</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {formatArs(card.marketArsBlue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Los precios de referencia sirven como guía de mercado internacional para compradores y vendedores. Cada vendedor en tcgtX fija su propio precio en Pesos Argentinos (ARS).
            </p>
          </div>

          {/* Price History Table */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Historial de Mediana TCGplayer
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                    <th className="pb-2">Fecha</th>
                    <th className="pb-2">Mediana (USD)</th>
                    <th className="pb-2">Mercado (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {card.priceHistory.map((h, i) => (
                    <tr key={i} className="text-slate-700 dark:text-slate-300">
                      <td className="py-2 text-slate-500 font-sans">{h.date}</td>
                      <td className="py-2 font-bold text-amber-600 dark:text-amber-400">
                        {formatUsd(h.medianUsd)}
                      </td>
                      <td className="py-2 text-slate-500">{formatUsd(h.marketUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
