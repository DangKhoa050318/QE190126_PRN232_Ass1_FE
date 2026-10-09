import Link from "next/link";
import { DEFAULT_TAG_COLOR, PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES, findOption } from "@/lib/constants";
import type { Tag } from "@/lib/types";

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: number }) {
  const o = findOption(TASK_STATUSES, status);
  return <Badge className={o.badge}>{o.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: number }) {
  const o = findOption(TASK_PRIORITIES, priority);
  return <Badge className={o.badge}>{o.label}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: number }) {
  const o = findOption(PROJECT_STATUSES, status);
  return <Badge className={o.badge}>{o.label}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">Active</Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-500 ring-gray-300">Inactive</Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return role === "Admin" ? (
    <Badge className="bg-violet-50 text-violet-700 ring-violet-200">Admin</Badge>
  ) : (
    <Badge className="bg-slate-100 text-slate-600 ring-slate-300">Staff</Badge>
  );
}

/** Tag pill tinted with the tag's own color. Links to the search page filtered by this tag when `link` is set. */
export function TagChip({ tag, link = false }: { tag: Tag; link?: boolean }) {
  const color = tag.color ?? DEFAULT_TAG_COLOR;
  const content = (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: `${color}1A`, color, boxShadow: `inset 0 0 0 1px ${color}40` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {tag.tagName}
    </span>
  );
  return link ? (
    <Link href={`/search?tagId=${tag.tagId}`} className="hover:opacity-80">
      {content}
    </Link>
  ) : (
    content
  );
}

export function TagList({ tags, link = false }: { tags: Tag[]; link?: boolean }) {
  if (!tags.length) return <span className="text-xs text-slate-400">No tags</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <TagChip key={t.tagId} tag={t} link={link} />
      ))}
    </div>
  );
}
