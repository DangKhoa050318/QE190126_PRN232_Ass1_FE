"use client";

import { ChevronDown, LayoutDashboard, LayoutGrid, LogIn, LogOut, Menu, UserCircle, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { RoleBadge } from "./ui/Badges";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/departments", label: "Departments" },
  { href: "/tasks", label: "Tasks" },
  { href: "/search", label: "Search" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export function Navbar() {
  const pathname = usePathname();
  const { status, account, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const loggedIn = status === "authenticated" && account;
  const links = loggedIn ? [...mainLinks, { href: "/admin", label: "Admin" }] : mainLinks;
  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <LayoutGrid className="h-4 w-4" />
          </span>
          TaskTrack
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(isActive(pathname, l.href))}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <span className="h-9 w-40 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
          ) : loggedIn ? (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setUserOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
                aria-expanded={userOpen}
                aria-label="Account menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                  {initials(account.fullName)}
                </span>
                <span className="max-w-[10rem] truncate">{account.fullName}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${userOpen ? "rotate-180" : ""}`} />
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-slate-900">{account.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{account.email}</p>
                    <div className="mt-1.5">
                      <RoleBadge role={account.roleName} />
                    </div>
                  </div>
                  <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <LayoutDashboard className="h-4 w-4 text-slate-400" /> Dashboard
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <UserCircle className="h-4 w-4 text-slate-400" /> Profile
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={`${linkClass(pathname === "/login")} inline-flex items-center gap-1.5`}>
                <LogIn className="h-4 w-4" /> Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
              >
                <UserPlus className="h-4 w-4" /> Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`block ${linkClass(isActive(pathname, l.href))}`}>
              {l.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-slate-100 pt-3">
            {loggedIn ? (
              <>
                <div className="flex items-center gap-3 px-3 pb-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {initials(account.fullName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{account.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{account.email}</p>
                  </div>
                  <RoleBadge role={account.roleName} />
                </div>
                <Link href="/profile" className={`block ${linkClass(pathname === "/profile")}`}>
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Log out
                </button>
              </>
            ) : (
              status !== "loading" && (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-700 ring-1 ring-slate-300 ring-inset"
                  >
                    Log in
                  </Link>
                  <Link href="/register" className="rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white">
                    Register
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
