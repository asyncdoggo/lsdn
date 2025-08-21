import type { TextToImageOptions } from '../textToImageGenerator';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  options: TextToImageOptions & { model: string };
  previewUrl?: string;
}

const DB_NAME = 'TextToImageDB';
const DB_VERSION = 1;
const STORE_NAME = 'historyEntries';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (_event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  return openDatabase().then(db => {
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      callback(store)
        .then(resolve)
        .catch(reject);

      transaction.onerror = () => reject(transaction.error);
    });
  });
}

export class History {
  private static instance: History;
  private readonly maxEntries = 10;

  private constructor() {}

  static getInstance(): History {
    if (!History.instance) {
      History.instance = new History();
    }
    return History.instance;
  }

  async addEntry(options: TextToImageOptions & { model: string }): Promise<string> {
    const id = crypto.randomUUID();
    const entry: HistoryEntry = {
      id,
      timestamp: Date.now(),
      options,
      previewUrl: undefined
    };

    const entries = await this.getEntries();
    entries.unshift(entry);

    // Enforce maxEntries
    const trimmed = entries.slice(0, this.maxEntries);

    await withStore('readwrite', async (store) => {
      for (const e of trimmed) {
        store.put(e);
      }
      // Delete extras from DB
      for (const e of entries.slice(this.maxEntries)) {
        store.delete(e.id);
      }
    });

    return id;
  }

  async updateEntry(id: string, updates: Partial<HistoryEntry>): Promise<void> {
    await withStore('readwrite', async (store) => {
      return new Promise<void>((resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const existing = getRequest.result;
          if (!existing) return resolve();

          const updated = { ...existing, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    });
  }

  async getEntries(): Promise<HistoryEntry[]> {
    return withStore('readonly', (store) => {
      return new Promise<HistoryEntry[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const sorted = request.result.sort((a, b) => b.timestamp - a.timestamp);
          resolve(sorted);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getEntry(id: string): Promise<HistoryEntry | undefined> {
    return withStore('readonly', (store) => {
      return new Promise<HistoryEntry | undefined>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async clear(): Promise<void> {
    return withStore('readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }
}
