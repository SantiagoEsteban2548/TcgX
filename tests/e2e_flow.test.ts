/**
 * tests/e2e_flow.test.ts
 * Prueba de Integración End-to-End simulando el ciclo completo de tcgtX:
 * 1. Autenticación y vinculación OAuth Mercado Pago del vendedor.
 * 2. Búsqueda en catálogo canónico y valuación ARS (MEP / Blue).
 * 3. Gestión de Colección Personal del comprador (desacoplada).
 * 4. Publicación de cartas en el marketplace por el vendedor.
 * 5. Mensajería interna bidireccional entre comprador y vendedor.
 * 6. Checkout con Mercado Pago, tasa congelada, split fee y webhook.
 * 7. Verificación de stock, estado de orden y comprobante.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, signAuthToken, verifyAuthToken } from '../src/lib/auth';
import { getCardByCode, getCards } from '../src/lib/catalog';
import { getExchangeRates, convertUsdToArs } from '../src/lib/currency';
import {
  createListing,
  getListingById,
  getListings,
  addToUserCollection,
  getUserCollection,
  _resetMarketplaceStore,
} from '../src/lib/marketplace';
import {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead,
  getUnreadCount,
  _resetMemoryMessages,
} from '../src/lib/messaging';
import {
  createCheckoutOrder,
  confirmOrderPayment,
  getOrderById,
  getUserOrders,
  _resetOrdersStore,
} from '../src/lib/orders';

describe('tcgtX - Flujo Integral End-to-End del Marketplace', () => {
  beforeEach(() => {
    _resetMarketplaceStore();
    _resetMemoryMessages();
    _resetOrdersStore();
  });

  it('ejecuta exitosamente el ciclo completo de vida de compra, venta, chat y pagos en tcgtX', async () => {
    // ----------------------------------------------------
    // PASO 1: Usuarios y Autenticación
    // ----------------------------------------------------
    const sellerPassword = await hashPassword('password123');
    const isSellerPassValid = await verifyPassword('password123', sellerPassword);
    expect(isSellerPassValid).toBe(true);

    const sellerPayload = {
      userId: 'usr_seller_law',
      email: 'trafalgar.law@heartpirates.ar',
      alias: 'room_shambles',
      role: 'USER',
    };

    const buyerPayload = {
      userId: 'usr_buyer_luffy',
      email: 'monkey.luffy@strawhats.ar',
      alias: 'future_pirate_king',
      role: 'USER',
    };

    const sellerToken = await signAuthToken(sellerPayload);
    const decodedSeller = await verifyAuthToken(sellerToken);
    expect(decodedSeller?.alias).toBe('room_shambles');

    // ----------------------------------------------------
    // PASO 2: Consulta de Catálogo y Cotizaciones Dólar en Vivo
    // ----------------------------------------------------
    const cards = getCards();
    expect(cards.length).toBeGreaterThanOrEqual(10);

    const rates = await getExchangeRates();
    expect(rates.mep.venta).toBeGreaterThan(1000);
    expect(rates.blue.venta).toBeGreaterThan(1000);

    // Carta emblemática: OP01-120 Shanks
    const shanksCard = getCardByCode('OP01-120');
    expect(shanksCard).toBeDefined();
    expect(shanksCard?.currentMedianUsd).toBe(840.0);

    // Conversión a ARS con MEP y Blue
    const mepArs = convertUsdToArs(shanksCard!.currentMedianUsd, rates.mep.venta);
    const blueArs = convertUsdToArs(shanksCard!.currentMedianUsd, rates.blue.venta);
    expect(mepArs).toBeGreaterThan(1000000);
    expect(blueArs).toBeGreaterThan(1000000);

    // ----------------------------------------------------
    // PASO 3: Colección Personal del Comprador (Desacoplada)
    // ----------------------------------------------------
    const collectionItem = addToUserCollection({
      userId: buyerPayload.userId,
      cardCode: 'OP01-120',
      condition: 'NM',
      quantity: 1,
      isWishlist: true,
      notes: 'Buscando copia impecable para el deck',
    });

    expect(collectionItem.isWishlist).toBe(true);
    const buyerCollection = getUserCollection(buyerPayload.userId, rates.mep.venta, rates.blue.venta);
    expect(buyerCollection.wishlistCount).toBe(1);
    expect(buyerCollection.totalEstimatedArsMep).toBe(0); // Wishlist no computa como owned

    // ----------------------------------------------------
    // PASO 4: Vendedor publica carta en el Marketplace
    // ----------------------------------------------------
    const sellerListing = createListing({
      seller: {
        id: sellerPayload.userId,
        alias: sellerPayload.alias,
        name: 'Trafalgar D. Water Law',
        avatarUrl: null,
        reputationScore: 5.0,
        totalSalesCount: 12,
        mpConnected: true, // Cuenta de Mercado Pago vinculada vía OAuth
      },
      cardCode: 'OP01-120',
      condition: 'NM',
      priceArs: 1100000, // $1.100.000 ARS
      quantity: 1,
      description: 'Impecable recien sacada de sobre, con sleeve toploader magnetico.',
      mepRate: rates.mep.venta,
    });

    expect(sellerListing.id).toBeTruthy();
    expect(sellerListing.status).toBe('ACTIVE');
    expect(sellerListing.priceArs).toBe(1100000);

    // ----------------------------------------------------
    // PASO 5: Chat y Consulta Previa a la Compra
    // ----------------------------------------------------
    const firstMsg = await sendMessage({
      senderId: buyerPayload.userId,
      receiverId: sellerPayload.userId,
      content: '¡Hola Law! ¿Hacés envíos en el día por moto en CABA?',
      cardCode: 'OP01-120',
    });

    expect(firstMsg.senderId).toBe(buyerPayload.userId);
    expect(await getUnreadCount(sellerPayload.userId)).toBe(1);

    // Vendedor responde y lee
    await markAsRead(sellerPayload.userId, buyerPayload.userId);
    expect(await getUnreadCount(sellerPayload.userId)).toBe(0);

    await sendMessage({
      senderId: sellerPayload.userId,
      receiverId: buyerPayload.userId,
      content: 'Hola Luffy, sí! Coordinamos por moto apenas se acredite el pago.',
      cardCode: 'OP01-120',
    });

    const thread = await getConversation(buyerPayload.userId, sellerPayload.userId);
    expect(thread).toHaveLength(2);

    // ----------------------------------------------------
    // PASO 6: Checkout con Mercado Pago Split & Freeze Cambiario
    // ----------------------------------------------------
    const { order, initPoint } = await createCheckoutOrder({
      buyerId: buyerPayload.userId,
      buyerEmail: buyerPayload.email,
      listingId: sellerListing.id,
      quantity: 1,
      rateType: 'MEP',
    });

    expect(order.status).toBe('PENDING');
    expect(order.totalArs).toBe(1100000);
    // Fee 5% de 1.100.000 = 55.000 ARS
    expect(order.marketplaceFeeArs).toBe(55000);
    // Payout vendedor: 1.100.000 - 55.000 = 1.045.000 ARS
    expect(order.sellerPayoutArs).toBe(1045000);
    expect(order.exchangeRateType).toBe('MEP');
    expect(order.exchangeRateUsed).toBe(rates.mep.venta);
    expect(initPoint).toBeTruthy();

    // ----------------------------------------------------
    // PASO 7: Confirmación de Pago por Webhook de Mercado Pago
    // ----------------------------------------------------
    const paidOrder = await confirmOrderPayment(
      order.id,
      'mp-payment-sandbox-998877',
      'approved'
    );

    expect(paidOrder.status).toBe('PAID');
    expect(paidOrder.mpPaymentId).toBe('mp-payment-sandbox-998877');

    // Descuento automático de stock en el Marketplace
    const updatedListing = getListingById(sellerListing.id);
    expect(updatedListing?.quantity).toBe(0);
    expect(updatedListing?.status).toBe('SOLD');

    // Comprobación de órdenes de usuario
    const buyerOrders = getUserOrders(buyerPayload.userId);
    expect(buyerOrders.purchases).toHaveLength(1);
    expect(buyerOrders.purchases[0].status).toBe('PAID');

    const sellerOrders = getUserOrders(sellerPayload.userId);
    expect(sellerOrders.sales).toHaveLength(1);
    expect(sellerOrders.sales[0].status).toBe('PAID');

    // Mensaje automático generado por la plataforma
    const finalThread = await getConversation(buyerPayload.userId, sellerPayload.userId);
    expect(finalThread.length).toBeGreaterThanOrEqual(3);
    const orderNotification = finalThread.find((m) => m.orderId === order.id);
    expect(orderNotification?.content).toContain('Acabo de pagar la orden');
  });
});
