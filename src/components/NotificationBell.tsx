'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  Check,
  MessageSquare,
  ShoppingBag,
  Star,
  Sparkles,
  TrendingDown,
  X,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'MESSAGE' | 'SALE' | 'PURCHASE' | 'REVIEW' | 'PRICE_ALERT';
  title: string;
  description: string;
  timeAgo: string;
  link: string;
  read: boolean;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'SALE',
      title: '¡Venta completada!',
      description: 'Se confirmó el pago de $29.500 ARS por Roronoa Zoro (Rush).',
      timeAgo: 'hace 10 min',
      link: '/profile',
      read: false,
    },
    {
      id: 'notif-2',
      type: 'MESSAGE',
      title: 'Nuevo mensaje en el chat',
      description: '@luffy_fan_ar te consultó sobre tu publicación de Shanks Manga.',
      timeAgo: 'hace 25 min',
      link: '/messages',
      read: false,
    },
    {
      id: 'notif-3',
      type: 'REVIEW',
      title: 'Nueva calificación recibida',
      description: 'El comprador te calificó con 5 estrellas ⭐⭐⭐⭐⭐',
      timeAgo: 'hace 2 h',
      link: `/u/${user?.alias || 'pirate_king'}`,
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'SALE':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'MESSAGE':
        return <MessageSquare className="w-4 h-4 text-sky-500" />;
      case 'REVIEW':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F1E36] transition-colors focus:outline-none"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-sky-400">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Marcar leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No tenés notificaciones pendientes.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => {
                    setOpen(false);
                    setNotifications((prev) =>
                      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                    );
                  }}
                  className={`p-3.5 px-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-[#0A1128] transition-colors ${
                    !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0A1128] shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.timeAgo}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {n.description}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-slate-50 dark:bg-[#0A1128] text-center border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-sky-400"
            >
              Ver bandeja de mensajes completa →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
