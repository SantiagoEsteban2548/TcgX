import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada correctamente' });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    path: '/',
    expires: new Date(0),
  });
  return response;
}
