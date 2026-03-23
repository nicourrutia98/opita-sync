import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { getStoredValue, removeStoredValue, setStoredValue } from '../lib/storage';
import type { SessionSnapshot } from '../lib/types';

const SESSION_KEY = 'opita.session';

type SessionContextValue = {
  session: SessionSnapshot | null;
  isHydrating: boolean;
  signIn: (firebaseIdToken: string, inviteToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    void (async () => {
      const stored = await getStoredValue(SESSION_KEY);
      if (!stored) {
        setIsHydrating(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored) as SessionSnapshot;
        await api.getMe(parsed.accessToken);
        setSession(parsed);
      } catch {
        await removeStoredValue(SESSION_KEY);
        setSession(null);
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isHydrating,
      signIn: async (firebaseIdToken: string, inviteToken?: string) => {
        const next = await api.exchangeFirebaseToken(firebaseIdToken, inviteToken);
        await setStoredValue(SESSION_KEY, JSON.stringify(next));
        setSession(next);
      },
      signOut: async () => {
        await removeStoredValue(SESSION_KEY);
        setSession(null);
      },
    }),
    [isHydrating, session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return context;
}
