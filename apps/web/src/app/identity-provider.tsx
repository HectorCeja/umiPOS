'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface CanonicalIdentity {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}

interface IdentityContextValue {
  identity: CanonicalIdentity | null;
  updateIdentity: (identity: CanonicalIdentity | null) => void;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);
const storageKey = 'nexo.identity';

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<CanonicalIdentity | null>(null);
  useEffect(() => {
    try {
      setIdentity(
        JSON.parse(sessionStorage.getItem(storageKey) ?? 'null') as CanonicalIdentity | null,
      );
    } catch {
      sessionStorage.removeItem(storageKey);
    }
    const receive = (event: Event) => {
      const next = (event as CustomEvent<CanonicalIdentity | null>).detail;
      setIdentity(next);
      if (next) sessionStorage.setItem(storageKey, JSON.stringify(next));
      else sessionStorage.removeItem(storageKey);
    };
    window.addEventListener('nexo:identity-updated', receive);
    return () => {
      window.removeEventListener('nexo:identity-updated', receive);
    };
  }, []);
  const updateIdentity = useCallback((next: CanonicalIdentity | null) => {
    setIdentity(next);
    if (next) sessionStorage.setItem(storageKey, JSON.stringify(next));
    else sessionStorage.removeItem(storageKey);
  }, []);
  const value = useMemo<IdentityContextValue>(
    () => ({ identity, updateIdentity }),
    [identity, updateIdentity],
  );
  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}

export function useCanonicalIdentity() {
  const value = useContext(IdentityContext);
  if (!value) throw new Error('useCanonicalIdentity requires IdentityProvider');
  return value;
}
