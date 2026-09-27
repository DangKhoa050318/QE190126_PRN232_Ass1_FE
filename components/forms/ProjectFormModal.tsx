"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { PROJECT_STATUSES } from "@/lib/constants";
import { FieldErrors, required, useForm } from "@/lib/forms";
import type { Department, Project, ProjectInput } from "@/lib/types";

interface Values {
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  departmentId: string;
  isActive: boolean;
}

function validate(v: Values): FieldErrors {
  const e: FieldErrors = {};
  if (required(v.projectName)) e.projectName = "Project name is required.";
  else if (v.projectName.trim().length > 200) e.projectName = "Project name must not exceed 200 characters.";
  if (!v.startDate) e.startDate = "Start date is required.";
  if (v.startDate && v.endDate && v.endDate < v.startDate) e.endDate = "End date must be on or after the start date.";
  if (!v.departmentId) e.departmentId = "Department is required.";
  return e;
}

interface Props {
  open: boolean;
  project: Project | null; // null = create
  departments: Department[];
  onClose: () => void;
  onSubmit: (input: ProjectInput) => Promise<void>;
}

export function ProjectFormModal({ open, project, departments, onClose, onSubmit }: Props) {
  const empty: Values = {
    projectName: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    status: "0",
    departmentId: "",
    isActive: true,
  };
  const form = useForm<Values>(empty, validate);
  const { values, errors, saving, setField } = form;

  useEffect(() => {
    if (!open) return;
    form.reset(
      project
        ? {
            projectName: project.projectName,
            description: project.description ?? "",
            startDate: project.startDate,
            endDate: project.endDate ?? "",
            status: String(project.status),
            departmentId: String(project.departmentId),
            isActive: project.isActive,
          }
        : empty,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project]);

  const submit = form.handleSubmit((v) =>
    onSubmit({
      projectName: v.projectName.trim(),
      description: v.description.trim() || null,
      startDate: v.startDate,
      endDate: v.endDate || null,
      status: Number(v.status),
      departmentId: Number(v.departmentId),
      ...(project ? { isActive: v.isActive } : {}),
    }),
  );

  // Inactive departments are hidden unless the project already belongs to one.
  const departmentOptions = departments.filter((d) => d.isActive || String(d.departmentId) === values.departmentId);

  return (
    <Modal
      open={open}
      size="lg"
      title={project ? "Edit project" : "New project"}
      description={project ? `Update "${project.projectName}".` : "Add a project to a department."}
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => submit()} loading={saving}>
            {project ? "Save changes" : "Create project"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <Field label="Project name" htmlFor="p-name" required error={errors.projectName}>
            <Input
              id="p-name"
              value={values.projectName}
              onChange={(e) => setField("projectName", e.target.value)}
              invalid={!!errors.projectName}
              maxLength={200}
              autoFocus
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description" htmlFor="p-desc" error={errors.description}>
            <Textarea
              id="p-desc"
              rows={3}
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Department" htmlFor="p-dept" required error={errors.departmentId}>
          <Select
            id="p-dept"
            value={values.departmentId}
            onChange={(e) => setField("departmentId", e.target.value)}
            invalid={!!errors.departmentId}
          >
            <option value="">Select a department</option>
            {departmentOptions.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentName}
                {!d.isActive ? " (inactive)" : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="p-status" required error={errors.status}>
          <Select id="p-status" value={values.status} onChange={(e) => setField("status", e.target.value)}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Start date" htmlFor="p-start" required error={errors.startDate}>
          <Input
            id="p-start"
            type="date"
            value={values.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
            invalid={!!errors.startDate}
          />
        </Field>
        <Field label="End date" htmlFor="p-end" error={errors.endDate} hint="Optional">
          <Input
            id="p-end"
            type="date"
            value={values.endDate}
            min={values.startDate || undefined}
            onChange={(e) => setField("endDate", e.target.value)}
            invalid={!!errors.endDate}
          />
        </Field>
        {project && (
          <div className="sm:col-span-2">
            <Checkbox
              label="Active (shown on public pages)"
              checked={values.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
            />
          </div>
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
