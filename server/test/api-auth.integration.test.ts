import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import test, { after, before } from 'node:test';
import WebSocket from 'ws';

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API_TOKEN = 'integration-api-token';
const protectedRoutes: Array<[string, string]> = [
  ['GET', '/api/evidence'],
  ['POST', '/api/evidence/verify'],
  ['GET', '/api/bio/protocols'],
  ['GET', '/api/bio/state'],
  ['GET', '/api/bio/stats'],
  ['GET', '/api/guardian/status'],
  ['GET', '/api/usb/devices'],
  ['POST', '/api/usb/block'],
  ['POST', '/api/usb/unblock'],
  ['POST', '/api/usb/authenticate'],
  ['GET', '/api/sync/status'],
  ['POST', '/api/sync/transport'],
  ['POST', '/api/sync/connect-bluetooth'],
  ['POST', '/api/sync/disconnect-bluetooth'],
  ['POST', '/api/command'],
  ['POST', '/api/settings'],
];

let child: ChildProcess | null = null;
let port = 0;
let temporaryDirectory = '';
let childOutput = '';

async function reservePort(): Promise<number> {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve test port');
  await new Promise<void>((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  return address.port;
}

async function sendSocketMessage<T extends Record<string, unknown>>(socket: WebSocket, message: Record<string, unknown>): Promise<T> {
  const id = String(message.id ?? '');
  return new Promise<T>((resolveMessage, reject) => {
    const timer = setTimeout(() => reject(new Error('WebSocket response timed out')), 2000);
    const listener = (raw: WebSocket.RawData) => {
      const response = JSON.parse(raw.toString()) as T;
      if (response.id !== id) return;
      clearTimeout(timer);
      socket.off('message', listener);
      resolveMessage(response);
    };
    socket.on('message', listener);
    socket.send(JSON.stringify(message));
  });
}

before(async () => {
  temporaryDirectory = await mkdtemp(resolve(tmpdir(), 'sentra-auth-test-'));
  port = await reservePort();
  child = spawn(process.execPath, ['--import', 'tsx', 'index.ts'], {
    cwd: serverRoot,
    env: {
      ...process.env,
      SENTRA_PORT: String(port),
      SENTRA_HOST: '127.0.0.1',
      SENTRA_TRUSTED_TLS_PROXY: 'false',
      SENTRA_API_TOKEN: API_TOKEN,
      SENTRA_PLUGIN_CONTROL_TOKEN: 'integration-plugin-token',
      SENTRA_EVIDENCE_PATH: resolve(temporaryDirectory, 'evidence.jsonl'),
      SENTRA_EVIDENCE_KEY_PATH: resolve(temporaryDirectory, 'evidence-key.json'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout?.on('data', (chunk: Buffer) => { childOutput += chunk.toString(); });
  child.stderr?.on('data', (chunk: Buffer) => { childOutput += chunk.toString(); });

  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error(`Backend exited before listening:\n${childOutput}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/status`);
      if (response.ok) { ready = true; break; }
    } catch {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
    }
  }
  if (!ready) throw new Error(`Backend did not become ready:\n${childOutput}`);
});

after(async () => {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await once(child, 'exit');
  }
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
});

test('only basic status and module metadata are public REST routes', async () => {
  const status = await fetch(`http://127.0.0.1:${port}/api/status`);
  assert.equal(status.status, 200);
  assert.deepEqual(Object.keys(await status.json()).sort(), ['evidenceCount', 'status']);

  const modules = await fetch(`http://127.0.0.1:${port}/api/modules`);
  assert.equal(modules.status, 200);

  for (const [method, path] of protectedRoutes) {
    for (const authorization of [undefined, 'Bearer invalid-token']) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`, {
        method,
        headers: authorization ? { Authorization: authorization, 'Content-Type': 'application/json' } : undefined,
        body: method === 'POST' ? '{}' : undefined,
      });
      assert.equal(response.status, 401, `${method} ${path} should reject missing/invalid bearer`);
    }
  }
});

test('valid bearer can read protected evidence endpoints', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/api/evidence`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  assert.equal(response.status, 200);
});

test('valid bearer can execute an authorized REST command', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/api/command`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: 'hola' }),
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).allowed, true);
});

test('REST rejects bodies larger than 64 KB', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/api/settings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'bioEnabled', value: true, padding: 'x'.repeat(64 * 1024) }),
  });
  assert.equal(response.status, 413);
});

test('WebSocket permits public queries but rejects protected messages until auth frame', async () => {
  const socket = new WebSocket(`ws://127.0.0.1:${port}`);
  await once(socket, 'open');
  try {
    const publicStatus = await sendSocketMessage<{ ok: boolean; data?: Record<string, unknown> }>(socket, {
      type: 'query', module: 'system', action: 'get_status', payload: {}, id: 'public-status', timestamp: Date.now(),
    });
    assert.equal(publicStatus.ok, true);
    assert.deepEqual(publicStatus.data, { status: 'ok' });

    const privateEvidence = await sendSocketMessage<{ ok: boolean; error?: string }>(socket, {
      type: 'query', module: 'system', action: 'get_evidence', payload: {}, id: 'private-evidence', timestamp: Date.now(),
    });
    assert.equal(privateEvidence.ok, false);
    assert.equal(privateEvidence.error, 'Unauthorized');

    const authenticated = new Promise<{ ok: boolean }>((resolveMessage, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket auth response timed out')), 2000);
      const listener = (raw: WebSocket.RawData) => {
        const message = JSON.parse(raw.toString()) as { type?: string; ok?: boolean };
        if (message.type !== 'auth') return;
        clearTimeout(timer);
        socket.off('message', listener);
        resolveMessage(message as { ok: boolean });
      };
      socket.on('message', listener);
      socket.send(JSON.stringify({ type: 'auth', token: API_TOKEN }));
    });
    assert.equal((await authenticated).ok, true);

    const authorizedEvidence = await sendSocketMessage<{ ok: boolean }>(socket, {
      type: 'query', module: 'system', action: 'get_evidence', payload: {}, id: 'authorized-evidence', timestamp: Date.now(),
    });
    assert.equal(authorizedEvidence.ok, true);
  } finally {
    socket.close();
  }
});

test('WebSocket accepts a valid bearer during the native handshake', async () => {
  const socket = new WebSocket(`ws://127.0.0.1:${port}`, { headers: { Authorization: `Bearer ${API_TOKEN}` } });
  await once(socket, 'open');
  try {
    const evidence = await sendSocketMessage<{ ok: boolean }>(socket, {
      type: 'query', module: 'system', action: 'get_evidence', payload: {}, id: 'header-auth-evidence', timestamp: Date.now(),
    });
    assert.equal(evidence.ok, true);
  } finally {
    socket.close();
  }
});

test('WebSocket closes a session after an invalid auth frame', async () => {
  const socket = new WebSocket(`ws://127.0.0.1:${port}`);
  await once(socket, 'open');
  const rejected = new Promise<{ ok: boolean; error: string }>((resolveMessage, reject) => {
    const timer = setTimeout(() => reject(new Error('WebSocket rejection timed out')), 2000);
    const listener = (raw: WebSocket.RawData) => {
      const message = JSON.parse(raw.toString()) as { type?: string; ok?: boolean; error?: string };
      if (message.type !== 'auth') return;
      clearTimeout(timer);
      socket.off('message', listener);
      resolveMessage({ ok: message.ok === true, error: message.error ?? '' });
    };
    socket.on('message', listener);
    socket.send(JSON.stringify({ type: 'auth', token: 'invalid-token' }));
  });
  assert.deepEqual(await rejected, { ok: false, error: 'Unauthorized' });
  const [code] = await once(socket, 'close');
  assert.equal(code, 4401);
});

test('WebSocket rejects anonymous frames larger than 64 KB', async () => {
  const socket = new WebSocket(`ws://127.0.0.1:${port}`);
  await once(socket, 'open');
  socket.send('x'.repeat(64 * 1024 + 1));
  const [code] = await once(socket, 'close');
  assert.equal(code, 1009);
});

test('backend refuses to start without an API credential', async () => {
  const env = { ...process.env };
  delete env.SENTRA_API_TOKEN;
  delete env.SENTRA_PLUGIN_CONTROL_TOKEN;
  env.SENTRA_HOST = '127.0.0.1';
  env.SENTRA_TRUSTED_TLS_PROXY = 'false';
  const unconfigured = spawn(process.execPath, ['--import', 'tsx', 'index.ts'], {
    cwd: serverRoot,
    env,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let stderr = '';
  unconfigured.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
  const [code] = await once(unconfigured, 'exit');
  assert.notEqual(code, 0);
  assert.match(stderr, /SENTRA_API_TOKEN.*is required/);
});

test('backend refuses a non-loopback bind without trusted TLS proxy configuration', async () => {
  const env = {
    ...process.env,
    SENTRA_API_TOKEN: API_TOKEN,
    SENTRA_HOST: '0.0.0.0',
    SENTRA_TRUSTED_TLS_PROXY: 'false',
  };
  const untrustedBind = spawn(process.execPath, ['--import', 'tsx', 'index.ts'], {
    cwd: serverRoot,
    env,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let stderr = '';
  untrustedBind.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
  const [code] = await once(untrustedBind, 'exit');
  assert.notEqual(code, 0);
  assert.match(stderr, /Non-loopback bind requires SENTRA_TRUSTED_TLS_PROXY/);
});