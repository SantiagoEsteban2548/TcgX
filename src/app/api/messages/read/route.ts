import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { markAsRead } from '@/lib/messaging';

export async function PATCH(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { senderId } = body;

    if (!senderId) {
      return NextResponse.json(
        { error: 'Se requiere el senderId' },
        { status: 400 }
      );
    }

    const updatedCount = await markAsRead(authUser.userId, senderId);

    return NextResponse.json({
      success: true,
      updatedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al marcar mensajes como leídos' },
      { status: 500 }
    );
  }
}
