"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { FieldErrors, required, useForm } from "@/lib/forms";
import type { Department, DepartmentInput } from "@/lib/types";

interface Values {
  departmentName: string;
  departmentDescription: string;
  isActive: boolean;
}

function validate(v: Values): FieldErrors {
  const e: FieldErrors = {};
  if (required(v.departmentName)) e.departmentName = "Department name is required.";
  else if (v.departmentName.trim().length > 100) e.departmentName = "Department name must not exceed 100 characters.";
  if (required(v.departmentDescription)) e.departmentDescription = "Description is required.";
  else if (v.departmentDescription.trim().length > 300) e.departmentDescription = "Description must not exceed 300 characters.";
  return e;
}

interface Props {
  open: boolean;
  department: Department | null; // null = create
  onClose: () => void;
  onSubmit: (input: DepartmentInput) => Promise<void>;
}

export function DepartmentFormModal({ open, department, onClose, onSubmit }: Props) {
  const form = useForm<Values>({ departmentName: "", departmentDescription: "", isActive: true }, validate);
  const { values, errors, saving, setField } = form;

  useEffect(() => {
    if (open)
      form.reset({
        departmentName: department?.departmentName ?? "",
        departmentDescription: department?.departmentDescription ?? "",
        isActive: department?.isActive ?? true,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, department]);

  const submit = form.handleSubmit((v) =>
    onSubmit({
      departmentName: v.departmentName.trim(),
      departmentDescription: v.departmentDescription.trim(),
      ...(department ? { isActive: v.isActive } : {}),
    }),
  );

  return (
    <Modal
      open={open}
      title={department ? "Edit department" : "New department"}
      description={department ? `Update "${department.departmentName}".` : "Add a department to the organization."}
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => submit()} loading={saving}>
            {department ? "Save changes" : "Create department"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Name" htmlFor="d-name" required error={errors.departmentName}>
          <Input
            id="d-name"
            value={values.departmentName}
            onChange={(e) => setField("departmentName", e.target.value)}
            invalid={!!errors.departmentName}
            maxLength={100}
            autoFocus
          />
        </Field>
        <Field
          label="Description"
          htmlFor="d-desc"
          required
          error={errors.departmentDescription}
          hint={`${values.departmentDescription.length}/300`}
        >
          <Textarea
            id="d-desc"
            rows={3}
            value={values.departmentDescription}
            onChange={(e) => setField("departmentDescription", e.target.value)}
            invalid={!!errors.departmentDescription}
            maxLength={300}
          />
        </Field>
        {department && (
          <Checkbox
            label="Active (shown on public pages)"
            checked={values.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
          />
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
