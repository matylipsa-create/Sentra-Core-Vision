import assert from 'node:assert/strict';
import test from 'node:test';
import { ComplexEventProcessor } from '../../src/core/ComplexEventProcessor.js';
import { HotPlugRegistry } from '../../src/core/HotPlugRegistry.js';

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