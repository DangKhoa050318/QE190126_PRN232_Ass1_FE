"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { adminSections, dashboardSection } from "./adminSections";

/** Protected /admin area: requires login, with a sidebar (desktop) or scrollable tabs (mobile). */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </RequireAuth>
  );
}

function AdminNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const items = [dashboardSection, ...adminSections].filter((s) => !s.adminOnly || isAdmin);

  return (
    <nav aria-label="Admin sections" className="-mx-4 mb-6 overflow-x-auto px-4 lg:mx-0 lg:mb-0 lg:px-0">
      <p className="mb-2 hidden px-3 text-xs font-semibold tracking-wide text-slate-400 uppercase lg:block">Admin</p>
      <ul className="flex gap-1 lg:sticky lg:top-24 lg:flex-col">
        {items.map((s) => {
          const active = s.href === "/admin" ? pathname === "/admin" : pathname.startsWith(s.href);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
