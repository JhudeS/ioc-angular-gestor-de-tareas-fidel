import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  adaptTask,
  adaptTasks,
  normalizeKey,
  toApiCategory,
  toTaskApiRequest,
} from '../adapters/task.adapter';
import { TaskApiResponse } from '../models/task-api.model';
import { NewTask, Task, TaskFilterCriteria } from '../models/task.model';

const EMPTY_CRITERIA: TaskFilterCriteria = { text: '', category: '' };

interface SearchResult {
  tasks: Task[];
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly tasksUrl = `${environment.apiUrl}/tasques`;

  private readonly searchRequests = new Subject<TaskFilterCriteria>();

  private readonly tasksState = signal<Task[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly criteriaState = signal<TaskFilterCriteria>(EMPTY_CRITERIA);

  public readonly tasks = this.tasksState.asReadonly();
  public readonly loading = this.loadingState.asReadonly();
  public readonly error = this.errorState.asReadonly();
  public readonly lastCriteria = this.criteriaState.asReadonly();

  constructor() {
    this.searchRequests
      .pipe(
        tap(() => {
          this.loadingState.set(true);
          this.errorState.set(null);
        }),
        switchMap((criteria) =>
          this.getTasks(criteria).pipe(
            map((tasks): SearchResult => ({ tasks, error: null })),
            catchError((error: unknown) =>
              of<SearchResult>({ tasks: [], error: this.describeError(error) }),
            ),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ tasks, error }) => {
        this.tasksState.set(tasks);
        this.errorState.set(error);
        this.loadingState.set(false);
      });
  }

  public search(criteria: TaskFilterCriteria): void {
    const cleanCriteria: TaskFilterCriteria = {
      text: criteria.text.trim(),
      category: criteria.category,
    };
    this.criteriaState.set(cleanCriteria);
    this.searchRequests.next(cleanCriteria);
  }

  public retry(): void {
    this.searchRequests.next(this.criteriaState());
  }

  public getTasks(criteria: TaskFilterCriteria): Observable<Task[]> {
    let params = new HttpParams();
    if (criteria.category) {
      params = params.set('categoria', toApiCategory(criteria.category));
    }

    return this.http.get<TaskApiResponse[]>(this.tasksUrl, { params }).pipe(
      map((response) => adaptTasks(response)),
      map((tasks) => this.applyCriteria(tasks, criteria)),
    );
  }

  public countResults(term: string): Observable<number> {
    return this.getTasks({ text: term, category: '' }).pipe(map((tasks) => tasks.length));
  }

  public create(task: NewTask): Observable<Task> {
    return this.http.post<TaskApiResponse>(this.tasksUrl, toTaskApiRequest(task)).pipe(
      map((response) => adaptTask(response)),
      tap(() => this.retry()),
    );
  }

  public describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return "L'API no respon. Comprova que està en marxa amb npm run api.";
      }
      return `L'API ha retornat un error (${error.status} ${error.statusText}).`;
    }
    return "S'ha produït un error inesperat en comunicar amb l'API.";
  }

  private applyCriteria(tasks: Task[], criteria: TaskFilterCriteria): Task[] {
    const term = normalizeKey(criteria.text);

    return tasks.filter(
      (task) =>
        (!criteria.category || task.category === criteria.category) &&
        (!term || normalizeKey(`${task.title} ${task.description}`).includes(term)),
    );
  }
}
