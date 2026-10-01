import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  verifyAuthToken,
  isValidEmail,
  isValidAlias,
} from '@/lib/auth';

describe('Auth & Security Utilities', () => {
  describe('Password Hashing', () => {
    it('debe hashear y verificar correctamente una contraseña válida', async () => {
      const password = 'SecretPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2')).toBe(true);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('debe rechazar contraseñas de menos de 6 caracteres', async () => {
      await expect(hashPassword('12345')).rejects.toThrow(
        'La contraseña debe tener al menos 6 caracteres'
      );
    });
  });

  describe('JWT Session Tokens', () => {
    it('debe firmar y verificar un token JWT con el payload del usuario', async () => {
      const payload = {
        userId: 'usr_123',
        email: 'nakama@tcgtx.com',
        alias: 'luffy_pirate',
        role: 'USER',
      };

      const token = await signAuthToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const decoded = await verifyAuthToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.alias).toBe(payload.alias);
    });

    it('debe retornar null para un token corrupto o inválido', async () => {
      const invalid = await verifyAuthToken('invalid.jwt.token');
      expect(invalid).toBeNull();
    });
  });

  describe('Validation Helpers', () => {
    it('debe validar correos electrónicos correctamente', () => {
      expect(isValidEmail('test@tcgtx.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
    });

    it('debe validar alias de usuario correctamente', () => {
      expect(isValidAlias('zoro_swordsman')).toBe(true);
      expect(isValidAlias('luffy-gear5')).toBe(true);
      expect(isValidAlias('op')).toBe(false); // muy corto
      expect(isValidAlias('este_alias_es_demasiado_largo_para_el_sistema')).toBe(false); // >20
      expect(isValidAlias('alias con espacios')).toBe(false);
      expect(isValidAlias('alias!@#$')).toBe(false);
    });
  });
});
