import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';
import { ComplexEventProcessor } from '../../src/core/ComplexEventProcessor.js';
import { EVOLIS } from '../../src/core/EVOLIS.js';
import { HotPlugRegistry } from '../../src/core/HotPlugRegistry.js';
import { evolisSourceIdFromPublicKey } from '../../src/lib/crypto.js';
import {
  createAirGapAcknowledgementChunks,
  exportAirGapDelta,
  getAirGapSourceId,
  importAirGapAcknowledgement,
  importAirGapDelta,
  joinAirGapChunks,
} from '../../src/services/AirGapSyncTransport.js';
import { StorageService } from '../../src/services/StorageService.js';

test('CEP requires distinct critical sources within its time window', () => {
  const processor = new ComplexEventProcessor();
  processor.registerRule({
    id: 'critical-sensor-pair',
    windowMs: 5000,
    minEvents: 2,
    distinctBy: (signal) => signal.source,
    matches: (signal) => signal.level === 'critical',
  });

  assert.equal(processor.process({ type: 'imu', source: 'imu', level: 'critical', timestamp: 1000 }).length, 0);
  assert.equal(processor.process({ type: 'imu', source: 'imu', level: 'critical', timestamp: 2000 }).length, 0);
  const [match] = processor.process({ type: 'air', source: 'air', level: 'critical', timestamp: 5999 });
  assert.equal(match.ruleId, 'critical-sensor-pair');
  assert.deepEqual(match.signals.map((signal) => signal.source).sort(), ['air', 'imu']);
});

test('CEP ignores critical signals that fall outside the window', () => {
  const processor = new ComplexEventProcessor();
  processor.registerRule({
    id: 'critical-sensor-pair',
    windowMs: 5000,
    minEvents: 2,
    matches: (signal) => signal.level === 'critical',
  });

  processor.process({ type: 'imu', source: 'imu', level: 'critical', timestamp: 1000 });
  assert.equal(processor.process({ type: 'air', source: 'air', level: 'critical', timestamp: 6001 }).length, 0);
});

test('hot-plug loader activates, deactivates, and detaches a plugin', async () => {
  const registry = new HotPlugRegistry<void>();
  const lifecycle: string[] = [];
  registry.registerLoader('telemetry', async () => ({
    id: 'telemetry',
    version: '1.0.0',
    activate: () => { lifecycle.push('active'); },
    deactivate: () => { lifecycle.push('inactive'); },
  }));

  await registry.activate('telemetry', undefined);
  assert.equal(registry.isActive('telemetry'), true);
  await registry.deactivate('telemetry', undefined);
  assert.equal(registry.isActive('telemetry'), false);
  await registry.detach('telemetry', undefined);
  assert.deepEqual(lifecycle, ['active', 'inactive']);
  assert.deepEqual(registry.list(), []);
  await assert.rejects(registry.activate('telemetry', undefined), /Plugin not registered/);
});

test('air-gap node identity is stable without localStorage', async () => {
  assert.equal(typeof globalThis.localStorage, 'undefined');
  const first = await getAirGapSourceId();
  const second = await getAirGapSourceId();
  assert.match(first, /^sentra:[0-9a-f]{64}$/);
  assert.equal(second, first);
});

test('air-gap delta encrypts, chunks, verifies EVOLIS, and imports to an isolated node', async () => {
  const suffix = crypto.randomUUID();
  const sourceStorage = new StorageService(`airgap-source-${suffix}`);
  const receiverStorage = new StorageService(`airgap-receiver-${suffix}`);
  const source = new EVOLIS();
  const evidence: Awaited<ReturnType<EVOLIS['record']>>[] = [];
  let keyPair: { publicKey: string; privateKey: string } | undefined;
  source.setPersistenceAdapter({
    loadKeyPair: async () => keyPair,
    saveKeyPair: async (created) => { keyPair = created; },
    saveEvidence: async (entry) => { evidence.push(entry); },
  });
  await source.record('vision', 'detection', JSON.stringify({ label: 'person' }));
  await source.record('telemetry', 'sample', JSON.stringify({ temperature: 22 }));
  for (const entry of evidence) await sourceStorage.saveEvidence(entry);
  assert.ok(keyPair);
  await sourceStorage.saveEvolisKey(keyPair);
  const sourceId = await evolisSourceIdFromPublicKey(keyPair.publicKey);

  const passphrase = 'air-gap-integration-passphrase';
  const chunks = await exportAirGapDelta(sourceStorage, 'receiver-node', sourceId, passphrase, 1024);
  const exportedBatch = await sourceStorage.exportEvidenceDeltaForPeer('receiver-node', sourceId);
  assert.ok(chunks.length > 1);
  await assert.rejects(
    receiverStorage.applyEvidenceDelta({ ...exportedBatch, sourceId: `${sourceId}-spoofed` }, `${sourceId}-spoofed`),
    /source id does not match its EVOLIS signing key/,
  );

  await assert.rejects(
    importAirGapDelta(receiverStorage, chunks, 'source-node', 'wrong-air-gap-passphrase'),
    /authentication failed/,
  );
  assert.equal((await receiverStorage.getSyncedEvidence()).length, 0);

  const corrupted = chunks.map((chunk) => ({ ...chunk }));
  corrupted[0].data = `${corrupted[0].data.slice(0, -4)}AAAA`;
  await assert.rejects(importAirGapDelta(receiverStorage, corrupted, 'source-node', passphrase));
  assert.equal((await receiverStorage.getSyncedEvidence()).length, 0);

  const result = await importAirGapDelta(receiverStorage, [...chunks].reverse(), sourceId, passphrase);
  assert.equal(result.appliedThrough, 1);
  assert.equal(result.sourceId, sourceId);
  assert.equal((await receiverStorage.getSyncedEvidence(sourceId)).length, 2);
  assert.equal((await receiverStorage.loadSyncCursor(sourceId))?.lastHash, result.endingHash);

  const acknowledgementChunks = await createAirGapAcknowledgementChunks(result, 'receiver-node', passphrase);
  const acknowledgementPackage = await joinAirGapChunks(acknowledgementChunks);
  await assert.rejects(
    importAirGapAcknowledgement(sourceStorage, acknowledgementPackage, 'wrong-peer', passphrase),
    /different peer/,
  );
  await assert.rejects(
    sourceStorage.acknowledgeEvidenceDelta('receiver-node', sourceId, 'unknown-export', 1, result.endingHash),
    /does not match the pending export/,
  );
  const thirdEvidence = await source.record('telemetry', 'sample', JSON.stringify({ temperature: 23 }));
  await sourceStorage.saveEvidence(thirdEvidence);
  await assert.rejects(
    sourceStorage.acknowledgeEvidenceDelta('receiver-node', sourceId, exportedBatch.exportId, 2, thirdEvidence.entry.hash),
    /does not match the pending export/,
  );
  assert.equal(await sourceStorage.loadSyncCursor('receiver-node', 'outbound'), undefined);
  await importAirGapAcknowledgement(
    sourceStorage,
    acknowledgementPackage,
    'receiver-node',
    passphrase,
  );
  const nextDelta = await sourceStorage.exportEvidenceDeltaForPeer('receiver-node', sourceId);
  assert.deepEqual(nextDelta.entries.map((entry) => entry.entry.index), [2]);
  assert.equal(await source.verify(), true);
});