import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../axios/api';

/**
 * GET a URL and expose loading/error state.
 *
 * Every page previously repeated the same `useEffect` + `try/catch` + three
 * pieces of state, and several of them read `res.data.products` without checking
 * `res.data.success` first, so a failed request threw inside the effect and left
 * the page rendering `undefined`.
 *
 * `requestId` makes out-of-order responses harmless: if the URL changes while a
 * request is in flight, only the newest response is allowed to update state.
 *
 * @param {string|null} url   pass `null` to skip fetching entirely
 * @param {{enabled?: boolean}} options
 */
export default function useFetch(url, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && url));
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const run = useCallback(() => {
    if (!url) return Promise.resolve(null);

    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    return api.get(url).then(
      (res) => {
        if (id === requestId.current) {
          setData(res.data);
          setLoading(false);
        }
        return res.data;
      },
      (err) => {
        if (id === requestId.current) {
          setError(err.friendlyMessage || 'Could not load this data.');
          setLoading(false);
        }
        throw err;
      }
    );
  }, [url]);

  useEffect(() => {
    if (!enabled || !url) return;
    run().catch(() => {
      /* surfaced through `error` */
    });
  }, [url, enabled, run]);

  return { data, loading, error, reload: run, setData };
}
