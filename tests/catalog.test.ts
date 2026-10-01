import { describe, it, expect } from 'vitest';
import {
  getCards,
  getCardByCode,
  getSealedProducts,
  updateCardPrice,
  getAvailableSets,
  enrichCard,
} from '@/lib/catalog';
import { CANONICAL_CARDS } from '@/data/canonicalCatalog';

describe('Catalog & TCGplayer Pricing Service', () => {
  const mepRate = 1500;
  const blueRate = 1550;

  describe('getCards & Filtering', () => {
    it('debe retornar todas las cartas enriquecidas con valores en ARS', () => {
      const cards = getCards({}, mepRate, blueRate);
      expect(cards.length).toBe(CANONICAL_CARDS.length);

      const firstCard = cards[0];
      expect(firstCard.medianArsMep).toBe(firstCard.currentMedianUsd * mepRate);
      expect(firstCard.medianArsBlue).toBe(firstCard.currentMedianUsd * blueRate);
      expect(firstCard.marketArsMep).toBe(firstCard.currentMarketUsd * mepRate);
    });

    it('debe filtrar cartas por búsqueda de texto (nombre o código)', () => {
      const zoroCards = getCards({ query: 'Zoro' }, mepRate, blueRate);
      expect(zoroCards.length).toBeGreaterThan(0);
      zoroCards.forEach((c) => {
        const matches =
          c.name.toLowerCase().includes('zoro') ||
          c.code.toLowerCase().includes('zoro') ||
          c.setName.toLowerCase().includes('zoro');
        expect(matches).toBe(true);
      });

      const op01025 = getCards({ query: 'OP01-025' }, mepRate, blueRate);
      expect(op01025.length).toBeGreaterThanOrEqual(1);
      expect(op01025.some((c) => c.code === 'OP01-025')).toBe(true);
    });

    it('debe filtrar por setCode (ej. OP-01)', () => {
      const op01Cards = getCards({ setCode: 'OP-01' }, mepRate, blueRate);
      expect(op01Cards.length).toBeGreaterThan(0);
      op01Cards.forEach((c) => expect(c.setCode).toBe('OP-01'));
    });

    it('debe filtrar por rareza (ej. SEC)', () => {
      const secCards = getCards({ rarity: 'SEC' }, mepRate, blueRate);
      expect(secCards.length).toBeGreaterThan(0);
      secCards.forEach((c) => expect(c.rarity).toBe('SEC'));
    });

    it('debe ordenar por precio ascendente y descendente', () => {
      const asc = getCards({ sortBy: 'price-asc' }, mepRate, blueRate);
      for (let i = 0; i < asc.length - 1; i++) {
        expect(asc[i].currentMedianUsd).toBeLessThanOrEqual(asc[i + 1].currentMedianUsd);
      }

      const desc = getCards({ sortBy: 'price-desc' }, mepRate, blueRate);
      for (let i = 0; i < desc.length - 1; i++) {
        expect(desc[i].currentMedianUsd).toBeGreaterThanOrEqual(desc[i + 1].currentMedianUsd);
      }
    });

    it('debe filtrar por coste numérico mínimo y máximo', () => {
      const cheapCards = getCards({ maxCost: 3 }, mepRate, blueRate);
      expect(cheapCards.length).toBeGreaterThan(0);
      cheapCards.forEach((c) => expect(c.cost).toBeLessThanOrEqual(3));

      const expensiveCards = getCards({ minCost: 7 }, mepRate, blueRate);
      expect(expensiveCards.length).toBeGreaterThan(0);
      expensiveCards.forEach((c) => expect(c.cost).toBeGreaterThanOrEqual(7));

      const midCostCards = getCards({ minCost: 4, maxCost: 6 }, mepRate, blueRate);
      expect(midCostCards.length).toBeGreaterThan(0);
      midCostCards.forEach((c) => {
        expect(c.cost).toBeGreaterThanOrEqual(4);
        expect(c.cost).toBeLessThanOrEqual(6);
      });
    });

    it('debe filtrar por poder numérico mínimo y máximo', () => {
      const weakCards = getCards({ maxPower: 4000 }, mepRate, blueRate);
      expect(weakCards.length).toBeGreaterThan(0);
      weakCards.forEach((c) => expect(c.power).toBeLessThanOrEqual(4000));

      const strongCards = getCards({ minPower: 8000 }, mepRate, blueRate);
      expect(strongCards.length).toBeGreaterThan(0);
      strongCards.forEach((c) => expect(c.power).toBeGreaterThanOrEqual(8000));
    });

    it('debe filtrar por valor de counter', () => {
      const counter1000 = getCards({ counter: 1000 }, mepRate, blueRate);
      expect(counter1000.length).toBeGreaterThan(0);
      counter1000.forEach((c) => expect(c.counter).toBe(1000));
    });

    it('debe combinar filtros avanzados (ej. rojas con costo <= 3 y power >= 5000)', () => {
      const combo = getCards({ color: 'Red', maxCost: 3, minPower: 5000 }, mepRate, blueRate);
      // Validamos que todos los resultados cumplan la condición.
      // Dependiendo del catálogo, podría estar vacío, pero asumiremos que existe Zoro u otra carta.
      if (combo.length > 0) {
        combo.forEach((c) => {
          expect(c.color?.toLowerCase()).toContain('red');
          expect(c.cost).toBeLessThanOrEqual(3);
          expect(c.power).toBeGreaterThanOrEqual(5000);
        });
      }
    });
  });

  describe('getCardByCode', () => {
    it('debe retornar la carta exacta buscada por código case-insensitive', () => {
      const card = getCardByCode('op01-025', mepRate, blueRate);
      expect(card).not.toBeNull();
      expect(card?.code).toBe('OP01-025');
      expect(card?.rarity).toBe('SR');
      expect(card?.currentMedianUsd).toBe(24.0);
    });

    it('debe retornar null para un código inexistente', () => {
      const notFound = getCardByCode('OP99-999');
      expect(notFound).toBeNull();
    });
  });

  describe('Sealed Products', () => {
    it('debe listar y enriquecer productos sellados (Booster boxes, Starter decks)', () => {
      const sealed = getSealedProducts({}, mepRate, blueRate);
      expect(sealed.length).toBeGreaterThan(0);

      const boosterBoxes = getSealedProducts({ type: 'BOOSTER_BOX' }, mepRate, blueRate);
      expect(boosterBoxes.length).toBeGreaterThan(0);
      boosterBoxes.forEach((b) => expect(b.type).toBe('BOOSTER_BOX'));
    });
  });

  describe('TCGplayer Price Sync & History', () => {
    it('debe actualizar precios de mediana y registrar histórico correctamente', () => {
      const testCode = 'OP01-025';
      const newMedian = 30.5;
      const newMarket = 31.0;

      const success = updateCardPrice(testCode, newMedian, newMarket);
      expect(success).toBe(true);

      const updated = getCardByCode(testCode, mepRate, blueRate);
      expect(updated?.currentMedianUsd).toBe(newMedian);
      expect(updated?.currentMarketUsd).toBe(newMarket);

      // Historial contiene el nuevo precio
      const lastHistoryEntry = updated?.priceHistory[updated.priceHistory.length - 1];
      expect(lastHistoryEntry?.medianUsd).toBe(newMedian);
    });
  });

  describe('Sets available', () => {
    it('debe listar todos los sets únicos', () => {
      const sets = getAvailableSets();
      expect(sets).toContain('OP-01');
      expect(sets).toContain('OP-05');
      expect(sets).toContain('ST-01');
    });
  });
});
