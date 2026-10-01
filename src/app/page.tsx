import Link from 'next/link';
import {
  Compass,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowRight,
  Flame,
  Search,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1E36] via-[#0A1128] to-[#040817] text-white p-8 sm:p-14 border border-blue-900/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Marketplace Oficial de la Comunidad Argentina</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Comprá y vendé <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              One Piece TCG
            </span>{' '}
            al precio real.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Plataforma con cotización en tiempo real por{' '}
            <strong className="text-white">Dólar MEP y Blue</strong>, precios de referencia oficiales de{' '}
            <strong className="text-white">TCGplayer</strong> (mediana de lanzamiento) y cobros protegidos por{' '}
            <strong className="text-white">Mercado Pago</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              Crear Cuenta Gratis <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all backdrop-blur-sm"
            >
              Ingresar a mi Perfil
            </Link>
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Dólar MEP & Blue en vivo</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Mediana TCGplayer</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span className="text-slate-300">Mercado Pago Split</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300">Singles y Sellado</span>
          </div>
        </div>
      </section>

      {/* Preview Section: How it works */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Diseñado para Coleccionistas y Vendedores
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Transparencia total en precios y separación de colección personal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Colección Personal Separada
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Registrá las cartas que tenés y tu wishlist privada sin mezclarlas con lo que ponés a la venta.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Precios TCGplayer en ARS
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculamos la mediana de TCGplayer convertida a MEP o Blue para saber si estás comprando con descuento real.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cobros Directos con Mercado Pago
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Vinculá tu cuenta una sola vez y recibí el dinero de tus ventas de forma inmediata, sin intermediación de fondos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
