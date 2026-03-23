import type { AuthErrorCode } from "../domain/opita";

export class ServiceError extends Error {
  code: AuthErrorCode;
  status?: number;

  constructor(message: string, code: AuthErrorCode = "unknown", status?: number) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = status;
  }
}

export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof ServiceError;
}

