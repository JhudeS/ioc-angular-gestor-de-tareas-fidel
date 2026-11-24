import { TaskApiCategory, TaskApiRequest, TaskApiResponse, TaskApiStatus } from '../models/task-api.model';
import { NewTask, Task, TASK_CATEGORIES, TaskCategory, TaskStatus } from '../models/task.model';

export const DEFAULT_TITLE = 'Tasca sense títol';
export const DEFAULT_DESCRIPTION = 'Sense descripció';
export const DEFAULT_CATEGORY: TaskCategory = 'Personal';
export const DEFAULT_STATUS: TaskStatus = 'Pendent';

const STATUS_FROM_API: Record<TaskApiStatus, TaskStatus> = {
  pendent: 'Pendent',
  en_curs: 'En curs',
  completada: 'Completada',
};

const STATUS_TO_API: Record<TaskStatus, TaskApiStatus> = {
  Pendent: 'pendent',
  'En curs': 'en_curs',
  Completada: 'completada',
};

export function adaptTask(api: TaskApiResponse): Task {
  return {
    id: String(api.id).trim(),
    title: cleanText(api.titol) || DEFAULT_TITLE,
    description: cleanText(api.descripcio) || DEFAULT_DESCRIPTION,
    category: normalizeCategory(api.categoria),
    dueDate: normalizeDate(api.data_limit),
    status: normalizeStatus(api.estat),
    estimatedHours: toSafeNumber(api.hores_estimades),
    featured: api.destacada === true,
  };
}

export function adaptTasks(list: TaskApiResponse[] | null | undefined): Task[] {
  return Array.isArray(list) ? list.map(adaptTask) : [];
}

export function toTaskApiRequest(task: NewTask): TaskApiRequest {
  return {
    titol: cleanText(task.title),
    descripcio: cleanText(task.description),
    categoria: toApiCategory(task.category),
    data_limit: task.dueDate ? `${task.dueDate}T00:00:00` : '',
    estat: STATUS_TO_API[task.status],
    hores_estimades: String(task.estimatedHours),
    destacada: task.featured,
  };
}

export function toApiCategory(category: TaskCategory): TaskApiCategory {
  return category.toLowerCase() as TaskApiCategory;
}

export function cleanText(value: string | null | undefined): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

export function normalizeKey(value: string | null | undefined): string {
  return cleanText(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function normalizeCategory(value: string | null | undefined): TaskCategory {
  const key = normalizeKey(value);
  return TASK_CATEGORIES.find((category) => normalizeKey(category) === key) ?? DEFAULT_CATEGORY;
}

export function normalizeStatus(value: string | null | undefined): TaskStatus {
  const key = normalizeKey(value).replace(/[\s-]+/g, '_');
  return (STATUS_FROM_API as Record<string, TaskStatus>)[key] ?? DEFAULT_STATUS;
}

export function normalizeDate(value: string | null | undefined): string {
  const text = cleanText(value);
  if (!text) {
    return '';
  }

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (isoDate) {
    const [, year, month, day] = isoDate.map(Number);
    const date = new Date(year, month - 1, day);
    const exists =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    return exists ? formatDate(date) : '';
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? '' : formatDate(date);
}

export function toSafeNumber(value: string | number | null | undefined, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(cleanText(value).replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : fallback;
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
