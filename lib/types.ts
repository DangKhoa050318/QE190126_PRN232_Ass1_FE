// Shapes returned by / sent to the TaskTrack API (camelCase JSON).

export interface Department {
  departmentId: number;
  departmentName: string;
  departmentDescription: string;
  isActive: boolean;
  projectCount: number;
}

export interface DepartmentDetail extends Department {
  projects: Project[];
}

export interface Project {
  projectId: number;
  projectName: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: number;
  statusName: string;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
  createdDate: string;
  taskCount: number;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
}

export interface Tag {
  tagId: number;
  tagName: string;
  color: string | null;
}

export interface TagWithUsage extends Tag {
  taskCount: number;
}

export interface Task {
  taskId: number;
  title: string;
  description: string | null;
  status: number;
  statusName: string;
  priority: number;
  priorityName: string;
  dueDate: string | null;
  projectId: number;
  projectName: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
  tags: Tag[];
}

export interface DepartmentInput {
  departmentName: string;
  departmentDescription: string;
  isActive?: boolean;
}

export interface ProjectInput {
  projectName: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  status: number;
  departmentId: number;
  isActive?: boolean;
}

export interface TaskInput {
  title: string;
  description: string | null;
  status: number;
  priority: number;
  dueDate: string | null;
  projectId: number;
  tagIds: number[];
}

export interface TagInput {
  tagName: string;
  color: string | null;
}

export interface TaskFilters {
  title?: string;
  status?: number;
  priority?: number;
  projectId?: number;
  tagId?: number;
}

export interface ProjectFilters {
  name?: string;
  status?: number;
  departmentId?: number;
  includeInactive?: boolean;
}
