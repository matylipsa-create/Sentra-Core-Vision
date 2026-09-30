import { WebSocketServer, WebSocket } from 'ws';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { cpus } from 'node:os';
import { performance } from 'node:perf_hooks';
import { timingSafeEqual } from 'node:crypto';
import { TCREIMessage, makeResponse, makeEvent, parseMessage } from './tcrei-protocol.js';

// Motor imports
import { evolis } from '../src/core/EVOLIS.js';
import { moralNode } from '../src/core/MoralNode.js';
import { geminiService } from '../src/core/GeminiService.js';
import { moduleManager } from '../src/modules/ModuleManager.js';
import { bioSoftware, BioProtocol } from '../src/core/BioSoftwareInterface.js';
import { bacterialGuardian } from '../src/core/BacterialGuardian.js';
import { usbService } from '../src/services/USBService.js';
import { PowerMode } from '../src/core/PowerManager.js';
import { syncManager, SyncTransport } from '../src/core/SyncManager.js';
import { EvidenceJournal } from './EvidenceJournal.js';
import { ComplexEventProcessor } from '../src/core/ComplexEventProcessor.js';
import {
  attachServerPlugin,
  authorizePluginControl,
  initializeServerPlugins,
  serverPluginRegistry,
} from './PluginHost.js';

const PORT = parseInt(process.env.SENTRA_PORT ?? '8080', 10);
const MAX_REST_BODY_BYTES = 64 * 1024;
const TRUSTED_TLS_PROXY = process.env.SENTRA_TRUSTED_TLS_PROXY === 'true';
const HOST = process.env.SENTRA_HOST ?? (TRUSTED_TLS_PROXY ? '0.0.0.0' : '127.0.0.1');
const IS_LOOPBACK_HOST = ['localhost', '127.0.0.1', '::1'].includes(HOST);
if (!IS_LOOPBACK_HOST && !TRUSTED_TLS_PROXY) {
  throw new Error('Non-loopback bind requires SENTRA_TRUSTED_TLS_PROXY=true and a TLS-terminating reverse proxy');
}
const API_TOKEN = process.env.SENTRA_API_TOKEN ?? process.env.SENTRA_PLUGIN_CONTROL_TOKEN ?? '';
if (!API_TOKEN) throw new Error('SENTRA_API_TOKEN (or SENTRA_PLUGIN_CONTROL_TOKEN) is required');
const API_TOKEN_BYTES = Buffer.from(API_TOKEN);

// ─── State ──────────────────────────────────────────────

interface ServerState {
  activeModule: string;
  voiceEnabled: boolean;
  humanVeto: boolean;
  powerMode: PowerMode;
  syncTransport: SyncTransport;
  geminiRemote: boolean;
  worldEnabled: boolean;
  bioEnabled: boolean;
}

const state: ServerState = {
  activeModule: 'vision',
  voiceEnabled: true,
  humanVeto: false,
  powerMode: 'normal',
  syncTransport: 'offline',
  geminiRemote: false,
  worldEnabled: false,
  bioEnabled: false,
};

const evidenceJournal = new EvidenceJournal();
const telemetryCEP = new ComplexEventProcessor();
telemetryCEP.registerRule({
  id: 'multi-sensor-critical-window',
  windowMs: 5000,
  minEvents: 2,
  distinctBy: (signal) => signal.source,
  matches: (signal) => signal.level === 'critical',
});
evolis.setPersistenceAdapter({
  loadKeyPair: () => evidenceJournal.loadKeyPair(),
  saveKeyPair: (keyPair) => evidenceJournal.saveKeyPair(keyPair),
  saveEvidence: (evidence) => evidenceJournal.append(evidence),
});
const persistedEvidence = await evidenceJournal.load();
if (persistedEvidence.length > 0) evolis.importState(persistedEvidence);

// ─── Init ───────────────────────────────────────────────

async function init(): Promise<void> {
  await evolis.initialize();
  bioSoftware.setEnabled(state.bioEnabled);
  moralNode.setHumanVeto(state.humanVeto);
  await initializeServerPlugins();
}

// ─── Command handlers ───────────────────────────────────

type Handler = (msg: TCREIMessage) => Promise<unknown>;

