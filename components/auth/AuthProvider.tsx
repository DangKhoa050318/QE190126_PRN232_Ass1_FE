"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { api, setSessionExpiredHandler } from "@/lib/api";
import { getSession, isExpired, sessionFromAuth, setSession, subscribeSession } from "@/lib/session";
import type { Account, AuthResponse } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  account: Account | null;
  isAdmin: boolean;
  /** True while logging out, so route guards do not redirect to /login on the way to the home page. */
  loggingOut: boolean;
  login: (email: string, password: string) => Promise<Account>;
  logout: () => void;
  /** Store new tokens, e.g. after changing the password. */
  replaceSession: (res: AuthResponse) => void;
  /** Update the cached account, e.g. after editing the profile. */
  updateAccount: (account: Account) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// The server render has no access to localStorage: "undefined" marks the session as not known yet.
const getServerSnapshot = () => undefined;

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeSession, getSession, getServerSnapshot);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // A session whose refresh token has expired can no longer be renewed.
  useEffect(() => {
    if (session && isExpired(session.refreshTokenExpiresAt, 0)) setSession(null);
  }, [session]);

  // When a protected API call finds the session expired, tell the user and send them to the login page.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      toast.error("Your session has expired. Please log in again.", { id: "session-expired" });
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    });
    return () => setSessionExpiredHandler(null);
  }, [router]);

  useEffect(() => {
    if (loggingOut && pathname === "/") setLoggingOut(false);
  }, [loggingOut, pathname]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setSession(sessionFromAuth(res));
    return res.account;
  }, []);

  const logout = useCallback(() => {
    const current = getSession();
    setLoggingOut(true);
    if (current) api.auth.logout(current.refreshToken).catch(() => {}); // revoke the refresh token (best effort)
    setSession(null);
    router.replace("/");
    toast.success("You have been logged out.");
  }, [router]);

  const replaceSession = useCallback((res: AuthResponse) => setSession(sessionFromAuth(res)), []);

  const updateAccount = useCallback((account: Account) => {
    const current = getSession();
    if (current) setSession({ ...current, account });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: session === undefined ? "loading" : session ? "authenticated" : "anonymous",
      account: session?.account ?? null,
      isAdmin: session?.account.roleName === "Admin",
      loggingOut,
      login,
      logout,
      replaceSession,
      updateAccount,
    }),
    [session, loggingOut, login, logout, replaceSession, updateAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>.");
  return value;
}
