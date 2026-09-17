import {
  HashChainEntry,
  createHashChainEntry,
  verifyHashChain,
  DilithiumSignature,
  dilithiumSign,
  dilithiumVerify,
  generateDilithiumKeyPair,
  uuidv4,
} from '../lib/crypto';
import type { Decision } from './InflectionNode';

export type ChainIntegrityListener = (valid: boolean) => void;

export interface EVOLISEvidence {
  id: string;
  entry: HashChainEntry;
  signature: DilithiumSignature;
  module: string;
  action: string;
}

export interface EVOLISStats {
  totalEntries: number;
  verified: boolean;
  firstEntry: number | null;
  lastEntry: number | null;
  modules: string[];
}

export interface EventRecord {
  id: string;
  type: string;
  module: string;
  action: string;
  timestamp: number;
  data: string;
}

export interface EventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  averageFrequencyPerHour: number;
}

const GENESIS_HASH = '0'.repeat(64);

function serializeData(value: unknown): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(value, (_key, nestedValue: unknown) => {
    if (typeof nestedValue === 'bigint') return { $bigint: nestedValue.toString() };
    if (nestedValue && typeof nestedValue === 'object') {
      if (seen.has(nestedValue)) return '[Circular]';
      seen.add(nestedValue);
    }
    return nestedValue;
  });
}

export class EVOLIS {
  private entries: EVOLISEvidence[] = [];
  private publicKey: string = '';
  private privateKey: string = '';
  private integrityListeners: Set<ChainIntegrityListener> = new Set();

  async initialize(): Promise<void> {
    if (this.publicKey) return;
    const pair = await generateDilithiumKeyPair();
    this.publicKey = pair.publicKey;
    this.privateKey = pair.privateKey;
  }

  async record(module: string, action: string, data: string): Promise<EVOLISEvidence> {
    await this.initialize();
    const index = this.entries.length;
    const previousHash = index === 0 ? GENESIS_HASH : this.entries[index - 1].entry.hash;
    const entry = await createHashChainEntry(index, previousHash, `${module}:${action}:${data}`);
    const message = `${entry.index}:${entry.hash}:${entry.previousHash}`;
    const signature = await dilithiumSign(message, this.privateKey);
    signature.publicKey = this.publicKey;
    const evidence: EVOLISEvidence = {
      id: uuidv4(),
      entry,
      signature,
      module,
      action,
    };
    this.entries.push(evidence);
    return evidence;
  }

  onIntegrityViolation(listener: ChainIntegrityListener): () => void {
    this.integrityListeners.add(listener);
    return () => this.integrityListeners.delete(listener);
  }

  async registerUSBEvent(event: string): Promise<EVOLISEvidence> {
    return this.record('guardian', 'usb_event', event);
  }

  async registerDecision(decision: Decision, nodeId: string): Promise<void> {
    await this.record('sovereignty', 'decision', serializeData({ nodeId, decision }));
  }

  async registerReversion(nodeId: string, reason: string): Promise<void> {
    await this.record('sovereignty', 'reversion', serializeData({ nodeId, reason }));
  }

  async verifyChainIntegrity(): Promise<boolean> {
    return this.verify();
  }

  onChainBreach(): void {
    this.notifyIntegrityListeners(false);
  }

  async verify(): Promise<boolean> {
    if (this.entries.length === 0) return true;
    const chain = this.entries.map((e) => e.entry);
    const chainValid = await verifyHashChain(chain);
    if (!chainValid) {
      this.notifyIntegrityListeners(false);
      return false;
    }
    for (const evidence of this.entries) {
      const message = `${evidence.entry.index}:${evidence.entry.hash}:${evidence.entry.previousHash}`;
      const sigValid = await dilithiumVerify(message, evidence.signature, this.publicKey);
      if (!sigValid) {
        this.notifyIntegrityListeners(false);
        return false;
      }
    }
    return true;
  }

  private notifyIntegrityListeners(valid: boolean): void {
    if (!valid) {
      for (const listener of this.integrityListeners) listener(false);
    }
  }

  getEntries(): EVOLISEvidence[] {
    return [...this.entries];
  }

