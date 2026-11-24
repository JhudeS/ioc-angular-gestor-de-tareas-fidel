import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, map, merge } from 'rxjs';
import {
  MAX_SEARCH_LENGTH,
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
} from '../../config/search.config';
import { TaskCategory, TaskFilterCriteria } from '../../models/task.model';
import { SearchHistoryService } from '../../services/search-history.service';
import { TaskService } from '../../services/task.service';
import { termHasResultsValidator } from '../../validators/term-has-results.validator';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-task-filters',
  styleUrl: './task-filters.component.scss',
  templateUrl: './task-filters.component.html',
})
export class TaskFilters {
  @Input({ required: true }) public categories: readonly TaskCategory[] = [];
  @Output() public criteriaChange = new EventEmitter<TaskFilterCriteria>();

  private readonly taskService = inject(TaskService);
  private readonly searchHistory = inject(SearchHistoryService);
  private readonly immediateSearch = new Subject<void>();

  public readonly minLength = MIN_SEARCH_LENGTH;
  public readonly maxLength = MAX_SEARCH_LENGTH;
  public readonly history = this.searchHistory.history;

  public readonly form = new FormGroup({
    text: new FormControl('', {
      nonNullable: true,
      validators: [Validators.minLength(MIN_SEARCH_LENGTH), Validators.maxLength(MAX_SEARCH_LENGTH)],
      asyncValidators: [termHasResultsValidator(this.taskService)],
    }),
    category: new FormControl<TaskCategory | ''>('', { nonNullable: true }),
  });

  constructor() {
    merge(this.form.valueChanges.pipe(debounceTime(SEARCH_DEBOUNCE_MS)), this.immediateSearch)
      .pipe(
        filter(() => !this.hasSyncTextError()),
        map(() => this.currentCriteria()),
        distinctUntilChanged((a, b) => a.text === b.text && a.category === b.category),
        takeUntilDestroyed(),
      )
      .subscribe((criteria) => this.criteriaChange.emit(criteria));

    this.text.statusChanges
      .pipe(
        filter((status) => status === 'VALID'),
        map(() => this.text.value.trim()),
        filter((term) => term.length >= MIN_SEARCH_LENGTH),
        takeUntilDestroyed(),
      )
      .subscribe((term) => this.searchHistory.add(term));
  }

  public get text(): FormControl<string> {
    return this.form.controls.text;
  }

  public get trimmedText(): string {
    return this.text.value.trim();
  }

  public showTextErrors(): boolean {
    return this.text.invalid && (this.text.dirty || this.text.touched);
  }

  public submit(): void {
    if (this.hasSyncTextError()) {
      this.text.markAsTouched();
      return;
    }
    this.immediateSearch.next();
  }

  public clear(): void {
    this.form.reset();
    this.immediateSearch.next();
  }

  public useHistory(term: string): void {
    this.text.setValue(term);
    this.text.markAsDirty();
    this.immediateSearch.next();
  }

  public clearHistory(): void {
    this.searchHistory.clear();
  }

  private hasSyncTextError(): boolean {
    return this.text.hasError('minlength') || this.text.hasError('maxlength');
  }

  private currentCriteria(): TaskFilterCriteria {
    const { text, category } = this.form.getRawValue();
    return { text: text.trim(), category };
  }
}
