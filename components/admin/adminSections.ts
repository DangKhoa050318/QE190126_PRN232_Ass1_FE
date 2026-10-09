import { Building2, FolderKanban, LayoutDashboard, ListTodo, LucideIcon, Tags, Users } from "lucide-react";

export interface AdminSection {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Only shown to (and usable by) the Admin role. */
  adminOnly?: boolean;
}

export const dashboardSection: AdminSection = {
  href: "/admin",
  label: "Dashboard",
  description: "Overview of all data.",
  icon: LayoutDashboard,
};

/** Management pages in the /admin area (any logged-in user unless adminOnly). */
export const adminSections: AdminSection[] = [
  {
    href: "/admin/departments",
    label: "Departments",
    description: "Create, edit and delete departments.",
    icon: Building2,
  },
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Create, edit and delete projects.",
    icon: FolderKanban,
  },
  {
    href: "/admin/tasks",
    label: "Tasks",
    description: "Create, edit and soft-delete tasks, assign tags.",
    icon: ListTodo,
  },
  {
    href: "/admin/tags",
    label: "Tags",
    description: "Create, edit and delete tags.",
    icon: Tags,
  },
  {
    href: "/admin/accounts",
    label: "Accounts",
    description: "View accounts, change roles, delete accounts.",
    icon: Users,
    adminOnly: true,
  },
];