const handlers: Record<string, Handler> = {
  'command:process': async (msg) => {
    if (state.activeModule === 'vision' && !serverPluginRegistry.isActive('vision')) {
      throw new Error('Vision plugin is not active');
    }
    const command = (msg.payload.command as string) ?? '';
    const perceptionSummary = (msg.payload.perception as string) ?? 'Sin percepcion activa';
    const eval_ = moralNode.evaluate(command, { externalRequest: state.worldEnabled });
    if (!eval_.allowed) {
      broadcast(makeEvent('moral.blocked', {
        reason: eval_.decisions.find((d) => !d.passed)?.reason ?? 'Accion bloqueada',
        decisions: eval_.decisions,
      }));
      return { allowed: false, reason: eval_.decisions.find((d) => !d.passed)?.reason };
    }
    const response = await geminiService.query(state.activeModule, perceptionSummary, command);
    const evidence = await evolis.record(state.activeModule, 'command', command);
    broadcast(makeEvent('evidence.recorded', { id: evidence.id, index: evidence.entry.index }));
    return { allowed: true, response };
  },

  'command:telemetry': async (msg) => {
    if (!serverPluginRegistry.isActive('telemetry')) throw new Error('Telemetry plugin is not active');
    const serialized = JSON.stringify(msg.payload);
    if (serialized.length > 32000) throw new Error('Telemetry payload exceeds limit');
    const evidence = await evolis.record('telemetry', 'sensor_snapshot', serialized);
    const rawSignals = msg.payload.signals;
    if (Array.isArray(rawSignals)) {
      for (const rawSignal of rawSignals) {
        if (!rawSignal || typeof rawSignal !== 'object') continue;
        const candidate = rawSignal as Record<string, unknown>;
        if (typeof candidate.type !== 'string' || !candidate.type.trim()) continue;
        const level = candidate.level === 'critical' || candidate.level === 'warning'
          ? candidate.level
          : 'info';
        const matches = telemetryCEP.process({
          type: candidate.type,
          source: typeof candidate.source === 'string' ? candidate.source : candidate.type,
          level,
          timestamp: Date.now(),
          payload: candidate,
        });
        for (const match of matches) {
          const signalTypes = [...new Set(match.signals.map((signal) => signal.type))];
          bacterialGuardian.reportSensorCorrelation(match.ruleId, signalTypes);
          broadcast(makeEvent('guardian.sensor_correlation', match));
        }
      }
    }
    broadcast(makeEvent('evidence.recorded', { id: evidence.id, index: evidence.entry.index }));
    return { accepted: true, evidenceId: evidence.id, hash: evidence.entry.hash };
  },

  'command:operator_action': async (msg) => {
    const serialized = JSON.stringify(msg.payload);
    if (serialized.length > 32000) throw new Error('Operator action payload exceeds limit');
    const evidence = await evolis.record('operator', 'critical_action', serialized);
    broadcast(makeEvent('evidence.recorded', { id: evidence.id, index: evidence.entry.index }));
    return { accepted: true, evidenceId: evidence.id, hash: evidence.entry.hash };
  },

  'query:get_status': async () => ({
    activeModule: state.activeModule,
    voiceEnabled: state.voiceEnabled,
    humanVeto: state.humanVeto,
    powerMode: state.powerMode,
    syncTransport: state.syncTransport,
    geminiRemote: state.geminiRemote,
    worldEnabled: state.worldEnabled,
    bioEnabled: state.bioEnabled,
    evidenceCount: evolis.getEntries().length,
    bioState: bioSoftware.getState(),
    guardianState: bacterialGuardian.getStatus().state,
  }),

  'query:get_evidence': async () => {
    const entries = evolis.getEntries();
    return { entries: entries.slice(-50).reverse(), total: entries.length };
  },

  'command:verify': async () => {
    const valid = await evolis.verify();
    return { valid };
  },

  'query:get_protocols': async () => ({
    protocols: bioSoftware.getProtocols(),
  }),

  'query:get_bio_state': async () => bioSoftware.getState(),

  'query:get_bio_stats': async () => bioSoftware.getStats(),

  'command:start_session': async (msg) => {
    const protocol = msg.payload.protocol as BioProtocol;
    const session = bioSoftware.startSession(protocol);
    if (session) {
      broadcast(makeEvent('bio.session_started', { protocol, sessionId: session.id }));
    }
    return { session };
  },

  'command:stop_session': async () => {
    const session = bioSoftware.stopSession();
    if (session) {
      broadcast(makeEvent('bio.session_complete', {
        protocol: session.protocol,
        coherence: session.metrics.coherenceScore,
      }));
    }
    return { session };
  },

  'command:get_reframe': async () => {
    const reframe = bioSoftware.getReframe();
    return { reframe };
  },

  'query:get_guardian_status': async () => bacterialGuardian.getStatus(),

  'command:check_chain': async () => {
    const valid = await bacterialGuardian.checkChain();
    return { valid };
  },

  'command:activate_guardian': async () => {
    bacterialGuardian.activate();
    return { state: bacterialGuardian.getStatus().state };
  },

  'command:deactivate_guardian': async () => {
    bacterialGuardian.deactivate();
    return { state: bacterialGuardian.getStatus().state };
  },

  'command:resolve_alert': async (msg) => {
    bacterialGuardian.resolveAlert(msg.payload.alertId as string);
    return { alerts: bacterialGuardian.getStatus().alerts };
  },

  'command:clear_alerts': async () => {
    bacterialGuardian.clearAlerts();
    return { alerts: [] };
  },

  'command:dismiss_quarantine': async () => {
    bacterialGuardian.dismissQuarantine();
    return { state: bacterialGuardian.getStatus().state };
  },

  'command:set_module': async (msg) => {
    state.activeModule = (msg.payload.module as string) ?? state.activeModule;
    return { activeModule: state.activeModule };
  },

  'command:set_setting': async (msg) => {
    const key = msg.payload.key as string;
    const value = msg.payload.value;
    switch (key) {
      case 'voiceEnabled': state.voiceEnabled = value as boolean; break;
      case 'humanVeto':
        state.humanVeto = value as boolean;
        moralNode.setHumanVeto(state.humanVeto);
        break;
      case 'powerMode': state.powerMode = value as PowerMode; break;
      case 'syncTransport': state.syncTransport = value as SyncTransport; break;
      case 'geminiRemote':
        state.geminiRemote = value as boolean;
        geminiService.setRemoteEnabled(state.geminiRemote);
        break;
      case 'worldEnabled':
        state.worldEnabled = value as boolean;
        geminiService.setWorldConnected(state.worldEnabled);
        break;
      case 'bioEnabled':
        state.bioEnabled = value as boolean;
        bioSoftware.setEnabled(state.bioEnabled);
        break;
    }
    return { key, value };
  },

  'query:get_modules': async () => ({
    modules: moduleManager.getAllModules(),
  }),

  'query:get_plugins': async () => ({ plugins: serverPluginRegistry.list() }),

  'command:attach_plugin': async (msg) => {
    if (!authorizePluginControl(msg.payload.controlToken)) throw new Error('Plugin control is not authorized');
    attachServerPlugin(String(msg.payload.pluginId ?? ''));
    return { plugins: serverPluginRegistry.list() };
  },

  'command:activate_plugin': async (msg) => {
    if (!authorizePluginControl(msg.payload.controlToken)) throw new Error('Plugin control is not authorized');
    const pluginId = String(msg.payload.pluginId ?? '');
    await serverPluginRegistry.activate(pluginId, undefined);
    return { plugins: serverPluginRegistry.list() };
  },

  'command:deactivate_plugin': async (msg) => {
    if (!authorizePluginControl(msg.payload.controlToken)) throw new Error('Plugin control is not authorized');
    const pluginId = String(msg.payload.pluginId ?? '');
    await serverPluginRegistry.deactivate(pluginId, undefined);
    return { plugins: serverPluginRegistry.list() };
  },

  'command:detach_plugin': async (msg) => {
    if (!authorizePluginControl(msg.payload.controlToken)) throw new Error('Plugin control is not authorized');
    const pluginId = String(msg.payload.pluginId ?? '');
    await serverPluginRegistry.detach(pluginId, undefined);
    return { plugins: serverPluginRegistry.list() };
  },

  'command:export': async () => {
    return { exported: true, evidence: evolis.exportState() };
  },

  'query:get_usb_devices': async () => ({
    devices: usbService.getDevices().map((d) => {
      const key = `${d.vendorId}:${d.productId}:${d.serialNumber ?? 'unknown'}`;
      return { ...d, portId: key, portStatus: usbService.getPortStatus(key) };
    }),
  }),

  'command:block_port': async (msg) => {
    const portId = msg.payload.portId as string;
    usbService.blockPort(portId, msg.payload.reason as string | undefined);
    await evolis.registerUSBEvent(`block:${portId}`);
    broadcast(makeEvent('usb.port_change', { portId, status: usbService.getPortStatus(portId) }));
    return { portId, status: usbService.getPortStatus(portId) };
  },

  'command:unblock_port': async (msg) => {
    const portId = msg.payload.portId as string;
    usbService.unblockPort(portId);
    bacterialGuardian.vaccinatePort(portId);
    await evolis.registerUSBEvent(`unblock:${portId}`);
    broadcast(makeEvent('usb.port_change', { portId, status: usbService.getPortStatus(portId) }));
    return { portId, status: usbService.getPortStatus(portId) };
  },

  'command:authenticate_device': async (msg) => {
    const portId = msg.payload.portId as string;
    const ok = usbService.authenticateDevice(portId);
    if (!ok) {
      bacterialGuardian.activateDefense(portId);
      await evolis.registerUSBEvent(`defense:${portId}`);
      broadcast(makeEvent('usb.port_change', { portId, status: usbService.getPortStatus(portId) }));
      return { portId, authenticated: false, status: usbService.getPortStatus(portId) };
    }
    await evolis.registerUSBEvent(`auth:${portId}`);
    broadcast(makeEvent('usb.port_change', { portId, status: usbService.getPortStatus(portId) }));
    return { portId, authenticated: true, status: usbService.getPortStatus(portId) };
  },

  'command:deploy_bacteria': async (msg) => {
    const portId = msg.payload.portId as string;
    bacterialGuardian.deployBacteria(portId);
    await evolis.registerUSBEvent(`bacteria:${portId}`);
    broadcast(makeEvent('usb.port_change', { portId, status: usbService.getPortStatus(portId) }));
    return { portId, status: usbService.getPortStatus(portId) };
  },

  'command:vaccinate_port': async (msg) => {
    const portId = msg.payload.portId as string;
    bacterialGuardian.vaccinatePort(portId);
    await evolis.registerUSBEvent(`vaccinate:${portId}`);
    broadcast(makeEvent('usb.port_change', { portId, status: usbService.getPortStatus(portId) }));
    return { portId, status: usbService.getPortStatus(portId) };
  },

  'query:get_sync_status': async () => syncManager.getStatus(),

  'command:set_sync_transport': async (msg) => {
    const transport = msg.payload.transport as SyncTransport;
    syncManager.setTransport(transport);
    state.syncTransport = transport;
    broadcast(makeEvent('sync.transport_changed', { transport }));
    return { transport };
  },

  'command:connect_bluetooth': async () => {
    await syncManager.connectBluetooth();
    return syncManager.getStatus();
  },

  'command:disconnect_bluetooth': async () => {
    syncManager.disconnectBluetooth();
    return syncManager.getStatus();
  },
};

