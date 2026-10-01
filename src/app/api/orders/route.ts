import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUserOrders } from '@/lib/orders';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const orders = getUserOrders(authUser.userId);
    return NextResponse.json({
      success: true,
      purchases: orders.purchases,
      sales: orders.sales,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener órdenes' },
      { status: 500 }
    );
  }
}
