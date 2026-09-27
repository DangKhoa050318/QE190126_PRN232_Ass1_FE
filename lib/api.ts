import type {
  Department,
  DepartmentDetail,
  DepartmentInput,
  Project,
  ProjectDetail,
  ProjectFilters,
  ProjectInput,
  Tag,
  TagInput,
  TagWithUsage,
  Task,
  TaskFilters,
  TaskInput,
} from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

/** Error thrown for non-2xx responses; fieldErrors holds the first message per field (camelCase keys). */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

// "$.status" (JSON conversion errors) and "Status" both map to "status".
function normalizeKey(key: string) {
  const k = key.replace(/^\$\.?/, "");
  return k.charAt(0).toLowerCase() + k.slice(1);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Cannot reach the server. It may be starting up — please try again in a moment.", 0);
  }

  if (!res.ok) {
    let body: ProblemDetails | null = null;
    try {
      body = await res.json();
    } catch {
      // empty or non-JSON body
    }
    const fieldErrors: Record<string, string> = {};
    for (const [key, messages] of Object.entries(body?.errors ?? {})) {
      if (messages.length) fieldErrors[normalizeKey(key)] = messages[0];
    }
    const message =
      body?.detail ??
      (Object.keys(fieldErrors).length ? Object.values(fieldErrors)[0] : undefined) ??
      body?.title ??
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, fieldErrors);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false) continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  departments: {
    list: (includeInactive = false) => request<Department[]>(`/api/departments${qs({ includeInactive })}`),
    get: (id: number) => request<DepartmentDetail>(`/api/departments/${id}`),
    search: (name: string, includeInactive = false) =>
      request<Department[]>(`/api/departments/search${qs({ name, includeInactive })}`),
    create: (input: DepartmentInput) => request<Department>("/api/departments", { method: "POST", body: json(input) }),
    update: (id: number, input: DepartmentInput) =>
      request<Department>(`/api/departments/${id}`, { method: "PUT", body: json(input) }),
    remove: (id: number) => request<void>(`/api/departments/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: (includeInactive = false) => request<Project[]>(`/api/projects${qs({ includeInactive })}`),
    get: (id: number) => request<ProjectDetail>(`/api/projects/${id}`),
    byDepartment: (departmentId: number) => request<Project[]>(`/api/projects/department/${departmentId}`),
    search: (filters: ProjectFilters) => request<Project[]>(`/api/projects/search${qs({ ...filters })}`),
    create: (input: ProjectInput) => request<Project>("/api/projects", { method: "POST", body: json(input) }),
    update: (id: number, input: ProjectInput) =>
      request<Project>(`/api/projects/${id}`, { method: "PUT", body: json(input) }),
    remove: (id: number) => request<void>(`/api/projects/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: (status?: number) => request<Task[]>(`/api/tasks${qs({ status })}`),
    get: (id: number) => request<Task>(`/api/tasks/${id}`),
    byProject: (projectId: number) => request<Task[]>(`/api/tasks/project/${projectId}`),
    search: (filters: TaskFilters) => request<Task[]>(`/api/tasks/search${qs({ ...filters })}`),
    create: (input: TaskInput) => request<Task>("/api/tasks", { method: "POST", body: json(input) }),
    update: (id: number, input: TaskInput) => request<Task>(`/api/tasks/${id}`, { method: "PUT", body: json(input) }),
    remove: (id: number) => request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
  },
  tags: {
    list: () => request<TagWithUsage[]>("/api/tags"),
    create: (input: TagInput) => request<Tag>("/api/tags", { method: "POST", body: json(input) }),
    update: (id: number, input: TagInput) => request<Tag>(`/api/tags/${id}`, { method: "PUT", body: json(input) }),
    remove: (id: number) => request<void>(`/api/tags/${id}`, { method: "DELETE" }),
  },
};

/** Parses a route id; throws a 404 ApiError for anything that is not a positive integer (e.g. /tasks/abc). */
export function parseId(value: string, entity: string) {
  if (!/^[1-9]\d*$/.test(value)) throw new ApiError(`${entity} with id "${value}" was not found.`, 404);
  return Number(value);
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
