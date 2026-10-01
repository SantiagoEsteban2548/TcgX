'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CollectionItem } from '@/lib/marketplace';
import { CardImage } from '@/components/CardImage';
import { formatArs, formatUsd } from '@/lib/currency';
import {
  Layers,
  Heart,
  ExternalLink,
  Tag,
  Sparkles,
} from 'lucide-react';

interface Props {
  ownedItems: CollectionItem[];
  wishlistItems: CollectionItem[];
}

export function ShowcaseTabs({ ownedItems, wishlistItems }: Props) {
  const [activeTab, setActiveTab] = useState<'owned' | 'wishlist'>('owned');

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
        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
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
        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
          styles[condition] || styles.NM
        }`}
      >
        {condition}
      </span>
    );
  };

  const currentList = activeTab === 'owned' ? ownedItems : wishlistItems;

  return (
    <div className="space-y-6">
      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0F1E36] p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('owned')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'owned'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Cartas en Colección ({ownedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Wishlist / En Búsqueda ({wishlistItems.length})
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {currentList.length} ítem(s) mostrados
        </span>
      </div>

      {/* Grid of Cards */}
      {currentList.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white dark:bg-[#0F1E36] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {activeTab === 'owned'
              ? 'Este coleccionista no tiene cartas públicas registradas en su colección aún.'
              : 'Este coleccionista no tiene cartas agregadas a su Wishlist actualmente.'}
          </p>
          <p className="text-xs text-slate-400">
            Podés contactarlo por mensaje directo para consultarle sobre su stock o cartas de cambio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Header Code & Badges */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-400 font-semibold">{item.cardCode}</span>
                  <div className="flex items-center gap-1">
                    {getRarityBadge(item.rarity)}
                    {getConditionBadge(item.condition)}
                  </div>
                </div>

                {/* Card Artwork */}
                <Link
                  href={`/catalog/${item.cardCode}`}
                  className="relative aspect-[1/1.4] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0A1128] block"
                >
                  <CardImage
                    src={item.cardImageUrl}
                    alt={item.cardName}
                    code={item.cardCode}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.quantity > 1 && (
                    <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-white/20">
                      x{item.quantity}
                    </span>
                  )}
                </Link>

                {/* Title & Set */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                    {item.cardName}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{item.setName}</p>
                </div>

                {/* Collector Note if present */}
                {item.notes && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-[#0A1128] p-1.5 rounded-lg line-clamp-2">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Pricing & Catalog Link */}
              <div className="pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>TCGplayer:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {formatUsd(item.currentMedianUsd)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[10px] text-slate-400">Ref. MEP:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {formatArs(item.estimatedValueArsMep)}
                  </span>
                </div>

                <Link
                  href={`/catalog/${item.cardCode}`}
                  className="block w-full text-center py-1 mt-1 text-[10px] font-semibold text-blue-600 dark:text-sky-400 hover:underline"
                >
                  Ver en catálogo →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
