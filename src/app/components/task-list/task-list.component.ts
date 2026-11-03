import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskCard } from '../task-card/task-card.component';

@Component({
  imports: [TaskCard],
  selector: 'app-task-list',
  styleUrl: './task-list.component.scss',
  templateUrl: './task-list.component.html',
})
export class TaskList {
  @Input({ required: true }) public tasks: Task[] = [];
  @Input({ required: true }) public totalTasks = 0;
  @Input() public selectedTaskId: number | null = null;
  @Output() public taskSelected = new EventEmitter<Task>();
}
