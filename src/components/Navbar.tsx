'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Compass,
  User as UserIcon,
  LogOut,
  PlusCircle,
  Bookmark,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 dark:bg-[#0A1128]/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-[#1B2A4A] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  tcgt<span className="text-sky-500">X</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 dark:text-slate-400">
                  One Piece TCG
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
              >
                Catálogo de Cartas
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
              >
                Mi Colección
              </Link>
            </div>
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {loading ? (
              <div className="w-24 h-9 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#0F1E36] transition-colors"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.alias}`}
                    alt={user.alias}
                    className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      @{user.alias}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> {user.reputationScore.toFixed(1)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0F1E36] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Conectado como</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user.name || user.alias}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-blue-500" /> Mi Perfil & Mercado Pago
                    </Link>

                    <Link
                      href="/profile#collection"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-sky-500" /> Mi Colección Personal
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 py-1"
            >
              Catálogo de Cartas
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 py-1"
            >
              Mi Colección
            </Link>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.alias}`}
                      alt={user.alias}
                      className="w-7 h-7 rounded-full"
                    />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">@{user.alias}</span>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-slate-600 dark:text-slate-300 py-1"
                  >
                    Ver Perfil & Configuración
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="block text-sm text-rose-600 dark:text-rose-400 py-1"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
