/**
 * FailoverManager — Gestor de fallos locales.
 *
 * Redirige el flujo a nodos secundarios internos si algo falla.
 * Mantiene historial de errores y estado de failover.
 */

import { offlineLogger } from './OfflineLogger';
import { eventRouter } from './EventRouter';
import { powerManager } from './PowerManager';

export type FailoverState = 'stable' | 'degraded' | 'backup_active' | 'critical';

export interface FailoverEntry {
  id: string;
  error: string;
  timestamp: number;
  backupUsed: boolean;
  resolved: boolean;
}

export interface FailoverStatus {
  state: FailoverState;
  totalErrors: number;
  activeBackups: number;
  lastError: FailoverEntry | null;
  history: FailoverEntry[];
}

type BackupFn = (error: Error) => Promise<boolean>;
type FailoverListener = (status: FailoverStatus) => void;

const MAX_HISTORY = 50;

class FailoverManager {
  private backups = new Map<string, BackupFn>();
  private state: FailoverState = 'stable';
  private totalErrors = 0;
  private history: FailoverEntry[] = [];
  private listeners = new Set<FailoverListener>();
  private energyFailoverState: 'grid' | 'harvesting' | 'battery' = 'battery';

  registerBackup(id: string, fn: BackupFn): void {
    this.backups.set(id, fn);
  }

  onError(error: Error): void {
    this.totalErrors++;
    const entry: FailoverEntry = {
      id: this.generateId(),
      error: error.message,
      timestamp: Date.now(),
      backupUsed: false,
      resolved: false,
    };

    offlineLogger.log({
      type: 'failover_error',
      message: error.message,
      error: error.message,
    });

    this.tryBackups(error, entry);
    this.history.unshift(entry);
    if (this.history.length > MAX_HISTORY) this.history.pop();
    this.updateState();
    this.notify();
  }

  switchToBackup(): void {
    this.state = 'backup_active';
    eventRouter.sendAlert('warning', 'Cambiando a nodo secundario de respaldo');
    offlineLogger.log({ type: 'failover_switch', message: 'Cambio a backup manual' });
    this.notify();
  }

  onGridFailure(): void {
    powerManager.setEnergySource('harvesting');
    this.energyFailoverState = 'harvesting';
  }

  onGridRestore(): void {
    powerManager.setEnergySource('grid');
    this.energyFailoverState = 'grid';
  }

  getFailoverState(): 'grid' | 'harvesting' | 'battery' {
    return this.energyFailoverState;
  }

  getFailoverStatus(): FailoverStatus {
    return {
      state: this.state,
      totalErrors: this.totalErrors,
      activeBackups: this.backups.size,
      lastError: this.history[0] ?? null,
      history: [...this.history],
    };
  }

  subscribe(listener: FailoverListener): () => void {
    this.listeners.add(listener);
    listener(this.getFailoverStatus());
    return () => this.listeners.delete(listener);
  }

  reset(): void {
    this.state = 'stable';
    this.totalErrors = 0;
    this.history = [];
    this.notify();
  }

  private async tryBackups(error: Error, entry: FailoverEntry): Promise<void> {
    for (const [id, fn] of this.backups) {
      try {
        const ok = await fn(error);
        if (ok) {
          entry.backupUsed = true;
          entry.resolved = true;
          offlineLogger.log({ type: 'failover_resolved', message: `Backup ${id} resolvio el error` });
          return;
        }
      } catch {
        // try next backup
      }
    }
    entry.resolved = false;
    eventRouter.sendAlert('critical', `Fallo sin backup disponible: ${error.message}`);
  }

  private updateState(): void {
    const recentUnresolved = this.history
      .slice(0, 5)
      .filter((e) => !e.resolved);
    if (recentUnresolved.length >= 3) {
      this.state = 'critical';
    } else if (recentUnresolved.length >= 1) {
      this.state = 'degraded';
    } else if (this.history.length > 0 && this.history[0].backupUsed) {
      this.state = 'backup_active';
    } else {
      this.state = 'stable';
    }
  }

  private notify(): void {
    const status = this.getFailoverStatus();
    for (const listener of this.listeners) listener(status);
  }

  private generateId(): string {
    return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  }
}

export const failoverManager = new FailoverManager();
