"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { FieldErrors, required, useForm } from "@/lib/forms";
import type { AccountDetail, UpdateAccountInput } from "@/lib/types";

interface Values {
  fullName: string;
  role: string;
}

function validate(v: Values): FieldErrors {
  const e: FieldErrors = {};
  if (required(v.fullName)) e.fullName = "Full name is required.";
  else if (v.fullName.trim().length > 100) e.fullName = "Full name must not exceed 100 characters.";
  return e;
}

interface Props {
  open: boolean;
  account: AccountDetail | null;
  /** The logged-in admin cannot change their own role. */
  isSelf: boolean;
  onClose: () => void;
  onSubmit: (input: UpdateAccountInput) => Promise<void>;
}

export function AccountFormModal({ open, account, isSelf, onClose, onSubmit }: Props) {
  const form = useForm<Values>({ fullName: "", role: "0" }, validate);
  const { values, errors, saving, setField } = form;

  useEffect(() => {
    if (open && account) form.reset({ fullName: account.fullName, role: String(account.role) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, account]);

  const submit = form.handleSubmit((v) =>
    onSubmit({
      fullName: v.fullName.trim(),
      ...(isSelf ? {} : { role: Number(v.role) }),
    }),
  );

  return (
    <Modal
      open={open}
      size="sm"
      title="Edit account"
      description={account ? account.email : undefined}
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => submit()} loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" htmlFor="acc-name" required error={errors.fullName}>
          <Input
            id="acc-name"
            value={values.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            invalid={!!errors.fullName}
            maxLength={100}
            autoFocus
          />
        </Field>
        <Field
          label="Role"
          htmlFor="acc-role"
          required
          error={errors.role}
          hint={isSelf ? "You cannot change your own role." : "Admins can also manage accounts."}
        >
          <Select id="acc-role" value={values.role} onChange={(e) => setField("role", e.target.value)} disabled={isSelf}>
            <option value="0">Staff</option>
            <option value="1">Admin</option>
          </Select>
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
