export default () => ({
  app: {
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
    frontendUrl: process.env.FRONTEND_URL ?? '',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessTtlSeconds: Number.parseInt(process.env.JWT_ACCESS_TTL_SECONDS ?? '900', 10),
    refreshTtlSeconds: Number.parseInt(process.env.JWT_REFRESH_TTL_SECONDS ?? '2592000', 10),
    maxSessionsPerUser: Number.parseInt(process.env.JWT_MAX_SESSIONS_PER_USER ?? '5', 10),
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
    mockUsersJson: process.env.FIREBASE_MOCK_USERS_JSON ?? '',
  },
  bootstrap: {
    tenantSlug: process.env.BOOTSTRAP_TENANT_SLUG ?? 'opita-admin',
    tenantName: process.env.BOOTSTRAP_TENANT_NAME ?? 'Opita Admin Tenant',
    tenantTimezone: process.env.BOOTSTRAP_TENANT_TIMEZONE ?? 'America/Bogota',
  },
});
