/**
 * catalog.ts
 * Capa de servicio y repositorio para el catálogo de cartas y producto sellado
 * con integración de cotizaciones de TCGplayer y conversión a ARS (MEP y Blue).
 */

import {
  CANONICAL_CARDS,
  CANONICAL_SEALED,
  CanonicalCard,
  CanonicalSealedProduct,
} from '@/data/canonicalCatalog';
import { convertUsdToArs } from './currency';

export interface EnrichedCard extends CanonicalCard {
  medianArsMep: number;
  medianArsBlue: number;
  marketArsMep: number;
  marketArsBlue: number;
}

export interface EnrichedSealedProduct extends CanonicalSealedProduct {
  medianArsMep: number;
  medianArsBlue: number;
  marketArsMep: number;
  marketArsBlue: number;
}

export interface CardFilters {
  query?: string;
  setCode?: string;
  rarity?: string;
  color?: string;
  type?: string;
  minCost?: number;
  maxCost?: number;
  minPower?: number;
  maxPower?: number;
  counter?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'code-asc';
  limit?: number;
  offset?: number;
}

export interface SealedFilters {
  query?: string;
  type?: string;
  setCode?: string;
}

// In-memory mutable copy for live sync during app runtime
let cardsStore: CanonicalCard[] = JSON.parse(JSON.stringify(CANONICAL_CARDS));
let sealedStore: CanonicalSealedProduct[] = JSON.parse(JSON.stringify(CANONICAL_SEALED));

/**
 * Enriquece un producto o carta con los valores convertidos a ARS en MEP y Blue.
 */
export function enrichCard(card: CanonicalCard, mepRate: number, blueRate: number): EnrichedCard {
  return {
    ...card,
    medianArsMep: convertUsdToArs(card.currentMedianUsd, mepRate),
    medianArsBlue: convertUsdToArs(card.currentMedianUsd, blueRate),
    marketArsMep: convertUsdToArs(card.currentMarketUsd, mepRate),
    marketArsBlue: convertUsdToArs(card.currentMarketUsd, blueRate),
  };
}

export function enrichSealed(
  item: CanonicalSealedProduct,
  mepRate: number,
  blueRate: number
): EnrichedSealedProduct {
  return {
    ...item,
    medianArsMep: convertUsdToArs(item.currentMedianUsd, mepRate),
    medianArsBlue: convertUsdToArs(item.currentMedianUsd, blueRate),
    marketArsMep: convertUsdToArs(item.currentMarketUsd, mepRate),
    marketArsBlue: convertUsdToArs(item.currentMarketUsd, blueRate),
  };
}

/**
 * Consulta y filtra cartas del catálogo
 */
export function getCards(filters: CardFilters = {}, mepRate = 1548.7, blueRate = 1560.0): EnrichedCard[] {
  let result = [...cardsStore];

  if (filters.query) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.setName.toLowerCase().includes(q)
    );
  }

  if (filters.setCode) {
    const targetSet = filters.setCode.toUpperCase().replace(/-/g, '');
    result = result.filter(
      (c) =>
        c.setCode.toUpperCase() === filters.setCode?.toUpperCase() ||
        c.setCode.toUpperCase().replace(/-/g, '') === targetSet ||
        c.code.toUpperCase().startsWith(targetSet)
    );
  }

  if (filters.rarity) {
    result = result.filter((c) => c.rarity === filters.rarity);
  }

  if (filters.color) {
    result = result.filter((c) => c.color?.toLowerCase().includes(filters.color!.toLowerCase()));
  }

  if (filters.type) {
    result = result.filter((c) => c.type?.toLowerCase() === filters.type!.toLowerCase());
  }

  if (filters.minCost !== undefined) {
    result = result.filter((c) => c.cost !== undefined && c.cost !== null && c.cost >= filters.minCost!);
  }

  if (filters.maxCost !== undefined) {
    result = result.filter((c) => c.cost !== undefined && c.cost !== null && c.cost <= filters.maxCost!);
  }

  if (filters.minPower !== undefined) {
    result = result.filter((c) => c.power !== undefined && c.power !== null && c.power >= filters.minPower!);
  }

  if (filters.maxPower !== undefined) {
    result = result.filter((c) => c.power !== undefined && c.power !== null && c.power <= filters.maxPower!);
  }

  if (filters.counter !== undefined) {
    result = result.filter((c) => c.counter !== undefined && c.counter !== null && c.counter === filters.counter!);
  }

  // Ordenamiento
  if (filters.sortBy === 'price-asc') {
    result.sort((a, b) => a.currentMedianUsd - b.currentMedianUsd);
  } else if (filters.sortBy === 'price-desc') {
    result.sort((a, b) => b.currentMedianUsd - a.currentMedianUsd);
  } else if (filters.sortBy === 'name-asc') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // default: code-asc
    result.sort((a, b) => a.code.localeCompare(b.code));
  }

  // Paginación si se especifica
  if (filters.offset || filters.limit) {
    const start = filters.offset || 0;
    const end = filters.limit ? start + filters.limit : undefined;
    result = result.slice(start, end);
  }

  return result.map((c) => enrichCard(c, mepRate, blueRate));
}

