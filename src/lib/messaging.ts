/**
 * tcgtX - Módulo de Mensajería Interna (Chat Comprador/Vendedor)
 * Soporta conversaciones entre usuarios, vínculos a órdenes o publicaciones de cartas,
 * y persistencia en memoria con sincronización Prisma.
 */

import { prisma } from './prisma';

export interface InternalMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  orderId?: string | null;
  listingId?: string | null;
  cardCode?: string | null;
  readAt?: Date | null;
  createdAt: Date;
}

export interface ConversationSummary {
  otherUserId: string;
  otherUserName: string;
  otherUserEmail: string;
  lastMessage: InternalMessage;
  unreadCount: number;
}

// Almacén en memoria persistente durante el proceso para agilidad y fallback
const memoryMessages: InternalMessage[] = [
  {
    id: 'msg-seed-1',
    senderId: 'seller-demo-1',
    receiverId: 'usr_buyer_demo',
    content: '¡Hola! Vi tu interés en la carta OP01-120 Shanks Manga Alt-Art. Está impecable, directo de sobre a sleeve y toploader.',
    cardCode: 'OP01-120',
    readAt: null,
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 horas atrás
  },
  {
    id: 'msg-seed-2',
    senderId: 'usr_buyer_demo',
    receiverId: 'seller-demo-1',
    content: 'Hola Juan! Buenísimo, ¿hacés envíos por Andreani o retiro en persona por Microcentro?',
    cardCode: 'OP01-120',
    readAt: new Date(Date.now() - 3600000), // 1 hora atrás
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'msg-seed-3',
    senderId: 'seller-demo-1',
    receiverId: 'usr_buyer_demo',
    content: 'Ambas opciones! Puedo coordinar en Microcentro o mandarlo súper protegido con seguimiento.',
    cardCode: 'OP01-120',
    readAt: null,
    createdAt: new Date(Date.now() - 1800000), // 30 min atrás
  }
];

/**
 * Envía un mensaje interno
 */
export async function sendMessage(params: {
  senderId: string;
  receiverId: string;
  content: string;
  orderId?: string | null;
  listingId?: string | null;
  cardCode?: string | null;
}): Promise<InternalMessage> {
  const { senderId, receiverId, content, orderId, listingId, cardCode } = params;

  if (!senderId || !receiverId) {
    throw new Error('El remitente y el destinatario son obligatorios');
  }

  if (senderId === receiverId) {
    throw new Error('No podés enviarte un mensaje a vos mismo');
  }

  const cleanContent = content ? content.trim() : '';
  if (!cleanContent) {
    throw new Error('El mensaje no puede estar vacío');
  }

  if (cleanContent.length > 2000) {
    throw new Error('El mensaje supera el límite máximo de 2000 caracteres');
  }

  const newMessage: InternalMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    senderId,
    receiverId,
    content: cleanContent,
    orderId: orderId || null,
    listingId: listingId || null,
    cardCode: cardCode || null,
    readAt: null,
    createdAt: new Date(),
  };

  try {
    if (process.env.USE_PRISMA === 'true' && prisma && prisma.message) {
      const created = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          orderId: orderId || undefined,
          content: cleanContent,
        },
      });
      newMessage.id = created.id;
      newMessage.createdAt = created.createdAt;
    }
  } catch {
    // Si no hay DB activa, continúa con el store en memoria
  }

  memoryMessages.push(newMessage);
  return newMessage;
}

/**
 * Obtiene el hilo de conversación entre dos usuarios ordenado cronológicamente
 */
export async function getConversation(userId1: string, userId2: string, orderId?: string | null): Promise<InternalMessage[]> {
  try {
    if (process.env.USE_PRISMA === 'true' && prisma && prisma.message) {
      const dbMessages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 },
          ],
          ...(orderId ? { orderId } : {}),
        },
        orderBy: { createdAt: 'asc' },
      });

      if (dbMessages.length > 0) {
        return dbMessages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          content: m.content,
          orderId: m.orderId,
          readAt: m.readAt,
          createdAt: m.createdAt,
        }));
      }
    }
  } catch {
    // Fallback en memoria
  }

  return memoryMessages
    .filter(
      (m) =>
        ((m.senderId === userId1 && m.receiverId === userId2) ||
          (m.senderId === userId2 && m.receiverId === userId1)) &&
        (!orderId || m.orderId === orderId)
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

/**
 * Obtiene el resumen de conversaciones activas para un usuario
 */
export async function getUserConversations(
  userId: string,
  userResolver?: (id: string) => { name: string; email: string }
): Promise<ConversationSummary[]> {
  const relevantMessages = memoryMessages.filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );

  const conversationMap = new Map<string, InternalMessage[]>();

  for (const msg of relevantMessages) {
    const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, []);
    }
    conversationMap.get(otherUserId)!.push(msg);
  }

  const summaries: ConversationSummary[] = [];

  for (const [otherUserId, msgs] of conversationMap.entries()) {
    // Ordenar de más viejo a más nuevo
    msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const lastMessage = msgs[msgs.length - 1];

    // Contar los no leídos que fueron enviados AL usuario actual
    const unreadCount = msgs.filter(
      (m) => m.receiverId === userId && !m.readAt
    ).length;

    let otherUserName = otherUserId === 'seller-demo-1' ? 'Juan Pirata (Vendedor OP)' : `Usuario (${otherUserId.slice(0, 8)})`;
    let otherUserEmail = otherUserId === 'seller-demo-1' ? 'juan.nakama@onepiece.ar' : `user_${otherUserId.slice(0, 6)}@tcgtx.com`;

    if (userResolver) {
      const resolved = userResolver(otherUserId);
      if (resolved) {
        otherUserName = resolved.name;
        otherUserEmail = resolved.email;
      }
    }

    summaries.push({
      otherUserId,
      otherUserName,
      otherUserEmail,
      lastMessage,
      unreadCount,
    });
  }

  // Ordenar por el mensaje más reciente descendente
  return summaries.sort(
    (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
  );
}

/**
 * Marca mensajes de un remitente como leídos
 */
export async function markAsRead(userId: string, senderId: string): Promise<number> {
  let updatedCount = 0;

  for (const m of memoryMessages) {
    if (m.receiverId === userId && m.senderId === senderId && !m.readAt) {
      m.readAt = new Date();
      updatedCount++;
    }
  }

  try {
    if (process.env.USE_PRISMA === 'true' && prisma && prisma.message) {
      await prisma.message.updateMany({
        where: {
          receiverId: userId,
          senderId: senderId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });
    }
  } catch {
    // Fallback silencioso
  }

  return updatedCount;
}

/**
 * Total de mensajes no leídos para el usuario (para el badge de la Navbar)
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return memoryMessages.filter(
    (m) => m.receiverId === userId && !m.readAt
  ).length;
}

/**
 * Resetea el almacén de mensajes en memoria (útil para tests limpios)
 */
export function _resetMemoryMessages(initialMessages?: InternalMessage[]) {
  memoryMessages.length = 0;
  if (initialMessages) {
    memoryMessages.push(...initialMessages);
  }
}
