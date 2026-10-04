import { describe, it, expect } from 'vitest';
import { validateListingInput, CreateListingInput } from '../src/lib/listingValidator';

describe('Listing Integrity & Safety Engine', () => {
  describe('Price validation', () => {
    it('should validate a normal price within bounds', () => {
      const input: CreateListingInput = { priceArs: 1000 };
      const marketMedianArs = 1000;
      const result = validateListingInput(input, marketMedianArs);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject a price < 15% of median', () => {
      const input: CreateListingInput = { priceArs: 100 }; // 10%
      const marketMedianArs = 1000;
      const result = validateListingInput(input, marketMedianArs);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/too low/);
    });

    it('should reject a price > 600% of median', () => {
      const input: CreateListingInput = { priceArs: 7000 }; // 700%
      const marketMedianArs = 1000;
      const result = validateListingInput(input, marketMedianArs);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/too high/);
    });

    it('should accept a price > 600% of median if isSpecialCard is true', () => {
      const input: CreateListingInput = { priceArs: 7000, isSpecialCard: true };
      const marketMedianArs = 1000;
      const result = validateListingInput(input, marketMedianArs);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a price < 15% of median if isSpecialCard is true', () => {
      const input: CreateListingInput = { priceArs: 100, isSpecialCard: true };
      const marketMedianArs = 1000;
      const result = validateListingInput(input, marketMedianArs);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Notes sanitization (Security)', () => {
    it('should allow valid clean notes', () => {
      const input: CreateListingInput = { priceArs: 1000, notes: 'Cartas en perfecto estado, siempre en folio.' };
      const result = validateListingInput(input, 1000);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect and block an email address', () => {
      const input: CreateListingInput = { priceArs: 1000, notes: 'Contactame a ventas@ejemplo.com' };
      const result = validateListingInput(input, 1000);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });

    it('should detect and block an external link', () => {
      const input: CreateListingInput = { priceArs: 1000, notes: 'Mira más en https://misitio.com.ar' };
      const result = validateListingInput(input, 1000);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('external link'))).toBe(true);
    });

    it('should detect and block a generic www link', () => {
      const input: CreateListingInput = { priceArs: 1000, notes: 'Visitá www.otrolado.com' };
      const result = validateListingInput(input, 1000);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('external link'))).toBe(true);
    });

    it('should detect and block a phone number (e.g., evasion attempts)', () => {
      const input: CreateListingInput = { priceArs: 1000, notes: 'Hablame al 11-1234-5678' };
      const result = validateListingInput(input, 1000);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('phone number'))).toBe(true);
    });

    it('should detect and block a phone number without dashes', () => {
      const input: CreateListingInput = { priceArs: 1000, notes: 'Llamar al 1112345678 para coordinar' };
      const result = validateListingInput(input, 1000);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('phone number'))).toBe(true);
    });

    it('should detect and block a phone number with spaces', () => {
      const input: CreateListingInput = { priceArs: 1000, notes: 'Mi num 11 1234 5678' };
      const result = validateListingInput(input, 1000);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('phone number'))).toBe(true);
    });
  });
});
