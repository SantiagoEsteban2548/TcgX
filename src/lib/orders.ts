/**
 * orders.ts
 * Lógica central de órdenes y transacciones de tcgtX:
 * - Integración de Checkout de Mercado Pago con Split (Marketplace Fee).
 * - Congelamiento de cotizaciones en ARS (MEP / Blue) al instante del checkout.
 * - Validación de stock y estado de publicación del vendedor.
 * - Gestión de Webhooks de pago y descuento de stock.
 */

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getListingById, updateListingStock, MarketplaceListing } from './marketplace';
import { getExchangeRates } from './currency';
import { sendMessage } from './messaging';
import { prisma } from './prisma';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'DISPUTED';

export interface OrderItemRecord {
  listingId: string;
  cardCode: string;
  cardName: string;
  cardImageUrl: string;
  condition: string;
  priceArs: number;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  totalArs: number;
  marketplaceFeeArs: number;
  sellerPayoutArs: number;
  exchangeRateUsed: number;
  exchangeRateType: 'MEP' | 'BLUE';
  mpPreferenceId?: string | null;
  mpPaymentId?: string | null;
  mpStatus?: string | null;
  initPoint?: string | null;
  item: OrderItemRecord;
  createdAt: Date;
  updatedAt: Date;
}

// Configuración Mercado Pago Sandbox
const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const DEFAULT_MARKETPLACE_FEE_PERCENT = 0.05; // 5% fee de plataforma

let mpClient: MercadoPagoConfig | null = null;
if (MP_ACCESS_TOKEN && MP_ACCESS_TOKEN !== 'TEST-mock-token') {
  try {
    mpClient = new MercadoPagoConfig({
      accessToken: MP_ACCESS_TOKEN,
      options: { timeout: 7000 },
    });
  } catch (err) {
    console.warn('No se pudo inicializar cliente de Mercado Pago:', err);
  }
}

// In-memory order store para entorno de desarrollo / fallback ágil
let ordersStore: OrderRecord[] = [
  {
    id: 'ord-demo-1001',
    buyerId: 'usr_buyer_demo',
    sellerId: 'seller-demo-1',
    status: 'PAID',
    totalArs: 29500,
    marketplaceFeeArs: 1475,
    sellerPayoutArs: 28025,
    exchangeRateUsed: 1548.7,
    exchangeRateType: 'MEP',
    mpPreferenceId: 'pref-demo-1001',
    mpPaymentId: 'pay-demo-998877',
    mpStatus: 'approved',
    initPoint: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-demo-1001',
    item: {
      listingId: 'listing-2',
      cardCode: 'OP01-025',
      cardName: 'Roronoa Zoro (Rush)',
      cardImageUrl: 'https://images.ygoprodeck.com/images/cards_optcg/OP01-025.jpg',
      condition: 'LP',
      priceArs: 29500,
      quantity: 1,
    },
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000 + 300000),
  },
];

/**
 * Calcula la comisión del marketplace (tcgtX)
 */
export function calculateMarketplaceFee(
  totalArs: number,
  feePercentage: number = DEFAULT_MARKETPLACE_FEE_PERCENT
): number {
  if (totalArs <= 0 || isNaN(totalArs)) return 0;
  return Math.round(totalArs * feePercentage);
}

/**
 * Calcula el monto neto a cobrar por el vendedor
 */
export function calculateSellerPayout(totalArs: number, feeArs: number): number {
  return Math.max(0, totalArs - feeArs);
}

export interface CreateOrderParams {
  buyerId: string;
  buyerEmail?: string;
  listingId: string;
  quantity: number;
  rateType?: 'MEP' | 'BLUE';
}

/**
 * Crea una orden de compra y genera la preferencia de Mercado Pago con split fee
 */
