import { describe, it, expect } from 'vitest';
import { exportCollectionToCsv, parseCollectionCsv } from '../src/lib/collectionIo';
import { CollectionItem } from '../src/lib/marketplace';

describe('Collection IO Service', () => {
  describe('exportCollectionToCsv', () => {
    it('should export items to standard CSV format', () => {
      const items: CollectionItem[] = [
        {
          id: '1',
          userId: 'user1',
          cardCode: 'OP01-001',
          cardName: 'Zoro',
          cardImageUrl: 'zoro.jpg',
          rarity: 'SR',
          setName: 'Romance Dawn',
          condition: 'NM',
          quantity: 2,
          isWishlist: false,
          notes: '',
          currentMedianUsd: 10,
          estimatedValueArsMep: 15480,
          estimatedValueArsBlue: 15600,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'user1',
          cardCode: 'ST01-006',
          cardName: 'Chopper',
          cardImageUrl: 'chopper.jpg',
          rarity: 'C',
          setName: 'Straw Hat Crew',
          condition: 'LP',
          quantity: 4,
          isWishlist: true,
          notes: '',
          currentMedianUsd: 1,
          estimatedValueArsMep: 1548,
          estimatedValueArsBlue: 1560,
          createdAt: new Date().toISOString(),
        }
      ];

      const csv = exportCollectionToCsv(items);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('code,quantity,condition,isWishlist');
      expect(lines[1]).toBe('OP01-001,2,NM,false');
      expect(lines[2]).toBe('ST01-006,4,LP,true');
      expect(lines.length).toBe(3);
    });

    it('should return only headers for empty array', () => {
      const csv = exportCollectionToCsv([]);
      expect(csv).toBe('code,quantity,condition,isWishlist');
    });
  });

  describe('parseCollectionCsv', () => {
    it('should parse valid CSV strings correctly', () => {
      const csvContent = `code,quantity,condition,isWishlist
OP01-120, 1, NM, false
op01-016, 3, lp, true`;

      const results = parseCollectionCsv(csvContent);
      expect(results.length).toBe(2);
      expect(results[0]).toEqual({
        cardCode: 'OP01-120',
        quantity: 1,
        condition: 'NM',
        isWishlist: false,
      });
      expect(results[1]).toEqual({
        cardCode: 'OP01-016',
        quantity: 3,
        condition: 'LP',
        isWishlist: true,
      });
    });

    it('should handle different column order', () => {
      const csvContent = `condition,isWishlist,code,quantity
MP, yes, OP01-120, 4`;

      const results = parseCollectionCsv(csvContent);
      expect(results.length).toBe(1);
      expect(results[0]).toEqual({
        cardCode: 'OP01-120',
        quantity: 4,
        condition: 'MP',
        isWishlist: true,
      });
    });

    it('should throw error if header columns are missing', () => {
      const csvContent = `code,quantity,condition
OP01-120, 1, NM`;
      expect(() => parseCollectionCsv(csvContent)).toThrowError(/CSV must contain header columns: code, quantity, condition, isWishlist/);
    });

    it('should throw error for malformed row missing columns', () => {
      const csvContent = `code,quantity,condition,isWishlist
OP01-120, 1, NM`; // missing isWishlist
      expect(() => parseCollectionCsv(csvContent)).toThrowError(/Row 2 is malformed: missing columns/);
    });

    it('should throw error for invalid card code', () => {
      const csvContent = `code,quantity,condition,isWishlist
INVALID-CODE-999, 1, NM, false`;
      expect(() => parseCollectionCsv(csvContent)).toThrowError(/Row 2: Invalid card code 'INVALID-CODE-999'/);
    });

    it('should throw error for invalid quantity', () => {
      const csvContent = `code,quantity,condition,isWishlist
OP01-120, -1, NM, false`;
      expect(() => parseCollectionCsv(csvContent)).toThrowError(/Row 2: Invalid quantity '-1'/);
    });

    it('should throw error for invalid condition', () => {
      const csvContent = `code,quantity,condition,isWishlist
OP01-120, 1, MINT, false`;
      expect(() => parseCollectionCsv(csvContent)).toThrowError(/Row 2: Invalid condition 'MINT'/);
    });
  });
});
