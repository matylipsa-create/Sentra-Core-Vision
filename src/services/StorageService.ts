import type { DBSchema, IDBPDatabase } from 'idb';
import type { EVOLISEvidence } from '../core/EVOLIS';
import { openDatabase, withStore } from '../core/IndexedDBHelper';
import { ecdsaVerify, sha256 } from '../lib/crypto';

export interface EvidenceDeltaBatch {
  formatVersion: 1;
  sourceId: string;
  fromIndex: number;
  toIndex: number;
  previousHash: string;
  endingHash: string;
  createdAt: number;
  entries: EVOLISEvidence[];
}

export interface EvidenceSyncCursor {
  peerId: string;
  sourceId: string;
  direction: 'inbound' | 'outbound';
  lastIndex: number;
  lastHash: string;
  updatedAt: number;
}

export interface SyncedEvidenceRecord {
  id: string;
  sourceId: string;
  evidence: EVOLISEvidence;
}

interface SentraDB extends DBSchema {
  evolis: { key: string; value: EVOLISEvidence };
  evolis_keys: { key: string; value: { publicKey: string; privateKey: string } };
  state: { key: string; value: unknown };
  settings: { key: string; value: unknown };
  sync_cursors: { key: string; value: EvidenceSyncCursor };
  sync_evidence: { key: string; value: SyncedEvidenceRecord };
}

const DB_NAME = 'sentra-core';
const DB_VERSION = 3;
const GENESIS_HASH = '0'.repeat(64);
const MAX_DELTA_ENTRIES = 500;

