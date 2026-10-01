'use client';

import React, { useState, useEffect } from 'react';
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
  Bookmark,
  Heart,
  TrendingUp,
  Trash2,
  Layers,
  Receipt,
  MessageSquare,
  Star,
  Sparkles,
} from 'lucide-react';
import { CollectionItem } from '@/lib/marketplace';
import { formatArs, formatUsd } from '@/lib/currency';
import { CardImage } from '@/components/CardImage';
import { ReviewModal } from '@/components/ReviewModal';

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

  // Collection State
  const [collection, setCollection] = useState<{
    items: CollectionItem[];
    ownedCount: number;
    wishlistCount: number;
    totalEstimatedArsMep: number;
    totalEstimatedArsBlue: number;
  }>({
    items: [],
    ownedCount: 0,
    wishlistCount: 0,
    totalEstimatedArsMep: 0,
    totalEstimatedArsBlue: 0,
  });
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'owned' | 'wishlist'>('all');

  // Inicializar estado de edición al cargar
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAlias(user.alias || '');
      setBio(user.bio || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const fetchCollection = async () => {
    try {
      const res = await fetch('/api/user/collection');
      if (res.ok) {
        const data = await res.json();
        setCollection(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCollectionLoading(false);
    }
  };

  const [orders, setOrders] = useState<{ purchases: any[]; sales: any[] }>({
    purchases: [],
    sales: [],
  });
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersTab, setOrdersTab] = useState<'purchases' | 'sales'>('purchases');
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders({
          purchases: data.purchases || [],
          sales: data.sales || [],
        });
      }
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
    fetchOrders();
  }, []);

  const handleRemoveCollectionItem = async (itemId: string) => {
    if (!confirm('¿Deseás remover esta carta de tu colección?')) return;
    try {
      const res = await fetch(`/api/user/collection/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCollection();
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const filteredCollectionItems = collection.items.filter((item) => {
    if (collectionFilter === 'owned') return !item.isWishlist;
    if (collectionFilter === 'wishlist') return item.isWishlist;
    return true;
  });

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
              {user.bio || 'Sin biografía aún. ¡Agregá tus cartas favoritas de One Piece!'}
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

              <div className="flex justify-between items-center pt-1">
                <Link
                  href="/sell"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5" /> Publicar Carta a la Venta
                </Link>

                <button
                  onClick={handleUnlinkMercadoPago}
                  disabled={mpLoading}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50"
                >
                  {mpLoading ? 'Desvinculando...' : 'Desvincular cuenta'}
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

      {/* Personal Collection Dashboard Section (Decoupled from Listings) */}
      <section id="collection" className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-[#1B2A4A] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-600 dark:text-sky-400" /> Mi Colección Personal & Wishlist
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Registro personal de lo que poseés y tus deseos de compra, valorizado automáticamente según la mediana de TCGplayer.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Public Showcase Link */}
            {user && (
              <Link
                href={`/u/${user.alias}`}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-sky-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                Vitrina Pública (/u/{user.alias})
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0A1128] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setCollectionFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  collectionFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Todas ({collection.items.length})
              </button>
              <button
                onClick={() => setCollectionFilter('owned')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  collectionFilter === 'owned'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                En Posesión ({collection.ownedCount})
              </button>
              <button
                onClick={() => setCollectionFilter('wishlist')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  collectionFilter === 'wishlist'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Wishlist ({collection.wishlistCount})
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Valuation Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1128] border border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Cartas en Posesión
            </span>
            <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
              {collection.ownedCount} unidades
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1128] border border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Valor Estimado (MEP)
            </span>
            <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
              {formatArs(collection.totalEstimatedArsMep)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A1128] border border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Valor Estimado (Blue)
            </span>
            <span className="text-xl font-mono font-black text-sky-600 dark:text-sky-400">
              {formatArs(collection.totalEstimatedArsBlue)}
            </span>
          </div>
        </div>

        {/* Collection Items List */}
        {collectionLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando colección...</div>
        ) : filteredCollectionItems.length === 0 ? (
          <div className="p-10 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">
              {collectionFilter === 'wishlist'
                ? 'No tenés cartas en tu lista de deseos.'
                : 'Todavía no agregaste cartas a tu colección.'}
            </p>
            <Link
              href="/catalog"
              className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Explorar Catálogo y Agregar Cartas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollectionItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A1128] flex gap-3 items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 shadow-sm">
                    <CardImage
                      src={item.cardImageUrl}
                      alt={item.cardName}
                      code={item.cardCode}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {item.cardCode}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded">
                        {item.condition}
                      </span>
                      {item.isWishlist && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5" /> Deseo
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/catalog/${item.cardCode}`}
                      className="text-xs font-bold text-slate-900 dark:text-white truncate block hover:text-blue-600"
                    >
                      {item.cardName}
                    </Link>
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {formatArs(item.estimatedValueArsMep)}{' '}
                      <span className="text-[10px] text-slate-400 font-sans">
                        ({item.quantity} {item.quantity === 1 ? 'copia' : 'copias'})
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveCollectionItem(item.id)}
                  title="Eliminar de colección"
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Mis Operaciones (Mercado Pago Split) */}
      <section className="bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Mis Transacciones
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Historial de compras y ventas procesadas mediante Mercado Pago Split.
              </p>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setOrdersTab('purchases')}
              className={`px-4 py-1.5 rounded-lg transition ${
                ordersTab === 'purchases'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Compras ({orders.purchases.length})
            </button>
            <button
              onClick={() => setOrdersTab('sales')}
              className={`px-4 py-1.5 rounded-lg transition ${
                ordersTab === 'sales'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Ventas ({orders.sales.length})
            </button>
          </div>
        </div>

        {ordersLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Cargando historial de operaciones...
          </div>
        ) : (ordersTab === 'purchases' ? orders.purchases : orders.sales).length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No tenés {ordersTab === 'purchases' ? 'compras' : 'ventas'} registradas todavía.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {ordersTab === 'purchases'
                ? 'Explorá el catálogo para encontrar cartas al mejor precio del mercado.'
                : 'Publicá tus cartas para comenzar a vender en tcgtX.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(ordersTab === 'purchases' ? orders.purchases : orders.sales).map((order) => {
              const otherPartyId = ordersTab === 'purchases' ? order.sellerId : order.buyerId;
              const isPaid = order.status === 'PAID';

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 shadow-xs">
                      <CardImage
                        src={order.item.cardImageUrl}
                        alt={order.item.cardName}
                        code={order.item.cardCode}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400">
                          {order.item.cardCode}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {order.item.condition}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {isPaid ? 'PAGADO' : 'PENDIENTE'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {order.item.cardName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.item.quantity}x a {formatArs(order.item.priceArs)} (Dólar {order.exchangeRateType} ${order.exchangeRateUsed.toFixed(1)})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total Transacción</span>
                      <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                        {formatArs(order.totalArs)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ordersTab === 'purchases' && isPaid && (
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForReview(order)}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
                          title="Dejar calificación y feedback al vendedor"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          Calificar
                        </button>
                      )}

                      <Link
                        href={`/messages?with=${otherPartyId}&card=${order.item.cardCode}`}
                        className="p-2.5 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition"
                        title="Abrir chat de la orden"
                      >
                        <MessageSquare className="w-4 h-4 text-sky-500" />
                      </Link>

                      <Link
                        href={`/checkout/feedback?order_id=${order.id}&status=${isPaid ? 'approved' : 'pending'}`}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1"
                      >
                        Comprobante ↗
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Review Modal */}
      {selectedOrderForReview && (
        <ReviewModal
          order={selectedOrderForReview}
          isOpen={Boolean(selectedOrderForReview)}
          onClose={() => setSelectedOrderForReview(null)}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
