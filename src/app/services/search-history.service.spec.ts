import { TestBed } from '@angular/core/testing';
import { SEARCH_HISTORY_STORAGE_KEY } from '../config/search.config';
import { SearchHistoryService } from './search-history.service';

describe('SearchHistoryService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('saves valid terms in localStorage, newest first', () => {
    const history = TestBed.inject(SearchHistoryService);
    history.add('angular');
    history.add('  reunio ');

    expect(history.history()).toEqual(['reunio', 'angular']);
    expect(JSON.parse(localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY) ?? '[]')).toEqual([
      'reunio',
      'angular',
    ]);
  });

  it('ignores consecutive duplicates and too short terms', () => {
    const history = TestBed.inject(SearchHistoryService);
    history.add('angular');
    history.add('Angular');
    history.add('ab');

    expect(history.history()).toEqual(['angular']);
  });

  it('keeps only the last five terms', () => {
    const history = TestBed.inject(SearchHistoryService);
    ['uno', 'dos', 'tres', 'quatre', 'cinc', 'sis'].forEach((term) => history.add(term));

    expect(history.history()).toEqual(['sis', 'cinc', 'quatre', 'tres', 'dos']);
  });

  it('restores the history saved in a previous session', () => {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(['compra', 'dentista']));

    expect(TestBed.inject(SearchHistoryService).history()).toEqual(['compra', 'dentista']);
  });

  it('survives corrupted data and localStorage errors', () => {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, '{no és json');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const history = TestBed.inject(SearchHistoryService);
    expect(history.history()).toEqual([]);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => history.add('angular')).not.toThrow();
    expect(history.history()).toEqual(['angular']);
  });
});
