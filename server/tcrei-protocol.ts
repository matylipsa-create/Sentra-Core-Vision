export type TCREIMessageType =
  | 'telemetry' | 'command' | 'event' | 'auth' | 'ack'
  | 'query' | 'response' | 'error';

export type TCREIModule =
  | 'vision' | 'seguridad' | 'movimiento' | 'juego'
  | 'aprendizaje' | 'impacto' | 'silencio' | 'evidencia' | 'bio' | 'guardian';

export type TCREIAction =
  | 'process' | 'start_session' | 'stop_session' | 'get_reframe'
  | 'verify' | 'export' | 'activate' | 'deactivate'
  | 'resolve_alert' | 'clear_alerts' | 'dismiss_quarantine'
  | 'set_module' | 'set_setting' | 'get_status' | 'get_evidence'
  | 'get_protocols' | 'get_bio_state' | 'get_bio_stats'
  | 'get_guardian_status' | 'check_chain'
  | 'get_usb_devices' | 'block_port' | 'unblock_port'
  | 'authenticate_device' | 'deploy_bacteria' | 'vaccinate_port'
  | 'get_sync_status' | 'set_sync_transport'
  | 'connect_bluetooth' | 'disconnect_bluetooth'
  | 'get_plugins' | 'attach_plugin' | 'activate_plugin' | 'deactivate_plugin' | 'detach_plugin'
  | 'telemetry' | 'operator_action';

export interface TCREIMessage {
  type: TCREIMessageType;
  module: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: number;
  id: string;
  signature?: string;
}

export interface TCREIResponse {
  type: 'response' | 'error';
  id: string;
  ok: boolean;
  module: 'system';
  action: 'response';
  payload: { ok: boolean; data?: unknown; error?: string };
  data?: unknown;
  error?: string;
  timestamp: number;
}

export interface TCREIEvent {
  type: 'event';
  event: string;
  data: unknown;
  module: TCREIMessage['module'];
  action: string;
  payload: Record<string, unknown>;
  id: string;
  timestamp: number;
  signature?: string;
}

export interface TCREIAck {
  type: 'ack';
  module: 'system';
  action: 'ack';
  payload: { ok: boolean; data?: unknown; error?: string };
  timestamp: number;
  id: string;
  signature?: string;
}

export interface TCREIAuthResult {
  type: 'auth';
  module: 'system';
  action: 'authenticate';
  payload: { ok: boolean; error?: string };
  timestamp: number;
  id: string;
  ok: boolean;
  error?: string;
}

const MESSAGE_TYPES = new Set<TCREIMessageType>([
  'telemetry', 'command', 'event', 'auth', 'ack', 'query', 'response', 'error',
]);

function createMessageId(): string {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function makeMessage(
  module: string,
  action: string,
  payload: Record<string, unknown> = {},
  type: TCREIMessageType = 'command',
  signature?: string,
): TCREIMessage {
  return {
    type,
    module,
    action,
    payload,
    timestamp: Date.now(),
    id: createMessageId(),
    ...(signature === undefined ? {} : { signature }),
  };
}

export function makeResponse(id: string, ok: boolean, data?: unknown, error?: string): TCREIResponse {
  return {
    type: ok ? 'response' : 'error',
    id,
    ok,
    module: 'system',
    action: 'response',
    payload: {
      ok,
      ...(data === undefined ? {} : { data }),
      ...(error === undefined ? {} : { error }),
    },
    data,
    error,
    timestamp: Date.now(),
  };
}

export function makeEvent(event: string, data: unknown): TCREIEvent {
  const payload = data !== null && typeof data === 'object' && !Array.isArray(data)
    ? data as Record<string, unknown>
    : { value: data };
  return {
    type: 'event',
    event,
    data,
    module: 'system',
    action: event,
    payload,
    id: createMessageId(),
    timestamp: Date.now(),
  };
}

export function makeAck(id: string, ok: boolean, data?: unknown, error?: string): TCREIAck {
  return {
    type: 'ack',
    module: 'system',
    action: 'ack',
    payload: {
      ok,
      ...(data === undefined ? {} : { data }),
      ...(error === undefined ? {} : { error }),
    },
    timestamp: Date.now(),
    id,
  };
}

export function makeAuthResult(id: string, ok: boolean, error?: string): TCREIAuthResult {
  return {
    type: 'auth',
    module: 'system',
    action: 'authenticate',
    payload: { ok, ...(error === undefined ? {} : { error }) },
    timestamp: Date.now(),
    id,
    ok,
    ...(error === undefined ? {} : { error }),
  };
}

export function parseMessage(raw: string): TCREIMessage | null {
  try {
    const obj: unknown = JSON.parse(raw);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    const candidate = obj as Record<string, unknown>;
    const payload = candidate.payload;
    if (
      typeof candidate.type === 'string' && MESSAGE_TYPES.has(candidate.type as TCREIMessageType) &&
      typeof candidate.module === 'string' && candidate.module.length > 0 &&
      typeof candidate.action === 'string' && candidate.action.length > 0 &&
      typeof candidate.id === 'string' && candidate.id.length > 0 &&
      payload !== null && typeof payload === 'object' && !Array.isArray(payload) &&
      typeof candidate.timestamp === 'number' && Number.isSafeInteger(candidate.timestamp) && candidate.timestamp >= 0 &&
      (candidate.signature === undefined || typeof candidate.signature === 'string')
    ) {
      return candidate as unknown as TCREIMessage;
    }
  } catch {
    // invalid JSON
  }
  return null;
}
