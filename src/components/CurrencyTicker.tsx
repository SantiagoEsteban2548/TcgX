'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { formatArs } from '@/lib/currency';

interface CurrencyData {
  mep: number;
  blue: number;
  updatedAt: string;
}

export function CurrencyTicker() {
  const [rates, setRates] = useState<CurrencyData | null>(null);

  useEffect(() => {
    fetch('/api/currency')
      .then((res) => res.json())
      .then((data) => setRates(data))
      .catch((err) => console.error('Error al cargar cotizaciones:', err));
  }, []);

  return (
    <div className="bg-slate-100 dark:bg-[#070C1E] border-b border-slate-200 dark:border-[#14213d] text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Cotizaciones ARS:
          </span>

          <div className="flex items-center gap-1.5 bg-white dark:bg-[#0F1E36] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">MEP:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {rates ? formatArs(rates.mep) : '$ ...'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-[#0F1E36] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Blue:</span>
            <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
              {rates ? formatArs(rates.blue) : '$ ...'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Referencia:</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">TCGplayer Mediana</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
          <RefreshCw className="w-3 h-3 text-blue-400 animate-spin-slow" />
          <span>Mercado Pago Split Sandbox</span>
        </div>
      </div>
    </div>
  );
}
