export const TASK_CATEGORIES = ['Feina', 'Estudis', 'Casa', 'Salut', 'Personal'] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface Task {
  id: number;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
  estimatedHours: number;
  featured?: boolean;
}

export interface TaskFilterCriteria {
  text: string;
  category: TaskCategory | '';
}
