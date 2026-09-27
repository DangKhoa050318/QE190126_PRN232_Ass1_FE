"use client";

import { Settings2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TaskList } from "@/components/TaskList";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { TASK_STATUSES } from "@/lib/constants";
import { useFetch } from "@/lib/useFetch";

export default function TasksPage() {
  const [status, setStatus] = useState<number | undefined>(undefined);
  const { data, loading, error, reload } = useFetch(() => api.tasks.list(status), [status]);

  const tabs = [{ value: undefined, label: "All" }, ...TASK_STATUSES];

  return (
    <>
      <PageHeader
        title="Tasks"
        description="All active tasks across every project."
        actions={
          <Link
            href="/tasks/manage"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 ring-inset hover:bg-slate-50"
          >
            <Settings2 className="h-4 w-4" /> Manage tasks
          </Link>
        }
      />

      <div className="mb-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Filter by status">
          {tabs.map((t) => {
            const active = t.value === status;
            return (
              <button
                key={t.label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatus(t.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                  active ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading tasks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="No tasks" description="There are no tasks with this status." />
      ) : (
        <TaskList tasks={data} />
      )}
    </>
  );
}
