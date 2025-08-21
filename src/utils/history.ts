import type { TextToImageOptions } from '../textToImageGenerator';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  options: TextToImageOptions & { model: string };
  previewUrl?: string;
}

export class History {
  private static instance: History;
  private entries: HistoryEntry[] = [];
  private readonly maxEntries = 10;
  private readonly storageKey = 'textToImageHistory';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): History {
    if (!History.instance) {
      History.instance = new History();
    }
    return History.instance;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  addEntry(options: TextToImageOptions & { model: string }): string {
    const id = crypto.randomUUID();
    const entry: HistoryEntry = {
      id,
      timestamp: Date.now(),
      options,
      previewUrl: undefined
    };

    this.entries.unshift(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.pop();
    }

    this.saveToStorage();
    return id;
  }

  updateEntry(id: string, updates: Partial<HistoryEntry>): void {
    const entryIndex = this.entries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;

    this.entries[entryIndex] = {
      ...this.entries[entryIndex],
      ...updates
    };

    this.saveToStorage();
  }

  getEntries(): HistoryEntry[] {
    return [...this.entries];
  }

  getEntry(id: string): HistoryEntry | undefined {
    return this.entries.find(entry => entry.id === id);
  }

  clear(): void {
    this.entries = [];
    this.saveToStorage();
  }
}
