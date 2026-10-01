/**
 * currency.ts - Utilidades para conversión de divisas (USD / ARS MEP y Blue)
 * y cálculo de márgenes respecto a precios de referencia de TCGplayer.
 */

export interface CurrencyRates {
  mep: number;
  blue: number;
  lastUpdated: string;
}

export type RateType = 'mep' | 'blue';

/**
 * Convierte un monto en USD a ARS según el tipo de cambio elegido.
 */
export function convertUsdToArs(amountUsd: number, rate: number): number {
  if (amountUsd < 0 || rate <= 0 || isNaN(amountUsd) || isNaN(rate)) {
    throw new Error('Monto o cotización inválida para conversión');
  }
  return Math.round(amountUsd * rate * 100) / 100;
}

/**
 * Calcula la diferencia porcentual entre el precio publicado y el precio de referencia (mediana TCGplayer).
 * Retorna el porcentaje (e.g. -15.5 significa 15.5% por debajo de la mediana).
 */
export function calculateMedianDiffPercentage(listingPriceUsd: number, medianPriceUsd: number): number {
  if (medianPriceUsd <= 0) return 0;
  const diff = ((listingPriceUsd - medianPriceUsd) / medianPriceUsd) * 100;
  return Math.round(diff * 10) / 10;
}

/**
 * Formatea un valor numérico a moneda ARS estándar (e.g. "$ 15.480,50")
 */
export function formatArs(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un valor numérico a moneda USD estándar (e.g. "US$ 12.50")
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
