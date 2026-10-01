import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getOrderById, confirmOrderPayment } from '@/lib/orders';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await context.params;
    const order = getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    if (order.buyerId !== authUser.userId && order.sellerId !== authUser.userId) {
      return NextResponse.json({ error: 'Acceso no permitido' }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await context.params;
    const order = getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));

    // Simulación de aprobación de pago en sandbox
    if (body.action === 'simulate-approval') {
      const updatedOrder = await confirmOrderPayment(
        id,
        `sim-pay-${Date.now()}`,
        'approved'
      );
      return NextResponse.json({ success: true, order: updatedOrder });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
