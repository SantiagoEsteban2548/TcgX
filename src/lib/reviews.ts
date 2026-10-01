/**
 * reviews.ts
 * Sistema de calificaciones y reputación post-compra para tcgtX:
 * - Calificaciones de 1 a 5 estrellas y comentarios de compradores.
 * - Validación de orden completada (PAID o DELIVERED).
 * - Verificación de identidad: solo el comprador de la orden puede calificar al vendedor.
 * - Idempotencia: previene calificaciones duplicadas sobre la misma orden.
 * - Cálculo automático y actualización del promedio de reputación del vendedor.
 */

import { getOrderById } from './orders';

export interface SellerReview {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  buyerAlias: string;
  rating: number; // 1 to 5
  comment: string;
  cardName: string;
  createdAt: string;
}

// Store en memoria para runtime y desarrollo
let reviewsStore: SellerReview[] = [
  {
    id: 'rev-demo-1',
    orderId: 'ord-demo-1001',
    sellerId: 'seller-demo-1',
    buyerId: 'usr_buyer_demo',
    buyerAlias: 'luffy_fan_ar',
    rating: 5,
    comment: 'Llegó en perfecto estado, doble folio y toploader magnético. Vendedor súper recomendado!',
    cardName: 'Roronoa Zoro (Rush)',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'rev-demo-2',
    orderId: 'ord-demo-1000',
    sellerId: 'seller-demo-1',
    buyerId: 'usr_buyer_demo_2',
    buyerAlias: 'chopper_doc',
    rating: 5,
    comment: 'Todo impecable, entrega rápida y excelente comunicación por el chat de tcgtX.',
    cardName: 'Shanks (Manga Alt-Art)',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'rev-demo-3',
    orderId: 'ord-demo-999',
    sellerId: 'user-demo-1',
    buyerId: 'usr_buyer_demo',
    buyerAlias: 'luffy_fan_ar',
    rating: 5,
    comment: 'Caja original sellada con precinto Bandai impecable. Muy bien embalada.',
    cardName: 'Romance Dawn Booster Box (OP-01)',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export interface CreateReviewParams {
  orderId: string;
  buyerId: string;
  buyerAlias: string;
  rating: number;
  comment?: string;
}

export function hasReviewedOrder(orderId: string, buyerId: string): boolean {
  return reviewsStore.some((r) => r.orderId === orderId && r.buyerId === buyerId);
}

export function createReview(params: CreateReviewParams): SellerReview {
  const { orderId, buyerId, buyerAlias, rating, comment = '' } = params;

  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new Error('La calificación debe ser un número entero entre 1 y 5 estrellas.');
  }

  const order = getOrderById(orderId);
  if (!order) {
    throw new Error(`La orden ${orderId} no fue encontrada.`);
  }

  if (order.buyerId !== buyerId) {
    throw new Error('Solo el comprador de la orden puede calificar al vendedor.');
  }

  if (order.status !== 'PAID' && order.status !== 'DELIVERED') {
    throw new Error('Solo podés calificar una orden una vez que el pago esté confirmado.');
  }

  if (hasReviewedOrder(orderId, buyerId)) {
    throw new Error('Ya calificaste esta compra previamente.');
  }

  const newReview: SellerReview = {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId,
    sellerId: order.sellerId,
    buyerId,
    buyerAlias,
    rating,
    comment: comment.trim() || 'Sin comentario adicional.',
    cardName: order.item.cardName,
    createdAt: new Date().toISOString(),
  };

  reviewsStore.unshift(newReview);
  return newReview;
}

export function getSellerReviews(sellerId: string): {
  reviews: SellerReview[];
  averageScore: number;
  totalReviews: number;
  ratingBreakdown: Record<number, number>;
} {
  const reviews = reviewsStore.filter((r) => r.sellerId === sellerId);
  const totalReviews = reviews.length;

  const ratingBreakdown: Record<number, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((r) => {
    if (ratingBreakdown[r.rating] !== undefined) {
      ratingBreakdown[r.rating]++;
    }
  });

  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const averageScore = totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 5.0;

  return {
    reviews,
    averageScore,
    totalReviews,
    ratingBreakdown,
  };
}

export function _resetReviewsStore() {
  reviewsStore = [];
}
