export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null; // ISO string from API
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status: string;
  priority: string;
  category: string;
  search: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  dueToday: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}