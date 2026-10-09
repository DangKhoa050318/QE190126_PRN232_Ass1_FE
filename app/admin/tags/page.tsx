"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TagFormModal } from "@/components/forms/TagFormModal";
import { TagChip } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { Table, Td, Th } from "@/components/ui/Table";
import { api } from "@/lib/api";
import type { TagInput, TagWithUsage } from "@/lib/types";
import { useDelete } from "@/lib/useDelete";
import { useFetch } from "@/lib/useFetch";

export default function ManageTagsPage() {
  const { data, loading, error, reload } = useFetch(() => api.tags.list());
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TagWithUsage | null>(null);

  const del = useDelete<TagWithUsage>(
    (t) => api.tags.remove(t.tagId),
    (t) => `Tag "${t.tagName}" deleted.`,
    reload,
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((t) => !q || t.tagName.toLowerCase().includes(q));
  }, [data, query]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (t: TagWithUsage) => {
    setEditing(t);
    setModalOpen(true);
  };

  const save = async (input: TagInput) => {
    if (editing) {
      await api.tags.update(editing.tagId, input);
      toast.success(`Tag "${input.tagName}" updated.`);
    } else {
      await api.tags.create(input);
      toast.success(`Tag "${input.tagName}" created.`);
    }
    setModalOpen(false);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Manage tags"
        description="Create, edit and delete tags. A tag can only be deleted when no task uses it."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New tag
          </Button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by name..." className="pl-9" />
      </div>

      {loading && !data ? (
        <LoadingState label="Loading tags..." />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !rows.length ? (
        <EmptyState title="No tags" action={<Button onClick={openCreate}>New tag</Button>} />
      ) : (
        <Table
          head={
            <>
              <Th>Tag</Th>
              <Th>Color</Th>
              <Th className="text-center">Used by</Th>
              <Th className="text-right">Actions</Th>
            </>
          }
        >
          {rows.map((t) => (
            <tr key={t.tagId} className="hover:bg-slate-50">
              <Td>
                <TagChip tag={t} />
              </Td>
              <Td>
                {t.color ? (
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-slate-600">
                    <span className="h-4 w-4 rounded border border-black/10" style={{ backgroundColor: t.color }} />
                    {t.color}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Default</span>
                )}
              </Td>
              <Td className="text-center whitespace-nowrap">
                {t.taskCount > 0 ? (
                  <Link href={`/search?tagId=${t.tagId}`} className="text-indigo-600 hover:underline">
                    {t.taskCount} {t.taskCount === 1 ? "task" : "tasks"}
                  </Link>
                ) : (
                  <span className="text-slate-400">Unused</span>
                )}
              </Td>
              <Td>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)} aria-label={`Edit ${t.tagName}`}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => del.ask(t)}
                    aria-label={`Delete ${t.tagName}`}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <TagFormModal open={modalOpen} tag={editing} onClose={() => setModalOpen(false)} onSubmit={save} />

      <ConfirmDialog
        open={!!del.target}
        title="Delete tag?"
        message={
          <>
            Are you sure you want to delete the tag <strong className="text-slate-900">{del.target?.tagName}</strong>? This
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
