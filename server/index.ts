import { WebSocketServer, WebSocket } from 'ws';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { TCREIMessage, makeResponse, makeEvent, parseMessage } from './tcrei-protocol.js';

// Motor imports
import { evolis } from '../src/core/EVOLIS.js';
import { moralNode } from '../src/core/MoralNode.js';
import { geminiService } from '../src/core/GeminiService.js';
import { perceptionEngine } from '../src/core/PerceptionEngine.js';
import { moduleManager } from '../src/modules/ModuleManager.js';
import { bioSoftware, BioProtocol } from '../src/core/BioSoftwareInterface.js';
import { bacterialGuardian } from '../src/core/BacterialGuardian.js';
import { ternaryEthics, tritToValue } from '../src/core/TernaryMath.js';
import { usbService } from '../src/services/USBService.js';
import { PowerMode } from '../src/core/PowerManager.js';
import { syncManager, SyncTransport } from '../src/core/SyncManager.js';
import { storageService } from '../src/services/StorageService.js';

const PORT = parseInt(process.env.SENTRA_PORT ?? '8080', 10);

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

// ─── Init ───────────────────────────────────────────────

async function init(): Promise<void> {
  await evolis.initialize();
  await storageService.init();
  const entries = await storageService.getAllEvidence();
  if (entries.length > 0) evolis.importState(entries);
  bioSoftware.setEnabled(state.bioEnabled);
  moralNode.setHumanVeto(state.humanVeto);
  bacterialGuardian.activate();
}

// ─── Command handlers ───────────────────────────────────

type Handler = (msg: TCREIMessage) => Promise<unknown>;

const handlers: Record<string, Handler> = {
  'command:process': async (msg) => {
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
    await storageService.saveEvidence(evidence);
    broadcast(makeEvent('evidence.recorded', { id: evidence.id, index: evidence.entry.index }));
    return { allowed: true, response };
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

  'command:export': async () => {
    await storageService.downloadExport();
    return { exported: true };
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

const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });
const clients = new Set<WebSocket>();

function broadcast(data: unknown): void {
  const msg = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('message', async (raw) => {
    const msg = parseMessage(raw.toString());
    if (!msg) {
      ws.send(JSON.stringify(makeResponse('unknown', false, undefined, 'Invalid message format')));
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

  ws.on('close', () => clients.delete(ws));

  ws.send(JSON.stringify(makeEvent('connection.status', { connected: true })));
});

// ─── Guardian event forwarding ──────────────────────────

bacterialGuardian.subscribe((status) => {
  broadcast(makeEvent('guardian.state_change', status));
});

// ─── REST API ───────────────────────────────────────────

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
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

  try {
    if (route === 'status' && req.method === 'GET') {
      sendJson(200, {
        activeModule: state.activeModule,
        voiceEnabled: state.voiceEnabled,
        humanVeto: state.humanVeto,
        powerMode: state.powerMode,
        evidenceCount: evolis.getEntries().length,
        bioState: bioSoftware.getState(),
        guardianState: bacterialGuardian.getStatus().state,
        modules: moduleManager.getAllModules(),
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
      await storageService.saveEvidence(evidence);
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
        (state as Record<string, unknown>)[key] = value;
      }
      sendJson(200, { ok: true, key, value });
      return;
    }

    sendJson(404, { error: `No route: ${route}` });
  } catch (err) {
    sendJson(500, { error: err instanceof Error ? err.message : 'Server error' });
  }
});

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

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
    bioSoftware.tick((Date.now() - (bioState.currentSession?.startedAt ?? Date.now())) * 1000);
    if (!bioSoftware.getState().currentSession) {
      broadcast(makeEvent('bio.session_ended', {}));
    }
  }
}, 1000);

// ─── Start servers ──────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`[Sentra Core API] REST escuchando en http://localhost:${PORT}/api`);
  console.log(`[Sentra Core API] WebSocket en ws://localhost:${PORT}`);
});

let isShuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  clearInterval(bioTickInterval);

  for (const client of clients) {
    client.close();
  }
  clients.clear();

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