export class StorageService {
  private db: IDBPDatabase<SentraDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    this.db = await openDatabase<SentraDB>(DB_NAME, DB_VERSION, (db) => {
      if (!db.objectStoreNames.contains('evolis')) db.createObjectStore('evolis', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('evolis_keys')) db.createObjectStore('evolis_keys');
      if (!db.objectStoreNames.contains('state')) db.createObjectStore('state');
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
      if (!db.objectStoreNames.contains('sync_cursors')) db.createObjectStore('sync_cursors');
      if (!db.objectStoreNames.contains('sync_evidence')) {
        db.createObjectStore('sync_evidence', { keyPath: 'id' });
      }
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

  async getSyncedEvidence(sourceId?: string): Promise<SyncedEvidenceRecord[]> {
    await this.init();
    const records = await withStore(this.db!, 'sync_evidence', 'readonly', (store) => store.getAll());
    return sourceId ? records.filter((record) => record.sourceId === sourceId) : records;
  }

  async exportEvidenceDelta(sourceId: string, afterIndex = -1, limit = 200): Promise<EvidenceDeltaBatch> {
    if (!sourceId.trim()) throw new Error('Sync source id cannot be empty');
    if (!Number.isInteger(afterIndex) || afterIndex < -1) throw new Error('Invalid evidence cursor');
    if (!Number.isFinite(limit) || limit < 1) throw new Error('Invalid evidence delta limit');
    const safeLimit = Math.min(MAX_DELTA_ENTRIES, Math.floor(limit));
    const entries = (await this.getAllEvidence()).sort((a, b) => a.entry.index - b.entry.index);
    const tailIndex = entries.at(-1)?.entry.index ?? -1;
    if (afterIndex > tailIndex) throw new Error('Evidence cursor is ahead of the local chain');
    const previousEntry = afterIndex === -1 ? undefined : entries.find(({ entry }) => entry.index === afterIndex);
    if (afterIndex !== -1 && !previousEntry) throw new Error('Evidence cursor is not on the local chain');
    const deltaEntries = entries.filter(({ entry }) => entry.index > afterIndex).slice(0, safeLimit);
    const previousHash = previousEntry?.entry.hash ?? GENESIS_HASH;

    return {
      formatVersion: 1,
      sourceId,
      fromIndex: afterIndex + 1,
      toIndex: deltaEntries.at(-1)?.entry.index ?? afterIndex,
      previousHash,
      endingHash: deltaEntries.at(-1)?.entry.hash ?? previousHash,
      createdAt: Date.now(),
      entries: deltaEntries,
    };
  }

  async exportEvidenceDeltaForPeer(peerId: string, sourceId: string, limit = 200): Promise<EvidenceDeltaBatch> {
    const cursor = await this.loadSyncCursor(peerId, 'outbound');
    if (cursor && cursor.sourceId !== sourceId) throw new Error('Sync cursor belongs to a different source');
    const batch = await this.exportEvidenceDelta(sourceId, cursor?.lastIndex ?? -1, limit);
    if (cursor && batch.previousHash !== cursor.lastHash) throw new Error('Outbound cursor no longer matches the local chain');
    return batch;
  }

  async applyEvidenceDelta(batch: EvidenceDeltaBatch, peerId = batch.sourceId): Promise<number> {
    if (batch.formatVersion !== 1 || !batch.sourceId || !peerId || !Array.isArray(batch.entries)) {
      throw new Error('Invalid evidence delta format');
    }
    if (batch.entries.length > MAX_DELTA_ENTRIES) throw new Error('Evidence delta exceeds the entry limit');
    if (batch.entries.length === 0) {
      if (batch.toIndex < -1 || batch.fromIndex !== batch.toIndex + 1 || batch.endingHash !== batch.previousHash) {
        throw new Error('Invalid empty evidence delta');
      }
      const cursor = await this.loadSyncCursor(peerId, 'inbound');
      const expectedIndex = cursor?.lastIndex ?? -1;
      const expectedHash = cursor?.lastHash ?? GENESIS_HASH;
      if (batch.toIndex !== expectedIndex || batch.endingHash !== expectedHash) {
        throw new Error('Empty evidence delta does not match the inbound cursor');
      }
      return batch.toIndex;
    }

    if (batch.fromIndex !== batch.entries[0].entry.index
      || batch.toIndex !== batch.entries.at(-1)?.entry.index
      || batch.previousHash !== batch.entries[0].entry.previousHash
      || batch.endingHash !== batch.entries.at(-1)?.entry.hash) {
      throw new Error('Evidence delta metadata does not match its entries');
    }

    const priorCursor = await this.loadSyncCursor(peerId, 'inbound');
    if (priorCursor && priorCursor.sourceId !== batch.sourceId) {
      throw new Error('Inbound cursor belongs to a different source');
    }
    await this.init();
    const remoteRecords = await this.getSyncedEvidence(batch.sourceId);
    const localEntries = remoteRecords.map((record) => record.evidence).sort((a, b) => a.entry.index - b.entry.index);
    const localByIndex = new Map(localEntries.map((evidence) => [evidence.entry.index, evidence]));
    let expectedIndex = localEntries.at(-1)?.entry.index ?? -1;
    let expectedHash = localEntries.at(-1)?.entry.hash ?? GENESIS_HASH;
    const additions: SyncedEvidenceRecord[] = [];

    for (const evidence of batch.entries) {
      const { entry, signature } = evidence;
      if (entry.index <= expectedIndex) {
        const existing = localByIndex.get(entry.index);
        if (existing?.id !== evidence.id || existing.entry.hash !== entry.hash) {
          throw new Error(`Conflicting evidence at index ${entry.index}`);
        }
        const composite = `${entry.index}:${entry.previousHash}:${entry.timestamp}:${entry.data}`;
        if (await sha256(composite) !== entry.hash) throw new Error(`Invalid evidence hash at index ${entry.index}`);
        const signedMessage = `${entry.index}:${entry.hash}:${entry.previousHash}`;
        if (!await ecdsaVerify(signedMessage, signature, signature.publicKey)) {
          throw new Error(`Invalid evidence signature at index ${entry.index}`);
        }
        continue;
      }
      if (entry.index !== expectedIndex + 1 || entry.previousHash !== expectedHash) {
        throw new Error(`Evidence chain gap at index ${entry.index}`);
      }
      const composite = `${entry.index}:${entry.previousHash}:${entry.timestamp}:${entry.data}`;
      if (await sha256(composite) !== entry.hash) throw new Error(`Invalid evidence hash at index ${entry.index}`);
      const signedMessage = `${entry.index}:${entry.hash}:${entry.previousHash}`;
      if (!await ecdsaVerify(signedMessage, signature, signature.publicKey)) {
        throw new Error(`Invalid evidence signature at index ${entry.index}`);
      }
      additions.push({ id: `${batch.sourceId}:${entry.index}`, sourceId: batch.sourceId, evidence });
      expectedIndex = entry.index;
      expectedHash = entry.hash;
    }

    if (additions.length > 0) {
      await withStore(this.db!, 'sync_evidence', 'readwrite', (store) => (
        Promise.all(additions.map((record) => store.put(record)))
      ));
    }
    await this.saveSyncCursor({
      peerId,
      sourceId: batch.sourceId,
      direction: 'inbound',
      lastIndex: expectedIndex,
      lastHash: expectedHash,
      updatedAt: Date.now(),
    });
    return expectedIndex;
  }

  async acknowledgeEvidenceDelta(peerId: string, batch: EvidenceDeltaBatch): Promise<void> {
    const evidence = batch.entries.at(-1);
    if (!peerId || !batch.sourceId || !evidence || evidence.entry.hash !== batch.endingHash) {
      throw new Error('Invalid evidence delta acknowledgement');
    }
    const previous = await this.loadSyncCursor(peerId, 'outbound');
    if (previous && previous.sourceId !== batch.sourceId) throw new Error('Sync cursor belongs to a different source');
    if (previous && batch.toIndex < previous.lastIndex) throw new Error('Acknowledgement cursor cannot move backwards');
    await this.saveSyncCursor({
      peerId,
      sourceId: batch.sourceId,
      direction: 'outbound',
      lastIndex: batch.toIndex,
      lastHash: batch.endingHash,
      updatedAt: Date.now(),
    });
  }

  async saveSyncCursor(cursor: EvidenceSyncCursor): Promise<void> {
    if (!cursor.peerId || !cursor.sourceId || cursor.lastIndex < -1) throw new Error('Invalid sync cursor');
    await this.init();
    await withStore(this.db!, 'sync_cursors', 'readwrite', (store) => (
      store.put(cursor, `${cursor.direction}:${cursor.peerId}`)
    ));
  }

  async loadSyncCursor(peerId: string, direction: EvidenceSyncCursor['direction'] = 'inbound'): Promise<EvidenceSyncCursor | undefined> {
    await this.init();
    return withStore(this.db!, 'sync_cursors', 'readonly', (store) => store.get(`${direction}:${peerId}`));
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
    syncedEvidence: SyncedEvidenceRecord[];
    syncCursors: EvidenceSyncCursor[];
    state: { key: string; value: unknown }[];
    settings: { key: string; value: unknown }[];
  }> {
    await this.init();
    const evidence = await withStore(this.db!, 'evolis', 'readonly', (store) => store.getAll());
    const syncedEvidence = await withStore(this.db!, 'sync_evidence', 'readonly', (store) => store.getAll());
    const syncCursorKeys = await withStore(this.db!, 'sync_cursors', 'readonly', (store) => store.getAllKeys());
    const syncCursorRecords = await Promise.all(syncCursorKeys.map((key) => (
      withStore(this.db!, 'sync_cursors', 'readonly', (store) => store.get(key))
    )));
    const syncCursors = syncCursorRecords.filter((cursor): cursor is EvidenceSyncCursor => cursor !== undefined);
    const stateKeys = await withStore(this.db!, 'state', 'readonly', (store) => store.getAllKeys());
    const state = await Promise.all(
      stateKeys.map(async (key) => ({ key: key as string, value: await withStore(this.db!, 'state', 'readonly', (store) => store.get(key)) }))
    );
    const settingKeys = await withStore(this.db!, 'settings', 'readonly', (store) => store.getAllKeys());
    const settings = await Promise.all(
      settingKeys.map(async (key) => ({ key: key as string, value: await withStore(this.db!, 'settings', 'readonly', (store) => store.get(key)) }))
    );
    return { evidence, syncedEvidence, syncCursors, state, settings };
  }

  async importAll(data: {
    evidence: EVOLISEvidence[];
    syncedEvidence?: SyncedEvidenceRecord[];
    syncCursors?: EvidenceSyncCursor[];
    state: { key: string; value: unknown }[];
    settings: { key: string; value: unknown }[];
  }): Promise<void> {
    await this.init();
    await withStore(this.db!, 'evolis', 'readwrite', (store) => Promise.all([
      store.clear(),
      ...data.evidence.map((evidence) => store.put(evidence)),
    ]));
    await withStore(this.db!, 'state', 'readwrite', (store) => Promise.all([
      store.clear(),
      ...data.state.map((item) => store.put(item.value, item.key)),
    ]));
    await withStore(this.db!, 'settings', 'readwrite', (store) => Promise.all([
      store.clear(),
      ...data.settings.map((setting) => store.put(setting.value, setting.key)),
    ]));
    await withStore(this.db!, 'sync_evidence', 'readwrite', (store) => Promise.all([
      store.clear(),
      ...(data.syncedEvidence ?? []).map((record) => store.put(record)),
    ]));
    await withStore(this.db!, 'sync_cursors', 'readwrite', (store) => Promise.all([
      store.clear(),
      ...(data.syncCursors ?? []).map((cursor) => store.put(cursor, `${cursor.direction}:${cursor.peerId}`)),
    ]));
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