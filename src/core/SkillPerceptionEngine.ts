import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { evolis } from './EVOLIS';

export interface UsageContext {
  timestamp: number;
  hour: number;
  dayOfWeek: number;
  approximateLocation: string;
  detectionTypes: string[];
  detectionCount: number;
  loadLevel: 'low' | 'medium' | 'high';
}

export interface Pattern {
  id: string;
  hourRange: [number, number];
  dayOfWeek: number[];
  approximateLocation: string;
  expectedDetections: string[];
  confidence: number;
}

export interface Insight {
  id: string;
  summary: string;
  type: string;
  score: number;
  timestamp: number;
}

export interface DetectionConfig {
  priorityDetections: string[];
  secondaryDetections: string[];
  ignoreDetections: string[];
  minConfidence: number;
  enableAdaptiveScan: boolean;
  quietMode: boolean;
}

interface SkillPatternRecord {
  kind: 'context' | 'pattern';
  id: string;
  timestamp: number;
  context?: UsageContext;
  pattern?: Pattern;
}

interface SkillPatternDB extends DBSchema {
  skill_patterns: {
    key: string;
    value: SkillPatternRecord;
  };
}

const DB_NAME = 'sentra-skill-perception';
const DB_VERSION = 1;
const STORE_NAME = 'skill_patterns';
const LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;

