/**
 * @fileoverview Primitivas de rendimiento y auditoría para Sentra Core.
 *
 * Proporciona pooling explícito, una cola binaria max-heap y un registro
 * encadenado de snapshots. Las estructuras no dependen de estado global.
 */

import { sha256 } from '../lib/crypto';

export type ResetFunction<T> = (item: T) => void;

export interface ObjectPoolOptions<T> {
  readonly factory: () => T;
  readonly reset: ResetFunction<T>;
  readonly initialSize?: number;
  readonly maxSize?: number;
}

export class ObjectPool<T> {
  private readonly items: T[] = [];
  private readonly factory: () => T;
  private readonly reset: ResetFunction<T>;
  private readonly maxSize: number;

  constructor(options: ObjectPoolOptions<T>) {
    if (!Number.isInteger(options.initialSize) || (options.initialSize ?? 0) < 0) {
      throw new RangeError('ObjectPool initialSize debe ser un entero no negativo.');
    }
    if (!Number.isInteger(options.maxSize) || (options.maxSize ?? 0) <= 0) {
      throw new RangeError('ObjectPool maxSize debe ser un entero positivo.');
    }
    if ((options.initialSize ?? 0) > (options.maxSize ?? 0)) {
      throw new RangeError('ObjectPool initialSize no puede superar maxSize.');
    }

    this.factory = options.factory;
    this.reset = options.reset;
    this.maxSize = options.maxSize ?? 1;
    for (let index = 0; index < (options.initialSize ?? 0); index += 1) {
      this.items.push(this.factory());
    }
  }

  acquire(): T {
    return this.items.pop() ?? this.factory();
  }

  release(item: T): void {
    this.reset(item);
    if (this.items.length < this.maxSize) this.items.push(item);
  }

  size(): number {
    return this.items.length;
  }
}

export interface PrioritizedTask<T> {
  readonly priority: number;
  readonly payload: T;
}

export class MaxPriorityQueue<T> {
  private readonly heap: PrioritizedTask<T>[] = [];

  enqueue(payload: T, priority: number): void {
    if (!Number.isFinite(priority)) {
      throw new RangeError('La prioridad debe ser un número finito.');
    }
    this.heap.push({ payload, priority });
    this.siftUp(this.heap.length - 1);
  }

  dequeue(): T | null {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0 && last) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return top.payload;
  }

  peek(): PrioritizedTask<T> | null {
    return this.heap[0] ?? null;
  }

  size(): number {
    return this.heap.length;
  }

  clear(): void {
    this.heap.length = 0;
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].priority >= this.heap[index].priority) return;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  private siftDown(index: number): void {
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let largest = index;
      if (left < this.heap.length && this.heap[left].priority > this.heap[largest].priority) {
        largest = left;
      }
      if (right < this.heap.length && this.heap[right].priority > this.heap[largest].priority) {
        largest = right;
      }
      if (largest === index) return;
      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

export interface AuditRecord {
  readonly id: string;
  readonly timestamp: number;
  readonly module: string;
  readonly statePayload: Record<string, unknown>;
  readonly previousHash: string;
  readonly signature: string;
}

const GENESIS_HASH = '0'.repeat(64);

export class SecureStateRegistry {
  private readonly state = new Map<string, unknown>();
  private lastHash = GENESIS_HASH;

  set(key: string, value: unknown): void {
    if (key.trim().length === 0) throw new Error('La clave de estado no puede estar vacía.');
    this.state.set(key, value);
  }

  get(key: string): unknown {
    return this.state.get(key);
  }

  delete(key: string): boolean {
    return this.state.delete(key);
  }

  async commitAuditSnapshot(moduleName: string): Promise<AuditRecord> {
    if (moduleName.trim().length === 0) {
      throw new Error('El nombre del módulo no puede estar vacío.');
    }

    const statePayload = Object.fromEntries(this.state);
    const timestamp = Date.now();
    const rawData = `${this.lastHash}:${timestamp}:${moduleName}:${JSON.stringify(statePayload)}`;
    const signature = await sha256(rawData);
    const record: AuditRecord = {
      id: `audit-${timestamp}-${signature.slice(0, 12)}`,
      timestamp,
      module: moduleName,
      statePayload,
      previousHash: this.lastHash,
      signature,
    };
    this.lastHash = signature;
    return record;
  }

  getLastHash(): string {
    return this.lastHash;
  }

  clear(): void {
    this.state.clear();
    this.lastHash = GENESIS_HASH;
  }
}
