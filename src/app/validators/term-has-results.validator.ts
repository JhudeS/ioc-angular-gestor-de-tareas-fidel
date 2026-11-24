import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS } from '../config/search.config';
import { TaskService } from '../services/task.service';

export function termHasResultsValidator(
  taskService: TaskService,
  delayMs = SEARCH_DEBOUNCE_MS,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const term = String(control.value ?? '').trim();
    if (term.length < MIN_SEARCH_LENGTH) {
      return of(null);
    }

    return timer(delayMs).pipe(
      switchMap(() => taskService.countResults(term)),
      map((total) => (total > 0 ? null : { noResults: { term } })),
      catchError(() => of(null)),
    );
  };
}
