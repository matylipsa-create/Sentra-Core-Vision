export type NotificationLevel = 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE' | 'INFO';
export type CognitiveLoadLevel = 'low' | 'medium' | 'high';

export interface NotificationEvent {
  type?: string;
  level?: string;
  priority?: string;
  category?: string;
  message?: string;
}

export class EthicalNotificationFilter {
  private lastNotificationTs = 0;

  shouldNotify(event: NotificationEvent | string, loadLevel: CognitiveLoadLevel = 'low'): boolean {
    const normalized = typeof event === 'string' ? event : (event.level ?? event.priority ?? event.type ?? event.category ?? 'INFO');
    const level = String(normalized).toUpperCase();
    const now = Date.now();

    const allowedByLoad =
      loadLevel === 'high'
        ? level === 'CRITICAL'
        : loadLevel === 'medium'
          ? level === 'CRITICAL' || level === 'NAVIGATION'
          : true;

    if (!allowedByLoad) return false;

    const cooldownMs = 3000;
    if (now - this.lastNotificationTs < cooldownMs) return false;

    this.lastNotificationTs = now;
    return true;
  }

  getSoftTone(): 'soft' {
    return 'soft';
  }
}

export const ethicalNotificationFilter = new EthicalNotificationFilter();
