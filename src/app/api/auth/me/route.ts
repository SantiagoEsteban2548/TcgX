import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        alias: true,
        name: true,
        role: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        reputationScore: true,
        totalSalesCount: true,
        totalBuysCount: true,
        mpUserId: true,
        mpConnectedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        ...user,
        mpConnected: Boolean(user.mpUserId),
      },
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return NextResponse.json({ error: 'Error al consultar la sesión' }, { status: 500 });
  }
}
