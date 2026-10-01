import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  signAuthToken,
  isValidEmail,
  isValidAlias,
  AUTH_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, alias, name } = body;

    if (!email || !password || !alias) {
      return NextResponse.json(
        { error: 'Email, contraseña y alias son campos obligatorios.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'El formato de correo electrónico no es válido.' },
        { status: 400 }
      );
    }

    if (!isValidAlias(alias)) {
      return NextResponse.json(
        { error: 'El alias debe tener entre 3 y 20 caracteres (solo letras, números, _ y -).' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // Verificar si ya existe email o alias
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { alias: alias.toLowerCase() }],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta registrada con este correo.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'El alias ya se encuentra en uso por otro usuario.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        alias: alias.toLowerCase(),
        name: name || alias,
        avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${alias.toLowerCase()}`,
      },
      select: {
        id: true,
        email: true,
        alias: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = await signAuthToken({
      userId: newUser.id,
      email: newUser.email,
      alias: newUser.alias,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user: newUser,
      },
      { status: 201 }
    );

    // Establecer cookie HTTP-only segura
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error interno al registrar la cuenta.' },
      { status: 500 }
    );
  }
}
