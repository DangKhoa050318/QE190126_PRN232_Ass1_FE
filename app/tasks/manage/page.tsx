"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { TaskFormModal } from "@/components/forms/TaskFormModal";
import { DueDate } from "@/components/TaskList";
import { PriorityBadge, TagList, TaskStatusBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { Table, Td, Th } from "@/components/ui/Table";
import { api } from "@/lib/api";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import type { Task, TaskInput } from "@/lib/types";
import { useDelete } from "@/lib/useDelete";
import { useDebounced, useFetch } from "@/lib/useFetch";

export default function ManageTasksPage() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [projectId, setProjectId] = useState("");
  const debouncedTitle = useDebounced(title.trim());

  const lookups = useFetch(async () => {
    const [projects, tags] = await Promise.all([api.projects.list(true), api.tags.list()]);
    return { projects, tags };
  });

  const num = (v: string) => (v === "" ? undefined : Number(v));
  const { data, loading, error, reload } = useFetch(
    () =>
      api.tasks.search({
        title: debouncedTitle || undefined,
        status: num(status),
        priority: num(priority),
        projectId: num(projectId),
      }),
    [debouncedTitle, status, priority, projectId],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const del = useDelete<Task>(
    (t) => api.tasks.remove(t.taskId),
    (t) => `Task "${t.title}" deleted.`,
    reload,
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setModalOpen(true);
  };

  const save = async (input: TaskInput) => {
    if (editing) {
      await api.tasks.update(editing.taskId, input);
      toast.success(`Task "${input.title}" updated.`);
    } else {
      await api.tasks.create(input);
      toast.success(`Task "${input.title}" created.`);
    }
    setModalOpen(false);
    reload();
    lookups.reload(); // project task counts / tag usage changed
  };

  return (
    <>
      <PageHeader
        title="Manage tasks"
        description="Create, edit and delete tasks. Deleting a task only hides it (soft delete)."
        actions={
          <Button onClick={openCreate} disabled={!lookups.data}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Search by title..." className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority">
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
        <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} aria-label="Filter by project">
          <option value="">All projects</option>
          {lookups.data?.projects.map((p) => (
            <option key={p.projectId} value={p.projectId}>
              {p.projectName}
            </option>
          ))}
        </Select>
      </div>

      {loading && !data ? (
        <LoadingState label="Loading tasks..." />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="No tasks found" description="Try changing the filters or create a new task." />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <Table
            head={
              <>
                <Th>Task</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Due</Th>
                <Th>Tags</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {data.map((t) => (
              <tr key={t.taskId} className="hover:bg-slate-50">
                <Td className="min-w-56">
                  <Link href={`/tasks/${t.taskId}`} className="font-medium text-slate-900 hover:text-indigo-600">
                    {t.title}
                  </Link>
                  <p className="text-xs text-slate-500">{t.projectName}</p>
                </Td>
                <Td>
                  <TaskStatusBadge status={t.status} />
                </Td>
                <Td>
                  <PriorityBadge priority={t.priority} />
                </Td>
                <Td className="whitespace-nowrap">
                  <DueDate task={t} />
                </Td>
                <Td className="min-w-40">
                  <TagList tags={t.tags} />
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)} aria-label={`Edit ${t.title}`}>
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => del.ask(t)}
                      aria-label={`Delete ${t.title}`}
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

      <TaskFormModal
        open={modalOpen}
        task={editing}
        projects={lookups.data?.projects ?? []}
        tags={lookups.data?.tags ?? []}
        onClose={() => setModalOpen(false)}
        onSubmit={save}
      />

      <ConfirmDialog
        open={!!del.target}
        title="Delete task?"
        confirmLabel="Delete task"
        message={
          <>
            Delete <strong className="text-slate-900">{del.target?.title}</strong>? The task will be hidden from all lists
            (soft delete) but kept in the database.
          </>
        }
        loading={del.deleting}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </>
  );
}
