import { timingSafeEqual } from 'node:crypto';
import { HotPlugRegistry } from '../src/core/HotPlugRegistry.js';
import { bacterialGuardian } from '../src/core/BacterialGuardian.js';

type ServerPluginId = 'vision' | 'telemetry' | 'security';

const serverPluginDefinitions = new Map<ServerPluginId, {
  id: ServerPluginId;
  version: string;
  activate: () => void;
  deactivate: () => void;
}>([
  ['vision', { id: 'vision', version: '1.0.0', activate() {}, deactivate() {} }],
  ['telemetry', { id: 'telemetry', version: '1.0.0', activate() {}, deactivate() {} }],
  ['security', {
    id: 'security',
    version: '1.0.0',
    activate: () => bacterialGuardian.activate(),
    deactivate: () => bacterialGuardian.deactivate(),
  }],
]);

export const serverPluginRegistry = new HotPlugRegistry<void>();

export function attachServerPlugin(id: string): void {
  if (!serverPluginDefinitions.has(id as ServerPluginId)) throw new Error(`Unknown server plugin: ${id}`);
  const plugin = serverPluginDefinitions.get(id as ServerPluginId)!;
  serverPluginRegistry.register(plugin);
}

export async function initializeServerPlugins(): Promise<void> {
  for (const id of serverPluginDefinitions.keys()) {
    if (!serverPluginRegistry.list().some((plugin) => plugin.id === id)) attachServerPlugin(id);
    await serverPluginRegistry.activate(id, undefined);
  }
}

export function authorizePluginControl(token: unknown): boolean {
  const expected = process.env.SENTRA_PLUGIN_CONTROL_TOKEN ?? '';
  if (!expected || typeof token !== 'string') return false;
  const suppliedBytes = Buffer.from(token);
  const expectedBytes = Buffer.from(expected);
  return suppliedBytes.length === expectedBytes.length && timingSafeEqual(suppliedBytes, expectedBytes);
}