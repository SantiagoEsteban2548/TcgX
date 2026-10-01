'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Save,
  X,
  Phone,
  Mail,
  Calendar,
  Package,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Inicializar estado de edición al cargar
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAlias(user.alias || '');
      setBio(user.bio || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Cargando tu perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Iniciá sesión para ver tu perfil
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Necesitás una cuenta para gestionar tus cartas, compras y configurar Mercado Pago.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl"
          >
            Registrarse
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, alias, bio, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(`Error: ${data.error}`);
      } else {
        await refreshUser();
        setIsEditing(false);
        setStatusMessage('Perfil actualizado exitosamente.');
      }
    } catch {
      setStatusMessage('Error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLinkMercadoPago = async () => {
    setMpLoading(true);
    try {
      const res = await fetch('/api/user/mercadopago/link', { method: 'POST' });
      if (res.ok) {
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMpLoading(false);
    }
  };

  const handleUnlinkMercadoPago = async () => {
    if (!confirm('¿Estás seguro de que deseás desvincular tu cuenta de Mercado Pago?')) return;
    setMpLoading(true);
    try {
      const res = await fetch('/api/user/mercadopago/unlink', { method: 'POST' });
      if (res.ok) {
        await refreshUser();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMpLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-6 shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.alias}`}
              alt={user.alias}
              className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-[#0A1128] border-2 border-blue-500/30 object-cover shadow-md"
            />
            <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow">
              <ShieldCheck className="w-3 h-3" /> {user.reputationScore.toFixed(1)}
            </span>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {user.name || user.alias}
                </h1>
                <p className="text-sm font-semibold text-blue-600 dark:text-sky-400">@{user.alias}</p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors self-center sm:self-auto"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar Perfil
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
              {user.bio || 'Sin biografía aún. ¡Agregá tus series y cartas favoritas de One Piece!'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Miembro desde{' '}
                {new Date(user.createdAt).toLocaleDateString('es-AR', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alias (@)
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 9 11 ..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biografía
                </label>
                <textarea
                  value={bio}
                  rows={2}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Coleccionista de OP01, mazos de Zoro y cartas manga..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0A1128] border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1 shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}

        {statusMessage && (
          <div className="mt-4 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Activity Stats & Mercado Pago Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Marketplace Reputation & Stats */}
        <div className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Reputación en tcgtX
          </h2>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0A1128]">
            <span className="text-xs text-slate-500">Puntaje Vendedor</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              ⭐ {user.reputationScore.toFixed(1)} / 5.0
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1128] text-center">
              <Package className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {user.totalSalesCount}
              </span>
              <p className="text-[11px] text-slate-500">Ventas concretadas</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1128] text-center">
              <ShoppingBag className="w-5 h-5 text-sky-500 mx-auto mb-1" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {user.totalBuysCount}
              </span>
              <p className="text-[11px] text-slate-500">Compras realizadas</p>
            </div>
          </div>
        </div>

        {/* Mercado Pago Marketplace Split Status */}
        <div className="md:col-span-2 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" /> Cobros con Mercado Pago (Split Marketplace)
            </h2>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
              Sandbox Activo
            </span>
          </div>

          {user.mpConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    Cuenta de Mercado Pago vinculada y activa
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Tus publicaciones se cobran de forma directa a tu cuenta con acreditación instantánea menos la comisión de marketplace.
                  </p>
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-500 pt-1">
                    ID Vendedor: {user.mpUserId}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUnlinkMercadoPago}
                  disabled={mpLoading}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50"
                >
                  {mpLoading ? 'Desvinculando...' : 'Desvincular cuenta de Mercado Pago'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    Vinculación pendiente para publicar cartas
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    tcgtX no custodia tu dinero. Para poder publicar cartas a la venta y recibir los fondos directamente en tu cuenta bancaria o billetera, debés vincular tu cuenta de Mercado Pago. El proceso de KYC (verificación de identidad) es validado 100% por Mercado Pago.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold">Modo Desarrollo:</span> Simulador OAuth 2.0 de Mercado Pago.
                </div>

                <button
                  onClick={handleLinkMercadoPago}
                  disabled={mpLoading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  {mpLoading ? 'Conectando con Mercado Pago...' : 'Vincular con Mercado Pago (OAuth)'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