export async function createCheckoutOrder(params: CreateOrderParams): Promise<{
  order: OrderRecord;
  initPoint: string;
}> {
  const { buyerId, buyerEmail, listingId, quantity, rateType = 'MEP' } = params;

  if (!buyerId) {
    throw new Error('Debés iniciar sesión para realizar una compra');
  }

  if (quantity < 1 || !Number.isInteger(quantity)) {
    throw new Error('La cantidad a comprar debe ser al menos 1 unidad');
  }

  const listing = getListingById(listingId);
  if (!listing) {
    throw new Error(`La publicación con ID ${listingId} no fue encontrada`);
  }

  if (listing.status !== 'ACTIVE') {
    throw new Error('Esta publicación ya no se encuentra activa para la venta');
  }

  if (quantity > listing.quantity) {
    throw new Error(`Stock insuficiente. Solo quedan ${listing.quantity} unidad(es) disponible(s)`);
  }

  if (listing.sellerId === buyerId) {
    throw new Error('No podés comprar tu propia publicación');
  }

  // Obtener cotización en vivo y congelar snapshot
  const rates = await getExchangeRates();
  const exchangeRateUsed = rateType === 'BLUE' ? rates.blue.venta : rates.mep.venta;

  const totalArs = listing.priceArs * quantity;
  const marketplaceFeeArs = calculateMarketplaceFee(totalArs);
  const sellerPayoutArs = calculateSellerPayout(totalArs, marketplaceFeeArs);

  const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  let preferenceId = `pref-sandbox-${orderId}`;
  let initPoint = `${APP_URL}/checkout/feedback?order_id=${orderId}&status=simulated_pending`;

  // Integración real con Mercado Pago SDK si el cliente está configurado
  if (mpClient) {
    try {
      const preference = new Preference(mpClient);
      const prefResponse = await preference.create({
        body: {
          items: [
            {
              id: listing.id,
              title: `${listing.cardName} (${listing.cardCode}) - ${listing.condition}`,
              description: `Compra en tcgtX One Piece Marketplace. Vendedor: @${listing.seller.alias}`,
              picture_url: listing.cardImageUrl,
              unit_price: listing.priceArs,
              quantity: quantity,
              currency_id: 'ARS',
            },
          ],
          marketplace_fee: marketplaceFeeArs,
          payer: {
            email: buyerEmail || `buyer_${buyerId.slice(0, 6)}@tcgtx.com`,
          },
          back_urls: {
            success: `${APP_URL}/checkout/feedback?order_id=${orderId}&status=approved`,
            pending: `${APP_URL}/checkout/feedback?order_id=${orderId}&status=pending`,
            failure: `${APP_URL}/checkout/feedback?order_id=${orderId}&status=failure`,
          },
          auto_return: 'approved',
          external_reference: orderId,
          notification_url: `${APP_URL}/api/webhooks/mercadopago`,
          statement_descriptor: 'TCGTX ONE PIECE',
        },
      });

      if (prefResponse.id) {
        preferenceId = prefResponse.id;
        initPoint = prefResponse.init_point || prefResponse.sandbox_init_point || initPoint;
      }
    } catch (mpError: any) {
      console.warn('Fallo al crear preferencia en MP API (usando modo sandbox simulado):', mpError.message);
    }
  }

  const newOrder: OrderRecord = {
    id: orderId,
    buyerId,
    sellerId: listing.sellerId,
    status: 'PENDING',
    totalArs,
    marketplaceFeeArs,
    sellerPayoutArs,
    exchangeRateUsed,
    exchangeRateType: rateType,
    mpPreferenceId: preferenceId,
    mpPaymentId: null,
    mpStatus: 'pending',
    initPoint,
    item: {
      listingId: listing.id,
      cardCode: listing.cardCode,
      cardName: listing.cardName,
      cardImageUrl: listing.cardImageUrl,
      condition: listing.condition,
      priceArs: listing.priceArs,
      quantity,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Si Prisma está activo en prod
  try {
    if (process.env.USE_PRISMA === 'true' && prisma && prisma.order) {
      await prisma.order.create({
        data: {
          id: newOrder.id,
          buyerId,
          sellerId: listing.sellerId,
          status: 'PENDING',
          totalArs,
          marketplaceFeeArs,
          exchangeRateUsed,
          exchangeRateType: rateType,
          mpPreferenceId: preferenceId,
        },
      });
    }
  } catch {
    // Continuar en memoria
  }

  ordersStore.unshift(newOrder);

  return {
    order: newOrder,
    initPoint,
  };
}

/**
 * Confirma el pago de una orden (vía webhook de Mercado Pago o confirmación sandbox)
 */
export async function confirmOrderPayment(
  orderId: string,
  paymentId: string = `pay-${Date.now()}`,
  mpStatus: string = 'approved'
): Promise<OrderRecord> {
  const order = ordersStore.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Orden con ID ${orderId} no encontrada`);
  }

  if (order.status === 'PAID') {
    return order; // Idempotencia
  }

  order.status = 'PAID';
  order.mpPaymentId = paymentId;
  order.mpStatus = mpStatus;
  order.updatedAt = new Date();

  // Descontar stock del listing
  updateListingStock(order.item.listingId, order.item.quantity);

  // Enviar mensaje automático de notificación en el chat tcgtX
  try {
    await sendMessage({
      senderId: order.buyerId,
      receiverId: order.sellerId,
      orderId: order.id,
      cardCode: order.item.cardCode,
      content: `¡Hola! Acabo de pagar la orden #${order.id.slice(-6)} por ${order.item.quantity}x ${order.item.cardName} (${order.item.cardCode}). ¿Coordinamos la entrega?`,
    });
  } catch {
    // Ignorar si falla el mensaje de bienvenida
  }

  return order;
}

/**
 * Cancela una orden pendiente
 */
export function cancelOrder(orderId: string, reason: string = 'Cancelado'): OrderRecord {
  const order = ordersStore.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Orden con ID ${orderId} no encontrada`);
  }

  if (order.status === 'PAID') {
    throw new Error('No se puede cancelar una orden ya abonada directamente. Debe abrirse un reclamo.');
  }

  order.status = 'CANCELLED';
  order.updatedAt = new Date();
  return order;
}

/**
 * Obtiene una orden por su ID
 */
export function getOrderById(orderId: string): OrderRecord | null {
  return ordersStore.find((o) => o.id === orderId) || null;
}

/**
 * Obtiene todas las órdenes vinculadas a un usuario (como comprador y como vendedor)
 */
export function getUserOrders(userId: string): {
  purchases: OrderRecord[];
  sales: OrderRecord[];
} {
  const purchases = ordersStore.filter((o) => o.buyerId === userId);
  const sales = ordersStore.filter((o) => o.sellerId === userId);

  return {
    purchases,
    sales,
  };
}

/**
 * Resetea el almacén de órdenes para tests unitarios
 */
export function _resetOrdersStore(initial?: OrderRecord[]) {
  ordersStore = initial ? [...initial] : [];
}
