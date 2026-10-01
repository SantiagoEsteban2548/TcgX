import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createCheckoutOrder } from '@/lib/orders';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Debés iniciar sesión para comprar en el marketplace' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, quantity = 1, rateType = 'MEP' } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'El ID de la publicación es obligatorio' },
        { status: 400 }
      );
    }

    const { order, initPoint } = await createCheckoutOrder({
      buyerId: authUser.userId,
      buyerEmail: authUser.email,
      listingId,
      quantity: Number(quantity),
      rateType,
    });

    return NextResponse.json(
      {
        success: true,
        order,
        initPoint,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al iniciar checkout con Mercado Pago' },
      { status: 400 }
    );
  }
}
