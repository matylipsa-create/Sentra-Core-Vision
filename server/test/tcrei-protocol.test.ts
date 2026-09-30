import assert from 'node:assert/strict';
import test from 'node:test';
import { makeAck, makeAuthResult, makeEvent, parseMessage } from '../tcrei-protocol.js';

test('TCREI parser accepts telemetry frames with optional signatures', () => {
  const frame = {
    type: 'telemetry',
    module: 'vision',
    action: 'telemetry',
    payload: { signals: [] },
    timestamp: Date.now(),
    id: 'telemetry-1',
    signature: 'evolis-signature',
  };

  assert.deepEqual(parseMessage(JSON.stringify(frame)), frame);
});

test('TCREI parser rejects malformed required fields', () => {
  const valid = {
    type: 'command', module: 'system', action: 'get_status', payload: {}, timestamp: 1, id: 'status-1',
  };
  const malformed = [
    { ...valid, payload: undefined },
    { ...valid, timestamp: undefined },
    { ...valid, timestamp: 1.5 },
    { ...valid, signature: 42 },
    { ...valid, type: 'unknown' },
  ];

  for (const frame of malformed) assert.equal(parseMessage(JSON.stringify(frame)), null);
});

test('TCREI ACK and event preserve common frame fields', () => {
  const auth = makeAuthResult('auth-1', true);
  const ack = makeAck('message-1', true, { accepted: true });
  const event = makeEvent('evidence.recorded', { index: 4 });

  assert.equal(auth.type, 'auth');
  assert.equal(auth.payload.ok, true);
  assert.equal(parseMessage(JSON.stringify(auth))?.type, 'auth');
  assert.equal(ack.id, 'message-1');
  assert.equal(ack.type, 'ack');
  assert.deepEqual(ack.payload.data, { accepted: true });
  assert.equal(parseMessage(JSON.stringify(ack))?.type, 'ack');
  assert.equal(event.type, 'event');
  assert.equal(event.action, 'evidence.recorded');
  assert.deepEqual(event.payload, { index: 4 });
  assert.equal(parseMessage(JSON.stringify(event))?.type, 'event');
});