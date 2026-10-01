import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import {
  sendMessage,
  getConversation,
  getUserConversations,
  getUnreadCount,
} from '@/lib/messaging';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Debés iniciar sesión para ver tus mensajes' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const withUserId = searchParams.get('withUserId');
    const orderId = searchParams.get('orderId');

    if (withUserId) {
      const messages = await getConversation(authUser.userId, withUserId, orderId);
      return NextResponse.json({
        success: true,
        withUserId,
        messages,
      });
    }

    // Devuelve todas las conversaciones activas
    const conversations = await getUserConversations(authUser.userId);
    const totalUnread = await getUnreadCount(authUser.userId);

    return NextResponse.json({
      success: true,
      conversations,
      totalUnread,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener mensajes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Debés iniciar sesión para enviar mensajes' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiverId, content, orderId, listingId, cardCode } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Destinatario y contenido son obligatorios' },
        { status: 400 }
      );
    }

    const message = await sendMessage({
      senderId: authUser.userId,
      receiverId,
      content,
      orderId,
      listingId,
      cardCode,
    });

    return NextResponse.json(
      {
        success: true,
        message,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al enviar mensaje' },
      { status: 400 }
    );
  }
}
