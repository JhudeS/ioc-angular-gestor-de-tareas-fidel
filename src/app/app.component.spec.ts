import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app.component';
import { environment } from '../environments/environment';
import { TaskApiResponse } from './models/task-api.model';

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
    categoria: 'feina',
    data_limit: '2026-11-26T10:00:00',
    estat: 'pendent',
    hores_estimades: '2',
  },
];

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    httpTesting.expectOne(TASKS_URL).flush(API_TASKS);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gestor de Tasques');
  });

  it('shows the loading state and then the adapted tasks from the API', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.loading')?.textContent).toContain('Carregant tasques');

    httpTesting.expectOne(TASKS_URL).flush(API_TASKS);
    await fixture.whenStable();

    expect(compiled.querySelector('.loading')).toBeNull();
    expect(compiled.querySelectorAll('app-task-card').length).toBe(2);
    expect(compiled.querySelector('app-task-card .title')?.textContent?.trim()).toBe(
      "Lliurar l'EAC3 d'Angular",
    );
  });

  it('shows the error banner and retries the last search', async () => {
    const fixture = TestBed.createComponent(App);
    httpTesting
      .expectOne(TASKS_URL)
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const banner = compiled.querySelector('.error-banner');
    expect(banner?.getAttribute('role')).toBe('alert');
    expect(banner?.textContent).toContain("L'API no respon");

    banner?.querySelector('button')?.click();
    httpTesting.expectOne(TASKS_URL).flush(API_TASKS);
    await fixture.whenStable();

    expect(compiled.querySelector('.error-banner')).toBeNull();
    expect(compiled.querySelectorAll('app-task-card').length).toBe(2);
  });
});
