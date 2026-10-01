import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, isValidAlias } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { name, alias, bio, phone, avatarUrl } = body;

    const dataToUpdate: Record<string, unknown> = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (bio !== undefined) dataToUpdate.bio = bio;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl;

    if (alias !== undefined && alias !== auth.alias) {
      if (!isValidAlias(alias)) {
        return NextResponse.json(
          { error: 'El alias debe tener entre 3 y 20 caracteres alfanuméricos.' },
          { status: 400 }
        );
      }
      const existing = await prisma.user.findUnique({
        where: { alias: alias.toLowerCase() },
      });
      if (existing && existing.id !== auth.userId) {
        return NextResponse.json(
          { error: 'El alias ya está en uso por otro usuario.' },
          { status: 409 }
        );
      }
      dataToUpdate.alias = alias.toLowerCase();
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: dataToUpdate,
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
      },
    });

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      user: {
        ...updatedUser,
        mpConnected: Boolean(updatedUser.mpUserId),
      },
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 });
  }
}
