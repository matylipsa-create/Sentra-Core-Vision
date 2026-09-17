import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { InflectionNode } from './InflectionNode';
import type { Decision } from './InflectionNode';

interface SovereigntyDB extends DBSchema {
  inflection_nodes: {
    key: string;
    value: InflectionNode;
    indexes: { timestamp: number };
  };
  decision_history: {
    key: string;
    value: Decision;
    indexes: { timestamp: number; type: string };
  };
}

const DB_NAME = 'sentra-sovereignty';
const DB_VERSION = 1;

export function openSovereigntyDB(): Promise<IDBPDatabase<SovereigntyDB>> {
  return openDB<SovereigntyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('inflection_nodes')) {
        const nodes = db.createObjectStore('inflection_nodes', { keyPath: 'id' });
        nodes.createIndex('timestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('decision_history')) {
        const decisions = db.createObjectStore('decision_history', { keyPath: 'id' });
        decisions.createIndex('timestamp', 'timestamp');
        decisions.createIndex('type', 'type');
      }
    },
  });
}