import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#070C1E] border-t border-slate-200 dark:border-[#14213d] text-xs text-slate-500 dark:text-slate-400 py-8 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              tcgt<span className="text-sky-500">X</span>
            </span>
            <span className="text-[11px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
              Argentina / LatAm
            </span>
          </div>
          <p className="text-[11px]">
            Marketplace especializado en One Piece Trading Card Game con precios de referencia TCGplayer.
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> Pagos protegidos con Mercado Pago
          </span>
          <span>•</span>
          <span>Dólar MEP & Blue en tiempo real</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 dark:text-slate-500 text-center">
        tcgtX no está afiliado con Bandai Namco ni con TCGplayer. Las cartas e ilustraciones son © Eiichiro Oda / Shueisha, Toei Animation y Bandai. Precios provistos con fines informativos de mercado.
      </div>
    </footer>
  );
}
