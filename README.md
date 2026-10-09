# TaskTrack — PRN232 Assignments 1 & 2 (Frontend)

Next.js 15 (App Router, TypeScript) + Tailwind CSS frontend for the Task & Team Management app.
All data comes from the TaskTrack API — the frontend never touches the database.

- **Assignment 1:** public pages for departments, projects, tasks, tags and search.
- **Assignment 2:** register / login with JWT, logout, and the management pages moved into a protected `/admin`
  area (account management for admins only).

Links:

- **Student:** QE190126 — **Class:** PRN232
- **Live site:** https://qe190126prn232ass1.vercel.app
- **Live API (Swagger):** https://qe190126-tasktrack-api.onrender.com/swagger
- **Backend repo:** https://github.com/DangKhoa050318/QE190126_PRN232_Ass1_BE

> The API runs on Render's free plan and sleeps when idle, so the first page load can take up to a minute.

## Pages

Public (no login):

| Route | Description |
|---|---|
| `/` | Welcome banner, summary counts, active projects as cards |
| `/departments` | Active departments (with name search) |
| `/departments/[id]` | Department info and its projects |
| `/projects/[id]` | Project details and its tasks (status/priority badges, tags, due date) |
| `/tasks` | All active tasks with a status filter |
| `/tasks/[id]` | Every field of a task, including tags and who created / last changed it |
| `/search` | Filter tasks by title, status, priority, project and tag — results update live |
| `/register` | Full name, email, password, confirm password → success message, then redirect to `/login` |
| `/login` | Email + password → stores the JWT and redirects to `/admin` (clear error message on failure) |

Protected (redirect to `/login` without a valid session):

| Route | Description |
|---|---|
| `/admin` | Dashboard: total departments, projects, tasks and tags, links to every section |
| `/admin/departments` | Department CRUD (modal forms, delete confirmation) |
| `/admin/projects` | Project CRUD with filters |
| `/admin/tasks` | Task CRUD with tag multi-select; delete is a soft delete |
| `/admin/tags` | Tag CRUD with color picker |
| `/admin/accounts` | **Admin only** — list accounts, change name/role, delete (Staff sees "Admins only") |
| `/profile` | Update your name or change your password (bonus) |

The old Assignment 1 URLs (`/departments/manage`, …) redirect to the matching `/admin/...` page.

## Authentication (design notes)

- **Storage:** the session (JWT, refresh token, account) is kept in `localStorage` under `tasktrack.session`.
  HTTP-only cookies were not used because the frontend (vercel.app) and the API (onrender.com) are on different
  sites, where cross-site cookies are blocked by modern browsers. Logging in or out in one tab updates every tab.
- **Requests:** every call to a protected endpoint sends `Authorization: Bearer <token>`; public GETs send no token.
- **Token expiry:** the access token lives 60 minutes. Before a protected call, an expired token is first renewed
  with the refresh token (one shared refresh request even if several calls run at once); a `401` response is also
  retried once with a renewed token. If the refresh fails too, the session is cleared, a "session expired" toast is
  shown and the user is redirected to `/login?next=<current page>`, returning there after logging in.
- **Route guard:** `/admin/*` and `/profile` render nothing until the session is known; visitors without one are
  redirected to `/login`. `/admin/accounts` additionally requires the Admin role (the API also returns `403`).
- **Navbar:** shows the user's name, role, Profile and Log out when logged in; Log in and Register otherwise.
  Logout revokes the refresh token on the server, clears the session and returns to the home page.

## Project structure

```
app/          Routes (App Router); app/admin/* is the protected area
components/   Navbar, auth/ (AuthProvider, RequireAuth), admin/ (sidebar), forms/ (modals), ui/ (Button, Modal, Badges...)
lib/          API client (JWT + refresh handling), session storage, types, constants, hooks, formatting
```

## Run locally

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL (default http://localhost:5000)
npm install
npm run dev                  # http://localhost:3000
```

The backend must allow `http://localhost:3000` in CORS (it does by default).

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API, e.g. `https://<your-service>.onrender.com` |

`NEXT_PUBLIC_*` values are embedded at build time — redeploy after changing it. The JWT secret lives only in the
backend (`JWT_SECRET`); the frontend never needs it.

## Deploy to Vercel

1. Import this repository in Vercel (framework preset: Next.js).
2. Add `NEXT_PUBLIC_API_URL` = your Render backend URL.
3. Deploy, then add the Vercel URL to the backend's `FRONTEND_URL` so CORS allows it.
