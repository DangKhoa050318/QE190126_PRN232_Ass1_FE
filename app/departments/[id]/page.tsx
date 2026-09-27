"use client";

import { Building2 } from "lucide-react";
import { useParams } from "next/navigation";
import { ProjectCard } from "@/components/ProjectCard";
import { BackLink } from "@/components/ui/BackLink";
import { ActiveBadge } from "@/components/ui/Badges";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api, parseId } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, errorStatus, reload } = useFetch(() => api.departments.get(parseId(id, "Department")), [id]);

  return (
    <>
      <BackLink href="/departments" label="All departments" />
      {loading ? (
        <LoadingState label="Loading department..." />
      ) : error ? (
        <ErrorState message={error} onRetry={errorStatus === 404 ? undefined : reload} />
      ) : (
        data && (
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <Building2 className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">{data.departmentName}</h1>
                    <ActiveBadge active={data.isActive} />
                  </div>
                  <p className="mt-2 text-slate-600">{data.departmentDescription}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{data.projects.length}</p>
                  <p className="text-xs text-slate-500">Active projects</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Projects</h2>
              {data.projects.length === 0 ? (
                <EmptyState title="No active projects" description="This department has no active projects yet." />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.projects.map((p) => (
                    <ProjectCard key={p.projectId} project={p} showDepartment={false} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )
      )}
    </>
  );
}
