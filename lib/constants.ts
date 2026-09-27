export interface Option {
  value: number;
  label: string;
  /** Tailwind classes for the colored badge. */
  badge: string;
}

export const PROJECT_STATUSES: Option[] = [
  { value: 0, label: "Not Started", badge: "bg-slate-100 text-slate-700 ring-slate-300" },
  { value: 1, label: "In Progress", badge: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: 2, label: "Completed", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: 3, label: "On Hold", badge: "bg-amber-50 text-amber-800 ring-amber-200" },
];

export const TASK_STATUSES: Option[] = [
  { value: 0, label: "To Do", badge: "bg-slate-100 text-slate-700 ring-slate-300" },
  { value: 1, label: "In Progress", badge: "bg-blue-50 text-blue-700 ring-blue-200" },
  { value: 2, label: "Done", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: 3, label: "Cancelled", badge: "bg-rose-50 text-rose-700 ring-rose-200" },
];

export const TASK_PRIORITIES: Option[] = [
  { value: 0, label: "Low", badge: "bg-teal-50 text-teal-700 ring-teal-200" },
  { value: 1, label: "Medium", badge: "bg-yellow-50 text-yellow-800 ring-yellow-200" },
  { value: 2, label: "High", badge: "bg-orange-50 text-orange-700 ring-orange-200" },
  { value: 3, label: "Critical", badge: "bg-red-100 text-red-800 ring-red-300" },
];

export function findOption(options: Option[], value: number): Option {
  return options.find((o) => o.value === value) ?? { value, label: "Unknown", badge: "bg-gray-100 text-gray-600 ring-gray-300" };
}

export const DEFAULT_TAG_COLOR = "#64748B";
