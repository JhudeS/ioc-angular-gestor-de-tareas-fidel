import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TaskCategory, TaskFilterCriteria } from '../../models/task.model';

@Component({
  imports: [FormsModule],
  selector: 'app-task-filters',
  styleUrl: './task-filters.component.scss',
  templateUrl: './task-filters.component.html',
})
export class TaskFilters {
  @Input({ required: true }) public categories: readonly TaskCategory[] = [];
  @Output() public filtersApplied = new EventEmitter<TaskFilterCriteria>();
  @Output() public filtersReset = new EventEmitter<void>();

  public text = '';
  public category: TaskCategory | '' = '';

  public applyFilters(): void {
    this.filtersApplied.emit({ text: this.text, category: this.category });
  }

  public resetFilters(form: NgForm): void {
    form.resetForm({ text: '', category: '' });
    this.filtersReset.emit();
  }
}
