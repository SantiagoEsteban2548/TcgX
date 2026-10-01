import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSealedProductById } from '@/lib/catalog';
import { getListings } from '@/lib/marketplace';
import { formatArs, formatUsd } from '@/lib/currency';
import { ListingBuyButton } from '@/components/ListingBuyButton';
import { CardImage } from '@/components/CardImage';
import {
  ArrowLeft,
  Box,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Store,
  Tag,
  MessageSquare,
  TrendingUp,
  Layers,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SealedProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = getSealedProductById(id);
  if (!product) {
    notFound();
  }

  // Obtener publicaciones activas de vendedores en tcgtX para este producto sellado
  const listings = getListings({
    itemType: 'SEALED',
    sealedProductId: product.id,
  });

  const getTypeBadge = (type: string) => {
    const formatted = type.replace(/_/g, ' ');
    return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-md border bg-blue-500/10 text-blue-600 dark:text-sky-400 border-blue-500/20 uppercase tracking-wider">
        {formatted}
      </span>
    );
  };

  const getConditionBadge = (condition: string) => {
    return (
      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
        {condition === 'NM' ? 'FÁBRICA SELLADO (MINT)' : condition}
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

      {/* Main Product View Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Product Artwork Preview (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative aspect-[4/3] sm:aspect-square w-full max-w-sm mx-auto rounded-3xl overflow-hidden bg-slate-100 dark:bg-[#0A1128] border-2 border-slate-200 dark:border-[#1B2A4A] shadow-2xl shadow-blue-500/10 flex items-center justify-center p-4">
            <CardImage
              src={product.imageUrl}
              alt={product.name}
              code={product.setCode}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Producto original sellado oficial de Bandai Namco</span>
          </div>
        </div>

        {/* Product Details & Live TCGplayer Pricing (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Product Header */}
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm bg-slate-100 dark:bg-[#0F1E36] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Box className="w-3.5 h-3.5 text-blue-500" /> {product.setCode}
              </span>
              {getTypeBadge(product.type)}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              {product.description}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <Link
                href={`/sell?type=sealed&product=${product.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Tag className="w-3.5 h-3.5" /> Publicar este producto sellado
              </Link>
            </div>
          </div>

          {/* Pricing Box: TCGplayer Reference & ARS conversions */}
          <div className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Precios de Referencia TCGplayer
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Sincronizado vía DolarApi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* USD Median */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1128] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                  Mediana Internacional (USD)
                </span>
                <span className="text-xl font-mono font-black text-amber-600 dark:text-amber-400">
                  {formatUsd(product.currentMedianUsd)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Mercado: {formatUsd(product.currentMarketUsd)}
                </span>
              </div>

              {/* ARS MEP / Blue */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1128] border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Conversión Estimada en ARS
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Dólar MEP:</span>
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatArs(product.medianArsMep)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Dólar Blue:</span>
                  <span className="text-sm font-mono font-bold text-sky-600 dark:text-sky-400">
                    {formatArs(product.medianArsBlue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Price History Snapshot */}
            {product.priceHistory && product.priceHistory.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Historial de Mediana (Últimos días)
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {product.priceHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-[#0A1128]/60 border border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-[10px] text-slate-400 block">{item.date}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatUsd(item.medianUsd)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            href={`/sell?type=sealed&product=${product.id}`}
            className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <Tag className="w-3.5 h-3.5" /> Publicar en este listado
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">
              Actualmente no hay publicaciones activas para este producto sellado en tcgtX.
            </p>
            <Link
              href={`/sell?type=sealed&product=${product.id}`}
              className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              ¡Sé el primer vendedor en publicarlo!
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
                      href={`/messages?with=${listing.sellerId}&card=${product.id}`}
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
