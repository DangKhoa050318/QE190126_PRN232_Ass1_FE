"use client";

import { ArrowRight, Building2, FolderKanban, ListTodo, Search } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";

export default function HomePage() {
  const { status } = useAuth();
  const { data, loading, error, reload } = useFetch(async () => {
    const [departments, projects, tasks] = await Promise.all([
      api.departments.list(),
      api.projects.list(),
      api.tasks.list(),
    ]);
    return { departments, projects, tasks };
  });

  const stats = [
    { label: "Departments", value: data?.departments.length, icon: Building2, href: "/departments", color: "bg-sky-100 text-sky-700" },
    { label: "Projects", value: data?.projects.length, icon: FolderKanban, href: "#projects", color: "bg-violet-100 text-violet-700" },
    { label: "Tasks", value: data?.tasks.length, icon: ListTodo, href: "/tasks", color: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium text-indigo-100">Task &amp; Team Management</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Welcome to TaskTrack</h1>
          <p className="mt-3 text-indigo-100">
            Keep every department, project and task in one place. Browse what your teams are working on, or jump
            straight into managing the data.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
            >
              <Search className="h-4 w-4" /> Find tasks
            </Link>
            <Link
              href={status === "authenticated" ? "/admin" : "/login"}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/40 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-indigo-500/60"
            >
              {status === "authenticated" ? "Open dashboard" : "Log in to manage"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingState label="Loading dashboard..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{s.value ?? 0}</p>
                  <p className="text-sm text-slate-500">Active {s.label.toLowerCase()}</p>
                </div>
              </Link>
            ))}
          </section>

          <section id="projects" className="scroll-mt-24">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Active projects</h2>
                <p className="text-sm text-slate-500">Click a project to see its tasks.</p>
              </div>
            </div>
            {data!.projects.length === 0 ? (
              <EmptyState title="No active projects" description="Create one from the project management page." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data!.projects.map((p) => (
                  <ProjectCard key={p.projectId} project={p} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
