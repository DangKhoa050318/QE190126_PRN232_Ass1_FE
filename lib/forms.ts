"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { ApiError, errorMessage, isSessionEnded } from "./api";

export type FieldErrors = Record<string, string>;

/**
 * Shared form state for the create/edit modals: client-side validation first, then the API call.
 * Server-side field errors (HTTP 400) are mapped back onto the fields.
 */
export function useForm<T>(initial: T, validate: (values: T) => FieldErrors) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = (next: T) => {
    setValues(next);
    setErrors({});
    setSubmitted(false);
  };

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    // After the first submit attempt, re-validate live so errors clear as the user fixes them.
    if (submitted) setErrors(validate(next));
  };

  const handleSubmit = (save: (values: T) => Promise<void>) => async (e?: FormEvent) => {
    e?.preventDefault();
    setSubmitted(true);
    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSaving(true);
    try {
      await save(values);
    } catch (err) {
      if (isSessionEnded(err)) return; // already reported; the user is being sent to /login
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return { values, errors, saving, setField, reset, handleSubmit };
}

export const required = (value: string | null | undefined) => !value || !value.trim();
