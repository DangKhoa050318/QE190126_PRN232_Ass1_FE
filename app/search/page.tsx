"use client";

import { RotateCcw, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { TaskList } from "@/components/TaskList";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import type { TaskFilters } from "@/lib/types";
import { useDebounced, useFetch } from "@/lib/useFetch";

interface FilterState {
  title: string;
  status: string;
  priority: string;
  projectId: string;
  tagId: string;
}

const EMPTY: FilterState = { title: "", status: "", priority: "", projectId: "", tagId: "" };
const KEYS = Object.keys(EMPTY) as (keyof FilterState)[];

function toApiFilters(f: FilterState): TaskFilters {
  const num = (v: string) => (v === "" ? undefined : Number(v));
  return {
    title: f.title.trim() || undefined,
    status: num(f.status),
    priority: num(f.priority),
    projectId: num(f.projectId),
    tagId: num(f.tagId),
  };
}

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters start from the URL so links like /search?tagId=2 work and results can be shared.
  const [filters, setFilters] = useState<FilterState>(() => {
    const initial = { ...EMPTY };
    for (const key of KEYS) initial[key] = searchParams.get(key) ?? "";
    return initial;
  });
  const debouncedTitle = useDebounced(filters.title);
  const effective = { ...filters, title: debouncedTitle };
  const effectiveKey = JSON.stringify(effective);

  const options = useFetch(async () => {
    const [projects, tags] = await Promise.all([api.projects.list(), api.tags.list()]);
    return { projects, tags };
  });

  const results = useFetch(() => api.tasks.search(toApiFilters(effective)), [effectiveKey]);

  // Keep the URL in sync with the active filters.
  useEffect(() => {
    const params = new URLSearchParams();
    for (const key of KEYS) if (effective[key].trim()) params.set(key, effective[key].trim());
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveKey]);

  const set = (key: keyof FilterState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const activeCount = KEYS.filter((k) => filters[k].trim() !== "").length;

  return (
    <>
      <PageHeader title="Search tasks" description="Filter by title, status, priority, project and tag. Results update as you type." />

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Field label="Title" htmlFor="f-title">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="f-title" value={filters.title} onChange={set("title")} placeholder="e.g. login" className="pl-9" />
              </div>
            </Field>
          </div>
          <Field label="Status" htmlFor="f-status">
            <Select id="f-status" value={filters.status} onChange={set("status")}>
              <option value="">All statuses</option>
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority" htmlFor="f-priority">
            <Select id="f-priority" value={filters.priority} onChange={set("priority")}>
              <option value="">All priorities</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Project" htmlFor="f-project">
            <Select id="f-project" value={filters.projectId} onChange={set("projectId")} disabled={options.loading}>
              <option value="">All projects</option>
              {options.data?.projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tag" htmlFor="f-tag">
            <Select id="f-tag" value={filters.tagId} onChange={set("tagId")} disabled={options.loading}>
              <option value="">All tags</option>
              {options.data?.tags.map((t) => (
                <option key={t.tagId} value={t.tagId}>
                  {t.tagName}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            {results.loading ? (
              <>
                <Spinner className="h-4 w-4 text-indigo-600" /> Searching...
              </>
            ) : (
              results.data && `${results.data.length} ${results.data.length === 1 ? "task" : "tasks"} found`
            )}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY)} disabled={activeCount === 0}>
            <RotateCcw className="h-3.5 w-3.5" /> Clear filters
          </Button>
        </div>
      </div>

      {results.loading && !results.data ? (
        <LoadingState label="Searching tasks..." />
      ) : results.error ? (
        <ErrorState message={results.error} onRetry={results.reload} />
      ) : !results.data?.length ? (
        <EmptyState title="No tasks match these filters" description="Try removing a filter or searching for another title." />
      ) : (
        <div className={results.loading ? "opacity-60 transition-opacity" : ""}>
          <TaskList tasks={results.data} />
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchContent />
    </Suspense>
  );
}
