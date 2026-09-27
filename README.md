# TaskTrack — PRN232 Assignment 1 (Frontend)

Next.js 15 (App Router, TypeScript) + Tailwind CSS frontend for the Task & Team Management app.
All pages are public and load their data from the TaskTrack API.

- **Student:** QE190126 — **Class:** PRN232
- **Live site:** https://qe190126prn232ass1.vercel.app
- **Live API (Swagger):** https://qe190126-tasktrack-api.onrender.com/swagger
- **Backend repo:** https://github.com/DangKhoa050318/QE190126_PRN232_Ass1_BE

> The API runs on Render's free plan and sleeps when idle, so the first page load can take up to a minute.

## Pages

| Route | Description |
|---|---|
| `/` | Welcome banner, summary counts, active projects as cards |
| `/departments` | Active departments (with name search) |
| `/departments/[id]` | Department info and its projects |
| `/projects/[id]` | Project details and its tasks (status/priority badges, tags, due date) |
| `/tasks` | All active tasks with a status filter |
| `/tasks/[id]` | Every field of a task, including tags |
| `/search` | Filter tasks by title, status, priority, project and tag — results update live |
| `/departments/manage` | Department CRUD (modal forms, delete confirmation) |
| `/projects/manage` | Project CRUD with filters |
| `/tasks/manage` | Task CRUD with tag multi-select; delete is a soft delete |
| `/tags/manage` | Tag CRUD with color picker |

UI: Tailwind CSS, colored badges for status/priority, loading indicators on every API call, toast
notifications ([sonner](https://sonner.emilkowal.ski/)) after each operation, confirmation dialogs for deletes,
client-side validation (server field errors are shown on the matching field), responsive layout.

## Project structure

```
app/          Routes (App Router)
components/   Navbar, TaskList, ProjectCard, forms/ (modal forms), ui/ (Button, Modal, Badges, Table...)
lib/          API client, types, constants (labels & badge colors), hooks, formatting
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

`NEXT_PUBLIC_*` values are embedded at build time — redeploy after changing it.

## Deploy to Vercel

1. Import this repository in Vercel (framework preset: Next.js).
2. Add `NEXT_PUBLIC_API_URL` = your Render backend URL.
3. Deploy, then add the Vercel URL to the backend's `FRONTEND_URL` so CORS allows it.
