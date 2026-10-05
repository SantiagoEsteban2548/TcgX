import { describe, it, expect } from 'vitest';
import { validateListingInput } from '../src/lib/listingValidator';

describe('Listing Integrity & Safety Engine', () => {
  const marketMedianArs = 10000;

  describe('Price validation', () => {
    it('should validate a normal price', () => {
      const result = validateListingInput({ priceArs: 10000 }, marketMedianArs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should invalidate an absurdly low price (< 15%)', () => {
      const result = validateListingInput({ priceArs: 1400 }, marketMedianArs); // 14%
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El precio es absurdamente bajo (menor al 15% de la mediana).');
    });

    it('should validate a low but acceptable price (15%)', () => {
      const result = validateListingInput({ priceArs: 1500 }, marketMedianArs); // 15%
      expect(result.isValid).toBe(true);
    });

    it('should invalidate an absurdly high price (> 600%) without special card flag', () => {
      const result = validateListingInput({ priceArs: 60001 }, marketMedianArs); // 600.01%
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('El precio es absurdamente alto (mayor al 600% de la mediana) sin flag de carta especial.');
    });

    it('should validate a high but acceptable price (600%) without special card flag', () => {
      const result = validateListingInput({ priceArs: 60000 }, marketMedianArs); // 600%
      expect(result.isValid).toBe(true);
    });

    it('should validate an absurdly high price (> 600%) WITH special card flag', () => {
      const result = validateListingInput({ priceArs: 100000, isSpecialCard: true }, marketMedianArs); // 1000%
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Safety sanitization (Notes / Description)', () => {
    it('should block email addresses', () => {
      const result = validateListingInput({
        priceArs: 10000,
        notes: 'Contactame a test@example.com para mas info'
      }, marketMedianArs);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedNotes).toBe('Contactame a [BLOQUEADO] para mas info');
    });

    it('should block URLs with http/https', () => {
      const result = validateListingInput({
        priceArs: 10000,
        notes: 'Mira mi tienda en https://mitienda.com/cartas'
      }, marketMedianArs);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedNotes).toBe('Mira mi tienda en [BLOQUEADO]');
    });

    it('should block URLs with www', () => {
      const result = validateListingInput({
        priceArs: 10000,
        notes: 'Entra a www.scam-site.com'
      }, marketMedianArs);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedNotes).toBe('Entra a [BLOQUEADO]');
    });

    it('should block phone numbers (10 digits)', () => {
      const result = validateListingInput({
        priceArs: 10000,
        notes: 'Mi numero es 1144445555 escribime'
      }, marketMedianArs);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedNotes).toBe('Mi numero es [BLOQUEADO] escribime');
    });

    it('should block phone numbers with dashes and spaces', () => {
      const result = validateListingInput({
        priceArs: 10000,
        notes: 'Llamame al 11 4444-5555, gracias'
      }, marketMedianArs);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedNotes).toBe('Llamame al [BLOQUEADO], gracias');
    });

    it('should block phone numbers with country code', () => {
      const result = validateListingInput({
        priceArs: 10000,
        notes: 'Wsp +54 9 11 1234 5678'
      }, marketMedianArs);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedNotes).toBe('Wsp [BLOQUEADO]');
    });

    it('should handle clean text without modifications', () => {
      const cleanText = 'Carta en excelente estado. Lista para torneo.';
      const result = validateListingInput({
        priceArs: 10000,
        notes: cleanText
      }, marketMedianArs);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedNotes).toBe(cleanText);
    });

    it('should fallback to description if notes are empty', () => {
      const result = validateListingInput({
        priceArs: 10000,
        description: 'Info test@example.com'
      }, marketMedianArs);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedNotes).toBe('Info [BLOQUEADO]');
    });
  });
});
