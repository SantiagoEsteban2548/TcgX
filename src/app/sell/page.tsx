'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Tag,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  Box,
  CreditCard,
} from 'lucide-react';
import { CANONICAL_CARDS, CANONICAL_SEALED } from '@/data/canonicalCatalog';
import { formatArs, formatUsd, calculateMedianDiffPercentage } from '@/lib/currency';
import { CardImage } from '@/components/CardImage';

function SellFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const initialType = searchParams.get('type') === 'sealed' ? 'SEALED' : 'CARD';
  const initialProduct = searchParams.get('product') || CANONICAL_SEALED[0].id;
  const initialCard = searchParams.get('card') || 'OP01-025';

  const [itemType, setItemType] = useState<'CARD' | 'SEALED'>(initialType);
  const [selectedCardCode, setSelectedCardCode] = useState(initialCard);
  const [selectedSealedId, setSelectedSealedId] = useState(initialProduct);

  const [condition, setCondition] = useState<'NM' | 'LP' | 'MP' | 'HP' | 'DMG'>('NM');
  const [priceArs, setPriceArs] = useState<number>(32000);
  const [quantity, setQuantity] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mepRate = 1548.7;

  const selectedCard =
    CANONICAL_CARDS.find((c) => c.code === selectedCardCode) || CANONICAL_CARDS[0];
  const selectedSealed =
    CANONICAL_SEALED.find((s) => s.id === selectedSealedId) || CANONICAL_SEALED[0];

  const currentMedianUsd =
    itemType === 'CARD' ? selectedCard.currentMedianUsd : selectedSealed.currentMedianUsd;
  const currentMedianArs = currentMedianUsd * mepRate;
  const diffPct = calculateMedianDiffPercentage(priceArs / mepRate, currentMedianUsd);

  // Al cambiar de producto o tipo, sugerir precio inicial aproximado redondeado
  const handleTypeChange = (type: 'CARD' | 'SEALED') => {
    setItemType(type);
    const targetMedian =
      type === 'CARD' ? selectedCard.currentMedianUsd : selectedSealed.currentMedianUsd;
    setPriceArs(Math.round((targetMedian * mepRate) / 500) * 500);
  };

  const handleCardChange = (code: string) => {
    setSelectedCardCode(code);
    const card = CANONICAL_CARDS.find((c) => c.code === code);
    if (card) {
      setPriceArs(Math.round((card.currentMedianUsd * mepRate) / 500) * 500);
    }
  };

  const handleSealedChange = (id: string) => {
    setSelectedSealedId(id);
    const sealed = CANONICAL_SEALED.find((s) => s.id === id);
    if (sealed) {
      setPriceArs(Math.round((sealed.currentMedianUsd * mepRate) / 1000) * 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: any = {
        itemType,
        condition,
        priceArs,
        quantity,
        description,
      };

      if (itemType === 'SEALED') {
        payload.sealedProductId = selectedSealedId;
      } else {
        payload.cardCode = selectedCardCode;
      }

      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al crear la publicación.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        if (itemType === 'SEALED') {
          router.push(`/catalog/sealed/${selectedSealedId}`);
        } else {
          router.push(`/catalog/${selectedCardCode}`);
        }
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
          Iniciá sesión para publicar en el marketplace
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
          Publicar en el Marketplace
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Publicá tus cartas o producto sellado fijando tu propio precio en ARS con referencia a la mediana internacional de TCGplayer.
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
                Para que los compradores puedan abonar y el dinero se acredite directamente en tu cuenta vía split, debés vincular Mercado Pago en tu perfil antes de publicar.
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
          <span>¡Publicación creada exitosamente! Redirigiendo a la publicación...</span>
        </div>
      )}

      {/* Item Type Switcher: Singles vs Producto Sellado */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0F1E36] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md">
        <button
          type="button"
          onClick={() => handleTypeChange('CARD')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            itemType === 'CARD'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> Single (Carta Suelta)
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('SEALED')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            itemType === 'SEALED'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Box className="w-4 h-4" /> Producto Sellado (Cajas/Decks)
        </button>
      </div>

      {/* Main Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-6 shadow-sm space-y-5">
          {/* Card or Sealed Selection */}
          {itemType === 'CARD' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Seleccionar Carta del Catálogo Oficial
              </label>
              <select
                value={selectedCardCode}
                onChange={(e) => handleCardChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CANONICAL_CARDS.map((card) => (
                  <option key={card.id} value={card.code}>
                    [{card.code}] {card.name} — {card.setName} ({card.rarity})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Seleccionar Producto Sellado Oficial
              </label>
              <select
                value={selectedSealedId}
                onChange={(e) => handleSealedChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CANONICAL_SEALED.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.setCode}] {s.name} ({s.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Condition Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Estado / Condición {itemType === 'SEALED' ? 'del Producto Sellado' : 'de la Carta'}
              </label>
              <span className="text-[10px] text-slate-400">Escala estándar TCG</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { code: 'NM', label: 'Near Mint', desc: itemType === 'SEALED' ? 'Sellado impecable' : 'Impecable' },
                { code: 'LP', label: 'Lightly Played', desc: itemType === 'SEALED' ? 'Detalle en film' : 'Leve desgaste' },
                { code: 'MP', label: 'Moderate', desc: itemType === 'SEALED' ? 'Caja abollada' : 'Bordes visibles' },
                { code: 'HP', label: 'Heavy', desc: itemType === 'SEALED' ? 'Caja golpeada' : 'Jugada' },
                { code: 'DMG', label: 'Damaged', desc: itemType === 'SEALED' ? 'Rotura exterior' : 'Doblada' },
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
              placeholder={
                itemType === 'SEALED'
                  ? 'Detallá si la caja viene con precinto original, procedencia, embalaje con plástico de burbujas, etc.'
                  : 'Detallá si incluye toploader, estado de centrado, método de envío o entrega en puntos de encuentro...'
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !user.mpConnected}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? 'Publicando...'
              : itemType === 'SEALED'
              ? 'Publicar Producto Sellado en el Marketplace'
              : 'Publicar Carta en el Marketplace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Live Price Comparison Preview (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Comparativa vs TCGplayer
            </h3>

            {/* Selected Item Mini Preview */}
            <div className="flex gap-3 items-center p-3 rounded-xl bg-slate-50 dark:bg-[#0A1128]">
              <div className="w-14 h-16 shrink-0 rounded-lg overflow-hidden bg-white dark:bg-[#0F1E36] p-1 flex items-center justify-center">
                <CardImage
                  src={itemType === 'CARD' ? selectedCard.imageUrl : selectedSealed.imageUrl}
                  alt={itemType === 'CARD' ? selectedCard.name : selectedSealed.name}
                  code={itemType === 'CARD' ? selectedCard.code : selectedSealed.setCode}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-mono text-slate-400">
                  {itemType === 'CARD' ? selectedCard.code : selectedSealed.setCode}
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {itemType === 'CARD' ? selectedCard.name : selectedSealed.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {itemType === 'CARD' ? selectedCard.setName : selectedSealed.type.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Mediana TCGplayer:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatUsd(currentMedianUsd)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>Equivalente ARS (MEP):</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatArs(currentMedianArs)}
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

export default function SellPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Cargando formulario de venta...</div>}>
      <SellFormContent />
    </Suspense>
  );
}
