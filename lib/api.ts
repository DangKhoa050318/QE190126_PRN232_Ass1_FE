import { getSession, isExpired, reloadSession, type Session, sessionFromAuth, setSession } from "./session";
import type {
  Account,
  AccountDetail,
  AuthResponse,
  ChangePasswordInput,
  Department,
  DepartmentDetail,
  DepartmentInput,
  Project,
  ProjectDetail,
  ProjectFilters,
  ProjectInput,
  RegisterInput,
  Tag,
  TagInput,
  TagWithUsage,
  Task,
  TaskFilters,
  TaskInput,
  UpdateAccountInput,
} from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

const NETWORK_ERROR = "Cannot reach the server. It may be starting up — please try again in a moment.";
const SESSION_EXPIRED = "Your session has expired. Please log in again.";

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

async function toApiError(res: Response) {
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
  return new ApiError(message, res.status, fieldErrors);
}

async function send(path: string, init: RequestInit, token?: string) {
  try {
    return await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(NETWORK_ERROR, 0);
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------------------------
// Session handling for protected endpoints
// ---------------------------------------------------------------------------------------------

let onSessionExpired: (() => void) | null = null;

/** Registered by AuthProvider: tells the user and sends them to /login. */
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

function endSession() {
  setSession(null);
  onSessionExpired?.();
}

type RefreshResult = { ok: true; session: Session } | { ok: false; reason: "invalid" | "network" };
let refreshing: Promise<RefreshResult> | null = null;

/** Exchanges the refresh token for a new token pair; concurrent callers share a single request. */
function refreshSession(current: Session): Promise<RefreshResult> {
  refreshing ??= doRefresh(current).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function doRefresh(current: Session): Promise<RefreshResult> {
  if (isExpired(current.refreshTokenExpiresAt, 0)) return { ok: false, reason: "invalid" };

  let res: Response;
  try {
    res = await send("/api/auth/refresh", { method: "POST", body: json({ refreshToken: current.refreshToken }) });
  } catch {
    return { ok: false, reason: "network" };
  }

  if (res.ok) {
    const next = sessionFromAuth((await res.json()) as AuthResponse);
    setSession(next);
    return { ok: true, session: next };
  }

  // Another tab may have used this refresh token first: continue with the session it saved.
  const latest = reloadSession();
  if (latest && latest.refreshToken !== current.refreshToken && !isExpired(latest.expiresAt)) {
    return { ok: true, session: latest };
  }
  return { ok: false, reason: res.status >= 500 ? "network" : "invalid" };
}

/** A session with a usable access token — refreshed first when it has expired (or when `force` is set). */
async function freshSession(force: boolean): Promise<Session> {
  const current = getSession();
  if (!current) {
    endSession();
    throw new ApiError("Please log in to continue.", 401);
  }
  if (!force && !isExpired(current.expiresAt)) return current;

  const result = await refreshSession(current);
  if (result.ok) return result.session;
  if (result.reason === "network") throw new ApiError(NETWORK_ERROR, 0);
  endSession();
  throw new ApiError(SESSION_EXPIRED, 401);
}

type RequestOptions = RequestInit & {
  /** Protected endpoint: send the JWT, refresh it when needed, end the session on 401. */
  auth?: boolean;
};

async function request<T>(path: string, { auth = false, ...init }: RequestOptions = {}): Promise<T> {
  if (!auth) return parse<T>(await send(path, init));

  let session = await freshSession(false);
  let res = await send(path, init, session.token);
  if (res.status === 401) {
    // The token was rejected although it had not expired yet (e.g. revoked): retry once with a new one.
    session = await freshSession(true);
    res = await send(path, init, session.token);
    if (res.status === 401) {
      const error = await toApiError(res);
      endSession();
      throw error;
    }
  }
  return parse<T>(res);
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

function json(body: unknown) {
  return JSON.stringify(body);
}

export const api = {
  auth: {
    register: (input: RegisterInput) =>
      request<Account>("/api/auth/register", { method: "POST", body: json(input) }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/api/auth/login", { method: "POST", body: json({ email, password }) }),
    logout: (refreshToken: string) =>
      request<void>("/api/auth/logout", { method: "POST", body: json({ refreshToken }) }),
    me: () => request<Account>("/api/auth/me", { auth: true }),
    updateMe: (fullName: string) =>
      request<Account>("/api/auth/me", { method: "PUT", body: json({ fullName }), auth: true }),
    changePassword: (input: ChangePasswordInput) =>
      request<AuthResponse>("/api/auth/me/password", { method: "PUT", body: json(input), auth: true }),
  },
  accounts: {
    list: () => request<AccountDetail[]>("/api/accounts", { auth: true }),
    get: (id: number) => request<AccountDetail>(`/api/accounts/${id}`, { auth: true }),
    update: (id: number, input: UpdateAccountInput) =>
      request<AccountDetail>(`/api/accounts/${id}`, { method: "PUT", body: json(input), auth: true }),
    remove: (id: number) => request<void>(`/api/accounts/${id}`, { method: "DELETE", auth: true }),
  },
  departments: {
    list: (includeInactive = false) => request<Department[]>(`/api/departments${qs({ includeInactive })}`),
    get: (id: number) => request<DepartmentDetail>(`/api/departments/${id}`),
    search: (name: string, includeInactive = false) =>
      request<Department[]>(`/api/departments/search${qs({ name, includeInactive })}`),
    create: (input: DepartmentInput) =>
      request<Department>("/api/departments", { method: "POST", body: json(input), auth: true }),
    update: (id: number, input: DepartmentInput) =>
      request<Department>(`/api/departments/${id}`, { method: "PUT", body: json(input), auth: true }),
    remove: (id: number) => request<void>(`/api/departments/${id}`, { method: "DELETE", auth: true }),
  },
  projects: {
    list: (includeInactive = false) => request<Project[]>(`/api/projects${qs({ includeInactive })}`),
    get: (id: number) => request<ProjectDetail>(`/api/projects/${id}`),
    byDepartment: (departmentId: number) => request<Project[]>(`/api/projects/department/${departmentId}`),
    search: (filters: ProjectFilters) => request<Project[]>(`/api/projects/search${qs({ ...filters })}`),
    create: (input: ProjectInput) =>
      request<Project>("/api/projects", { method: "POST", body: json(input), auth: true }),
    update: (id: number, input: ProjectInput) =>
      request<Project>(`/api/projects/${id}`, { method: "PUT", body: json(input), auth: true }),
    remove: (id: number) => request<void>(`/api/projects/${id}`, { method: "DELETE", auth: true }),
  },
  tasks: {
    list: (status?: number) => request<Task[]>(`/api/tasks${qs({ status })}`),
    get: (id: number) => request<Task>(`/api/tasks/${id}`),
    byProject: (projectId: number) => request<Task[]>(`/api/tasks/project/${projectId}`),
    search: (filters: TaskFilters) => request<Task[]>(`/api/tasks/search${qs({ ...filters })}`),
    create: (input: TaskInput) => request<Task>("/api/tasks", { method: "POST", body: json(input), auth: true }),
    update: (id: number, input: TaskInput) =>
      request<Task>(`/api/tasks/${id}`, { method: "PUT", body: json(input), auth: true }),
    remove: (id: number) => request<void>(`/api/tasks/${id}`, { method: "DELETE", auth: true }),
  },
  tags: {
    list: () => request<TagWithUsage[]>("/api/tags"),
    create: (input: TagInput) => request<Tag>("/api/tags", { method: "POST", body: json(input), auth: true }),
    update: (id: number, input: TagInput) =>
      request<Tag>(`/api/tags/${id}`, { method: "PUT", body: json(input), auth: true }),
    remove: (id: number) => request<void>(`/api/tags/${id}`, { method: "DELETE", auth: true }),
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