async function openSkillPatternDB(): Promise<IDBPDatabase<SkillPatternDB>> {
  return openDB<SkillPatternDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

function normalizeDetections(detections: string[]): string[] {
  return Array.from(new Set(detections.map((entry) => entry.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export class SkillPerceptionEngine {
  async recordContext(context: UsageContext): Promise<void> {
    const db = await openSkillPatternDB();
    const record: SkillPatternRecord = {
      kind: 'context',
      id: `context-${context.timestamp}-${Math.random().toString(16).slice(2)}`,
      timestamp: context.timestamp,
      context: {
        ...context,
        detectionTypes: normalizeDetections(context.detectionTypes),
        approximateLocation: context.approximateLocation?.trim() || 'ubicación no especificada',
      },
    };

    await db.put(STORE_NAME, record);
  }

  async detectPattern(): Promise<Pattern | null> {
    const db = await openSkillPatternDB();
    const now = Date.now();
    const records = (await db.getAll(STORE_NAME)) as SkillPatternRecord[];
    const contexts = records.filter((record) => {
      if (record.kind !== 'context' || !record.context) return false;
      return now - record.context.timestamp <= LOOKBACK_MS;
    });

    if (contexts.length < 3) return null;

    const grouped = new Map<string, { count: number; days: Set<number>; detections: Map<string, number>; location: string; hour: number; allHours: number[] }>();

    for (const record of contexts) {
      const context = record.context!;
      const key = `${context.approximateLocation}|${context.hour}`;
      const group = grouped.get(key) ?? {
        count: 0,
        days: new Set<number>(),
        detections: new Map<string, number>(),
        location: context.approximateLocation,
        hour: context.hour,
        allHours: [],
      };

      group.count += 1;
      group.days.add(context.dayOfWeek);
      group.location = context.approximateLocation;
      group.hour = context.hour;
      group.allHours.push(context.hour);

      for (const detection of normalizeDetections(context.detectionTypes)) {
        group.detections.set(detection, (group.detections.get(detection) ?? 0) + 1);
      }

      grouped.set(key, group);
    }

    let best: Pattern | null = null;

    for (const group of grouped.values()) {
      const totalGroupDetections = [...group.detections.entries()].sort((a, b) => b[1] - a[1]);
      const expectedDetections = totalGroupDetections.slice(0, 5).map(([name]) => name);
      const baseHour = Math.min(...group.allHours);
      const hourRange: [number, number] = [baseHour, Math.max(...group.allHours) + 1];
      const confidence = Math.min(0.99, Math.max(0.4, group.count / contexts.length));

      if (group.count < 2 || expectedDetections.length === 0) continue;

      const candidate: Pattern = {
        id: `pattern-${group.location.toLowerCase().replace(/\s+/g, '-')}-${hourRange[0]}-${hourRange[1]}`,
        hourRange,
        dayOfWeek: Array.from(group.days).sort((a, b) => a - b),
        approximateLocation: group.location,
        expectedDetections,
        confidence,
      };

      if (!best || candidate.confidence > best.confidence) {
        best = candidate;
      }
    }

    if (!best) return null;

    const patternRecord: SkillPatternRecord = {
      kind: 'pattern',
      id: `pattern-${best.id}`,
      timestamp: Date.now(),
      pattern: best,
    };

    await db.put(STORE_NAME, patternRecord);
    return best;
  }

  async getLearnedPatterns(): Promise<Pattern[]> {
    const db = await openSkillPatternDB();
    const records = (await db.getAll(STORE_NAME)) as SkillPatternRecord[];
    return records
      .filter((record) => record.kind === 'pattern' && record.pattern)
      .map((record) => record.pattern!)
      .sort((a, b) => b.confidence - a.confidence);
  }

  async learnFromEvolis(): Promise<void> {
    const events = evolis.getEntries().slice(-100);
    const filtered = events.filter((event) => {
      const module = (event.module ?? '').toLowerCase();
      const action = (event.action ?? '').toLowerCase();
      return module.includes('vision') || module.includes('detection') || module.includes('context') || action.includes('vision') || action.includes('detection') || action.includes('context');
    });

    if (filtered.length === 0) return;

    const byHour = new Map<number, { count: number; detections: Map<string, number> }>();
    for (const event of filtered) {
      const date = new Date(event.entry.timestamp);
      const hour = date.getHours();
      const bucket = byHour.get(hour) ?? { count: 0, detections: new Map<string, number>() };
      bucket.count += 1;
      const key = (event.module || event.action || 'unknown').toLowerCase();
      bucket.detections.set(key, (bucket.detections.get(key) ?? 0) + 1);
      byHour.set(hour, bucket);
    }

    const patterns: Pattern[] = [...byHour.entries()]
      .map(([hour, bucket]) => {
        const expectedDetections = [...bucket.detections.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name]) => name);

        return {
          id: `evolis-${hour}-${Date.now()}`,
          hourRange: [hour, hour + 1] as [number, number],
          dayOfWeek: Array.from(new Set(filtered.filter((event) => new Date(event.entry.timestamp).getHours() === hour).map((event) => new Date(event.entry.timestamp).getDay()))),
          approximateLocation: 'aprendizaje evolis',
          expectedDetections,
          confidence: Math.min(1, bucket.count / Math.max(1, filtered.length)),
        };
      })
      .filter((pattern) => pattern.expectedDetections.length > 0);

    if (patterns.length === 0) return;

    const db = await openSkillPatternDB();
    for (const pattern of patterns) {
      await db.put(STORE_NAME, {
        kind: 'pattern',
        id: `evolis-${pattern.id}`,
        timestamp: Date.now(),
        pattern,
      });
    }
  }

  async syncWithEvolis(): Promise<void> {
    await this.learnFromEvolis();

    const meta = {
      learned: (await this.getLearnedPatterns()).length,
      timestamp: Date.now(),
    };

    await evolis.record('skill', 'skill_learned', JSON.stringify(meta));
  }

  async getEvolisInsights(): Promise<Insight[]> {
    const events = evolis.getEntries().slice(-100);
    if (events.length === 0) return [];

    const now = Date.now();
    const lastWeek = now - 7 * 24 * 60 * 60 * 1000;
    const recent = events.filter((event) => event.entry.timestamp >= lastWeek);

    const byType: Record<string, number> = {};
    for (const event of recent) {
      const key = (event.module || event.action || 'unknown').toLowerCase();
      byType[key] = (byType[key] ?? 0) + 1;
    }

    const strongestType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
    if (!strongestType) return [];

    const summary = `En los últimos 7 días, detectaste ${strongestType[1]} eventos de tipo ${strongestType[0]}.`;
    return [{
      id: `insight-${Date.now()}`,
      summary,
      type: strongestType[0],
      score: Math.min(1, strongestType[1] / 10),
      timestamp: Date.now(),
    }];
  }

  optimizeForContext(context: UsageContext): DetectionConfig {
    const location = (context.approximateLocation ?? '').toLowerCase();
    const hour = Number.isFinite(context.hour) ? context.hour : 0;
    const detections = normalizeDetections(context.detectionTypes);

    let priorityDetections = [...detections];
    if (priorityDetections.length === 0) {
      priorityDetections = ['person', 'traffic light', 'bus'];
    }

    if (location.includes('calle') || location.includes('avenida') || location.includes('ruta') || location.includes('cruce')) {
      priorityDetections = ['bus', 'traffic light', 'person', 'motorcycle', 'obstacle', ...priorityDetections];
    }

    if (location.includes('estacion') || location.includes('mercado') || location.includes('colegio')) {
      priorityDetections = ['person', 'bus', 'crosswalk', 'traffic light', ...priorityDetections];
    }

    if (hour >= 7 && hour <= 9) {
      priorityDetections = ['bus', 'traffic light', 'person', ...priorityDetections];
    }

    if (hour >= 17 && hour <= 19) {
      priorityDetections = ['person', 'bus', 'traffic light', ...priorityDetections];
    }

    if (context.loadLevel === 'high') {
      priorityDetections = ['person', 'traffic light', 'bus', 'obstacle'];
    }

    if (context.loadLevel === 'medium') {
      priorityDetections = [...new Set(['person', 'traffic light', 'bus', ...priorityDetections])];
    }

    return {
      priorityDetections: normalizeDetections(priorityDetections).slice(0, 6),
      secondaryDetections: ['sign', 'door', 'bike', 'tree', 'cart'],
      ignoreDetections: context.loadLevel === 'high' ? ['background', 'noncritical', 'decorative'] : [],
      minConfidence: context.loadLevel === 'high' ? 0.7 : context.loadLevel === 'medium' ? 0.55 : 0.45,
      enableAdaptiveScan: true,
      quietMode: context.loadLevel === 'high',
    };
  }
}

export const skillPerceptionEngine = new SkillPerceptionEngine();
