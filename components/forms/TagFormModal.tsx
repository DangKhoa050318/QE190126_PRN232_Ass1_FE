"use client";

import { useEffect } from "react";
import { TagChip } from "@/components/ui/Badges";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { FieldErrors, required, useForm } from "@/lib/forms";
import type { Tag, TagInput } from "@/lib/types";

const PRESETS = ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899", "#6366F1", "#14B8A6", "#64748B"];
const HEX = /^#[0-9A-Fa-f]{6}$/;

interface Values {
  tagName: string;
  color: string;
}

function validate(v: Values): FieldErrors {
  const e: FieldErrors = {};
  if (required(v.tagName)) e.tagName = "Tag name is required.";
  else if (v.tagName.trim().length > 50) e.tagName = "Tag name must not exceed 50 characters.";
  if (v.color && !HEX.test(v.color)) e.color = "Color must be a hex code like #3B82F6.";
  return e;
}

interface Props {
  open: boolean;
  tag: Tag | null; // null = create
  onClose: () => void;
  onSubmit: (input: TagInput) => Promise<void>;
}

export function TagFormModal({ open, tag, onClose, onSubmit }: Props) {
  const form = useForm<Values>({ tagName: "", color: PRESETS[0] }, validate);
  const { values, errors, saving, setField } = form;

  useEffect(() => {
    if (open) form.reset({ tagName: tag?.tagName ?? "", color: tag ? (tag.color ?? "") : PRESETS[0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tag]);

  const submit = form.handleSubmit((v) =>
    onSubmit({ tagName: v.tagName.trim(), color: v.color ? v.color.toUpperCase() : null }),
  );

  const previewColor = HEX.test(values.color) ? values.color : null;

  return (
    <Modal
      open={open}
      size="sm"
      title={tag ? "Edit tag" : "New tag"}
      description={tag ? `Update "${tag.tagName}".` : "Tags label tasks across projects."}
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => submit()} loading={saving}>
            {tag ? "Save changes" : "Create tag"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Name" htmlFor="tag-name" required error={errors.tagName} hint="Must be unique.">
          <Input
            id="tag-name"
            value={values.tagName}
            onChange={(e) => setField("tagName", e.target.value)}
            invalid={!!errors.tagName}
            maxLength={50}
            autoFocus
          />
        </Field>
        <Field label="Color" htmlFor="tag-color" error={errors.color} hint="Optional hex color.">
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Pick color"
              value={previewColor ?? "#64748B"}
              onChange={(e) => setField("color", e.target.value.toUpperCase())}
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
            />
            <Input
              id="tag-color"
              value={values.color}
              onChange={(e) => setField("color", e.target.value.trim())}
              placeholder="#3B82F6"
              invalid={!!errors.color}
              maxLength={7}
              className="font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setField("color", c)}
                className={`h-6 w-6 rounded-full ring-offset-2 transition ${
                  values.color.toUpperCase() === c ? "ring-2 ring-slate-900" : "hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Use color ${c}`}
              />
            ))}
          </div>
        </Field>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
          Preview:
          <TagChip tag={{ tagId: 0, tagName: values.tagName.trim() || "tag name", color: previewColor }} />
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
