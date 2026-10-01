import { describe, it, expect, vi } from 'vitest';
import { exportCollectionToCsv, parseCollectionCsv } from '../src/lib/collectionIo';
import { CollectionItem } from '../src/lib/marketplace';

// Mocking getCardByCode in catalog to return predictable results
vi.mock('../src/lib/catalog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/catalog')>();
  return {
    ...actual,
    getCardByCode: vi.fn((code: string) => {
      if (code === 'OP01-001' || code === 'OP01001') {
        return { code: 'OP01-001' };
      }
      if (code === 'OP02-013') {
        return { code: 'OP02-013' };
      }
      return null;
    }),
  };
});

describe('Collection IO Services', () => {
  describe('exportCollectionToCsv', () => {
    it('should export headers only for an empty array', () => {
      const csv = exportCollectionToCsv([]);
      expect(csv).toBe('code,quantity,condition,isWishlist');
    });

    it('should correctly format valid items to CSV', () => {
      const items: CollectionItem[] = [
        {
          id: 'item-1',
          userId: 'user-1',
          cardCode: 'OP01-001',
          cardName: 'Roronoa Zoro',
          cardImageUrl: '',
          rarity: 'L',
          setName: 'Romance Dawn',
          condition: 'NM',
          quantity: 2,
          isWishlist: false,
          notes: '',
          currentMedianUsd: 10,
          estimatedValueArsMep: 1000,
          estimatedValueArsBlue: 1100,
          createdAt: new Date().toISOString()
        },
        {
          id: 'item-2',
          userId: 'user-1',
          cardCode: 'OP02-013',
          cardName: 'Portgas D. Ace',
          cardImageUrl: '',
          rarity: 'SR',
          setName: 'Paramount War',
          condition: 'LP',
          quantity: 1,
          isWishlist: true,
          notes: '',
          currentMedianUsd: 20,
          estimatedValueArsMep: 2000,
          estimatedValueArsBlue: 2200,
          createdAt: new Date().toISOString()
        }
      ];

      const csv = exportCollectionToCsv(items);
      const expected = [
        'code,quantity,condition,isWishlist',
        'OP01-001,2,NM,false',
        'OP02-013,1,LP,true'
      ].join('\n');

      expect(csv).toBe(expected);
    });
  });

  describe('parseCollectionCsv', () => {
    it('should return empty array for empty or whitespace content', () => {
      expect(parseCollectionCsv('')).toEqual([]);
      expect(parseCollectionCsv('   \n  ')).toEqual([]);
    });

    it('should return empty array for headers only', () => {
      expect(parseCollectionCsv('code,quantity,condition,isWishlist\n')).toEqual([]);
    });

    it('should parse valid CSV string into an array of items', () => {
      const csv = [
        'code,quantity,condition,isWishlist',
        'OP01-001,3,NM,false',
        'OP02-013,1,HP,true'
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { cardCode: 'OP01-001', quantity: 3, condition: 'NM', isWishlist: false },
        { cardCode: 'OP02-013', quantity: 1, condition: 'HP', isWishlist: true }
      ]);
    });

    it('should format alternative valid code correctly (ignoring hyphens etc if supported)', () => {
      // getCardByCode mock will translate OP01001 to OP01-001
      const csv = [
        'code,quantity,condition,isWishlist',
        'OP01001,1,NM,false',
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].cardCode).toBe('OP01-001');
    });

    it('should skip rows with missing columns', () => {
      const csv = [
        'code,quantity,condition,isWishlist',
        'OP01-001,1,NM', // Missing isWishlist
        'OP02-013,1,LP,true'
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].cardCode).toBe('OP02-013');
    });

    it('should skip rows with invalid quantity', () => {
      const csv = [
        'code,quantity,condition,isWishlist',
        'OP01-001,0,NM,false',     // Zero quantity
        'OP01-001,-5,NM,false',    // Negative quantity
        'OP01-001,abc,NM,false',   // NaN
        'OP02-013,1,LP,true'       // Valid
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].cardCode).toBe('OP02-013');
    });

    it('should skip rows with invalid condition', () => {
      const csv = [
        'code,quantity,condition,isWishlist',
        'OP01-001,1,EXCELLENT,false', // Invalid condition
        'OP02-013,1,LP,true'
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].cardCode).toBe('OP02-013');
    });

    it('should skip rows with invalid isWishlist value', () => {
      const csv = [
        'code,quantity,condition,isWishlist',
        'OP01-001,1,NM,maybe', // Invalid boolean
        'OP02-013,1,LP,true'
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].cardCode).toBe('OP02-013');
    });

    it('should handle alternative boolean values for isWishlist', () => {
      const csv = [
        'code,quantity,condition,isWishlist',
        'OP01-001,1,NM,1',
        'OP02-013,2,NM,yes',
        'OP01-001,3,NM,0',
        'OP02-013,4,NM,no'
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result).toHaveLength(4);
      expect(result[0].isWishlist).toBe(true);
      expect(result[1].isWishlist).toBe(true);
      expect(result[2].isWishlist).toBe(false);
      expect(result[3].isWishlist).toBe(false);
    });

    it('should skip non-existent card codes', () => {
      const csv = [
        'code,quantity,condition,isWishlist',
        'OP09-999,1,NM,false', // Doesn't exist in mock
        'OP01-001,1,NM,false'
      ].join('\n');

      const result = parseCollectionCsv(csv);
      expect(result).toHaveLength(1);
      expect(result[0].cardCode).toBe('OP01-001');
    });
  });
});
