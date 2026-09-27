"use client";

import { DependencyList, useCallback, useEffect, useState } from "react";
import { ApiError, errorMessage } from "./api";

/**
 * Runs an async loader on mount and whenever deps change; exposes loading/error state and reload().
 * errorStatus is the HTTP status of a failed API call (0 = server unreachable), null otherwise.
 */
export function useFetch<T>(loader: () => Promise<T>, deps: DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setErrorStatus(null);
    // Promise.resolve().then(...) also routes errors thrown synchronously by the loader into catch().
    Promise.resolve()
      .then(loader)
      .then((result) => !cancelled && setData(result))
      .catch((e) => {
        if (cancelled) return;
        setError(errorMessage(e));
        setErrorStatus(e instanceof ApiError ? e.status : null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, error, errorStatus, reload };
}

/** Returns value after it has stopped changing for `delay` ms. */
export function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
