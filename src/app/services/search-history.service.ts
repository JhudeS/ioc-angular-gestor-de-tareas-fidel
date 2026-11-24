import { Injectable, signal } from '@angular/core';
import {
  MIN_SEARCH_LENGTH,
  SEARCH_HISTORY_MAX_ITEMS,
  SEARCH_HISTORY_STORAGE_KEY,
} from '../config/search.config';

@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  private readonly items = signal<string[]>(this.load());

  public readonly history = this.items.asReadonly();

  public add(term: string): void {
    const cleanTerm = term.trim();
    if (cleanTerm.length < MIN_SEARCH_LENGTH) {
      return;
    }

    const current = this.items();
    if (current[0]?.toLowerCase() === cleanTerm.toLowerCase()) {
      return;
    }

    const next = [cleanTerm, ...current].slice(0, SEARCH_HISTORY_MAX_ITEMS);
    this.items.set(next);
    this.save(next);
  }

  public clear(): void {
    this.items.set([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    } catch (error) {
      console.warn("No s'ha pogut esborrar l'historial de cerques.", error);
    }
  }

  private load(): string[] {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed
            .filter((item): item is string => typeof item === 'string')
            .slice(0, SEARCH_HISTORY_MAX_ITEMS)
        : [];
    } catch (error) {
      console.warn("No s'ha pogut llegir l'historial de cerques.", error);
      return [];
    }
  }

  private save(items: string[]): void {
    try {
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("No s'ha pogut desar l'historial de cerques.", error);
    }
  }
}
