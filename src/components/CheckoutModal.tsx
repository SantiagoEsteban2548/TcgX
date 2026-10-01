'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarketplaceListing } from '@/lib/marketplace';
import { formatArs, formatUsd } from '@/lib/currency';
import { X, ShieldCheck, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  listing: MarketplaceListing;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ listing, isOpen, onClose }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [rateType, setRateType] = useState<'MEP' | 'BLUE'>('MEP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotalArs = listing.priceArs * quantity;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          quantity,
          rateType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
          return;
        }
        throw new Error(data.error || 'Error al iniciar checkout');
      }

      // Redirigir al Checkout de Mercado Pago (o URL de retorno sandbox)
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        router.push(`/checkout/feedback?order_id=${data.order.id}&status=pending`);
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la compra');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Confirmar Compra
              </h3>
              <p className="text-xs text-slate-500">Checkout protegido por Mercado Pago</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Item Preview */}
          <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <img
              src={listing.cardImageUrl}
              alt={listing.cardName}
              className="w-16 h-22 object-cover rounded-lg shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-sky-400">
                  {listing.cardCode}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {listing.condition}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {listing.cardName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                Vendido por: <strong className="text-slate-700 dark:text-slate-300">@{listing.seller.alias}</strong>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
              </p>
              <div className="mt-2 text-sm font-mono font-black text-slate-900 dark:text-white">
                {formatArs(listing.priceArs)} <span className="text-xs font-normal text-slate-400">c/u</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cantidad a comprar (Stock: {listing.quantity}):
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-700 dark:text-slate-200"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm px-2 text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(listing.quantity, quantity + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-700 dark:text-slate-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Currency Reference Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cotización de referencia para congelar en orden:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRateType('MEP')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                  rateType === 'MEP'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                Dólar MEP (Bolsa)
                <span className="block text-[10px] opacity-75 font-mono">Recomendado oficial</span>
              </button>
              <button
                type="button"
                onClick={() => setRateType('BLUE')}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                  rateType === 'BLUE'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                Dólar Blue
                <span className="block text-[10px] opacity-75 font-mono">Mercado libre</span>
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Subtotal ({quantity}x {formatArs(listing.priceArs)}):</span>
              <span className="font-mono font-medium">{formatArs(subtotalArs)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Envío o Retiro:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">A coordinar en chat</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Total a pagar:</span>
              <span className="text-xl font-mono font-black text-blue-600 dark:text-sky-400">
                {formatArs(subtotalArs)}
              </span>
            </div>
          </div>

          {/* Sandbox & Split Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-700 dark:text-blue-300 text-[11px] leading-relaxed">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-sky-400" />
            <p>
              Pago seguro en custodia. El dinero se acredita en la cuenta de Mercado Pago del vendedor automáticamente una vez recibido el producto.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="px-6 py-2.5 bg-[#009EE3] hover:bg-[#0089C7] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            {loading ? (
              'Generando pago...'
            ) : (
              <>
                <span>Pagar con Mercado Pago</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