/**
 * Obtiene el total de cartas que coinciden con los filtros (para paginación)
 */
export function getCardsCount(filters: CardFilters = {}): number {
  return getCards({ ...filters, limit: undefined, offset: undefined }).length;
}

/**
 * Obtiene el detalle de una carta específica por su código oficial (e.g. "OP01-025" o "OP01025")
 */
export function getCardByCode(code: string, mepRate = 1548.7, blueRate = 1560.0): EnrichedCard | null {
  const clean = code.toUpperCase().trim();
  const normalized = clean.replace(/[^A-Z0-9]/g, '');

  const card = cardsStore.find(
    (c) =>
      c.code.toUpperCase() === clean ||
      c.code.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalized
  );

  if (!card) return null;
  return enrichCard(card, mepRate, blueRate);
}

/**
 * Consulta y filtra producto sellado
 */
export function getSealedProducts(
  filters: SealedFilters = {},
  mepRate = 1548.7,
  blueRate = 1560.0
): EnrichedSealedProduct[] {
  let result = [...sealedStore];

  if (filters.query) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  if (filters.type) {
    result = result.filter((p) => p.type === filters.type);
  }

  if (filters.setCode) {
    result = result.filter((p) => p.setCode === filters.setCode);
  }

  return result.map((p) => enrichSealed(p, mepRate, blueRate));
}

/**
 * Obtiene el detalle de un producto sellado específico por su ID
 */
export function getSealedProductById(
  id: string,
  mepRate = 1548.7,
  blueRate = 1560.0
): EnrichedSealedProduct | null {
  const clean = id.trim().toLowerCase();
  const product = sealedStore.find((p) => p.id.toLowerCase() === clean);
  if (!product) return null;
  return enrichSealed(product, mepRate, blueRate);
}

/**
 * Sincroniza o actualiza el precio de una carta en TCGplayer
 * Agrega el registro en priceHistory y actualiza fecha de modificación
 */
export function updateCardPrice(
  code: string,
  newMedianUsd: number,
  newMarketUsd: number
): boolean {
  const index = cardsStore.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
  if (index === -1) return false;

  const card = cardsStore[index];
  const today = new Date().toISOString().split('T')[0];

  card.currentMedianUsd = newMedianUsd;
  card.currentMarketUsd = newMarketUsd;
  card.priceLastUpdated = new Date().toISOString();

  // Agregar al historial si no existe ya para hoy
  const existingToday = card.priceHistory.find((p) => p.date === today);
  if (existingToday) {
    existingToday.medianUsd = newMedianUsd;
    existingToday.marketUsd = newMarketUsd;
  } else {
    card.priceHistory.push({
      date: today,
      medianUsd: newMedianUsd,
      marketUsd: newMarketUsd,
    });
  }

  return true;
}

/**
 * Retorna todos los sets disponibles en el catálogo
 */
export function getAvailableSets(): string[] {
  const sets = new Set<string>();
  cardsStore.forEach((c) => sets.add(c.setCode));
  sealedStore.forEach((s) => s.setCode && sets.add(s.setCode));
  return Array.from(sets).sort();
}
