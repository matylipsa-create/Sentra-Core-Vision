import { offlineQueueStorage, type TCREICommand } from './OfflineQueueStorage';
import { API_TOKEN_CHANGED_EVENT, getApiToken } from './ApiSession';

export type BusConnectionStatus = 'ONLINE' | 'OFFLINE' | 'RECONNECTING';

export interface BusSnapshot {
  status: BusConnectionStatus;
  rttMs: number | null;
  queuedCount: number;
  message: string;
}

type BusListener = (snapshot: BusSnapshot) => void;
type EventListener = (name: string, data: unknown) => void;
type ServerMessage = {
  type?: string;
  id?: string;
  ok?: boolean;
  error?: string;
  event?: string;
  data?: unknown;
};

const RETRY_INITIAL_MS = 1000;
const RETRY_MAX_MS = 30000;
const PING_INTERVAL_MS = 5000;
const ACK_TIMEOUT_MS = 10000;

function createMessageId(): string {
  return window.crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function resolveBusUrl(): string | null {
  if (import.meta.env.VITE_SENTRA_WS_URL) return import.meta.env.VITE_SENTRA_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:8080`;
}

export class ResilientTCREIBus {
  private socket: WebSocket | null = null;
  private listeners = new Set<BusListener>();
  private eventListeners = new Set<EventListener>();
  private snapshot: BusSnapshot = {
    status: 'OFFLINE',
    rttMs: null,
    queuedCount: 0,
    message: 'Bus local sin conexión.',
  };
  private reconnectTimer: number | null = null;
  private pingTimer: number | null = null;
  private ackTimer: number | null = null;
  private authTimer: number | null = null;
  private retryDelay = RETRY_INITIAL_MS;
  private stopped = true;
  private authRejected = false;
  private pingRequest: { id: string; startedAt: number } | null = null;
  private sendingEntryId: number | null = null;
  private sendingMessageId: string | null = null;

  subscribe(listener: BusListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  start(): void {
    if (!this.stopped) return;
    this.stopped = false;
    window.addEventListener(API_TOKEN_CHANGED_EVENT, this.handleTokenChange);
    if (!resolveBusUrl()) {
      this.update({ status: 'OFFLINE', message: 'Configura VITE_SENTRA_WS_URL para conectar el bus remoto.' });
      return;
    }
    this.connect();
    void this.refreshQueueCount();
  }

  stop(): void {
    this.stopped = true;
    window.removeEventListener(API_TOKEN_CHANGED_EVENT, this.handleTokenChange);
    this.clearTimer('reconnectTimer');
    this.clearTimer('pingTimer');
    this.clearTimer('ackTimer');
    this.clearTimer('authTimer');
    this.pingRequest = null;
    this.sendingEntryId = null;
    this.sendingMessageId = null;
    const socket = this.socket;
    this.socket = null;
    socket?.close();
  }

  async enqueue(action: 'telemetry' | 'operator_action', payload: Record<string, unknown>): Promise<void> {
    const message: TCREICommand = {
      type: 'command',
      module: action === 'telemetry' ? 'vision' : 'system',
      action,
      payload,
      timestamp: Date.now(),
      id: createMessageId(),
    };
    await offlineQueueStorage.enqueue(message);
    await this.refreshQueueCount();
    void this.flushOutbox();
  }

  private connect(): void {
    if (this.stopped) return;
    if (!getApiToken()) {
      this.update({ status: 'OFFLINE', message: 'Configura el token del backend en Ajustes > API.' });
      return;
    }
    const url = resolveBusUrl();
    if (!url) return;
    this.update({ status: 'RECONNECTING', message: 'Conectando al bus TCREI...' });

    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;
    this.authRejected = false;

    socket.onopen = () => {
      if (this.socket !== socket || this.stopped) return;
      const token = getApiToken();
      if (!token) {
        socket.close();
        return;
      }
      socket.send(JSON.stringify({ type: 'auth', token }));
      this.authTimer = window.setTimeout(() => socket.close(), ACK_TIMEOUT_MS);
    };

    socket.onmessage = (event) => {
      if (this.socket !== socket || this.stopped) return;
      this.handleMessage(String(event.data));
    };

    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (this.socket !== socket || this.stopped) return;
      this.socket = null;
      this.clearTimer('pingTimer');
      this.clearTimer('ackTimer');
      this.clearTimer('authTimer');
      this.pingRequest = null;
      this.sendingEntryId = null;
      this.sendingMessageId = null;
      this.update({ status: 'RECONNECTING', rttMs: null, message: 'Bus desconectado; reintentando conexión.' });
      if (this.authRejected) {
        this.authRejected = false;
        this.update({ status: 'OFFLINE', message: 'El token del backend fue rechazado.' });
      } else this.scheduleReconnect();
    };
  }

  private handleMessage(raw: string): void {
    let message: ServerMessage;
    try {
      message = JSON.parse(raw) as ServerMessage;
    } catch {
      this.update({ message: 'Se recibió un mensaje de bus no válido.' });
      return;
    }

    if (message.type === 'auth') {
      this.clearTimer('authTimer');
      if (message.ok !== true) {
        this.authRejected = true;
        this.update({ status: 'OFFLINE', message: 'El token del backend fue rechazado.' });
        this.socket?.close();
        return;
      }
      this.retryDelay = RETRY_INITIAL_MS;
      this.update({ status: 'ONLINE', message: 'Sesión autenticada con el bus TCREI.' });
      this.ping();
      this.pingTimer = window.setInterval(() => this.ping(), PING_INTERVAL_MS);
      void this.flushOutbox();
      return;
    }

    if (message.type === 'response' || message.type === 'error') {
      const pingRequest = this.pingRequest;
      if (pingRequest && pingRequest.id === message.id) {
        const rttMs = Math.round(performance.now() - pingRequest.startedAt);
        this.pingRequest = null;
        this.update({ rttMs, message: message.ok ? 'Estado del bus actualizado.' : message.error ?? 'Error en el ping.' });
      }
      if (this.sendingEntryId !== null && this.sendingMessageId === message.id) {
        void this.acknowledgeOutbox(message);
      }
      return;
    }

    if (message.type === 'event' && message.event) {
      for (const listener of this.eventListeners) listener(message.event, message.data);
    }
  }

  private ping(): void {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const id = createMessageId();
    this.pingRequest = { id, startedAt: performance.now() };
    socket.send(JSON.stringify({
      type: 'query',
      module: 'system',
      action: 'get_status',
      payload: {},
      timestamp: Date.now(),
      id,
    }));
  }

  private async flushOutbox(): Promise<void> {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN || this.sendingEntryId !== null) return;
    try {
      const [next] = await offlineQueueStorage.list();
      if (!next?.id || this.socket !== socket || socket.readyState !== WebSocket.OPEN) return;
      this.sendingEntryId = next.id;
      this.sendingMessageId = next.message.id;
      socket.send(JSON.stringify(next.message));
      this.ackTimer = window.setTimeout(() => {
        if (this.sendingEntryId !== next.id) return;
        this.sendingEntryId = null;
        this.sendingMessageId = null;
        socket.close();
      }, ACK_TIMEOUT_MS);
    } catch (error) {
      console.error('[ResilientTCREIBus] No se pudo leer la cola offline:', error);
      this.update({ message: 'No se pudo acceder a la cola offline local.' });
    }
  }

  private async acknowledgeOutbox(message: ServerMessage): Promise<void> {
    if (this.sendingEntryId === null) return;
    const entryId = this.sendingEntryId;
    this.sendingEntryId = null;
    this.sendingMessageId = null;
    this.clearTimer('ackTimer');
    if (message.ok) {
      try {
        await offlineQueueStorage.remove(entryId);
        await this.refreshQueueCount();
        void this.flushOutbox();
      } catch (error) {
        console.error('[ResilientTCREIBus] No se pudo confirmar la cola offline:', error);
      }
    } else {
      this.update({ message: message.error ?? 'El servidor rechazó un evento pendiente.' });
      this.socket?.close();
    }
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.reconnectTimer !== null) return;
    const delay = this.retryDelay;
    this.retryDelay = Math.min(this.retryDelay * 2, RETRY_MAX_MS);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private handleTokenChange = (): void => {
    if (this.stopped) return;
    this.clearTimer('reconnectTimer');
    this.clearTimer('pingTimer');
    this.clearTimer('ackTimer');
    this.clearTimer('authTimer');
    const socket = this.socket;
    this.socket = null;
    socket?.close();
    if (getApiToken()) this.connect();
    else this.update({ status: 'OFFLINE', message: 'Configura el token del backend en Ajustes > API.' });
  };

  private async refreshQueueCount(): Promise<void> {
    try {
      this.update({ queuedCount: await offlineQueueStorage.count() });
    } catch (error) {
      console.error('[ResilientTCREIBus] No se pudo contar la cola offline:', error);
    }
  }

  private update(changes: Partial<BusSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...changes };
    for (const listener of this.listeners) listener(this.snapshot);
  }

  private clearTimer(key: 'reconnectTimer' | 'pingTimer' | 'ackTimer' | 'authTimer'): void {
    const timer = this[key];
    if (timer === null) return;
    if (key === 'pingTimer') window.clearInterval(timer);
    else window.clearTimeout(timer);
    this[key] = null;
  }
}
