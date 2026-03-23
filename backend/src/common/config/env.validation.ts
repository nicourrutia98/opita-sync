import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_ACCESS_TTL_SECONDS: z.string().optional(),
  JWT_REFRESH_TTL_SECONDS: z.string().optional(),
  JWT_MAX_SESSIONS_PER_USER: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  BOOTSTRAP_TENANT_SLUG: z.string().optional(),
  BOOTSTRAP_TENANT_NAME: z.string().optional(),
  BOOTSTRAP_TENANT_TIMEZONE: z.string().optional(),
});

export function validateEnv(config: Record<string, unknown>) {
  return envSchema.parse(config);
}
