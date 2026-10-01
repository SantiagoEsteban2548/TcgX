'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Heart, Tag, Check, AlertCircle } from 'lucide-react';

interface Props {
  cardCode: string;
}

export function CardMarketplaceActions({ cardCode }: Props) {
  const [collectionAdded, setCollectionAdded] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (isWishlist: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardCode,
          condition: 'NM',
          quantity: 1,
          isWishlist,
        }),
      });

      if (res.ok) {
        if (isWishlist) {
          setWishlistAdded(true);
          setTimeout(() => setWishlistAdded(false), 2500);
        } else {
          setCollectionAdded(true);
          setTimeout(() => setCollectionAdded(false), 2500);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      {/* Add to Collection Button */}
      <button
        onClick={() => handleAdd(false)}
        disabled={loading}
        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-sm ${
          collectionAdded
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'bg-white dark:bg-[#0F1E36] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-sky-400'
        }`}
      >
        {collectionAdded ? (
          <>
            <Check className="w-3.5 h-3.5" /> ¡En tu Colección!
          </>
        ) : (
          <>
            <Bookmark className="w-3.5 h-3.5 text-blue-500" /> Guardar en mi Colección
          </>
        )}
      </button>

      {/* Add to Wishlist Button */}
      <button
        onClick={() => handleAdd(true)}
        disabled={loading}
        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-sm ${
          wishlistAdded
            ? 'bg-rose-600 text-white border-rose-600'
            : 'bg-white dark:bg-[#0F1E36] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-400 hover:text-rose-600'
        }`}
      >
        {wishlistAdded ? (
          <>
            <Check className="w-3.5 h-3.5" /> ¡En tu Wishlist!
          </>
        ) : (
          <>
            <Heart className="w-3.5 h-3.5 text-rose-500" /> Deseo / Wishlist
          </>
        )}
      </button>

      {/* Sell this card */}
      <Link
        href={`/sell?card=${cardCode}`}
        className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
      >
        <Tag className="w-3.5 h-3.5" /> Vender esta Carta
      </Link>
    </div>
  );
}
