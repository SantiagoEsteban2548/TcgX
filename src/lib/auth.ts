import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'dev-secret-key-32-chars-long-at-least!!'
);

export const AUTH_COOKIE_NAME = 'tcgtx_session';

export interface UserSessionPayload {
  userId: string;
  email: string;
  alias: string;
  role: string;
}

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }
  return bcrypt.hash(password, 10);
}

/**
 * Verifica una contraseña en texto plano contra su hash bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Firma un token JWT seguro con vigencia de 7 días
 */
export async function signAuthToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifica y decodifica un token JWT
 */
export async function verifyAuthToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      alias: payload.alias as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de alias de usuario (alfanumérico y guiones, 3-20 caracteres)
 */
export function isValidAlias(alias: string): boolean {
  const aliasRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return aliasRegex.test(alias);
}

/**
 * Obtiene el usuario autenticado a partir de las cookies de la petición
 */
export async function getAuthUser(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}
