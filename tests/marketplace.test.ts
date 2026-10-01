import { describe, it, expect } from 'vitest';
import {
  createListing,
  getListings,
  updateListingStatus,
  addToUserCollection,
  getUserCollection,
  removeFromCollection,
  ListingSeller,
} from '@/lib/marketplace';

describe('Marketplace & Collection Service', () => {
  const verifiedSeller: ListingSeller = {
    id: 'seller-test-1',
    alias: 'zoro_dealer',
    name: 'Zoro',
    avatarUrl: null,
    reputationScore: 4.8,
    totalSalesCount: 10,
    mpConnected: true,
  };

  const unverifiedSeller: ListingSeller = {
    id: 'seller-test-2',
    alias: 'newbie_seller',
    name: 'Newbie',
    avatarUrl: null,
    reputationScore: 5.0,
    totalSalesCount: 0,
    mpConnected: false,
  };

  describe('Listing Creation & Mercado Pago KYC requirement', () => {
    it('debe rechazar la publicación si el vendedor NO tiene Mercado Pago vinculado', () => {
      expect(() =>
        createListing({
          seller: unverifiedSeller,
          cardCode: 'OP01-025',
          condition: 'NM',
          priceArs: 30000,
          quantity: 1,
        })
      ).toThrow('Debés vincular tu cuenta de Mercado Pago antes de publicar cartas a la venta.');
    });

    it('debe crear exitosamente una publicación si Mercado Pago está vinculado', () => {
      const listing = createListing({
        seller: verifiedSeller,
        cardCode: 'OP01-025',
        condition: 'NM',
        priceArs: 32000,
        quantity: 2,
        description: 'Impecable Near Mint',
      });

      expect(listing).toBeDefined();
      expect(listing.cardCode).toBe('OP01-025');
      expect(listing.priceArs).toBe(32000);
      expect(listing.status).toBe('ACTIVE');
      expect(typeof listing.medianDiffPercentage).toBe('number');
    });

    it('debe rechazar precios menores o iguales a cero', () => {
      expect(() =>
        createListing({
          seller: verifiedSeller,
          cardCode: 'OP01-025',
          condition: 'NM',
          priceArs: 0,
          quantity: 1,
        })
      ).toThrow('El precio en ARS debe ser un valor positivo.');
    });
  });

  describe('Listing Retrieval & Filtering', () => {
    it('debe filtrar publicaciones por código de carta', () => {
      const listings = getListings({ cardCode: 'OP01-025' });
      expect(listings.length).toBeGreaterThan(0);
      listings.forEach((l) => expect(l.cardCode).toBe('OP01-025'));
    });

    it('debe ordenar por defecto por menor precio en ARS (price-asc)', () => {
      const listings = getListings({ cardCode: 'OP01-025' });
      for (let i = 0; i < listings.length - 1; i++) {
        expect(listings[i].priceArs).toBeLessThanOrEqual(listings[i + 1].priceArs);
      }
    });

    it('debe permitir al vendedor pausar o cambiar estado de su publicación', () => {
      const listing = createListing({
        seller: verifiedSeller,
        cardCode: 'OP01-016',
        condition: 'LP',
        priceArs: 18000,
        quantity: 1,
      });

      const paused = updateListingStatus(listing.id, verifiedSeller.id, 'PAUSED');
      expect(paused?.status).toBe('PAUSED');

      // Intentar modificar como otro vendedor debe fallar
      expect(() =>
        updateListingStatus(listing.id, 'unauthorized-user', 'ACTIVE')
      ).toThrow('No tenés permisos para modificar esta publicación.');
    });
  });

  describe('Personal Collection (Desacoplada de las ventas)', () => {
    const testUserId = 'user-col-test-99';

    it('debe agregar cartas a la colección personal y calcular valuación estimada', () => {
      const item = addToUserCollection({
        userId: testUserId,
        cardCode: 'OP01-025',
        condition: 'NM',
        quantity: 2,
        notes: 'Copias de mi mazo principal',
      });

      expect(item).toBeDefined();
      expect(item.quantity).toBe(2);
      expect(item.isWishlist).toBe(false);

      const collection = getUserCollection(testUserId, 1500, 1550);
      expect(collection.ownedCount).toBe(2);
      expect(collection.totalEstimatedArsMep).toBe(24.0 * 2 * 1500); // 24 USD * 2 * 1500 ARS = 72000
    });

    it('debe soportar cartas en Wishlist sin sumarlas al valor de posesión', () => {
      addToUserCollection({
        userId: testUserId,
        cardCode: 'OP01-120', // Shanks Manga
        condition: 'NM',
        quantity: 1,
        isWishlist: true,
      });

      const collection = getUserCollection(testUserId);
      expect(collection.wishlistCount).toBe(1);
    });

    it('debe permitir eliminar items de la colección', () => {
      const item = addToUserCollection({
        userId: testUserId,
        cardCode: 'OP02-013',
        quantity: 1,
      });

      const removed = removeFromCollection(testUserId, item.id);
      expect(removed).toBe(true);
    });
  });
});
