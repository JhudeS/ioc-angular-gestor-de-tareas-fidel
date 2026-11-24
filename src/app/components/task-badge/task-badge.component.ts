import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-task-badge',
  styleUrl: './task-badge.component.scss',
  template: `<span class="badge" [class.featured]="featured" [class.status]="status">{{ label }}</span>`,
})
export class TaskBadge {
  @Input({ required: true }) public label = '';
  @Input() public featured = false;
  @Input() public status = false;
}
