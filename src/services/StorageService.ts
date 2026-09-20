import type { DBSchema, IDBPDatabase } from 'idb';
import type { EVOLISEvidence } from '../core/EVOLIS';
import { openDatabase, withStore } from '../core/IndexedDBHelper';

interface SentraDB extends DBSchema {
  evolis: { key: string; value: EVOLISEvidence };
  evolis_keys: { key: string; value: { publicKey: string; privateKey: string } };
  state: { key: string; value: unknown };
  settings: { key: string; value: unknown };
}

const DB_NAME = 'sentra-core';
const DB_VERSION = 2;

export class StorageService {
  private db: IDBPDatabase<SentraDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    this.db = await openDatabase<SentraDB>(DB_NAME, DB_VERSION, (db) => {
      if (!db.objectStoreNames.contains('evolis'))
        db.createObjectStore('evolis', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('evolis_keys'))
        db.createObjectStore('evolis_keys');
      if (!db.objectStoreNames.contains('state'))
        db.createObjectStore('state');
      if (!db.objectStoreNames.contains('settings'))
        db.createObjectStore('settings');
    });
  }

  async saveEvidence(evidence: EVOLISEvidence): Promise<void> {
    await this.init();
    await withStore(this.db!, 'evolis', 'readwrite', (store) => store.put(evidence));
  }

  async getAllEvidence(): Promise<EVOLISEvidence[]> {
    await this.init();
    return withStore(this.db!, 'evolis', 'readonly', (store) => store.getAll());
  }

  async clearEvidence(): Promise<void> {
    await this.init();
    await withStore(this.db!, 'evolis', 'readwrite', (store) => store.clear());
  }

  async saveState(key: string, value: unknown): Promise<void> {
    await this.init();
    await withStore(this.db!, 'state', 'readwrite', (store) => store.put(value, key));
  }

  async loadState<T>(key: string): Promise<T | undefined> {
    await this.init();
    return withStore(this.db!, 'state', 'readonly', (store) => store.get(key) as Promise<T | undefined>);
  }

  async saveSetting(key: string, value: unknown): Promise<void> {
    await this.init();
    await withStore(this.db!, 'settings', 'readwrite', (store) => store.put(value, key));
  }

  async loadSetting<T>(key: string): Promise<T | undefined> {
    await this.init();
    return withStore(this.db!, 'settings', 'readonly', (store) => store.get(key) as Promise<T | undefined>);
  }

  async saveEvolisKey(key: { publicKey: string; privateKey: string }): Promise<void> {
    await this.init();
    await withStore(this.db!, 'evolis_keys', 'readwrite', (store) => store.put(key, 'signing-key'));
  }

  async loadEvolisKey(): Promise<{ publicKey: string; privateKey: string } | undefined> {
    await this.init();
    return withStore(this.db!, 'evolis_keys', 'readonly', (store) => store.get('signing-key'));
  }

  async exportAll(): Promise<{
    evidence: EVOLISEvidence[];
    state: { key: string; value: unknown }[];
    settings: { key: string; value: unknown }[];
  }> {
    await this.init();
    const evidence = await withStore(this.db!, 'evolis', 'readonly', (store) => store.getAll());
    const stateKeys = await withStore(this.db!, 'state', 'readonly', (store) => store.getAllKeys());
    const state = await Promise.all(
      stateKeys.map(async (key) => ({ key: key as string, value: await withStore(this.db!, 'state', 'readonly', (store) => store.get(key)) }))
    );
    const settingKeys = await withStore(this.db!, 'settings', 'readonly', (store) => store.getAllKeys());
    const settings = await Promise.all(
      settingKeys.map(async (key) => ({ key: key as string, value: await withStore(this.db!, 'settings', 'readonly', (store) => store.get(key)) }))
    );
    return { evidence, state, settings };
  }

  async importAll(data: {
    evidence: EVOLISEvidence[];
    state: { key: string; value: unknown }[];
    settings: { key: string; value: unknown }[];
  }): Promise<void> {
    await this.init();
    await withStore(this.db!, 'evolis', 'readwrite', async (store) => {
      await store.clear();
      for (const evidence of data.evidence) await store.put(evidence);
    });
    await withStore(this.db!, 'state', 'readwrite', async (store) => {
      await store.clear();
      for (const state of data.state) await store.put(state.value, state.key);
    });
    await withStore(this.db!, 'settings', 'readwrite', async (store) => {
      await store.clear();
      for (const setting of data.settings) await store.put(setting.value, setting.key);
    });
  }

  async downloadExport(): Promise<void> {
    const data = await this.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentra-core-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const storageService = new StorageService();
