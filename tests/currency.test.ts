import { describe, it, expect } from 'vitest';
import {
  convertUsdToArs,
  calculateMedianDiffPercentage,
  formatArs,
  formatUsd,
} from '@/lib/currency';

describe('Currency & Pricing Logic', () => {
  describe('convertUsdToArs', () => {
    it('debe convertir correctamente USD a ARS usando la cotización provista', () => {
      const priceUsd = 10;
      const mepRate = 1500;
      expect(convertUsdToArs(priceUsd, mepRate)).toBe(15000);
    });

    it('debe redondear adecuadamente a 2 decimales', () => {
      const priceUsd = 10.55;
      const rate = 1548.7;
      // 10.55 * 1548.7 = 16338.785 -> 16338.79
      expect(convertUsdToArs(priceUsd, rate)).toBe(16338.79);
    });

    it('debe arrojar error si el monto o cotización son inválidos', () => {
      expect(() => convertUsdToArs(-5, 1500)).toThrow('Monto o cotización inválida para conversión');
      expect(() => convertUsdToArs(10, 0)).toThrow('Monto o cotización inválida para conversión');
      expect(() => convertUsdToArs(10, -100)).toThrow('Monto o cotización inválida para conversión');
    });
  });

  describe('calculateMedianDiffPercentage', () => {
    it('debe calcular porcentaje negativo cuando el precio está por debajo de la mediana', () => {
      const listingPrice = 80;
      const medianPrice = 100;
      // (80 - 100) / 100 = -20%
      expect(calculateMedianDiffPercentage(listingPrice, medianPrice)).toBe(-20);
    });

    it('debe calcular porcentaje positivo cuando el precio está por encima de la mediana', () => {
      const listingPrice = 125;
      const medianPrice = 100;
      // (125 - 100) / 100 = +25%
      expect(calculateMedianDiffPercentage(listingPrice, medianPrice)).toBe(25);
    });

    it('debe retornar 0 si la mediana de referencia es 0 o inválida', () => {
      expect(calculateMedianDiffPercentage(50, 0)).toBe(0);
    });
  });

  describe('Formatting functions', () => {
    it('debe formatear montos en USD correctamente', () => {
      expect(formatUsd(25.5)).toBe('$25.50');
    });

    it('debe formatear montos en ARS sin romper', () => {
      const formatted = formatArs(15000);
      expect(formatted).toContain('15.000');
    });
  });
});
