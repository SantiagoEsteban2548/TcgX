import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCardByCode } from '@/lib/catalog';
import { getListings } from '@/lib/marketplace';
import { formatArs, formatUsd } from '@/lib/currency';
import { CardMarketplaceActions } from '@/components/CardMarketplaceActions';
import { ListingBuyButton } from '@/components/ListingBuyButton';
import { CardImage } from '@/components/CardImage';
import {
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Clock,
  Sparkles,
  ShoppingBag,
  Store,
  Tag,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function CardDetailPage({ params }: Props) {
  const { code } = await params;

  const card = getCardByCode(code);
  if (!card) {
    notFound();
  }

  // Obtener publicaciones activas de vendedores en tcgtX para esta carta
  const listings = getListings({ cardCode: code });

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

  const getConditionBadge = (condition: string) => {
    const styles: Record<string, string> = {
      NM: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      LP: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      MP: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      HP: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      DMG: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };
    return (
      <span
        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
          styles[condition] || styles.NM
        }`}
      >
        {condition}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
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
            <CardImage
              src={card.imageUrl}
              alt={card.name}
              code={card.code}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Arte oficial de Bandai Namco</span>
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

            {/* Quick Actions: Add to collection / Wishlist / Sell */}
            <CardMarketplaceActions cardCode={card.code} />
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

          {/* TCGplayer Pricing Reference Panel */}
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
              {/* Mediana (Obligatoria de lanzamiento) */}
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
          </div>
        </div>
      </div>

      {/* Seller Listings Section on tcgtX Marketplace */}
      <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Publicaciones en venta ({listings.length})
            </h2>
          </div>

          <Link
            href={`/sell?card=${card.code}`}
            className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <Tag className="w-3.5 h-3.5" /> Publicar en este listado
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">
              Actualmente no hay publicaciones activas para esta carta en tcgtX.
            </p>
            <Link
              href={`/sell?card=${card.code}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              ¡Sé el primer vendedor en publicarla!
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Seller & Condition */}
                <div className="flex items-center gap-3">
                  <img
                    src={listing.seller.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${listing.seller.alias}`}
                    alt={listing.seller.alias}
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        @{listing.seller.alias}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> {listing.seller.reputationScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({listing.seller.totalSalesCount} ventas)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {getConditionBadge(listing.condition)}
                      <span className="text-slate-400 text-[11px]">
                        Disponibles: <strong className="text-slate-700 dark:text-slate-300">{listing.quantity}</strong>
                      </span>
                    </div>

                    {listing.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md pt-0.5">
                        "{listing.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Checkout Action */}
                <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                      {formatArs(listing.priceArs)}
                    </div>
                    {listing.isBelowMedian ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-end">
                        🔥 {Math.abs(listing.medianDiffPercentage)}% bajo mediana
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Precio vendedor en ARS
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/messages?with=${listing.sellerId}&card=${card.code}`}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
                      title="Hacer una pregunta al vendedor"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-sky-500" /> Preguntar
                    </Link>

                    <ListingBuyButton listing={listing} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
