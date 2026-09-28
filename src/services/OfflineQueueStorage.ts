import type { DBSchema, IDBPDatabase } from 'idb';
import { openDatabase, withStore } from '../core/IndexedDBHelper';

export interface TCREICommand {
  type: 'command';
  module: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: number;
  id: string;
}

export interface OfflineQueueEntry {
  id?: number;
  queuedAt: number;
  message: TCREICommand;
}

interface OfflineQueueDB extends DBSchema {
  outbox: {
    key: number;
    value: OfflineQueueEntry;
    indexes: { 'by-queued-at': number };
  };
}

const DB_NAME = 'sentra-offline-outbox';
const DB_VERSION = 1;

export class OfflineQueueStorage {
  private dbPromise: Promise<IDBPDatabase<OfflineQueueDB>> | null = null;

  private open(): Promise<IDBPDatabase<OfflineQueueDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDatabase<OfflineQueueDB>(DB_NAME, DB_VERSION, (db) => {
        if (!db.objectStoreNames.contains('outbox')) {
          const store = db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by-queued-at', 'queuedAt');
        }
      }).catch((error: unknown) => {
        this.dbPromise = null;
        throw error;
      });
    }
    return this.dbPromise;
  }

  async enqueue(message: TCREICommand): Promise<OfflineQueueEntry> {
    const db = await this.open();
    const entry: OfflineQueueEntry = { queuedAt: Date.now(), message };
    const id = await withStore(db, 'outbox', 'readwrite', (store) => store.add(entry));
    return { ...entry, id };
  }

  async list(): Promise<OfflineQueueEntry[]> {
    const db = await this.open();
    return withStore(db, 'outbox', 'readonly', (store) => store.index('by-queued-at').getAll());
  }

  async remove(id: number): Promise<void> {
    const db = await this.open();
    await withStore(db, 'outbox', 'readwrite', (store) => store.delete(id));
  }

  async count(): Promise<number> {
    const db = await this.open();
    return withStore(db, 'outbox', 'readonly', (store) => store.count());
  }
}

export const offlineQueueStorage = new OfflineQueueStorage();
