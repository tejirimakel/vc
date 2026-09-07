'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const CACHE_PREFIX = 'vc-cache:';
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRY_INTERVAL_MS = 15000;

function readCache(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage may be full, disabled, or in private mode — non-fatal.
  }
}

/**
 * Fetch JSON from `url` on mount, exposing loading/error state and a `retry()`.
 *
 * Encapsulates the loading/error/retryCount + useEffect boilerplate that was
 * duplicated across every data-driven page. The optional `select` maps the raw
 * response body to the shape the caller wants (kept pure so it can run during
 * render-free state updates).
 *
 * Resilience for slow/flaky/offline networks:
 * - Aborts a request that exceeds `timeoutMs` so a slow network surfaces an
 *   error (and an auto-retry) instead of hanging forever.
 * - Hydrates from the last cached (post-`select`) payload under `cacheKey`, so
 *   cached sections stay usable offline; `stale` is true until a fresh
 *   response confirms the data.
 * - Auto-retries on a fixed `retryIntervalMs` interval while the last attempt
 *   failed, and immediately when the browser fires the `online` event.
 *
 * @param {string} url
 * @param {{ enabled?: boolean, select?: (body: any) => any, cacheKey?: string, timeoutMs?: number, retryIntervalMs?: number }} [options]
 * @returns {{ data: any, loading: boolean, error: string | null, stale: boolean, retry: () => void }}
 */
export function useFetch(url, options = {}) {
  const {
    enabled = true,
    select,
    cacheKey = url,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryIntervalMs = DEFAULT_RETRY_INTERVAL_MS,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);

  const selectRef = useRef(select);
  selectRef.current = select;
  const inFlightRef = useRef(false);
  const needsRetryRef = useRef(false);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!enabled || !url || inFlightRef.current) return;
      inFlightRef.current = true;
      if (!silent) setLoading(true);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const body = await response.json();
        const mapped = selectRef.current ? selectRef.current(body) : body;
        setData(mapped);
        setError(null);
        setStale(false);
        needsRetryRef.current = false;
        if (cacheKey) writeCache(cacheKey, mapped);
      } catch (err) {
        const message =
          err && err.name === 'AbortError'
            ? 'The network is slow. Retrying…'
            : (err && err.message) || 'Network error';
        setError(message);
        setStale(true);
        needsRetryRef.current = true;
      } finally {
        clearTimeout(timer);
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [enabled, url, cacheKey, timeoutMs]
  );

  const retry = useCallback(() => load(), [load]);

  // Hydrate from cache (if any) then revalidate. Re-runs when the target URL
  // or cache key changes (e.g. navigating between articles).
  useEffect(() => {
    if (!enabled || !url) return undefined;

    const cached = cacheKey ? readCache(cacheKey) : null;
    if (cached != null) {
      setData(cached);
      setStale(true);
      setError(null);
      setLoading(false);
      load({ silent: true });
    } else {
      setData(null);
      setStale(false);
      load({ silent: false });
    }
    // `load` intentionally excluded from deps beyond url/cacheKey/enabled — it
    // is recreated only when those (or timeoutMs) change, so this still reruns
    // exactly when the request target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, cacheKey, enabled]);

  // Fixed-interval auto-retry while the last attempt failed. Attempted
  // unconditionally rather than gated on navigator.onLine, which is
  // unreliable on iOS PWAs — the request itself is the connectivity probe.
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => {
      if (needsRetryRef.current) load({ silent: true });
    }, retryIntervalMs);
    return () => clearInterval(id);
  }, [enabled, retryIntervalMs, load]);

  // Retry the moment connectivity is restored.
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return undefined;
    const onOnline = () => load({ silent: true });
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [enabled, load]);

  return { data, loading, error, stale, retry };
}
