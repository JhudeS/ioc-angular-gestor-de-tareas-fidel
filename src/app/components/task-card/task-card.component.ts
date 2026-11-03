import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskBadge } from '../task-badge/task-badge.component';

@Component({
  imports: [DatePipe, TaskBadge],
  selector: 'app-task-card',
  styleUrl: './task-card.component.scss',
  templateUrl: './task-card.component.html',
})
export class TaskCard {
  @Input({ required: true }) public task!: Task;
  @Input() public selected = false;
  @Output() public taskSelected = new EventEmitter<Task>();
}
