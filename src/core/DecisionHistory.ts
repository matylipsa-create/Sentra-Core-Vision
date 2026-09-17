import { openSovereigntyDB } from './SovereigntyStorage';
import type { Decision, DecisionType } from './InflectionNode';
import { moralNode } from './MoralNode';

export interface Inclination {
  totalDecisions: number;
  byType: Record<string, number>;
  dominantType: string;
  confidence: number;
  description: string;
}

const STORE_NAME = 'decision_history';

function normalizeDecision(decision: Decision): Decision {
  return {
    ...decision,
    id: decision.id ?? `decision-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: decision.timestamp ?? Date.now(),
  };
}

export async function recordDecision(decision: Decision): Promise<void> {
  const evaluation = moralNode.evaluate(JSON.stringify({ action: 'record_decision', decision }));
  if (!evaluation.allowed) return;
  const db = await openSovereigntyDB();
  await db.put(STORE_NAME, normalizeDecision(decision));
}

export async function getHistory(limit: number): Promise<Decision[]> {
  const db = await openSovereigntyDB();
  const decisions = await db.getAllFromIndex(STORE_NAME, 'timestamp');
  return decisions.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)).slice(0, Math.max(0, limit));
}

export async function getInclination(): Promise<Inclination> {
  const history = await getHistory(Number.MAX_SAFE_INTEGER);
  const byType: Record<string, number> = {};
  history.forEach((decision) => { byType[decision.type] = (byType[decision.type] ?? 0) + 1; });
  const dominant = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
  const dominantType = dominant?.[0] ?? '';
  const confidence = history.length === 0 ? 0 : (dominant?.[1] ?? 0) / history.length;
  return {
    totalDecisions: history.length,
    byType,
    dominantType,
    confidence,
    description: dominantType
      ? `Se registran más decisiones de tipo ${dominantType}.`
      : 'Todavía no hay decisiones registradas.',
  };
}

export async function getDecisionsByType(type: string): Promise<Decision[]> {
  const db = await openSovereigntyDB();
  const normalized = type as DecisionType;
  const decisions = await db.getAllFromIndex(STORE_NAME, 'type', normalized);
  return decisions.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
}

