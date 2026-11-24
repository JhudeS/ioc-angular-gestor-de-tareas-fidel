import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskDetail } from './components/task-detail/task-detail.component';
import { TaskFilters } from './components/task-filters/task-filters.component';
import { TaskForm } from './components/task-form/task-form.component';
import { TaskList } from './components/task-list/task-list.component';
import { Task, TASK_CATEGORIES, TaskFilterCriteria } from './models/task.model';
import { TaskService } from './services/task.service';

@Component({
  imports: [RouterOutlet, TaskDetail, TaskFilters, TaskForm, TaskList],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class App {
  private readonly taskService = inject(TaskService);
  private readonly selectedTaskId = signal<string | null>(null);

  public readonly appName = 'Gestor de Tasques';
  public readonly categories = TASK_CATEGORIES;

  public readonly tasks = this.taskService.tasks;
  public readonly loading = this.taskService.loading;
  public readonly error = this.taskService.error;

  public readonly selectedTask = computed(
    () => this.tasks().find((task) => task.id === this.selectedTaskId()) ?? null,
  );

  constructor() {
    this.taskService.search({ text: '', category: '' });
  }

  public search(criteria: TaskFilterCriteria): void {
    this.taskService.search(criteria);
  }

  public retry(): void {
    this.taskService.retry();
  }

  public selectTask(task: Task): void {
    this.selectedTaskId.set(task.id);
  }
}
