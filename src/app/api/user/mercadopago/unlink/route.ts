import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        mpUserId: null,
        mpAccessToken: null,
        mpRefreshToken: null,
        mpConnectedAt: null,
      },
      select: {
        id: true,
        alias: true,
        role: true,
        mpUserId: true,
      },
    });

    return NextResponse.json({
      message: 'Cuenta de Mercado Pago desvinculada',
      user: {
        ...updatedUser,
        mpConnected: false,
      },
    });
  } catch (error) {
    console.error('Error al desvincular Mercado Pago:', error);
    return NextResponse.json({ error: 'Error al desvincular cuenta' }, { status: 500 });
  }
}
