import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateMarketplaceFee,
  calculateSellerPayout,
  createCheckoutOrder,
  confirmOrderPayment,
  getOrderById,
  getUserOrders,
  _resetOrdersStore,
} from '../src/lib/orders';
import { _resetMarketplaceStore, getListingById } from '../src/lib/marketplace';
import { _resetMemoryMessages } from '../src/lib/messaging';

describe('tcgtX - Mercado Pago Checkout & Transacciones', () => {
  beforeEach(() => {
    _resetOrdersStore();
    _resetMarketplaceStore();
    _resetMemoryMessages();
  });

  describe('Cálculos de Marketplace Fee y Liquidación al Vendedor', () => {
    it('calcula la comisión del 5% correctamente para montos estándar en ARS', () => {
      // 100.000 ARS * 5% = 5.000 ARS
      const fee = calculateMarketplaceFee(100000, 0.05);
      expect(fee).toBe(5000);

      // Payout vendedor: 100.000 - 5.000 = 95.000 ARS
      const payout = calculateSellerPayout(100000, fee);
      expect(payout).toBe(95000);
    });

    it('redondea el fee al entero más próximo para evitar centavos fraccionarios en Mercado Pago', () => {
      // 29.500 ARS * 5% = 1.475 ARS
      const fee = calculateMarketplaceFee(29500, 0.05);
      expect(fee).toBe(1475);
      expect(Number.isInteger(fee)).toBe(true);

      const payout = calculateSellerPayout(29500, fee);
      expect(payout).toBe(28025);
    });

    it('devuelve 0 si el total es negativo o 0', () => {
      expect(calculateMarketplaceFee(0)).toBe(0);
      expect(calculateMarketplaceFee(-500)).toBe(0);
      expect(calculateSellerPayout(0, 0)).toBe(0);
    });
  });

  describe('Creación de Órdenes y Congelamiento de Cotización', () => {
    it('crea una orden PENDING con cotización MEP congelada y cálculo exacto de split', async () => {
      // listing-2 es Zoro LP a 29.500 ARS, stock = 1, sellerId = 'user-demo-2'
      const buyerId = 'usr_buyer_alice';
      const result = await createCheckoutOrder({
        buyerId,
        buyerEmail: 'alice@tcgtx.com',
        listingId: 'listing-2',
        quantity: 1,
        rateType: 'MEP',
      });

      expect(result).toBeDefined();
      expect(result.order).toBeDefined();
      expect(result.order.status).toBe('PENDING');
      expect(result.order.totalArs).toBe(29500);
      expect(result.order.marketplaceFeeArs).toBe(1475);
      expect(result.order.sellerPayoutArs).toBe(28025);
      expect(result.order.exchangeRateType).toBe('MEP');
      expect(result.order.exchangeRateUsed).toBeGreaterThan(1000); // Tasa MEP congelada
      expect(result.initPoint).toBeTruthy();
    });

    it('soporta cotización Blue y congela la tasa en la orden', async () => {
      const result = await createCheckoutOrder({
        buyerId: 'usr_buyer_alice',
        listingId: 'listing-2',
        quantity: 1,
        rateType: 'BLUE',
      });

      expect(result.order.exchangeRateType).toBe('BLUE');
      expect(result.order.exchangeRateUsed).toBeGreaterThan(1000);
    });

    it('rechaza que un vendedor compre su propia publicación', async () => {
      // listing-2 fue publicado por 'user-demo-2'
      await expect(
        createCheckoutOrder({
          buyerId: 'user-demo-2',
          listingId: 'listing-2',
          quantity: 1,
        })
      ).rejects.toThrow('No podés comprar tu propia publicación');
    });

    it('rechaza compras si la cantidad supera el stock disponible', async () => {
      // listing-1 tiene 1 unidad disponible
      await expect(
        createCheckoutOrder({
          buyerId: 'usr_buyer_alice',
          listingId: 'listing-1',
          quantity: 5,
        })
      ).rejects.toThrow('Stock insuficiente');
    });

    it('rechaza publicaciones inexistentes', async () => {
      await expect(
        createCheckoutOrder({
          buyerId: 'usr_buyer_alice',
          listingId: 'listing-inexistente-999',
          quantity: 1,
        })
      ).rejects.toThrow('no fue encontrada');
    });
  });

  describe('Confirmación de Pagos (Webhook / Sandbox Flow) y Descuento de Stock', () => {
    it('marca la orden como PAID, descuenta stock y actualiza listing a SOLD al agotar', async () => {
      const { order } = await createCheckoutOrder({
        buyerId: 'usr_buyer_alice',
        listingId: 'listing-1', // Stock 1
        quantity: 1,
      });

      expect(order.status).toBe('PENDING');

      // Simulamos confirmación de pago por webhook de Mercado Pago
      const paidOrder = await confirmOrderPayment(order.id, 'mp-payment-777888', 'approved');

      expect(paidOrder.status).toBe('PAID');
      expect(paidOrder.mpPaymentId).toBe('mp-payment-777888');
      expect(paidOrder.mpStatus).toBe('approved');

      // Verificar que el listing quedó sin stock y en estado SOLD
      const listing = getListingById('listing-1');
      expect(listing?.quantity).toBe(0);
      expect(listing?.status).toBe('SOLD');
    });

    it('es idempotente ante múltiples notificaciones de webhook de Mercado Pago', async () => {
      const { order } = await createCheckoutOrder({
        buyerId: 'usr_buyer_alice',
        listingId: 'listing-2',
        quantity: 1,
      });

      const firstCall = await confirmOrderPayment(order.id, 'mp-payment-111');
      const secondCall = await confirmOrderPayment(order.id, 'mp-payment-111');

      expect(firstCall.status).toBe('PAID');
      expect(secondCall.status).toBe('PAID');
      // No debe restar stock dos veces
      const listing = getListingById('listing-2');
      expect(listing?.quantity).toBe(0);
    });
  });

  describe('Historial de Órdenes del Usuario', () => {
    it('distingue correctamente compras y ventas según el rol del usuario', async () => {
      const buyerId = 'user_buyer_test';
      const sellerId = 'seller-demo-1';

      const { order } = await createCheckoutOrder({
        buyerId,
        listingId: 'listing-1', // Vendedor es seller-demo-1
        quantity: 1,
      });

      const buyerOrders = getUserOrders(buyerId);
      expect(buyerOrders.purchases).toHaveLength(1);
      expect(buyerOrders.purchases[0].id).toBe(order.id);
      expect(buyerOrders.sales).toHaveLength(0);

      const sellerOrders = getUserOrders(sellerId);
      expect(sellerOrders.sales).toHaveLength(1);
      expect(sellerOrders.sales[0].id).toBe(order.id);
      expect(sellerOrders.purchases).toHaveLength(0);
    });
  });
});
