'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Fetch JSON from `url` on mount, exposing loading/error state and a `retry()`.
 *
 * Encapsulates the loading/error/retryCount + useEffect boilerplate that was
 * duplicated across every data-driven page. The optional `select` maps the raw
 * response body to the shape the caller wants (kept pure so it can run during
 * render-free state updates).
 *
 * @param {string} url
 * @param {{ enabled?: boolean, select?: (body: any) => any }} [options]
 * @returns {{ data: any, loading: boolean, error: string | null, retry: () => void }}
 */
export function useFetch(url, { enabled = true, select } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  useEffect(() => {
    if (!enabled || !url) return undefined;

    let ignore = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return response.json();
      })
      .then((body) => {
        if (ignore) return;
        setData(select ? select(body) : body);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
    // `select` is intentionally excluded; callers pass a stable/inline mapper.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled, retryCount]);

  return { data, loading, error, retry };
}
