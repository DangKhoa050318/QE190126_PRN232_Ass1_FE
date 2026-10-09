"use client";

import { useState } from "react";
import { toast } from "sonner";
import { errorMessage, isSessionEnded } from "./api";

/** State for a delete confirmation dialog: pick a target, confirm, call the API, toast the outcome. */
export function useDelete<T>(remove: (item: T) => Promise<void>, successMessage: (item: T) => string, onDone: () => void) {
  const [target, setTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await remove(target);
      toast.success(successMessage(target));
      setTarget(null);
      onDone();
    } catch (err) {
      // e.g. HTTP 400 "Cannot delete ... because it still has linked projects."
      if (!isSessionEnded(err)) toast.error(errorMessage(err));
      setTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return { target, deleting, ask: setTarget, cancel: () => setTarget(null), confirm };
}
