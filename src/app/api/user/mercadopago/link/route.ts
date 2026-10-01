import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

/**
 * Vincula la cuenta de Mercado Pago del vendedor.
 * En modo sandbox / desarrollo, simula el retorno del flujo OAuth de MP
 * y asocia un Collector ID de prueba.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const testMpUserId = body.mpUserId || `TEST-USER-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        mpUserId: testMpUserId,
        mpAccessToken: `TEST-ACCESS-TOKEN-${Date.now()}`,
        mpConnectedAt: new Date(),
        role: 'SELLER',
      },
      select: {
        id: true,
        alias: true,
        role: true,
        mpUserId: true,
        mpConnectedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Cuenta de Mercado Pago vinculada correctamente (Modo Sandbox)',
      user: {
        ...updatedUser,
        mpConnected: true,
      },
    });
  } catch (error) {
    console.error('Error al vincular Mercado Pago:', error);
    return NextResponse.json({ error: 'Error al vincular Mercado Pago' }, { status: 500 });
  }
}
