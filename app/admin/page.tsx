"use client";

import { ArrowRight, Building2, FolderKanban, ListTodo, Tags } from "lucide-react";
import Link from "next/link";
import { adminSections } from "@/components/admin/adminSections";
import { useAuth } from "@/components/auth/AuthProvider";
import { RoleBadge } from "@/components/ui/Badges";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";

export default function AdminDashboardPage() {
  const { account, isAdmin } = useAuth();
  const { data, loading, error, reload } = useFetch(async () => {
    const [departments, projects, tasks, tags] = await Promise.all([
      api.departments.list(true),
      api.projects.list(true),
      api.tasks.list(),
      api.tags.list(),
    ]);
    return { departments, projects, tasks, tags };
  });

  const cards = data
    ? [
        {
          label: "Departments",
          total: data.departments.length,
          note: `${data.departments.filter((d) => d.isActive).length} active`,
          icon: Building2,
          href: "/admin/departments",
          color: "bg-sky-100 text-sky-700",
        },
        {
          label: "Projects",
          total: data.projects.length,
          note: `${data.projects.filter((p) => p.isActive).length} active`,
          icon: FolderKanban,
          href: "/admin/projects",
          color: "bg-violet-100 text-violet-700",
        },
        {
          label: "Tasks",
          total: data.tasks.length,
          note: `${data.tasks.filter((t) => t.status === 2).length} done`,
          icon: ListTodo,
          href: "/admin/tasks",
          color: "bg-emerald-100 text-emerald-700",
        },
        {
          label: "Tags",
          total: data.tags.length,
          note: `${data.tags.filter((t) => t.taskCount > 0).length} in use`,
          icon: Tags,
          href: "/admin/tags",
          color: "bg-amber-100 text-amber-700",
        },
      ]
    : [];

  const sections = adminSections.filter((s) => !s.adminOnly || isAdmin);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Welcome back, <strong className="text-slate-700">{account?.fullName}</strong>
            {account && <RoleBadge role={account.roleName} />}
          </span>
        }
      />

      {loading ? (
        <LoadingState label="Loading summary..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-3xl font-bold text-slate-900">{c.total}</p>
                <p className="text-sm text-slate-500">
                  Total {c.label.toLowerCase()} · {c.note}
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Management</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 group-hover:text-indigo-700">Manage {s.label.toLowerCase()}</p>
                <p className="text-sm text-slate-500">{s.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500" />
            </Link>
          ))}
        </div>
        {!isAdmin && (
          <p className="mt-4 text-sm text-slate-500">Account management is available to administrators only.</p>
        )}
      </section>
    </>
  );
}
