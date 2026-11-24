import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NewTask,
  Task,
  TASK_STATUSES,
  TaskCategory,
  TaskStatus,
} from '../../models/task.model';
import { TaskService } from '../../services/task.service';

type TaskFormField = 'title' | 'description' | 'category' | 'dueDate' | 'estimatedHours';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-task-form',
  styleUrl: './task-form.component.scss',
  templateUrl: './task-form.component.html',
})
export class TaskForm {
  @Input({ required: true }) public categories: readonly TaskCategory[] = [];
  @Output() public taskCreated = new EventEmitter<Task>();

  private readonly taskService = inject(TaskService);

  public readonly statuses = TASK_STATUSES;
  public readonly saving = signal(false);
  public readonly successMessage = signal<string | null>(null);
  public readonly errorMessage = signal<string | null>(null);

  public readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(80)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)],
    }),
    category: new FormControl<TaskCategory | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dueDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<TaskStatus>('Pendent', { nonNullable: true }),
    estimatedHours: new FormControl<number | null>(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.5), Validators.max(200)],
    }),
    featured: new FormControl(false, { nonNullable: true }),
  });

  public showErrors(field: TaskFormField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  public submit(): void {
    if (this.saving()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const newTask: NewTask = {
      title: value.title,
      description: value.description,
      category: value.category as TaskCategory,
      dueDate: value.dueDate,
      status: value.status,
      estimatedHours: Number(value.estimatedHours),
      featured: value.featured,
    };

    this.saving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.taskService.create(newTask).subscribe({
      next: (task) => {
        this.saving.set(false);
        this.successMessage.set(`S'ha creat la tasca «${task.title}» amb l'id ${task.id}.`);
        this.form.reset();
        this.taskCreated.emit(task);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.errorMessage.set(this.taskService.describeError(error));
      },
    });
  }
}
