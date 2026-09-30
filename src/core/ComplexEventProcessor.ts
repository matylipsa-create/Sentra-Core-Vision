export type ComplexEventLevel = 'info' | 'warning' | 'critical';

export interface ComplexEventSignal {
  type: string;
  source: string;
  level: ComplexEventLevel;
  timestamp: number;
  payload?: Record<string, unknown>;
}

export interface ComplexEventRule {
  id: string;
  windowMs: number;
  minEvents: number;
  distinctBy?: (signal: ComplexEventSignal) => string;
  matches: (signal: ComplexEventSignal) => boolean;
}

export interface ComplexEventMatch {
  ruleId: string;
  matchedAt: number;
  signals: ComplexEventSignal[];
}

export class ComplexEventProcessor {
  private readonly rules = new Map<string, ComplexEventRule>();
  private readonly signals: ComplexEventSignal[] = [];
  private readonly lastFiredAt = new Map<string, number>();
  private readonly maxSignals = 1000;

  registerRule(rule: ComplexEventRule): void {
    if (!rule.id.trim() || rule.windowMs <= 0 || rule.minEvents < 1) {
      throw new Error('Invalid complex event rule');
    }
    this.rules.set(rule.id, rule);
  }

  unregisterRule(id: string): boolean {
    this.lastFiredAt.delete(id);
    return this.rules.delete(id);
  }

  process(signal: ComplexEventSignal): ComplexEventMatch[] {
    const now = signal.timestamp;
    this.signals.push(signal);
    if (this.signals.length > this.maxSignals) this.signals.splice(0, this.signals.length - this.maxSignals);
    this.prune(now);

    const matches: ComplexEventMatch[] = [];
    for (const rule of this.rules.values()) {
      if (!rule.matches(signal)) continue;
      const candidates = this.signals.filter((candidate) => (
        candidate.timestamp >= now - rule.windowMs
        && candidate.timestamp <= now
        && rule.matches(candidate)
      ));
      const distinct = new Map<string, ComplexEventSignal>();
      for (const candidate of candidates) {
        distinct.set(rule.distinctBy?.(candidate) ?? candidate.source, candidate);
      }
      if (distinct.size < rule.minEvents) continue;
      const lastFiredAt = this.lastFiredAt.get(rule.id) ?? 0;
      if (now - lastFiredAt < rule.windowMs) continue;
      this.lastFiredAt.set(rule.id, now);
      matches.push({ ruleId: rule.id, matchedAt: now, signals: [...distinct.values()] });
    }
    return matches;
  }

  clear(): void {
    this.signals.length = 0;
    this.lastFiredAt.clear();
  }

  getStats(): { recentSignals: number; ruleCount: number } {
    return { recentSignals: this.signals.length, ruleCount: this.rules.size };
  }

  private prune(now: number): void {
    const maxWindow = Math.max(0, ...Array.from(this.rules.values(), (rule) => rule.windowMs));
    while (this.signals.length > 0 && this.signals[0].timestamp < now - maxWindow) {
      this.signals.shift();
    }
  }
}