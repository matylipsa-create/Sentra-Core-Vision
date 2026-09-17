import { evolis } from './EVOLIS';
import { openSovereigntyDB } from './SovereigntyStorage';
import { recordDecision } from './DecisionHistory';

export type DecisionType = 'mode_change' | 'veto' | 'preference' | 'action';

export interface Decision {
  type: DecisionType;
  description: string;
  value: any;
  id?: string;
  timestamp?: number;
}

export interface SystemSnapshot {
  activeModule: string;
  uiMode: string;
  cognitiveLoad: string;
  humanVeto: boolean;
  timestamp: number;
  [key: string]: unknown;
}

export interface InflectionNode {
  id: string;
  timestamp: number;
  decision: Decision;
  systemState: SystemSnapshot;
  reversible: boolean;
}

const STORE_NAME = 'inflection_nodes';

function createId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `node-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function snapshotFromDecision(decision: Decision): SystemSnapshot {
  const candidate = decision.value && typeof decision.value === 'object'
    ? decision.value.systemState
    : undefined;
  return {
    activeModule: 'vision',
    uiMode: 'vision',
    cognitiveLoad: 'low',
    humanVeto: false,
    timestamp: Date.now(),
    ...(candidate && typeof candidate === 'object' ? candidate : {}),
  };
}

export async function createNode(decision: Decision): Promise<InflectionNode> {
  const node: InflectionNode = {
    id: createId(),
    timestamp: Date.now(),
    decision: { ...decision, id: decision.id ?? createId(), timestamp: decision.timestamp ?? Date.now() },
    systemState: snapshotFromDecision(decision),
    reversible: true,
  };
  const db = await openSovereigntyDB();
  await db.put(STORE_NAME, node);
  await recordDecision(node.decision);
  await evolis.registerDecision(node.decision, node.id);
  return node;
}

export async function getNode(nodeId: string): Promise<InflectionNode | null> {
  const db = await openSovereigntyDB();
  return (await db.get(STORE_NAME, nodeId)) ?? null;
}

export async function revertToNode(nodeId: string): Promise<boolean> {
  const node = await getNode(nodeId);
  if (!node) return false;
  await evolis.registerReversion(nodeId, 'Reversión solicitada por el usuario');
  return true;
}

export async function listNodes(limit: number): Promise<InflectionNode[]> {
  const db = await openSovereigntyDB();
  const nodes = await db.getAllFromIndex(STORE_NAME, 'timestamp');
  return nodes.sort((a, b) => b.timestamp - a.timestamp).slice(0, Math.max(0, limit));
}