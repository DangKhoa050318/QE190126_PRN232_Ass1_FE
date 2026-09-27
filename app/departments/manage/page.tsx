"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DepartmentFormModal } from "@/components/forms/DepartmentFormModal";
import { ActiveBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { Table, Td, Th } from "@/components/ui/Table";
import { api } from "@/lib/api";
import type { Department, DepartmentInput } from "@/lib/types";
import { useDelete } from "@/lib/useDelete";
import { useFetch } from "@/lib/useFetch";

export default function ManageDepartmentsPage() {
  const { data, loading, error, reload } = useFetch(() => api.departments.list(true));
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const del = useDelete<Department>(
    (d) => api.departments.remove(d.departmentId),
    (d) => `Department "${d.departmentName}" deleted.`,
    reload,
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((d) => !q || d.departmentName.toLowerCase().includes(q));
  }, [data, query]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (d: Department) => {
    setEditing(d);
    setModalOpen(true);
  };

  const save = async (input: DepartmentInput) => {
    if (editing) {
      await api.departments.update(editing.departmentId, input);
      toast.success(`Department "${input.departmentName}" updated.`);
    } else {
      await api.departments.create(input);
      toast.success(`Department "${input.departmentName}" created.`);
    }
    setModalOpen(false);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Manage departments"
        description="Create, edit and delete departments. A department can only be deleted when it has no projects."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New department
          </Button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name..." className="pl-9" />
      </div>

      {loading && !data ? (
        <LoadingState label="Loading departments..." />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !rows.length ? (
        <EmptyState title="No departments" action={<Button onClick={openCreate}>New department</Button>} />
      ) : (
        <Table
          head={
            <>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th className="text-center">Projects</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </>
          }
        >
          {rows.map((d) => (
            <tr key={d.departmentId} className="hover:bg-slate-50">
              <Td className="text-slate-400">#{d.departmentId}</Td>
              <Td className="font-medium whitespace-nowrap text-slate-900">
                <Link href={`/departments/${d.departmentId}`} className="hover:text-indigo-600">
                  {d.departmentName}
                </Link>
              </Td>
              <Td className="max-w-md min-w-60 text-slate-500">{d.departmentDescription}</Td>
              <Td className="text-center">{d.projectCount}</Td>
              <Td>
                <ActiveBadge active={d.isActive} />
              </Td>
              <Td>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(d)} aria-label={`Edit ${d.departmentName}`}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => del.ask(d)}
                    aria-label={`Delete ${d.departmentName}`}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <DepartmentFormModal open={modalOpen} department={editing} onClose={() => setModalOpen(false)} onSubmit={save} />

      <ConfirmDialog
        open={!!del.target}
        title="Delete department?"
        message={
          <>
            Are you sure you want to delete <strong className="text-slate-900">{del.target?.departmentName}</strong>? This
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
