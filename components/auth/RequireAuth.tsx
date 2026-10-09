"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { LoadingState } from "@/components/ui/States";
import { useAuth } from "./AuthProvider";

/**
 * Renders its children only for a logged-in user; visitors without a session are redirected to /login
 * (and come back here after logging in). With `adminOnly`, Staff accounts see an access-denied message.
 */
export function RequireAuth({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { status, isAdmin, loggingOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous" && !loggingOut) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, loggingOut, pathname, router]);

  if (status !== "authenticated")
    return <LoadingState label={status === "loading" ? "Checking your session..." : "Redirecting to login..."} />;
  if (adminOnly && !isAdmin) return <AccessDenied />;
  return <>{children}</>;
}

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
      <ShieldAlert className="h-10 w-10 text-amber-500" />
      <h2 className="text-lg font-semibold text-slate-900">Admins only</h2>
      <p className="max-w-md text-sm text-slate-600">
        Your account has the Staff role. Only administrators can manage accounts.
      </p>
      <Link href="/admin" className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
        Back to dashboard
      </Link>
    </div>
  );
}
