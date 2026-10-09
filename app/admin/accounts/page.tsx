"use client";

import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AccountFormModal } from "@/components/forms/AccountFormModal";
import { RoleBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { Table, Td, Th } from "@/components/ui/Table";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { AccountDetail, UpdateAccountInput } from "@/lib/types";
import { useDelete } from "@/lib/useDelete";
import { useFetch } from "@/lib/useFetch";

function AccountsContent() {
  const { account: me, updateAccount } = useAuth();
  const { data, loading, error, reload } = useFetch(() => api.accounts.list());
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AccountDetail | null>(null);

  const del = useDelete<AccountDetail>(
    (a) => api.accounts.remove(a.accountId),
    (a) => `Account "${a.email}" deleted.`,
    reload,
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((a) => !q || a.fullName.toLowerCase().includes(q) || a.email.includes(q));
  }, [data, query]);

  const admins = (data ?? []).filter((a) => a.role === 1).length;

  const save = async (input: UpdateAccountInput) => {
    if (!editing) return;
    const updated = await api.accounts.update(editing.accountId, input);
    toast.success(`Account "${updated.email}" updated.`);
    if (updated.accountId === me?.accountId) updateAccount(updated); // keep the navbar name in sync
    setEditing(null);
    reload();
  };

  return (
    <>
      <PageHeader
        title="Manage accounts"
        description="Admin only. Change names and roles, or delete accounts. An account that has created tasks cannot be deleted."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name or email..."
            className="pl-9"
            aria-label="Filter accounts"
          />
        </div>
        {data && (
          <p className="text-sm text-slate-500">
            {data.length} {data.length === 1 ? "account" : "accounts"} · {admins} {admins === 1 ? "admin" : "admins"}
          </p>
        )}
      </div>

      {loading && !data ? (
        <LoadingState label="Loading accounts..." />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !rows.length ? (
        <EmptyState title="No accounts found" description={query ? `Nothing matches "${query}".` : undefined} />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <Table
            head={
              <>
                <Th>Account</Th>
                <Th>Role</Th>
                <Th>Created</Th>
                <Th className="text-center">Tasks created</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {rows.map((a) => {
              const isSelf = a.accountId === me?.accountId;
              return (
                <tr key={a.accountId} className="hover:bg-slate-50">
                  <Td className="min-w-56">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{a.fullName}</span>
                      {isSelf && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">You</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{a.email}</p>
                  </Td>
                  <Td>
                    <RoleBadge role={a.roleName} />
                  </Td>
                  <Td className="text-xs whitespace-nowrap text-slate-500">{formatDateTime(a.createdDate)}</Td>
                  <Td className="text-center">{a.createdTaskCount}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(a)} aria-label={`Edit ${a.email}`}>
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => del.ask(a)}
                        disabled={isSelf}
                        title={isSelf ? "You cannot delete your own account" : undefined}
                        aria-label={`Delete ${a.email}`}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
        </div>
      )}

      <AccountFormModal
        open={!!editing}
        account={editing}
        isSelf={editing?.accountId === me?.accountId}
        onClose={() => setEditing(null)}
        onSubmit={save}
      />

      <ConfirmDialog
        open={!!del.target}
        title="Delete account?"
        confirmLabel="Delete account"
        message={
          <>
            Delete the account <strong className="text-slate-900">{del.target?.email}</strong>? This cannot be undone.
            {!!del.target?.createdTaskCount && (
              <span className="mt-2 block text-amber-700">
                This account has created {del.target.createdTaskCount} task(s), so the server will refuse to delete it.
              </span>
            )}
          </>
        }
        loading={del.deleting}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </>
  );
}

export default function ManageAccountsPage() {
  // The /admin layout already requires a login; this page also requires the Admin role.
  return (
    <RequireAuth adminOnly>
      <AccountsContent />
    </RequireAuth>
  );
}
