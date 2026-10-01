import { describe, it, expect } from 'vitest';
import { checkTriggeredAlerts, formatAlertNotification, type PriceAlert, type TriggeredAlertEvent } from '../src/lib/alerts';
import type { MarketplaceListing } from '../src/lib/marketplace';

const mockListings: MarketplaceListing[] = [
  {
    id: 'listing-1',
    sellerId: 'user-2',
    seller: {
      id: 'user-2',
      alias: 'SellerA',
      name: 'Seller A',
      avatarUrl: null,
      reputationScore: 5,
      totalSalesCount: 100,
      mpConnected: true,
    },
    itemType: 'CARD',
    cardCode: 'OP01-016',
    cardName: 'Nami',
    cardImageUrl: 'url',
    condition: 'NM',
    priceArs: 9500,
    quantity: 1,
    description: 'Perfect condition',
    photos: [],
    status: 'ACTIVE',
    medianPriceUsd: 10,
    medianDiffPercentage: -5,
    isBelowMedian: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'listing-2',
    sellerId: 'user-3',
    seller: {
      id: 'user-3',
      alias: 'SellerB',
      name: 'Seller B',
      avatarUrl: null,
      reputationScore: 4,
      totalSalesCount: 50,
      mpConnected: true,
    },
    itemType: 'CARD',
    cardCode: 'OP01-016',
    cardName: 'Nami',
    cardImageUrl: 'url',
    condition: 'LP',
    priceArs: 11000,
    quantity: 1,
    description: 'Good condition',
    photos: [],
    status: 'ACTIVE',
    medianPriceUsd: 10,
    medianDiffPercentage: 10,
    isBelowMedian: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'listing-3',
    sellerId: 'user-2',
    seller: {
      id: 'user-2',
      alias: 'SellerA',
      name: 'Seller A',
      avatarUrl: null,
      reputationScore: 5,
      totalSalesCount: 100,
      mpConnected: true,
    },
    itemType: 'SEALED',
    sealedProductId: 'OP05-BOX',
    cardCode: '', // Empty since it's sealed, though type might require it, relying on itemType logic
    cardName: '',
    cardImageUrl: '',
    condition: 'NM',
    priceArs: 150000,
    quantity: 5,
    description: 'Brand new box',
    photos: [],
    status: 'ACTIVE',
    medianPriceUsd: 120,
    medianDiffPercentage: 0,
    isBelowMedian: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('Alerts System Engine', () => {
  describe('checkTriggeredAlerts', () => {
    it('should trigger a PRICE_DROP alert when an active listing is below or equal to target price', () => {
      const alerts: PriceAlert[] = [
        {
          id: 'alert-1',
          userId: 'user-1',
          cardCode: 'OP01-016',
          targetPriceArs: 10000,
          alertType: 'PRICE_DROP',
          isActive: true,
        },
      ];

      const triggered = checkTriggeredAlerts(alerts, mockListings);

      expect(triggered).toHaveLength(1);
      expect(triggered[0].alertId).toBe('alert-1');
      expect(triggered[0].listingId).toBe('listing-1'); // Matched the 9500 one, not the 11000
    });

    it('should NOT trigger a PRICE_DROP alert when listings are above target price', () => {
      const alerts: PriceAlert[] = [
        {
          id: 'alert-2',
          userId: 'user-1',
          cardCode: 'OP01-016',
          targetPriceArs: 9000,
          alertType: 'PRICE_DROP',
          isActive: true,
        },
      ];

      const triggered = checkTriggeredAlerts(alerts, mockListings);

      expect(triggered).toHaveLength(0);
    });

    it('should trigger a RESTOCK alert for sealed products', () => {
      const alerts: PriceAlert[] = [
        {
          id: 'alert-3',
          userId: 'user-1',
          sealedProductId: 'OP05-BOX',
          alertType: 'RESTOCK',
          isActive: true,
        },
      ];

      const triggered = checkTriggeredAlerts(alerts, mockListings);

      expect(triggered).toHaveLength(1);
      expect(triggered[0].alertId).toBe('alert-3');
      expect(triggered[0].listingId).toBe('listing-3');
    });

    it('should ignore inactive alerts', () => {
       const alerts: PriceAlert[] = [
        {
          id: 'alert-4',
          userId: 'user-1',
          cardCode: 'OP01-016',
          targetPriceArs: 10000,
          alertType: 'PRICE_DROP',
          isActive: false,
        },
      ];

      const triggered = checkTriggeredAlerts(alerts, mockListings);

      expect(triggered).toHaveLength(0);
    })

    it('should ignore non-ACTIVE listings', () => {
        const soldListings: MarketplaceListing[] = [
            {...mockListings[0], status: 'SOLD', id: 'sold-listing'}
        ];

        const alerts: PriceAlert[] = [
            {
              id: 'alert-5',
              userId: 'user-1',
              cardCode: 'OP01-016',
              targetPriceArs: 10000,
              alertType: 'PRICE_DROP',
              isActive: true,
            },
          ];

        const triggered = checkTriggeredAlerts(alerts, soldListings);

        expect(triggered).toHaveLength(0);
    })
  });

  describe('formatAlertNotification', () => {
    it('formats PRICE_DROP message correctly', () => {
      const event: TriggeredAlertEvent = {
        alertId: 'a1',
        userId: 'u1',
        listingId: 'l1',
        alertType: 'PRICE_DROP',
        cardCode: 'OP01-016',
        priceArs: 9500,
      };

      const notification = formatAlertNotification(event);

      expect(notification.title).toContain('Bajada de precio para OP01-016');
      expect(notification.body).toContain('$ 9.500,00'); // Note: Intl number format uses non-breaking spaces in some locales, checking substring
      expect(notification.link).toBe('/listings/l1');
    });

    it('formats RESTOCK message correctly', () => {
      const event: TriggeredAlertEvent = {
        alertId: 'a2',
        userId: 'u1',
        listingId: 'l2',
        alertType: 'RESTOCK',
        sealedProductId: 'OP05-BOX',
        priceArs: 150000,
      };

      const notification = formatAlertNotification(event);

      expect(notification.title).toContain('OP05-BOX vuelve a estar en stock');
      expect(notification.body).toContain('150.000,00');
      expect(notification.link).toBe('/listings/l2');
    });
  });
});
