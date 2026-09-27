const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** "2024-02-28" (DateOnly) → "28 Feb 2024". Parsed as a local date to avoid timezone shifts. */
export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return dateFormat.format(new Date(y, m - 1, d));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return dateTimeFormat.format(new Date(value));
}

/** Due date passed and the task is still open (To Do / In Progress). */
export function isOverdue(dueDate: string | null, status: number) {
  if (!dueDate || status >= 2) return false;
  const [y, m, d] = dueDate.split("-").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(y, m - 1, d) < today;
}