  getEventsByType(type: string, limit = 100): EventRecord[] {
    const normalized = type.toLowerCase();
    return this.entries
      .filter((event) => {
        const module = (event.module ?? '').toLowerCase();
        const action = (event.action ?? '').toLowerCase();
        return module === normalized || action.includes(normalized);
      })
      .slice(-limit)
      .map((event) => ({
        id: event.id,
        type: event.module,
        module: event.module,
        action: event.action,
        timestamp: event.entry.timestamp,
        data: event.entry.data,
      }));
  }

  getEventsByTimeRange(startTime: number, endTime: number): EventRecord[] {
    return this.entries
      .filter((event) => {
        const ts = event.entry.timestamp;
        return ts >= startTime && ts <= endTime;
      })
      .map((event) => ({
        id: event.id,
        type: event.module,
        module: event.module,
        action: event.action,
        timestamp: event.entry.timestamp,
        data: event.entry.data,
      }));
  }

  getEventStats(): EventStats {
    const eventsByType: Record<string, number> = {};
    for (const entry of this.entries) {
      const label = entry.module || 'unknown';
      eventsByType[label] = (eventsByType[label] ?? 0) + 1;
    }

    const totalEvents = this.entries.length;
    const averageFrequencyPerHour = totalEvents === 0 ? 0 : totalEvents / Math.max(1, this.getTimeSpanHours());

    return {
      totalEvents,
      eventsByType,
      averageFrequencyPerHour,
    };
  }

  private getTimeSpanHours(): number {
    if (this.entries.length < 2) return 1;
    const minTs = Math.min(...this.entries.map((e) => e.entry.timestamp));
    const maxTs = Math.max(...this.entries.map((e) => e.entry.timestamp));
    const diffMs = Math.max(1, maxTs - minTs);
    return diffMs / (1000 * 60 * 60);
  }

  async getStats(): Promise<EVOLISStats> {
    const modules = [...new Set(this.entries.map((e) => e.module))];
    const verified = await this.verify();
    return {
      totalEntries: this.entries.length,
      verified,
      firstEntry: this.entries.length > 0 ? this.entries[0].entry.timestamp : null,
      lastEntry: this.entries.length > 0 ? this.entries[this.entries.length - 1].entry.timestamp : null,
      modules,
    };
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  exportState(): EVOLISEvidence[] {
    return JSON.parse(this.exportChain()) as EVOLISEvidence[];
  }

  exportChain(): string {
    return serializeData(this.entries);
  }

  importState(entries: EVOLISEvidence[]): void {
    this.entries = JSON.parse(JSON.stringify(entries));
  }

  clear(): void {
    this.entries = [];
    this.publicKey = '';
    this.privateKey = '';
  }

  async registerIdentityEvent(eventType: string, data: string): Promise<EVOLISEvidence> {
    return this.record('identity', eventType, data);
  }

  getIdentityHistory(): EVOLISEvidence[] {
    return this.entries.filter((e) => e.module === 'identity');
  }

  async verifyIdentityChain(): Promise<boolean> {
    const identityEntries = this.getIdentityHistory();
    if (identityEntries.length === 0) return true;
    const chain = identityEntries.map((e) => e.entry);
    const chainValid = await verifyHashChain(chain);
    if (!chainValid) return false;
    for (const evidence of identityEntries) {
      const message = `${evidence.entry.index}:${evidence.entry.hash}:${evidence.entry.previousHash}`;
      const sigValid = await dilithiumVerify(message, evidence.signature, this.publicKey);
      if (!sigValid) return false;
    }
    return true;
  }

  exportIdentity(): string {
    const identityEntries = this.getIdentityHistory();
    return serializeData(identityEntries);
  }

  importIdentity(data: string): boolean {
    try {
      const parsed = JSON.parse(data) as EVOLISEvidence[];
      if (!Array.isArray(parsed)) return false;
      const existingIds = new Set(this.entries.map((e) => e.id));
      for (const entry of parsed) {
        if (entry.module === 'identity' && !existingIds.has(entry.id)) {
          this.entries.push(entry);
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const evolis = new EVOLIS();
