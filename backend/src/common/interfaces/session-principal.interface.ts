export interface SessionPrincipal {
  sub: string;
  userId: string;
  tenantId: string;
  role: string;
  sessionId: string;
  permissionsVersion: number;
  permissions: string[];
  iat?: number;
  exp?: number;
}
