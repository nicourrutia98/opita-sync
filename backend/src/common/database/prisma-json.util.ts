import type { Prisma } from '@prisma/client';

export function toNullableJson(
  value?: Record<string, unknown> | null,
): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return value as Prisma.InputJsonValue;
}

export function toJson(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
