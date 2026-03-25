import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import type { LocalSessionRecord, LocalUserRecord } from './state-types.js';

export const DEFAULT_TEST_TENANT_ID = 'test-tenant';
export const DEFAULT_TEST_TENANT_NAME = 'test-tenant';
export const DEFAULT_TEST_USER_EMAIL = 'test@test-tenant.local';
export const DEFAULT_TEST_USER_PASSWORD = 'test123';
export const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 12;
export const AUTH_COOKIE_NAME = 'opita_session';

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex');
}

export function createSeededLocalUser(tenantId = DEFAULT_TEST_TENANT_ID): LocalUserRecord {
  const passwordSalt = randomBytes(16).toString('hex');
  return {
    userId: 'user_test_tenant_admin',
    tenantId,
    email: DEFAULT_TEST_USER_EMAIL,
    displayName: 'Test Tenant Admin',
    passwordSalt,
    passwordHash: hashPassword(DEFAULT_TEST_USER_PASSWORD, passwordSalt),
    active: true,
    roles: ['tenant_admin', 'approver']
  };
}

export function verifyPassword(user: LocalUserRecord, password: string): boolean {
  const expected = Buffer.from(user.passwordHash, 'hex');
  const actual = Buffer.from(hashPassword(password, user.passwordSalt), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSession(user: LocalUserRecord, now = new Date()): LocalSessionRecord {
  const createdAt = now.toISOString();
  return {
    sessionId: randomBytes(24).toString('hex'),
    userId: user.userId,
    tenantId: user.tenantId,
    createdAt,
    expiresAt: new Date(now.getTime() + DEFAULT_SESSION_TTL_MS).toISOString(),
    lastSeenAt: createdAt
  };
}

export function isSessionExpired(session: LocalSessionRecord, now = new Date()): boolean {
  return new Date(session.expiresAt).getTime() <= now.getTime();
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rawValue.join('='));
    return acc;
  }, {});
}
