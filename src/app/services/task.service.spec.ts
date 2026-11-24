import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { TaskApiResponse } from '../models/task-api.model';
import { Task } from '../models/task.model';
import { TaskService } from './task.service';

const TASKS_URL = `${environment.apiUrl}/tasques`;

const API_TASKS: TaskApiResponse[] = [
  {
    id: '1',
    titol: "  Lliurar l'EAC3 d'Angular ",
    descripcio: 'Serveis HTTP i formularis',
    categoria: 'estudis',
    data_limit: '2026-11-24T23:55:00',
    estat: 'en_curs',
    hores_estimades: '6',
    destacada: true,
  },
  {
    id: '2',
    titol: 'Preparar la reunió de seguiment',
    descripcio: "Preparar l'ordre del dia",
    categoria: 'feina',
    data_limit: '2026-11-26T10:00:00',
    estat: 'pendent',
    hores_estimades: '2',
  },
];

describe('TaskService', () => {
  let service: TaskService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('loads, adapts and exposes the tasks with loading state', () => {
    service.search({ text: '', category: '' });
    expect(service.loading()).toBe(true);

    httpTesting.expectOne(TASKS_URL).flush(API_TASKS);

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.tasks().map((task) => task.title)).toEqual([
      "Lliurar l'EAC3 d'Angular",
      'Preparar la reunió de seguiment',
    ]);
  });

  it('sends the category to the API and filters the text after adapting', () => {
    service.search({ text: 'reunio', category: 'Feina' });

    const request = httpTesting.expectOne((req) => req.url === TASKS_URL);
    expect(request.request.params.get('categoria')).toBe('feina');
    request.flush(API_TASKS);

    expect(service.tasks().map((task) => task.id)).toEqual(['2']);
  });

  it('cancels the previous search when a new one starts (switchMap)', () => {
    service.search({ text: 'eac3', category: '' });
    const first = httpTesting.expectOne(TASKS_URL);
    service.search({ text: 'reunio', category: '' });
    const second = httpTesting.expectOne(TASKS_URL);

    expect(first.cancelled).toBe(true);
    second.flush(API_TASKS);
    expect(service.tasks().map((task) => task.id)).toEqual(['2']);
  });

  it('exposes an error and retries the last search', () => {
    service.search({ text: 'reunio', category: '' });
    httpTesting
      .expectOne(TASKS_URL)
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(service.loading()).toBe(false);
    expect(service.error()).toContain("L'API no respon");

    service.retry();
    httpTesting.expectOne(TASKS_URL).flush(API_TASKS);

    expect(service.error()).toBeNull();
    expect(service.tasks().map((task) => task.id)).toEqual(['2']);
  });

  it('creates a task with POST and reloads the last search', () => {
    let created: Task | undefined;

    service
      .create({
        title: 'Nova tasca',
        description: 'Creada des del formulari',
        category: 'Casa',
        dueDate: '2026-12-20',
        status: 'Pendent',
        estimatedHours: 1,
        featured: false,
      })
      .subscribe((task) => (created = task));

    const post = httpTesting.expectOne({ method: 'POST', url: TASKS_URL });
    expect(post.request.body.categoria).toBe('casa');
    post.flush({ ...post.request.body, id: 'ab12' });

    expect(created?.id).toBe('ab12');
    expect(created?.category).toBe('Casa');
    httpTesting.expectOne({ method: 'GET', url: TASKS_URL }).flush(API_TASKS);
  });
});