// ─── WebSocket server ───────────────────────────────────

const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
const clients = new Set<WebSocket>();
const allConnections = new Set<WebSocket>();
const websocketRtt = new Map<WebSocket, number>();
const websocketPingStartedAt = new WeakMap<WebSocket, number>();
const configuredCorsOrigins = new Set(
  (process.env.SENTRA_CORS_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean)
);

function isAllowedOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin) return false;
    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
    return isLoopback || (parsed.protocol === 'https:' && configuredCorsOrigins.has(origin));
  } catch {
    return false;
  }
}

function isValidToken(token: unknown): boolean {
  if (typeof token !== 'string') return false;
  const tokenBytes = Buffer.from(token);
  return tokenBytes.length === API_TOKEN_BYTES.length && timingSafeEqual(tokenBytes, API_TOKEN_BYTES);
}

function hasBearerToken(header: string | undefined): boolean {
  const match = /^Bearer ([^\s]+)$/.exec(header ?? '');
  return Boolean(match && isValidToken(match[1]));
}

function broadcast(data: unknown): void {
  const msg = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

wss.on('connection', (ws, request) => {
  allConnections.add(ws);
  let authenticated = hasBearerToken(request.headers.authorization);
  let authTimer: ReturnType<typeof setTimeout> | null = null;
  const markAuthenticated = () => {
    if (authenticated) return;
    authenticated = true;
    if (authTimer) clearTimeout(authTimer);
    authTimer = null;
    clients.add(ws);
    ws.send(JSON.stringify(makeEvent('connection.status', { connected: true })));
  };

  if (authenticated) {
    clients.add(ws);
    ws.send(JSON.stringify(makeEvent('connection.status', { connected: true })));
  } else {
    authTimer = setTimeout(() => ws.close(4401, 'Authentication required'), 5000);
  }

  ws.on('pong', () => {
    const startedAt = websocketPingStartedAt.get(ws);
    if (startedAt !== undefined) websocketRtt.set(ws, Math.round(performance.now() - startedAt));
  });

  ws.on('message', async (raw) => {
    let envelope: unknown;
    try {
      envelope = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify(makeResponse('unknown', false, undefined, 'Invalid message format')));
      return;
    }

    if (!authenticated && envelope && typeof envelope === 'object' && 'type' in envelope
      && envelope.type === 'auth') {
      const authEnvelope = envelope as { token?: unknown };
      if (!isValidToken(authEnvelope.token)) {
        ws.send(JSON.stringify({ type: 'auth', ok: false, error: 'Unauthorized' }));
        ws.close(4401, 'Unauthorized');
        return;
      }
      markAuthenticated();
      ws.send(JSON.stringify({ type: 'auth', ok: true }));
      return;
    }

    const msg = parseMessage(raw.toString());
    if (!msg) {
      ws.send(JSON.stringify(makeResponse('unknown', false, undefined, 'Invalid message format')));
      return;
    }
    const isPublicQuery = msg.type === 'query' && ['get_status', 'get_modules'].includes(msg.action);
    if (!authenticated && !isPublicQuery) {
      ws.send(JSON.stringify(makeResponse(msg.id, false, undefined, 'Unauthorized')));
      return;
    }
    if (!authenticated && msg.action === 'get_status') {
      ws.send(JSON.stringify(makeResponse(msg.id, true, { status: 'ok' })));
      return;
    }
    const key = `${msg.type}:${msg.action}`;
    const handler = handlers[key];
    if (!handler) {
      ws.send(JSON.stringify(makeResponse(msg.id, false, undefined, `No handler for ${key}`)));
      return;
    }
    try {
      const data = await handler(msg);
      ws.send(JSON.stringify(makeResponse(msg.id, true, data)));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      ws.send(JSON.stringify(makeResponse(msg.id, false, undefined, errorMsg)));
    }
  });

  ws.on('close', () => {
    if (authTimer) clearTimeout(authTimer);
    allConnections.delete(ws);
    clients.delete(ws);
    websocketRtt.delete(ws);
  });

});

