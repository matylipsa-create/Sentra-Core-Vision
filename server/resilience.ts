/**
 * Sentra Core - resiliencia, concurrencia y seguridad en el borde.
 */

import { z } from 'zod';

export const TelemetryPayloadSchema = z.object({
  deviceId: z.string().uuid(),
  timestamp: z.number().int().positive(),
  sensorType: z.enum(['gps', 'accel', 'proximity', 'battery']),
  value: z.number().finite(),
}).strict();

export type TelemetryPayload = z.infer<typeof TelemetryPayloadSchema>;

export class KeyedEventQueue {
  private readonly queues = new Map<string, Promise<void>>();

  async enqueue<T>(key: string, task: () => Promise<T>): Promise<T> {
    const previous = this.queues.get(key) ?? Promise.resolve();
    const current = previous.then(task);
    const queueTail = current.then(() => undefined, () => undefined);

    this.queues.set(key, queueTail);
    queueTail.finally(() => {
      if (this.queues.get(key) === queueTail) this.queues.delete(key);
    }).catch(() => undefined);

    return current;
  }
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class TCREICircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private openUntil = 0;
  private halfOpenProbeInFlight = false;

  constructor(
    private readonly providerName: string,
    private readonly failureThreshold = 5,
    private readonly baseCooldownMs = 30_000,
    private readonly maxJitterMs = 5_000,
  ) {
    if (!Number.isInteger(failureThreshold) || failureThreshold <= 0) {
      throw new RangeError('failureThreshold debe ser un entero positivo.');
    }
    if (!Number.isFinite(baseCooldownMs) || baseCooldownMs < 0) {
      throw new RangeError('baseCooldownMs debe ser un número finito no negativo.');
    }
    if (!Number.isFinite(maxJitterMs) || maxJitterMs < 0) {
      throw new RangeError('maxJitterMs debe ser un número finito no negativo.');
    }
  }

  async call<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.openUntil) return fallback();
      this.state = 'HALF_OPEN';
      console.info(`[CircuitBreaker:${this.providerName}] Pasando a HALF_OPEN para prueba.`);
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenProbeInFlight) return fallback();
      this.halfOpenProbeInFlight = true;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch {
      this.onFailure();
      return fallback();
    } finally {
      this.halfOpenProbeInFlight = false;
    }
  }

  private onSuccess(): void {
    if (this.state !== 'CLOSED') {
      console.info(`[CircuitBreaker:${this.providerName}] Servicio recuperado. Estado CLOSED.`);
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount += 1;
    console.warn(`[CircuitBreaker:${this.providerName}] Fallo detectado (${this.failureCount}/${this.failureThreshold}).`);

    if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.openUntil = Date.now() + this.baseCooldownMs + Math.random() * this.maxJitterMs;
      console.error(`[CircuitBreaker:${this.providerName}] Circuito ABIERTO.`);
    }
  }
}

const aiCircuitBreakers = new Map<string, TCREICircuitBreaker>();

export function getBreaker(provider: string): TCREICircuitBreaker {
  let breaker = aiCircuitBreakers.get(provider);
  if (!breaker) {
    breaker = new TCREICircuitBreaker(provider);
    aiCircuitBreakers.set(provider, breaker);
  }
  return breaker;
}

const eventQueue = new KeyedEventQueue();

export async function handleIncomingMQTTMessage(
  topic: string,
  rawPayload: unknown,
  deviceId: string,
): Promise<void> {
  const parsed = TelemetryPayloadSchema.safeParse(rawPayload);
  if (!parsed.success || parsed.data.deviceId !== deviceId) {
    console.warn(`[Security] Payload MQTT descartado para ${deviceId} en ${topic}:`,
      parsed.success ? 'deviceId no coincide' : parsed.error.issues);
    return;
  }

  const data = parsed.data;
  await eventQueue.enqueue(data.deviceId, async () => {
    console.info(`[Engine] Procesando telemetría segura para device: ${data.deviceId}`, data);
  });
}