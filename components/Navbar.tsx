"use client";

import { ChevronDown, LayoutGrid, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/departments", label: "Departments" },
  { href: "/tasks", label: "Tasks" },
  { href: "/search", label: "Search" },
];

const manageLinks = [
  { href: "/departments/manage", label: "Departments" },
  { href: "/projects/manage", label: "Projects" },
  { href: "/tasks/manage", label: "Tasks" },
  { href: "/tags/manage", label: "Tags" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // "/departments" should not light up on "/departments/manage".
  if (pathname.endsWith("/manage") && !href.endsWith("/manage")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const manageRef = useRef<HTMLDivElement>(null);

  // Close menus on navigation.
  useEffect(() => {
    setMobileOpen(false);
    setManageOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (manageRef.current && !manageRef.current.contains(e.target as Node)) setManageOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const inManage = pathname.endsWith("/manage");
  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <LayoutGrid className="h-4 w-4" />
          </span>
          TaskTrack
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(isActive(pathname, l.href))}>
              {l.label}
            </Link>
          ))}
          <div className="relative" ref={manageRef}>
            <button
              type="button"
              onClick={() => setManageOpen((o) => !o)}
              className={`${linkClass(inManage)} inline-flex items-center gap-1`}
              aria-expanded={manageOpen}
            >
              Manage <ChevronDown className={`h-4 w-4 transition-transform ${manageOpen ? "rotate-180" : ""}`} />
            </button>
            {manageOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                {manageLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      pathname === l.href ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`block ${linkClass(isActive(pathname, l.href))}`}>
              {l.label}
            </Link>
          ))}
          <p className="px-3 pt-3 pb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">Manage</p>
          {manageLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`block ${linkClass(pathname === l.href)}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
