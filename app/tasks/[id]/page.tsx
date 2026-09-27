"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ReactNode } from "react";
import { DueDate } from "@/components/TaskList";
import { BackLink } from "@/components/ui/BackLink";
import { ActiveBadge, PriorityBadge, TagList, TaskStatusBadge } from "@/components/ui/Badges";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { api, parseId } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useFetch } from "@/lib/useFetch";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 sm:col-span-2">{children}</dd>
    </div>
  );
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, loading, error, errorStatus, reload } = useFetch(() => api.tasks.get(parseId(id, "Task")), [id]);

  return (
    <>
      <BackLink href={task ? `/projects/${task.projectId}` : "/tasks"} label={task ? task.projectName : "All tasks"} />
      {loading ? (
        <LoadingState label="Loading task..." />
      ) : error ? (
        <ErrorState message={error} onRetry={errorStatus === 404 ? undefined : reload} />
      ) : (
        task && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Task #{task.taskId}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{task.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <TaskStatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
            <dl className="divide-y divide-slate-100">
              <Row label="Description">
                <p className="whitespace-pre-line">{task.description || <span className="text-slate-400">No description.</span>}</p>
              </Row>
              <Row label="Project">
                <Link href={`/projects/${task.projectId}`} className="font-medium text-indigo-600 hover:underline">
                  {task.projectName}
                </Link>
              </Row>
              <Row label="Status">
                <TaskStatusBadge status={task.status} />
              </Row>
              <Row label="Priority">
                <PriorityBadge priority={task.priority} />
              </Row>
              <Row label="Due date">
                <DueDate task={task} />
              </Row>
              <Row label="Tags">
                <TagList tags={task.tags} link />
              </Row>
              <Row label="Active">
                <ActiveBadge active={task.isActive} />
              </Row>
              <Row label="Created">{formatDateTime(task.createdDate)}</Row>
              <Row label="Last modified">{formatDateTime(task.modifiedDate)}</Row>
            </dl>
          </div>
        )
      )}
    </>
  );
}
