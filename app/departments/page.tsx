"use client";

import { Building2, ChevronRight, FolderKanban, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { useDebounced, useFetch } from "@/lib/useFetch";

export default function DepartmentsPage() {
  const [query, setQuery] = useState("");
  const name = useDebounced(query.trim());
  const { data, loading, error, reload } = useFetch(
    () => (name ? api.departments.search(name) : api.departments.list()),
    [name],
  );

  return (
    <>
      <PageHeader title="Departments" description="All active departments. Click one to see its projects." />

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search departments by name..."
          className="pl-9"
          aria-label="Search departments"
        />
      </div>

      {loading ? (
        <LoadingState label="Loading departments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="No departments found" description={name ? `Nothing matches "${name}".` : undefined} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((d) => (
            <Link
              key={d.departmentId}
              href={`/departments/${d.departmentId}`}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Building2 className="h-5 w-5" />
                </span>
                <h2 className="flex-1 font-semibold text-slate-900 group-hover:text-indigo-700">{d.departmentName}</h2>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500" />
              </div>
              <p className="mt-3 flex-1 text-sm text-slate-500">{d.departmentDescription}</p>
              <p className="mt-4 inline-flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
                <FolderKanban className="h-3.5 w-3.5" />
                {d.projectCount} active {d.projectCount === 1 ? "project" : "projects"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
