"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectFormModal } from "@/components/forms/ProjectFormModal";
import { ActiveBadge, ProjectStatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { Table, Td, Th } from "@/components/ui/Table";
import { api } from "@/lib/api";
import { PROJECT_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Project, ProjectInput } from "@/lib/types";
import { useDelete } from "@/lib/useDelete";
import { useDebounced, useFetch } from "@/lib/useFetch";

export default function ManageProjectsPage() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const debouncedName = useDebounced(name.trim());

  const departments = useFetch(() => api.departments.list(true));
  const { data, loading, error, reload } = useFetch(
    () =>
      api.projects.search({
        name: debouncedName || undefined,
        status: status === "" ? undefined : Number(status),
        departmentId: departmentId === "" ? undefined : Number(departmentId),
        includeInactive: true,
      }),
    [debouncedName, status, departmentId],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const del = useDelete<Project>(
    (p) => api.projects.remove(p.projectId),
    (p) => `Project "${p.projectName}" deleted.`,
    reload,
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: Project) => {
    setEditing(p);
    setModalOpen(true);
  };

  const save = async (input: ProjectInput) => {
    if (editing) {
      await api.projects.update(editing.projectId, input);
      toast.success(`Project "${input.projectName}" updated.`);
    } else {
      await api.projects.create(input);
      toast.success(`Project "${input.projectName}" created.`);
    }
    setModalOpen(false);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Manage projects"
        description="Create, edit and delete projects. A project can only be deleted when it has no tasks."
        actions={
          <Button onClick={openCreate} disabled={!departments.data}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-3xl">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Search by name..." className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} aria-label="Filter by department">
          <option value="">All departments</option>
          {departments.data?.map((d) => (
            <option key={d.departmentId} value={d.departmentId}>
              {d.departmentName}
            </option>
          ))}
        </Select>
      </div>

      {loading && !data ? (
        <LoadingState label="Loading projects..." />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="No projects found" description="Try changing the filters or create a new project." />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <Table
            head={
              <>
                <Th>Project</Th>
                <Th>Department</Th>
                <Th>Status</Th>
                <Th>Timeline</Th>
                <Th className="text-center">Tasks</Th>
                <Th>Active</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {data.map((p) => (
              <tr key={p.projectId} className="hover:bg-slate-50">
                <Td className="min-w-48">
                  <Link href={`/projects/${p.projectId}`} className="font-medium text-slate-900 hover:text-indigo-600">
                    {p.projectName}
                  </Link>
                  {p.description && <p className="line-clamp-1 max-w-xs text-xs text-slate-500">{p.description}</p>}
                </Td>
                <Td className="whitespace-nowrap">{p.departmentName}</Td>
                <Td>
                  <ProjectStatusBadge status={p.status} />
                </Td>
                <Td className="text-xs whitespace-nowrap text-slate-500">
                  {formatDate(p.startDate)} – {formatDate(p.endDate)}
                </Td>
                <Td className="text-center">{p.taskCount}</Td>
                <Td>
                  <ActiveBadge active={p.isActive} />
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} aria-label={`Edit ${p.projectName}`}>
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => del.ask(p)}
                      aria-label={`Delete ${p.projectName}`}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <ProjectFormModal
        open={modalOpen}
        project={editing}
        departments={departments.data ?? []}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      />

      <ConfirmDialog
        open={!!del.target}
        title="Delete project?"
        message={
          <>
            Are you sure you want to delete <strong className="text-slate-900">{del.target?.projectName}</strong>? This
            cannot be undone.
          </>
        }
        loading={del.deleting}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </>
  );
}
