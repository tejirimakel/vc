'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

// Single non-essential consent bucket (third-party media + any future analytics).
// Strictly-necessary cookies (e.g. tvc_pwa_access) are never gated by this.
const STORAGE_KEY = 'tvc-consent';

// status: 'accepted' | 'rejected' | null (undecided). `ready` flips true once
// we've read localStorage on the client, so consumers can avoid SSR/hydration flashes.
const ConsentContext = createContext({
  status: null,
  ready: false,
  accept: () => {},
  reject: () => {},
  reset: () => {},
});

export function ConsentProvider({ children }) {
  const [status, setStatus] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'accepted' || stored === 'rejected') {
        setStatus(stored);
      }
    } catch {
      // localStorage unavailable (private mode / blocked) — treat as undecided.
    }
    setReady(true);
  }, []);

  const persist = useCallback((next) => {
    setStatus(next);
    try {
      if (next === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Best effort; in-memory state still reflects the choice for this session.
    }
  }, []);

  const accept = useCallback(() => persist('accepted'), [persist]);
  const reject = useCallback(() => persist('rejected'), [persist]);
  const reset = useCallback(() => persist(null), [persist]);

  const value = useMemo(
    () => ({ status, ready, accept, reject, reset }),
    [status, ready, accept, reject, reset]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  return useContext(ConsentContext);
}
