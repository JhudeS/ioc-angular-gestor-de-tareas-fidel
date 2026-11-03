import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskBadge } from '../task-badge/task-badge.component';

@Component({
  imports: [DatePipe, TaskBadge],
  selector: 'app-task-detail',
  styleUrl: './task-detail.component.scss',
  templateUrl: './task-detail.component.html',
})
export class TaskDetail {
  @Input() public task: Task | null = null;
}
