/**
 * EventRouter — Router y dispatcher de eventos interno.
 *
 * Enruta eventos segun contexto, intensidad y evaluacion moral,
 * y ejecuta acciones nativas (voz, vibracion, registro EVOLIS, alertas).
 * Reemplaza los nodos Filter, Switch y Action de n8n.
 */

import { moralNode } from './MoralNode';
import { ternaryEthics, tritToValue, Trit } from './TernaryMath';
import { voiceManager } from '../services/VoiceManager';
import { deviceManager } from './DeviceManager';
import { evolis } from './EVOLIS';
import { offlineLogger } from './OfflineLogger';
import type { ContextGovernorPort } from './ContextGovernor';

export type RouteActionType = 'voice' | 'vibrate' | 'evolis_record' | 'alert' | 'log' | 'block';

export type ActionType = 'voice' | 'vibrate' | 'evolis_record' | 'alert' | 'log';

export interface RouteDecision {
  actionType: RouteActionType;
  target: string;
  priority: number;
  intensity: number;
  moralAllowed: boolean;
  ternaryLabel: string;
  reason: string;
}

export interface RoutableEvent {
  id: string;
  source: string;
  category: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface DispatchAction {
  type: ActionType;
  level: 'info' | 'warning' | 'critical';
  message: string;
  category: string;
  data?: Record<string, unknown>;
}

type ActionListener = (action: DispatchAction) => void;

const CATEGORY_ACTION_MAP: Record<string, RouteActionType> = {
  ambient: 'log',
  motion: 'alert',
  vision: 'voice',
  audio: 'alert',
  contact: 'alert',
  gas: 'alert',
  flow: 'alert',
  location: 'log',
  system: 'log',
};

class EventRouter {
  private actionListeners = new Set<ActionListener>();
  private actionLog: DispatchAction[] = [];
  private readonly maxActionLog = 200;

  // ── Routing ────────────────────────────────────────────────────────────

  route(event: RoutableEvent): RouteDecision {
    const moralEval = moralNode.evaluate(event.message);
    const intensity = this.evaluateIntensity(event);
    const ternaryResult = ternaryEthics.evaluate(
      moralEval.allowed,
      false,
      true,
      true,
    );

    let actionType: RouteActionType = CATEGORY_ACTION_MAP[event.category] ?? 'log';
    if (!moralEval.allowed) {
      actionType = 'block';
    } else if (event.level === 'critical') {
      actionType = 'alert';
    } else if (event.level === 'warning' && intensity > 0.7) {
      actionType = 'alert';
    }

    return {
      actionType,
      target: this.resolveTarget(event, actionType),
      priority: this.intensityToPriority(intensity),
      intensity,
      moralAllowed: moralEval.allowed,
      ternaryLabel: tritToValue(ternaryResult.value as Trit),
      reason: moralEval.allowed
        ? `Enrutado a ${actionType} (intensidad ${(intensity * 100).toFixed(0)}%)`
        : moralEval.decisions.find((d) => !d.passed)?.reason ?? 'Bloqueado',
    };
  }

  filter(event: RoutableEvent): boolean {
    if (!event.message || event.message.trim().length === 0) return false;
    const moralEval = moralNode.evaluate(event.message);
    return moralEval.allowed;
  }

  evaluateIntensity(event: RoutableEvent): number {
    let base = 0.3;
    if (event.level === 'critical') base = 0.9;
    else if (event.level === 'warning') base = 0.6;
    else base = 0.3;

    if (event.data) {
      const keys = Object.keys(event.data);
      if (keys.length > 5) base += 0.05;
      const hasNumeric = Object.values(event.data).some((v) => typeof v === 'number');
      if (hasNumeric) base += 0.05;
    }

    return Math.min(1, base);
  }

  enrich(event: RoutableEvent): RoutableEvent {
    const intensity = this.evaluateIntensity(event);
    const moralEval = moralNode.evaluate(event.message);
    return {
      ...event,
      data: {
        ...event.data,
        enriched: true,
        intensity,
        moralAllowed: moralEval.allowed,
        timestamp: Date.now(),
      },
    };
  }