// ─── Guardian event forwarding ──────────────────────────

bacterialGuardian.subscribe((status) => {
  broadcast(makeEvent('guardian.state_change', status));
});

// ─── REST API ───────────────────────────────────────────

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const origin = req.headers.origin;
  if (origin) res.setHeader('Vary', 'Origin');
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const path = url.pathname;
  const segments = path.split('/').filter(Boolean);

  if (segments[0] !== 'api') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const route = segments.slice(1).join('/');

  const sendJson = (code: number, data: unknown) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const publicRoute = req.method === 'GET' && (route === 'status' || route === 'modules');
  if (!publicRoute && !hasBearerToken(req.headers.authorization)) {
    res.setHeader('WWW-Authenticate', 'Bearer realm="Sentra Core"');
    sendJson(401, { error: 'Unauthorized' });
    return;
  }

  try {
    if (route === 'status' && req.method === 'GET') {
      sendJson(200, {
        status: 'ok',
        evidenceCount: evolis.getEntries().length,
      });
      return;
    }

    if (route === 'modules' && req.method === 'GET') {
      sendJson(200, { modules: moduleManager.getAllModules() });
      return;
    }

    if (route === 'evidence' && req.method === 'GET') {
      const entries = evolis.getEntries();
      sendJson(200, { entries: entries.slice(-50).reverse(), total: entries.length });
      return;
    }

    if (route === 'evidence/verify' && req.method === 'POST') {
      const valid = await evolis.verify();
      sendJson(200, { valid });
      return;
    }

    if (route === 'bio/protocols' && req.method === 'GET') {
      sendJson(200, { protocols: bioSoftware.getProtocols() });
      return;
    }

    if (route === 'bio/state' && req.method === 'GET') {
      sendJson(200, bioSoftware.getState());
      return;
    }

    if (route === 'bio/stats' && req.method === 'GET') {
      sendJson(200, bioSoftware.getStats());
      return;
    }

    if (route === 'guardian/status' && req.method === 'GET') {
      sendJson(200, bacterialGuardian.getStatus());
      return;
    }

    if (route === 'usb/devices' && req.method === 'GET') {
      sendJson(200, {
        devices: usbService.getDevices().map((d) => {
          const key = `${d.vendorId}:${d.productId}:${d.serialNumber ?? 'unknown'}`;
          return { ...d, portId: key, portStatus: usbService.getPortStatus(key) };
        }),
      });
      return;
    }

    if (route === 'usb/block' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const portId = body.portId as string;
      usbService.blockPort(portId, body.reason as string | undefined);
      await evolis.registerUSBEvent(`block:${portId}`);
      broadcast(makeEvent('usb.port_change', { portId, status: usbService.getPortStatus(portId) }));
      sendJson(200, { portId, status: usbService.getPortStatus(portId) });
      return;
    }

    if (route === 'usb/unblock' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const portId = body.portId as string;
      usbService.unblockPort(portId);
      bacterialGuardian.vaccinatePort(portId);
      await evolis.registerUSBEvent(`unblock:${portId}`);
      broadcast(makeEvent('usb.port_change', { portId, status: usbService.getPortStatus(portId) }));
      sendJson(200, { portId, status: usbService.getPortStatus(portId) });
      return;
    }

    if (route === 'usb/authenticate' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const portId = body.portId as string;
      const ok = usbService.authenticateDevice(portId);
      if (!ok) bacterialGuardian.activateDefense(portId);
      await evolis.registerUSBEvent(ok ? `auth:${portId}` : `defense:${portId}`);
      broadcast(makeEvent('usb.port_change', { portId, status: usbService.getPortStatus(portId) }));
      sendJson(200, { portId, authenticated: ok, status: usbService.getPortStatus(portId) });
      return;
    }

    if (route === 'sync/status' && req.method === 'GET') {
      sendJson(200, syncManager.getStatus());
      return;
    }

    if (route === 'sync/transport' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const transport = body.transport as SyncTransport;
      syncManager.setTransport(transport);
      state.syncTransport = transport;
      broadcast(makeEvent('sync.transport_changed', { transport }));
      sendJson(200, { transport });
      return;
    }

    if (route === 'sync/connect-bluetooth' && req.method === 'POST') {
      await syncManager.connectBluetooth();
      sendJson(200, syncManager.getStatus());
      return;
    }

    if (route === 'sync/disconnect-bluetooth' && req.method === 'POST') {
      syncManager.disconnectBluetooth();
      sendJson(200, syncManager.getStatus());
      return;
    }

    if (route === 'command' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const command = body.command as string;
      const perception = (body.perception as string) ?? 'Sin percepcion activa';
      const eval_ = moralNode.evaluate(command, { externalRequest: state.worldEnabled });
      if (!eval_.allowed) {
        sendJson(200, {
          allowed: false,
          reason: eval_.decisions.find((d) => !d.passed)?.reason,
        });
        return;
      }
      const response = await geminiService.query(state.activeModule, perception, command);
      const evidence = await evolis.record(state.activeModule, 'command', command);
      sendJson(200, { allowed: true, response, evidenceId: evidence.id });
      return;
    }

    if (route === 'settings' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const key = body.key as string;
      const value = body.value;
      if (key === 'humanVeto') {
        state.humanVeto = value as boolean;
        moralNode.setHumanVeto(state.humanVeto);
      } else if (key === 'geminiRemote') {
        state.geminiRemote = value as boolean;
        geminiService.setRemoteEnabled(state.geminiRemote);
      } else if (key === 'worldEnabled') {
        state.worldEnabled = value as boolean;
        geminiService.setWorldConnected(state.worldEnabled);
      } else if (key === 'bioEnabled') {
        state.bioEnabled = value as boolean;
        bioSoftware.setEnabled(state.bioEnabled);
      } else if (key in state) {
        (state as unknown as Record<string, unknown>)[key] = value;
      }
      sendJson(200, { ok: true, key, value });
      return;
    }

    sendJson(404, { error: `No route: ${route}` });
  } catch (err) {
    const statusCode = err instanceof Error && err.name === 'PayloadTooLargeError' ? 413 : 500;
    sendJson(statusCode, { error: err instanceof Error ? err.message : 'Server error' });
  }
});

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;
    req.on('data', (chunk) => {
      if (settled) return;
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalBytes += buffer.length;
      if (totalBytes > MAX_REST_BODY_BYTES) {
        settled = true;
        const error = new Error('Request body exceeds the 64 KB limit');
        error.name = 'PayloadTooLargeError';
        reject(error);
        req.resume();
        return;
      }
      chunks.push(buffer);
    });
    req.on('end', () => {
      if (!settled) resolve(Buffer.concat(chunks).toString());
    });
    req.on('error', (error) => {
      if (!settled) reject(error);
    });
  });
}

