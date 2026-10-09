import type { Account, AuthResponse } from "./types";

/**
 * What the browser keeps after login. It lives in localStorage so it survives reloads and is shared by
 * every tab (HTTP-only cookies would not work across the vercel.app / onrender.com domains).
 */
export interface Session {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  account: Account;
}

const STORAGE_KEY = "tasktrack.session";
const listeners = new Set<() => void>();
let cached: Session | null | undefined; // undefined = not read from storage yet

function read(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

/** Current session; the same object is returned until it changes (as useSyncExternalStore requires). */
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  if (cached === undefined) cached = read();
  return cached;
}

/** Re-reads storage, e.g. because another tab may just have refreshed the tokens. */
export function reloadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const latest = read();
  if (JSON.stringify(latest) !== JSON.stringify(cached ?? null)) {
    cached = latest;
    notify();
  }
  return cached ?? null;
}

export function setSession(session: Session | null) {
  cached = session;
  try {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (e.g. blocked): the session then only lives in memory for this tab.
  }
  notify();
}

export function sessionFromAuth(res: AuthResponse): Session {
  return {
    token: res.token,
    expiresAt: res.expiresAt,
    refreshToken: res.refreshToken,
    refreshTokenExpiresAt: res.refreshTokenExpiresAt,
    account: res.account,
  };
}

/** Notifies on login/logout/refresh in this tab and in other tabs (storage event). */
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cached = undefined;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** True when the ISO time has passed, or will within `skewSeconds`. */
export function isExpired(iso: string, skewSeconds = 30) {
  return new Date(iso).getTime() - skewSeconds * 1000 <= Date.now();
}
