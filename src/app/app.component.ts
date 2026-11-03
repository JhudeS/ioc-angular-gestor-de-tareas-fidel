import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskDetail } from './components/task-detail/task-detail.component';
import { TaskFilters } from './components/task-filters/task-filters.component';
import { TaskList } from './components/task-list/task-list.component';
import { Task, TASK_CATEGORIES, TaskFilterCriteria } from './models/task.model';
import { TASKS } from './models/tasks.mock';

@Component({
  imports: [RouterOutlet, TaskDetail, TaskFilters, TaskList],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class App {
  public appName = 'Gestor de Tasques';
  public categories = TASK_CATEGORIES;
  public tasks = TASKS;
  public filteredTasks = TASKS;
  public selectedTask: Task | null = null;

  public applyFilters(criteria: TaskFilterCriteria): void {
    const text = this.normalize(criteria.text);

    this.filteredTasks = this.tasks.filter(
      (task) =>
        (!criteria.category || task.category === criteria.category) &&
        this.normalize(`${task.title} ${task.description}`).includes(text),
    );

    if (this.selectedTask && !this.filteredTasks.includes(this.selectedTask)) {
      this.selectedTask = null;
    }
  }

  public resetFilters(): void {
    this.filteredTasks = this.tasks;
  }

  public selectTask(task: Task): void {
    this.selectedTask = task;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }
}
