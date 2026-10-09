"use client";

import { KeyRound, Save } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RoleBadge } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { api } from "@/lib/api";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/authRoutes";
import { formatDateTime } from "@/lib/format";
import { FieldErrors, required, useForm } from "@/lib/forms";

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500">{description}</p>
      {children}
    </section>
  );
}

function NameForm() {
  const { account, updateAccount } = useAuth();
  const form = useForm({ fullName: account?.fullName ?? "" }, (v): FieldErrors => {
    if (required(v.fullName)) return { fullName: "Full name is required." };
    if (v.fullName.trim().length > 100) return { fullName: "Full name must not exceed 100 characters." };
    return {};
  });

  const submit = form.handleSubmit(async (v) => {
    const updated = await api.auth.updateMe(v.fullName.trim());
    updateAccount(updated);
    form.reset({ fullName: updated.fullName });
    toast.success("Your name has been updated.");
  });

  const unchanged = form.values.fullName.trim() === account?.fullName;

  return (
    <Card title="Personal information" description="This name is shown in the navigation bar and on the tasks you change.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" htmlFor="profile-name" required error={form.errors.fullName}>
          <Input
            id="profile-name"
            value={form.values.fullName}
            onChange={(e) => form.setField("fullName", e.target.value)}
            invalid={!!form.errors.fullName}
            maxLength={100}
          />
        </Field>
        <Field label="Email" htmlFor="profile-email" hint="The email address cannot be changed.">
          <Input id="profile-email" value={account?.email ?? ""} disabled readOnly />
        </Field>
        <Button type="submit" loading={form.saving} disabled={unchanged}>
          {!form.saving && <Save className="h-4 w-4" />} Save name
        </Button>
      </form>
    </Card>
  );
}

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_PASSWORDS: PasswordValues = { currentPassword: "", newPassword: "", confirmPassword: "" };

function validatePasswords(v: PasswordValues): FieldErrors {
  const e: FieldErrors = {};
  if (!v.currentPassword) e.currentPassword = "Current password is required.";
  if (!v.newPassword) e.newPassword = "New password is required.";
  else if (v.newPassword.length < PASSWORD_MIN_LENGTH) e.newPassword = `New password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  else if (v.newPassword.length > PASSWORD_MAX_LENGTH) e.newPassword = `New password must not exceed ${PASSWORD_MAX_LENGTH} characters.`;
  else if (v.newPassword === v.currentPassword) e.newPassword = "New password must be different from the current password.";
  if (!v.confirmPassword) e.confirmPassword = "Please confirm the new password.";
  else if (v.confirmPassword !== v.newPassword) e.confirmPassword = "Passwords do not match.";
  return e;
}

function PasswordForm() {
  const { replaceSession } = useAuth();
  const form = useForm<PasswordValues>(EMPTY_PASSWORDS, validatePasswords);
  const { values, errors, saving, setField } = form;

  const submit = form.handleSubmit(async (v) => {
    const res = await api.auth.changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword });
    replaceSession(res); // this session continues with new tokens; other sessions were signed out
    form.reset(EMPTY_PASSWORDS);
    toast.success("Password changed. Your other sessions have been signed out.");
  });

  return (
    <Card title="Change password" description="Enter your current password, then choose a new one.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Current password" htmlFor="pw-current" required error={errors.currentPassword}>
          <PasswordInput
            id="pw-current"
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={(e) => setField("currentPassword", e.target.value)}
            invalid={!!errors.currentPassword}
          />
        </Field>
        <Field
          label="New password"
          htmlFor="pw-new"
          required
          error={errors.newPassword}
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        >
          <PasswordInput
            id="pw-new"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={(e) => setField("newPassword", e.target.value)}
            invalid={!!errors.newPassword}
            maxLength={PASSWORD_MAX_LENGTH}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm" required error={errors.confirmPassword}>
          <PasswordInput
            id="pw-confirm"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            invalid={!!errors.confirmPassword}
            maxLength={PASSWORD_MAX_LENGTH}
          />
        </Field>
        <Button type="submit" loading={saving}>
          {!saving && <KeyRound className="h-4 w-4" />} Change password
        </Button>
      </form>
    </Card>
  );
}

function ProfileContent() {
  const { account, updateAccount } = useAuth();

  // Refresh the cached account (name or role may have been changed by an admin).
  useEffect(() => {
    api.auth.me().then(updateAccount).catch(() => {});
  }, [updateAccount]);

  if (!account) return null;
  return (
    <>
      <PageHeader title="My profile" description="Update your name or change your password." />
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
          {account.fullName.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-slate-900">{account.fullName}</p>
            <RoleBadge role={account.roleName} />
          </div>
          <p className="text-sm text-slate-500">{account.email}</p>
        </div>
        <p className="text-sm text-slate-500">Member since {formatDateTime(account.createdDate)}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* key: re-create the form when the name changes elsewhere (e.g. another tab) */}
        <NameForm key={account.fullName} />
        <PasswordForm />
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
