import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUserPublicShowcase } from '@/lib/marketplace';
import { formatArs, formatUsd } from '@/lib/currency';
import { CardImage } from '@/components/CardImage';
import { ShowcaseTabs } from '@/components/ShowcaseTabs';
import {
  ShieldCheck,
  Package,
  Calendar,
  MessageSquare,
  Sparkles,
  Heart,
  TrendingUp,
  Award,
  Layers,
  ArrowLeft,
  Share2,
} from 'lucide-react';

interface Props {
  params: Promise<{ alias: string }>;
}

export default async function UserShowcasePage({ params }: Props) {
  const { alias } = await params;

  const showcase = await getUserPublicShowcase(alias);
  if (!showcase) {
    notFound();
  }

  const { user, stats, ownedItems, wishlistItems } = showcase;

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

      {/* Collector Profile Header Banner */}
      <div className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* User Info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.alias}`}
              alt={user.alias}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 dark:bg-[#0A1128] border-2 border-blue-500/30 object-cover shadow-md"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {user.name || user.alias}
                </h1>
                <span className="font-mono text-xs text-blue-600 dark:text-sky-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900">
                  @{user.alias}
                </span>
              </div>

              {user.bio && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                  {user.bio}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Reputación {user.reputationScore.toFixed(1)} / 5.0
                </span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Package className="w-3.5 h-3.5 text-blue-500" /> {user.totalSalesCount} ventas
                </span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> Coleccionista desde {new Date(user.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Action: Contact collector / Trade proposal */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
            <Link
              href={`/messages?with=${user.id}`}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Proponer Trade / Mensaje
            </Link>
          </div>
        </div>

        {/* Portfolio Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          {/* Total Cards */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A1128] border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-500" /> Cartas en Colección
            </span>
            <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
              {stats.ownedCardsCount}
            </span>
          </div>

          {/* Portfolio Value MEP */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A1128] border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> Valuación (MEP)
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
              {formatArs(stats.totalEstimatedArsMep)}
            </span>
          </div>

          {/* Portfolio Value Blue */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A1128] border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-sky-500" /> Valuación (Blue)
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-sky-600 dark:text-sky-400">
              {formatArs(stats.totalEstimatedArsBlue)}
            </span>
          </div>

          {/* Wishlist count */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0A1128] border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500" /> Wishlist
            </span>
            <span className="text-xl font-mono font-black text-rose-600 dark:text-rose-400">
              {stats.wishlistCardsCount} buscadas
            </span>
          </div>
        </div>
      </div>

      {/* Top Value Grail Card Callout if available */}
      {stats.topValueCard && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                Grial Principal de la Colección
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {stats.topValueCard.cardName} ({stats.topValueCard.cardCode}) — Valuado en {formatUsd(stats.topValueCard.currentMedianUsd)} ({formatArs(stats.topValueCard.estimatedValueArsMep)})
              </p>
            </div>
          </div>
          <Link
            href={`/catalog/${stats.topValueCard.cardCode}`}
            className="shrink-0 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
          >
            Ver en catálogo →
          </Link>
        </div>
      )}

      {/* Interactive Tabs for Collection vs Wishlist */}
      <ShowcaseTabs ownedItems={ownedItems} wishlistItems={wishlistItems} />
    </div>
  );
}
