export type TCREIMessageType = 'command' | 'query' | 'event' | 'response' | 'error';

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
  module: TCREIModule | 'system';
  action: TCREIAction;
  payload: Record<string, unknown>;
  timestamp: number;
  id: string;
}

export interface TCREIResponse {
  type: 'response' | 'error';
  id: string;
  ok: boolean;
  data?: unknown;
  error?: string;
  timestamp: number;
}

export interface TCREIEvent {
  type: 'event';
  event: string;
  data: unknown;
  timestamp: number;
}

export function makeMessage(
  module: TCREIMessage['module'],
  action: TCREIAction,
  payload: Record<string, unknown> = {},
  type: TCREIMessageType = 'command'
): TCREIMessage {
  return {
    type,
    module,
    action,
    payload,
    timestamp: Date.now(),
    id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
  };
}

export function makeResponse(id: string, ok: boolean, data?: unknown, error?: string): TCREIResponse {
  return {
    type: ok ? 'response' : 'error',
    id,
    ok,
    data,
    error,
    timestamp: Date.now(),
  };
}

export function makeEvent(event: string, data: unknown): TCREIEvent {
  return {
    type: 'event',
    event,
    data,
    timestamp: Date.now(),
  };
}

export function parseMessage(raw: string): TCREIMessage | null {
  try {
    const obj = JSON.parse(raw);
    if (
      typeof obj.type === 'string' &&
      typeof obj.module === 'string' &&
      typeof obj.action === 'string' &&
      typeof obj.id === 'string'
    ) {
      return obj as TCREIMessage;
    }
  } catch {
    // invalid JSON
  }
  return null;
}
