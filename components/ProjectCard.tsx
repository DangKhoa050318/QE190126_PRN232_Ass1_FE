import { CalendarDays, ListChecks } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Project } from "@/lib/types";
import { ProjectStatusBadge } from "./ui/Badges";

export function ProjectCard({ project, showDepartment = true }: { project: Project; showDepartment?: boolean }) {
  return (
    <Link
      href={`/projects/${project.projectId}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{project.projectName}</h3>
        <ProjectStatusBadge status={project.status} />
      </div>
      {showDepartment && <p className="mt-1 text-xs font-medium text-indigo-600">{project.departmentName}</p>}
      <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-500">{project.description || "No description."}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(project.startDate)} – {formatDate(project.endDate)}
        </span>
        <span className="inline-flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5" />
          {project.taskCount} {project.taskCount === 1 ? "task" : "tasks"}
        </span>
      </div>
    </Link>
  );
}
