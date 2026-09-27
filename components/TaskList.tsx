import { CalendarClock, FolderKanban } from "lucide-react";
import Link from "next/link";
import { formatDate, isOverdue } from "@/lib/format";
import type { Task } from "@/lib/types";
import { PriorityBadge, TagList, TaskStatusBadge } from "./ui/Badges";

export function DueDate({ task }: { task: Task }) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${overdue ? "font-medium text-rose-600" : "text-slate-500"}`}>
      <CalendarClock className="h-3.5 w-3.5" />
      {task.dueDate ? formatDate(task.dueDate) : "No due date"}
      {overdue && " · overdue"}
    </span>
  );
}

/** Responsive task rows: stacked on mobile, single line on desktop. */
export function TaskList({ tasks, showProject = true }: { tasks: Task[]; showProject?: boolean }) {
  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {tasks.map((t) => (
        <li key={t.taskId} className="flex flex-col gap-3 p-4 hover:bg-slate-50 lg:flex-row lg:items-center lg:gap-6">
          <div className="min-w-0 flex-1">
            <Link href={`/tasks/${t.taskId}`} className="font-medium text-slate-900 hover:text-indigo-600">
              {t.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              {showProject && (
                <Link
                  href={`/projects/${t.projectId}`}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  {t.projectName}
                </Link>
              )}
              <DueDate task={t} />
            </div>
          </div>
          <div className="lg:w-56">
            <TagList tags={t.tags} link />
          </div>
          <div className="flex gap-2 lg:w-52 lg:justify-end">
            <TaskStatusBadge status={t.status} />
            <PriorityBadge priority={t.priority} />
          </div>
        </li>
      ))}
    </ul>
  );
}
