import { TaskApiResponse } from '../models/task-api.model';
import {
  adaptTask,
  adaptTasks,
  normalizeCategory,
  normalizeDate,
  normalizeStatus,
  toSafeNumber,
  toTaskApiRequest,
} from './task.adapter';

const RAW_TASK: TaskApiResponse = {
  id: '3',
  titol: '  Fer   la compra setmanal  ',
  descripcio: '   ',
  categoria: ' CASA ',
  data_limit: '2026-11-28T11:00:00',
  estat: 'en_curs',
  hores_estimades: '1,5',
};

describe('task.adapter', () => {
  it('transforms an API task into the normalized internal model', () => {
    expect(adaptTask(RAW_TASK)).toEqual({
      id: '3',
      title: 'Fer la compra setmanal',
      description: 'Sense descripció',
      category: 'Casa',
      dueDate: '2026-11-28',
      status: 'En curs',
      estimatedHours: 1.5,
      featured: false,
    });
  });

  it('applies defaults for missing or invalid values', () => {
    const task = adaptTask({
      id: '99',
      titol: '',
      categoria: 'desconeguda',
      data_limit: 'no és una data',
      estat: '',
      hores_estimades: 'abc',
      destacada: true,
    });

    expect(task.title).toBe('Tasca sense títol');
    expect(task.description).toBe('Sense descripció');
    expect(task.category).toBe('Personal');
    expect(task.dueDate).toBe('');
    expect(task.status).toBe('Pendent');
    expect(task.estimatedHours).toBe(0);
    expect(task.featured).toBe(true);
  });

  it('normalizes categories, statuses, dates and numbers', () => {
    expect(normalizeCategory('estudis')).toBe('Estudis');
    expect(normalizeStatus('EN CURS')).toBe('En curs');
    expect(normalizeStatus('completada')).toBe('Completada');
    expect(normalizeDate('2026-02-31')).toBe('');
    expect(normalizeDate('2026-12-01T16:00:00')).toBe('2026-12-01');
    expect(toSafeNumber('6')).toBe(6);
    expect(toSafeNumber('-2')).toBe(0);
  });

  it('returns an empty list when the response is not an array', () => {
    expect(adaptTasks(null)).toEqual([]);
  });

  it('converts a new internal task into the API request format', () => {
    expect(
      toTaskApiRequest({
        title: '  Nova tasca ',
        description: 'Prova',
        category: 'Salut',
        dueDate: '2026-12-20',
        status: 'En curs',
        estimatedHours: 2.5,
        featured: true,
      }),
    ).toEqual({
      titol: 'Nova tasca',
      descripcio: 'Prova',
      categoria: 'salut',
      data_limit: '2026-12-20T00:00:00',
      estat: 'en_curs',
      hores_estimades: '2.5',
      destacada: true,
    });
  });
});
