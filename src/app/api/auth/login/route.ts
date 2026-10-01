import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  signAuthToken,
  AUTH_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body; // identifier puede ser email o alias

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Por favor ingresá tu email/alias y contraseña.' },
        { status: 400 }
      );
    }

    const normalizedIdentifier = identifier.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { alias: normalizedIdentifier },
        ],
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verificá tu usuario y contraseña.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verificá tu usuario y contraseña.' },
        { status: 401 }
      );
    }

    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      alias: user.alias,
      role: user.role,
    });

    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        alias: user.alias,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        reputationScore: user.reputationScore,
        mpConnected: Boolean(user.mpUserId),
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar el inicio de sesión.' },
      { status: 500 }
    );
  }
}
