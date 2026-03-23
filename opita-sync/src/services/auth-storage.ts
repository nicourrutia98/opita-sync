import type { SessionState } from "../domain/opita";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readSession(storageKey: string): SessionState | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function writeSession(storageKey: string, session: SessionState): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearSession(storageKey: string): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(storageKey);
}

