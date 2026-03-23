import type { Request } from 'express';
import type { SessionPrincipal } from './session-principal.interface';

export interface AuthenticatedRequest extends Request {
  auth?: SessionPrincipal;
}
