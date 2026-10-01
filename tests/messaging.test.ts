import { describe, it, expect, beforeEach } from 'vitest';
import {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead,
  getUnreadCount,
  _resetMemoryMessages,
} from '../src/lib/messaging';

describe('tcgtX - Mensajería Interna (Chat Comprador/Vendedor)', () => {
  const userA = 'user_buyer_123';
  const userB = 'user_seller_456';
  const userC = 'user_third_789';

  beforeEach(() => {
    _resetMemoryMessages();
  });

  it('permite enviar un mensaje válido entre dos usuarios', async () => {
    const msg = await sendMessage({
      senderId: userA,
      receiverId: userB,
      content: 'Hola, ¿seguís teniendo disponible la carta OP01-120?',
      cardCode: 'OP01-120',
    });

    expect(msg).toBeDefined();
    expect(msg.id).toBeTruthy();
    expect(msg.senderId).toBe(userA);
    expect(msg.receiverId).toBe(userB);
    expect(msg.content).toBe('Hola, ¿seguís teniendo disponible la carta OP01-120?');
    expect(msg.cardCode).toBe('OP01-120');
    expect(msg.readAt).toBeNull();
  });

  it('rechaza enviar un mensaje a uno mismo', async () => {
    await expect(
      sendMessage({
        senderId: userA,
        receiverId: userA,
        content: 'Nota para mí mismo',
      })
    ).rejects.toThrow('No podés enviarte un mensaje a vos mismo');
  });

  it('rechaza mensajes vacíos o con solo espacios', async () => {
    await expect(
      sendMessage({
        senderId: userA,
        receiverId: userB,
        content: '   ',
      })
    ).rejects.toThrow('El mensaje no puede estar vacío');
  });

  it('recupera una conversación en orden cronológico ascendente', async () => {
    await sendMessage({
      senderId: userA,
      receiverId: userB,
      content: 'Primer mensaje',
    });

    // Pequeño retardo para asegurar timestamps diferentes
    await new Promise((r) => setTimeout(r, 10));

    await sendMessage({
      senderId: userB,
      receiverId: userA,
      content: 'Respuesta al primer mensaje',
    });

    const thread = await getConversation(userA, userB);
    expect(thread).toHaveLength(2);
    expect(thread[0].content).toBe('Primer mensaje');
    expect(thread[1].content).toBe('Respuesta al primer mensaje');
  });

  it('aísla conversaciones entre diferentes pares de usuarios', async () => {
    await sendMessage({
      senderId: userA,
      receiverId: userB,
      content: 'Chat con B',
    });

    await sendMessage({
      senderId: userA,
      receiverId: userC,
      content: 'Chat con C',
    });

    const threadAB = await getConversation(userA, userB);
    const threadAC = await getConversation(userA, userC);

    expect(threadAB).toHaveLength(1);
    expect(threadAB[0].content).toBe('Chat con B');

    expect(threadAC).toHaveLength(1);
    expect(threadAC[0].content).toBe('Chat con C');
  });

  it('calcula correctamente los resúmenes de conversación y mensajes no leídos', async () => {
    // A manda 2 mensajes a B
    await sendMessage({ senderId: userA, receiverId: userB, content: 'Hola B 1' });
    await sendMessage({ senderId: userA, receiverId: userB, content: 'Hola B 2' });

    // C manda 1 mensaje a B
    await sendMessage({ senderId: userC, receiverId: userB, content: 'Hola B desde C' });

    // Para el usuario B: debe tener 2 conversaciones
    const convsForB = await getUserConversations(userB);
    expect(convsForB).toHaveLength(2);

    const convWithA = convsForB.find((c) => c.otherUserId === userA);
    const convWithC = convsForB.find((c) => c.otherUserId === userC);

    expect(convWithA?.unreadCount).toBe(2);
    expect(convWithC?.unreadCount).toBe(1);

    // Conteo total global no leídos para B
    const totalUnreadB = await getUnreadCount(userB);
    expect(totalUnreadB).toBe(3);

    // Para el usuario A: no leídos debe ser 0 (él es remitente)
    const totalUnreadA = await getUnreadCount(userA);
    expect(totalUnreadA).toBe(0);
  });

  it('permite marcar mensajes como leídos y actualiza los contadores', async () => {
    await sendMessage({ senderId: userA, receiverId: userB, content: 'Mensaje pendiente' });

    expect(await getUnreadCount(userB)).toBe(1);

    const marked = await markAsRead(userB, userA);
    expect(marked).toBe(1);

    expect(await getUnreadCount(userB)).toBe(0);

    const thread = await getConversation(userA, userB);
    expect(thread[0].readAt).not.toBeNull();
  });
});
