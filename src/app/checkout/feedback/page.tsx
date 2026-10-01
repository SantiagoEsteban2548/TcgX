'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatArs } from '@/lib/currency';
import {
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

function FeedbackContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('external_reference');
  const queryStatus = searchParams.get('status') || searchParams.get('collection_status');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        } else {
          setError('No pudimos encontrar la orden solicitada');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar la orden');
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const handleSimulatePayment = async () => {
    if (!order) return;
    setSimulating(true);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate-approval' }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      } else {
        alert('Error al simular aprobación');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
            Verificando estado de tu pago en Mercado Pago...
          </p>
        </div>
      </div>
    );
  }

  const isApproved = order?.status === 'PAID' || queryStatus === 'approved';
  const isPending = order?.status === 'PENDING' || queryStatus === 'pending' || queryStatus === 'simulated_pending';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status Card Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
          {isApproved ? (
            <div className="space-y-3">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                ¡Pago Acreditado con Éxito!
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Tu compra ha sido confirmada vía Mercado Pago. El vendedor ya fue notificado para preparar la entrega.
              </p>
            </div>
          ) : isPending ? (
            <div className="space-y-3">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                <Clock className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Pago Pendiente de Acreditación
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Mercado Pago está procesando la transacción. Te avisaremos apenas se confirme.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                <XCircle className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                El Pago No Se Pudo Completar
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                La operación fue cancelada o rechazada por el medio de pago.
              </p>
            </div>
          )}

          {/* Sandbox Test Action */}
          {isPending && order && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="inline-flex flex-col items-center gap-2 p-4 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/50">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Modo Sandbox / Test de Desarrollo
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Podés simular la aprobación inmediata de este pago sin utilizar dinero real:
                </p>
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  {simulating ? 'Procesando simulación...' : '✓ Simular Aprobación de Pago'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Receipt */}
        {order && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Comprobante de Orden</span>
                <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  #{order.id}
                </h3>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                order.status === 'PAID'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {order.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
              </span>
            </div>

            {/* Item Card Detail */}
            <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
              <img
                src={order.item.cardImageUrl}
                alt={order.item.cardName}
                className="w-16 h-22 object-cover rounded-lg shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-sky-400">
                    {order.item.cardCode}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {order.item.condition}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {order.item.cardName}
                </h4>
                <div className="text-xs text-slate-500">
                  Cantidad: <strong className="text-slate-700 dark:text-slate-300">{order.item.quantity}</strong>
                </div>
              </div>
            </div>

            {/* Financial Snapshot */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Subtotal pagado:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatArs(order.totalArs)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cotización Dólar {order.exchangeRateType} congelada:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  ${order.exchangeRateUsed.toFixed(2)} ARS
                </span>
              </div>
              <div className="flex justify-between">
                <span>Comisión de plataforma (tcgtX Split Fee):</span>
                <span className="font-mono text-slate-500">
                  {formatArs(order.marketplaceFeeArs)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Total Transacción:</span>
                <span className="text-lg font-mono font-black text-blue-600 dark:text-sky-400">
                  {formatArs(order.totalArs)}
                </span>
              </div>
            </div>

            {/* Contact Seller Action */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  ¿Querés coordinar el envío o entrega?
                </p>
                <p className="text-[11px] text-slate-500">
                  Chateá de forma directa con el vendedor de esta carta.
                </p>
              </div>
              <Link
                href={`/messages?with=${order.sellerId}&card=${order.item.cardCode}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Abrir Chat con Vendedor
              </Link>
            </div>
          </div>
        )}

        {/* Global Navigation Buttons */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold">
          <Link
            href="/catalog"
            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition"
          >
            ← Volver al Catálogo
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link
            href="/profile"
            className="text-blue-600 dark:text-sky-400 hover:underline"
          >
            Ver Mi Perfil & Colección ➔
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 flex items-center justify-center">
          <p className="text-slate-500">Cargando comprobante...</p>
        </div>
      }
    >
      <FeedbackContent />
    </Suspense>
  );
}
