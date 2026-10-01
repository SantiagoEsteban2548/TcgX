'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  TrendingUp,
  Layers,
  Box,
  Flame,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { EnrichedCard, EnrichedSealedProduct } from '@/lib/catalog';
import { formatArs, formatUsd } from '@/lib/currency';

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'singles' | 'sealed'>('singles');
  const [cards, setCards] = useState<EnrichedCard[]>([]);
  const [sealed, setSealed] = useState<EnrichedSealedProduct[]>([]);
  const [availableSets, setAvailableSets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('code-asc');
  const [currencyMode, setCurrencyMode] = useState<'mep' | 'blue'>('mep');

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (selectedSet) params.set('setCode', selectedSet);
      if (selectedRarity) params.set('rarity', selectedRarity);
      if (selectedColor) params.set('color', selectedColor);
      if (sortBy) params.set('sortBy', sortBy);

      const res = await fetch(`/api/catalog/cards?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards);
        setAvailableSets(data.availableSets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSealed = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (selectedSet) params.set('setCode', selectedSet);

      const res = await fetch(`/api/catalog/sealed?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSealed(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'singles') {
      fetchCards();
    } else {
      fetchSealed();
    }
  }, [activeTab, query, selectedSet, selectedRarity, selectedColor, sortBy]);

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
        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
          styles[rarity] || styles.C
        }`}
      >
        {rarity}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Catálogo Oficial One Piece TCG
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Precios de referencia oficiales de TCGplayer con cotización convertida a ARS.
          </p>
        </div>

        {/* Currency Toggle & Tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Currency preference button */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0F1E36] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCurrencyMode('mep')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currencyMode === 'mep'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ARS (MEP)
            </button>
            <button
              onClick={() => setCurrencyMode('blue')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                currencyMode === 'blue'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ARS (Blue)
            </button>
          </div>

          {/* Product Type Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0F1E36] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('singles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'singles'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Singles
            </button>
            <button
              onClick={() => setActiveTab('sealed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'sealed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Box className="w-3.5 h-3.5" /> Sellado
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeTab === 'singles' ? 'Buscar por código o nombre (e.g. OP01-025, Zoro)...' : 'Buscar producto sellado...'}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Set Filter */}
        <div>
          <select
            value={selectedSet}
            onChange={(e) => setSelectedSet(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="">Todos los Sets</option>
            {availableSets.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Singles specific filters */}
        {activeTab === 'singles' && (
          <>
            <div>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="">Todas las Rarezas</option>
                <option value="SEC">Secret Rare (SEC)</option>
                <option value="SR">Super Rare (SR)</option>
                <option value="R">Rare (R)</option>
                <option value="L">Leader (L)</option>
                <option value="UC">Uncommon (UC)</option>
                <option value="C">Common (C)</option>
              </select>
            </div>

            <div>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="">Todos los Colores</option>
                <option value="Red">Rojo</option>
                <option value="Green">Verde</option>
                <option value="Blue">Azul</option>
                <option value="Purple">Púrpura</option>
                <option value="Black">Negro</option>
                <option value="Yellow">Amarillo</option>
              </select>
            </div>
          </>
        )}

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="code-asc">Código (Ascendente)</option>
            <option value="price-desc">Precio TCGplayer: Mayor a menor</option>
            <option value="price-asc">Precio TCGplayer: Menor a mayor</option>
            <option value="name-asc">Nombre (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Cargando catálogo...</p>
        </div>
      ) : activeTab === 'singles' ? (
        cards.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No se encontraron cartas con los filtros seleccionados.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {cards.map((card) => {
              const displayArs =
                currencyMode === 'mep' ? card.medianArsMep : card.medianArsBlue;
              return (
                <Link
                  key={card.id}
                  href={`/catalog/${card.code}`}
                  className="group bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-sky-400/50 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Card Badges */}
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {card.code}
                      </span>
                      {getRarityBadge(card.rarity)}
                    </div>

                    {/* Card Image */}
                    <div className="relative aspect-[1/1.4] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-[#0A1128]">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback placeholder si la imagen externa falla
                          (e.target as HTMLImageElement).src =
                            'https://images.ygoprodeck.com/images/cards_optcg/back.jpg';
                        }}
                      />
                    </div>

                    {/* Card Title */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                        {card.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {card.setName}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Reference Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">TCGplayer:</span>
                      <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        {formatUsd(card.currentMedianUsd)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Ref. ARS:</span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          currencyMode === 'mep'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-sky-600 dark:text-sky-400'
                        }`}
                      >
                        {formatArs(displayArs)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        /* Sealed Products Grid */
        sealed.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No se encontró producto sellado con los filtros seleccionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sealed.map((item) => {
              const displayArs =
                currencyMode === 'mep' ? item.medianArsMep : item.medianArsBlue;
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider text-[10px]">
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">{item.setCode}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Mediana TCGplayer:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {formatUsd(item.currentMedianUsd)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Conversión {currencyMode.toUpperCase()}:</span>
                      <span
                        className={`text-lg font-mono font-black ${
                          currencyMode === 'mep'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-sky-600 dark:text-sky-400'
                        }`}
                      >
                        {formatArs(displayArs)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
