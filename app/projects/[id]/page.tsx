"use client";

import { Building2, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TaskList } from "@/components/TaskList";
import { BackLink } from "@/components/ui/BackLink";
import { ActiveBadge, ProjectStatusBadge } from "@/components/ui/Badges";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api, parseId } from "@/lib/api";
import { TASK_STATUSES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { useFetch } from "@/lib/useFetch";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, errorStatus, reload } = useFetch(() => api.projects.get(parseId(id, "Project")), [id]);

  return (
    <>
      <BackLink href={data ? `/departments/${data.departmentId}` : "/"} label={data ? data.departmentName : "Home"} />
      {loading ? (
        <LoadingState label="Loading project..." />
      ) : error ? (
        <ErrorState message={error} onRetry={errorStatus === 404 ? undefined : reload} />
      ) : (
        data && (
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{data.projectName}</h1>
                <ProjectStatusBadge status={data.status} />
                {!data.isActive && <ActiveBadge active={false} />}
              </div>
              <p className="mt-3 text-slate-600">{data.description || "No description."}</p>
              <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3">
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">Department</dt>
                    <dd>
                      <Link href={`/departments/${data.departmentId}`} className="font-medium text-indigo-600 hover:underline">
                        {data.departmentName}
                      </Link>
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">Timeline</dt>
                    <dd className="font-medium text-slate-800">
                      {formatDate(data.startDate)} – {formatDate(data.endDate)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">Created</dt>
                    <dd className="font-medium text-slate-800">{formatDateTime(data.createdDate)}</dd>
                  </div>
                </div>
              </dl>
            </section>

            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Tasks ({data.tasks.length})</h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  {TASK_STATUSES.map((s) => (
                    <span key={s.value} className={`rounded-full px-2.5 py-1 font-medium ring-1 ring-inset ${s.badge}`}>
                      {s.label}: {data.tasks.filter((t) => t.status === s.value).length}
                    </span>
                  ))}
                </div>
              </div>
              {data.tasks.length === 0 ? (
                <EmptyState title="No tasks yet" description="Tasks added to this project will appear here." />
              ) : (
                <TaskList tasks={data.tasks} showProject={false} />
              )}
            </section>
          </div>
        )
      )}
    </>
  );
}