  private resolveTarget(_event: RoutableEvent, actionType: RouteActionType): string {
    if (actionType === 'block') return 'moral_node';
    if (actionType === 'voice') return 'voice_manager';
    if (actionType === 'vibrate') return 'device_manager';
    if (actionType === 'evolis_record') return 'evolis';
    if (actionType === 'alert') return 'alert_module';
    return 'offline_logger';
  }

  private intensityToPriority(intensity: number): number {
    if (intensity >= 0.8) return 1;
    if (intensity >= 0.5) return 2;
    return 3;
  }

  // ── Priority cooldowns ─────────────────────────────────────────────────

  private _priorityCooldowns: Record<string, number> = {
    CRITICAL: 500,
    NAVIGATION: 1500,
    DESCRIPTIVE: 3000,
  };
  private _lastEventTime: Record<string, number> = {};
  private contextGovernor: ContextGovernorPort | null = null;

  public setContextGovernor(governor: ContextGovernorPort): void {
    this.contextGovernor = governor;
  }

  public routeWithPriority(
    level: 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE',
    handler: () => void
  ): boolean {
    const now = Date.now();
    const cooldown = this._priorityCooldowns[level] || 1000;
    const last = this._lastEventTime[level] || 0;
    if (now - last < cooldown) return false;
    if (level !== 'CRITICAL' && this.contextGovernor?.isCriticalActive()) return false;
    this._lastEventTime[level] = now;
    handler();
    return true;
  }

  // ── Dispatch (merged from ActionDispatcher) ────────────────────────────

  dispatch(action: DispatchAction): void {
    this.actionLog.unshift(action);
    if (this.actionLog.length > this.maxActionLog) this.actionLog.pop();

    switch (action.type) {
      case 'voice':
        this.doVoice(action);
        break;
      case 'vibrate':
        this.doVibrate(action);
        break;
      case 'evolis_record':
        void this.doEvolisRecord(action);
        break;
      case 'alert':
        this.doAlert(action);
        break;
      case 'log':
        this.doLog(action);
        break;
    }

    for (const listener of this.actionListeners) listener(action);
  }

  sendAlert(level: DispatchAction['level'], message: string): void {
    this.dispatch({
      type: 'alert',
      level,
      message,
      category: 'system',
    });
  }

  logEvent(event: { type: string; message: string; data?: unknown }): void {
    this.dispatch({
      type: 'log',
      level: 'info',
      message: event.message,
      category: event.type,
      data: event.data as Record<string, unknown> | undefined,
    });
  }

  getActionLog(): DispatchAction[] {
    return [...this.actionLog];
  }

  subscribeActions(listener: ActionListener): () => void {
    this.actionListeners.add(listener);
    return () => this.actionListeners.delete(listener);
  }

  private doVoice(action: DispatchAction): void {
    const priority = action.level === 'critical' ? 1 : action.level === 'warning' ? 2 : 3;
    voiceManager.speak(action.message, priority);
  }

  private doVibrate(action: DispatchAction): void {
    const pattern: number | number[] = action.level === 'critical'
      ? [200, 100, 200, 100, 200]
      : action.level === 'warning'
        ? [100, 50, 100]
        : 80;
    deviceManager.vibrate(pattern);
  }

  private async doEvolisRecord(action: DispatchAction): Promise<void> {
    await evolis.record('dispatcher', action.type, JSON.stringify({
      category: action.category,
      message: action.message,
      level: action.level,
    }));
  }

  private doAlert(action: DispatchAction): void {
    offlineLogger.log({
      type: 'alert',
      message: action.message,
      level: action.level,
    });
    if (action.level === 'critical' || action.level === 'warning') {
      deviceManager.vibrate(action.level === 'critical' ? [200, 100, 200] : 100);
    }
  }

  private doLog(action: DispatchAction): void {
    offlineLogger.log({
      type: action.category,
      message: action.message,
      data: action.data,
    });
  }
}

export const eventRouter = new EventRouter();
