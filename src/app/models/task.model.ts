export const TASK_CATEGORIES = ['Feina', 'Estudis', 'Casa', 'Salut', 'Personal'] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_STATUSES = ['Pendent', 'En curs', 'Completada'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
  status: TaskStatus;
  estimatedHours: number;
  featured: boolean;
}

export type NewTask = Omit<Task, 'id'>;

export interface TaskFilterCriteria {
  text: string;
  category: TaskCategory | '';
}
