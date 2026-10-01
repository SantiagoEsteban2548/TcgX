'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface InternalMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  orderId?: string | null;
  listingId?: string | null;
  cardCode?: string | null;
  readAt?: string | null;
  createdAt: string;
}

interface ConversationSummary {
  otherUserId: string;
  otherUserName: string;
  otherUserEmail: string;
  lastMessage: InternalMessage;
  unreadCount: number;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialWithUserId = searchParams.get('with');
  const initialCardCode = searchParams.get('card');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(initialWithUserId);
  const [activeMessages, setActiveMessages] = useState<InternalMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState(
    initialCardCode ? `¡Hola! Te consulto sobre la carta ${initialCardCode}: ` : ''
  );
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [authError, setAuthError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar usuario y conversaciones
  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          setAuthError(true);
          setLoading(false);
          return;
        }
        const userData = await userRes.json();
        setCurrentUser(userData.user);

        const convsRes = await fetch('/api/messages');
        if (convsRes.ok) {
          const convsData = await convsRes.json();
          setConversations(convsData.conversations || []);

          // Si hay initialWithUserId que no está aún en conversaciones, armamos un placeholder
          if (initialWithUserId && !convsData.conversations?.some((c: ConversationSummary) => c.otherUserId === initialWithUserId)) {
            const placeholder: ConversationSummary = {
              otherUserId: initialWithUserId,
              otherUserName: initialWithUserId === 'seller-demo-1' ? 'Juan Pirata (Vendedor OP)' : `Vendedor (${initialWithUserId.slice(0, 8)})`,
              otherUserEmail: 'vendedor@tcgtx.com',
              lastMessage: {
                id: 'draft',
                senderId: '',
                receiverId: '',
                content: initialCardCode ? `Consulta por ${initialCardCode}` : 'Nueva conversación',
                createdAt: new Date().toISOString(),
              },
              unreadCount: 0,
            };
            setConversations((prev) => [placeholder, ...prev]);
            setActiveUserId(initialWithUserId);
          } else if (!activeUserId && convsData.conversations?.length > 0) {
            setActiveUserId(convsData.conversations[0].otherUserId);
          }
        }
      } catch (err) {
        console.error('Error cargando mensajes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialWithUserId, initialCardCode]);

  // Cargar hilo de mensajes activos
  useEffect(() => {
    if (!activeUserId || !currentUser) return;

    async function loadThread() {
      try {
        const res = await fetch(`/api/messages?withUserId=${activeUserId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveMessages(data.messages || []);

          // Marcar como leídos
          await fetch('/api/messages/read', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId: activeUserId }),
          });

          // Actualizar contador en la lista de conversaciones
          setConversations((prev) =>
            prev.map((c) =>
              c.otherUserId === activeUserId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (err) {
        console.error('Error cargando hilo:', err);
      }
    }

    loadThread();
  }, [activeUserId, currentUser]);

  // Auto-scroll al final del chat al recibir mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeUserId || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: activeUserId,
          content: newMessageText.trim(),
          cardCode: initialCardCode || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveMessages((prev) => [...prev, data.message]);
        setNewMessageText('');

        // Actualizar último mensaje en la lista de conversaciones
        setConversations((prev) =>
          prev.map((c) =>
            c.otherUserId === activeUserId
              ? { ...c, lastMessage: data.message }
              : c
          )
        );
      } else {
        const errData = await res.json();
        alert(errData.error || 'Error al enviar mensaje');
      }
    } catch (err) {
      alert('Error de conexión al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando tus mensajes...</p>
        </div>
      </div>
    );
  }

  if (authError || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            💬
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mensajería Interna</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Iniciá sesión o registrate para consultar a vendedores y gestionar tus compras de One Piece TCG.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-center shadow-sm transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-center transition"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeConversation = conversations.find((c) => c.otherUserId === activeUserId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>💬</span> Mensajería Interna
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Coordiná entregas, fotos adicionales y detalles de compra directamente con otros usuarios.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            ← Volver al Catálogo
          </Link>
        </div>

        {/* Contenedor Principal Estilo Chat Dashboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px]">
          {/* Panel Izquierdo: Lista de Conversaciones */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Conversaciones Activas ({conversations.length})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No tenés conversaciones activas. Podés contactar a un vendedor desde cualquier publicación en el catálogo.
                </div>
              ) : (
                conversations.map((c) => {
                  const isSelected = c.otherUserId === activeUserId;
                  return (
                    <button
                      key={c.otherUserId}
                      onClick={() => setActiveUserId(c.otherUserId)}
                      className={`w-full text-left p-4 transition flex items-start gap-3 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-l-4 border-blue-600'
                          : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {c.otherUserName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {c.otherUserName}
                          </p>
                          {c.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {c.lastMessage.content || 'Sin mensajes'}
                        </p>
                        {c.lastMessage.cardCode && (
                          <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
                            Carta: {c.lastMessage.cardCode}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Panel Derecho: Chat del Hilo Activo */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
            {activeUserId ? (
              <>
                {/* Cabecera del Chat */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {activeConversation ? activeConversation.otherUserName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {activeConversation?.otherUserName || 'Usuario'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        tcgtX Chat Seguro
                      </p>
                    </div>
                  </div>
                  {initialCardCode && (
                    <Link
                      href={`/catalog/${initialCardCode}`}
                      className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg"
                    >
                      Ver carta {initialCardCode} ↗
                    </Link>
                  )}
                </div>

                {/* Área de Mensajes */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
                  {activeMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                      <span className="text-4xl mb-2">💬</span>
                      <p className="text-sm font-medium">Iniciá la conversación</p>
                      <p className="text-xs">
                        Hacé una pregunta sobre la carta, solicitá más fotos o coordiná detalles.
                      </p>
                    </div>
                  ) : (
                    activeMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/50'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.cardCode && (
                              <div
                                className={`mt-2 pt-1 border-t text-[11px] font-mono flex items-center justify-between ${
                                  isMe
                                    ? 'border-blue-500/50 text-blue-100'
                                    : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                <span>Ref: {msg.cardCode}</span>
                                <Link
                                  href={`/catalog/${msg.cardCode}`}
                                  className="underline ml-2"
                                >
                                  Ver carta
                                </Link>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {timeStr} {isMe && (msg.readAt ? '· Leído' : '· Enviado')}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input para redactar mensaje */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Escribí tu mensaje..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={!newMessageText.trim() || sending}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition flex items-center gap-1 shadow-sm"
                  >
                    {sending ? '...' : 'Enviar ➔'}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <span className="text-4xl mb-3">📬</span>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  Seleccioná una conversación
                </p>
                <p className="text-sm">
                  Elegí un contacto de la izquierda para ver el historial y responder.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 flex items-center justify-center">
        <p className="text-slate-500">Cargando mensajería...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