httpServer.on('upgrade', (request, socket, head) => {
  const origin = request.headers.origin;
  if (origin && !isAllowedOrigin(origin)) {
    socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }
  if (request.headers.authorization && !hasBearerToken(request.headers.authorization)) {
    socket.write('HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Bearer\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (webSocket) => {
    wss.emit('connection', webSocket, request);
  });
});

// ─── Bio tick broadcast ─────────────────────────────────

const bioTickInterval = setInterval(() => {
  const bioState = bioSoftware.getState();
  if (bioState.currentSession) {
    const progress = bioSoftware.getProgress();
    const breathPhase = bioSoftware.getBreathPhase();
    broadcast(makeEvent('bio.tick', {
      coherence: bioState.cardiacCoherence,
      stress: bioState.stressLevel,
      focus: bioState.focusLevel,
      progress,
      breathPhase,
      breathCycles: bioState.currentSession?.metrics.breathCycles ?? 0,
    }));
    bioSoftware.tick(Date.now() - (bioState.currentSession?.startedAt ?? Date.now()));
    if (!bioSoftware.getState().currentSession) {
      broadcast(makeEvent('bio.session_ended', {}));
    }
  }
}, 1000);

let previousCpu = process.cpuUsage();
let previousCpuSampleAt = performance.now();
const performanceInterval = setInterval(() => {
  const now = performance.now();
  const elapsedMs = Math.max(1, now - previousCpuSampleAt);
  const cpuDelta = process.cpuUsage(previousCpu);
  previousCpu = process.cpuUsage();
  previousCpuSampleAt = now;
  const memory = process.memoryUsage();
  const bufferedBytes = Array.from(clients).reduce((total, client) => total + client.bufferedAmount, 0);
  const backpressuredClients = Array.from(clients).filter((client) => client.bufferedAmount > 256 * 1024).length;
  const rtts = [...websocketRtt.values()];
  const cepStats = telemetryCEP.getStats();

  broadcast(makeEvent('system.performance', {
    sampledAt: Date.now(),
    cpuPercent: Math.min(100, ((cpuDelta.user + cpuDelta.system) / (elapsedMs * 1000 * cpus().length)) * 100),
    memoryRssMb: Math.round(memory.rss / 1024 / 1024),
    heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
    websocketRttMs: rtts.length ? Math.round(rtts.reduce((sum, value) => sum + value, 0) / rtts.length) : null,
    websocketClients: clients.size,
    bufferedBytes,
    backpressuredClients,
    cepRecentSignals: cepStats.recentSignals,
    cepRules: cepStats.ruleCount,
    queueHealth: backpressuredClients > 0 ? 'backpressured' : 'healthy',
  }));
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      websocketPingStartedAt.set(client, now);
      client.ping();
    }
  }
}, 1000);

// ─── Start servers ──────────────────────────────────────

await init();

httpServer.listen(PORT, HOST, () => {
  console.log(`[Sentra Core API] REST escuchando en http://${HOST}:${PORT}/api`);
  console.log(`[Sentra Core API] WebSocket en ws://${HOST}:${PORT}`);
});

let isShuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  clearInterval(bioTickInterval);
  clearInterval(performanceInterval);

  for (const client of allConnections) {
    client.close();
  }
  clients.clear();
  allConnections.clear();

  await new Promise<void>((resolve) => {
    wss.close(() => resolve());
  });
  await new Promise<void>((resolve, reject) => {
    httpServer.close((error) => (error ? reject(error) : resolve()));
  });
  console.log(`[Sentra Core API] Apagado limpio tras ${signal}.`);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void shutdown(signal).catch((error) => {
      console.error('[Sentra Core API] Error durante el apagado:', error);
      process.exitCode = 1;
    });
  });
}
