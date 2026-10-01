import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createReview, getSellerReviews, hasReviewedOrder } from '@/lib/reviews';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    const orderId = searchParams.get('orderId');

    const auth = await getAuthUser();

    if (orderId && auth) {
      const reviewed = hasReviewedOrder(orderId, auth.userId);
      return NextResponse.json({ reviewed });
    }

    if (!sellerId) {
      return NextResponse.json(
        { error: 'El parámetro sellerId es obligatorio.' },
        { status: 400 }
      );
    }

    const reviewsData = getSellerReviews(sellerId);
    return NextResponse.json(reviewsData);
  } catch (error) {
    console.error('Error al consultar reseñas:', error);
    return NextResponse.json(
      { error: 'Error al consultar reseñas' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json(
        { error: 'Debés iniciar sesión para calificar una compra.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, rating, comment } = body;

    if (!orderId || !rating) {
      return NextResponse.json(
        { error: 'orderId y rating (1 a 5) son obligatorios.' },
        { status: 400 }
      );
    }

    const review = createReview({
      orderId,
      buyerId: auth.userId,
      buyerAlias: auth.alias,
      rating: Number(rating),
      comment: comment || '',
    });

    return NextResponse.json(
      {
        message: '¡Gracias por calificar tu compra!',
        review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear reseña:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la calificación.' },
      { status: 400 }
    );
  }
}
