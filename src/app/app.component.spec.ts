import { TestBed } from '@angular/core/testing';
import { App } from './app.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gestor de Tasques');
  });

  it('should combine text and category filters', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.applyFilters({ text: 'reunio', category: 'Feina' });
    expect(app.filteredTasks.map((task) => task.id)).toEqual([2]);
    app.applyFilters({ text: 'reunio', category: 'Casa' });
    expect(app.filteredTasks).toEqual([]);
  });

  it('should clear the selection when the selected task is filtered out', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.selectTask(app.tasks[0]);
    app.applyFilters({ text: 'passaport', category: '' });
    expect(app.selectedTask).toBeNull();
  });

  it('should restore the full list when filters are reset', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.applyFilters({ text: 'passaport', category: '' });
    app.resetFilters();
    expect(app.filteredTasks.length).toBe(app.tasks.length);
  });
});
