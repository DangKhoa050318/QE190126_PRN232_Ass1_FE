"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import { FieldErrors, required, useForm } from "@/lib/forms";
import type { Project, Tag, Task, TaskInput } from "@/lib/types";
import { TagMultiSelect } from "./TagMultiSelect";

interface Values {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  projectId: string;
  tagIds: number[];
}

const EMPTY: Values = { title: "", description: "", status: "0", priority: "1", dueDate: "", projectId: "", tagIds: [] };

function validate(v: Values): FieldErrors {
  const e: FieldErrors = {};
  if (required(v.title)) e.title = "Title is required.";
  else if (v.title.trim().length > 300) e.title = "Title must not exceed 300 characters.";
  if (!v.projectId) e.projectId = "Project is required.";
  return e;
}

interface Props {
  open: boolean;
  task: Task | null; // null = create
  projects: Project[];
  tags: Tag[];
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<void>;
}

export function TaskFormModal({ open, task, projects, tags, onClose, onSubmit }: Props) {
  const form = useForm<Values>(EMPTY, validate);
  const { values, errors, saving, setField } = form;

  useEffect(() => {
    if (!open) return;
    form.reset(
      task
        ? {
            title: task.title,
            description: task.description ?? "",
            status: String(task.status),
            priority: String(task.priority),
            dueDate: task.dueDate ?? "",
            projectId: String(task.projectId),
            tagIds: task.tags.map((t) => t.tagId),
          }
        : EMPTY,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task]);

  const submit = form.handleSubmit((v) =>
    onSubmit({
      title: v.title.trim(),
      description: v.description.trim() || null,
      status: Number(v.status),
      priority: Number(v.priority),
      dueDate: v.dueDate || null,
      projectId: Number(v.projectId),
      tagIds: v.tagIds,
    }),
  );

  // Inactive projects are hidden unless the task already belongs to one.
  const projectOptions = projects.filter((p) => p.isActive || String(p.projectId) === values.projectId);

  return (
    <Modal
      open={open}
      size="lg"
      title={task ? "Edit task" : "New task"}
      description={task ? `Update "${task.title}". Saving replaces the task's tags.` : "Add a task to a project."}
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => submit()} loading={saving}>
            {task ? "Save changes" : "Create task"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <Field label="Title" htmlFor="t-title" required error={errors.title}>
            <Input
              id="t-title"
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              invalid={!!errors.title}
              maxLength={300}
              autoFocus
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description" htmlFor="t-desc" error={errors.description}>
            <Textarea
              id="t-desc"
              rows={3}
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Project" htmlFor="t-project" required error={errors.projectId}>
          <Select
            id="t-project"
            value={values.projectId}
            onChange={(e) => setField("projectId", e.target.value)}
            invalid={!!errors.projectId}
          >
            <option value="">Select a project</option>
            {projectOptions.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
                {!p.isActive ? " (inactive)" : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Due date" htmlFor="t-due" error={errors.dueDate} hint="Optional">
          <Input id="t-due" type="date" value={values.dueDate} onChange={(e) => setField("dueDate", e.target.value)} />
        </Field>
        <Field label="Status" htmlFor="t-status" required error={errors.status}>
          <Select id="t-status" value={values.status} onChange={(e) => setField("status", e.target.value)}>
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priority" htmlFor="t-priority" required error={errors.priority}>
          <Select id="t-priority" value={values.priority} onChange={(e) => setField("priority", e.target.value)}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Tags" htmlFor="t-tags" error={errors.tagIds} hint="Optional — pick any number of tags.">
            <TagMultiSelect
              id="t-tags"
              tags={tags}
              value={values.tagIds}
              onChange={(ids) => setField("tagIds", ids)}
              invalid={!!errors.tagIds}
            />
          </Field>
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
