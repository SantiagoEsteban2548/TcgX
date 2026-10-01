import { describe, it, expect, beforeEach } from 'vitest';
import {
  createReview,
  getSellerReviews,
  hasReviewedOrder,
  _resetReviewsStore,
} from '@/lib/reviews';

describe('Reviews & Seller Reputation Service', () => {
  beforeEach(() => {
    _resetReviewsStore();
  });

  describe('Post-purchase Reviews Creation', () => {
    it('debe crear exitosamente una calificación para una orden PAID', () => {
      const review = createReview({
        orderId: 'ord-demo-1001',
        buyerId: 'usr_buyer_demo',
        buyerAlias: 'luffy_fan_ar',
        rating: 5,
        comment: 'Excelente vendedor, paquete blindado.',
      });

      expect(review).toBeDefined();
      expect(review.rating).toBe(5);
      expect(review.comment).toBe('Excelente vendedor, paquete blindado.');
      expect(review.sellerId).toBe('seller-demo-1');
      expect(review.cardName).toBe('Roronoa Zoro (Rush)');
    });

    it('debe rechazar calificaciones menores a 1 o mayores a 5 estrellas', () => {
      expect(() =>
        createReview({
          orderId: 'ord-demo-1001',
          buyerId: 'usr_buyer_demo',
          buyerAlias: 'luffy_fan_ar',
          rating: 6,
        })
      ).toThrow('La calificación debe ser un número entero entre 1 y 5 estrellas.');

      expect(() =>
        createReview({
          orderId: 'ord-demo-1001',
          buyerId: 'usr_buyer_demo',
          buyerAlias: 'luffy_fan_ar',
          rating: 0,
        })
      ).toThrow('La calificación debe ser un número entero entre 1 y 5 estrellas.');
    });

    it('debe prevenir que un usuario ajeno a la compra califique al vendedor', () => {
      expect(() =>
        createReview({
          orderId: 'ord-demo-1001',
          buyerId: 'imposter-buyer-999',
          buyerAlias: 'hacker',
          rating: 1,
        })
      ).toThrow('Solo el comprador de la orden puede calificar al vendedor.');
    });

    it('debe ser idempotente: no permite calificar la misma orden dos veces', () => {
      createReview({
        orderId: 'ord-demo-1001',
        buyerId: 'usr_buyer_demo',
        buyerAlias: 'luffy_fan_ar',
        rating: 5,
      });

      expect(hasReviewedOrder('ord-demo-1001', 'usr_buyer_demo')).toBe(true);

      expect(() =>
        createReview({
          orderId: 'ord-demo-1001',
          buyerId: 'usr_buyer_demo',
          buyerAlias: 'luffy_fan_ar',
          rating: 4,
        })
      ).toThrow('Ya calificaste esta compra previamente.');
    });
  });

  describe('Seller Reputation Aggregation & Metrics', () => {
    it('debe calcular correctamente el promedio de reputación y total de reseñas', () => {
      createReview({
        orderId: 'ord-demo-1001',
        buyerId: 'usr_buyer_demo',
        buyerAlias: 'luffy_fan_ar',
        rating: 5,
      });

      const metrics = getSellerReviews('seller-demo-1');
      expect(metrics.totalReviews).toBeGreaterThanOrEqual(1);
      expect(metrics.averageScore).toBe(5.0);
      expect(metrics.ratingBreakdown[5]).toBeGreaterThanOrEqual(1);
    });
  });
});
