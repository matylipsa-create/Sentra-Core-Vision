/**
 * @fileoverview Circuit Breaker para aislar fallos transitorios de red.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  readonly failureThreshold: number;
  readonly successThreshold: number;
  readonly cooldownMs: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private nextAttemptTimestamp = 0;
  private halfOpenProbeInFlight = false;

  constructor(private readonly options: CircuitBreakerOptions) {
    if (!Number.isInteger(options.failureThreshold) || options.failureThreshold <= 0) {
      throw new RangeError('failureThreshold debe ser un entero positivo.');
    }
    if (!Number.isInteger(options.successThreshold) || options.successThreshold <= 0) {
      throw new RangeError('successThreshold debe ser un entero positivo.');
    }
    if (!Number.isFinite(options.cooldownMs) || options.cooldownMs < 0) {
      throw new RangeError('cooldownMs debe ser un número finito no negativo.');
    }
  }

  getState(): CircuitState {
    this.evaluateStateTransition();
    return this.state;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    this.evaluateStateTransition();
    if (this.state === 'OPEN') {
      throw new Error(
        `CircuitBreaker [OPEN]: operación bloqueada hasta ${new Date(this.nextAttemptTimestamp).toISOString()}.`,
      );
    }
    if (this.state === 'HALF_OPEN' && this.halfOpenProbeInFlight) {
      throw new Error('CircuitBreaker [HALF_OPEN]: ya existe una prueba de recuperación en curso.');
    }

    const isProbe = this.state === 'HALF_OPEN';
    this.halfOpenProbeInFlight = isProbe;
    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error: unknown) {
      this.onFailure();
      throw error;
    } finally {
      if (isProbe) this.halfOpenProbeInFlight = false;
    }
  }

  private evaluateStateTransition(): void {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttemptTimestamp) {
      this.state = 'HALF_OPEN';
      this.successes = 0;
      this.halfOpenProbeInFlight = false;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state !== 'HALF_OPEN') return;
    this.successes += 1;
    if (this.successes >= this.options.successThreshold) {
      this.state = 'CLOSED';
      this.successes = 0;
    }
  }

  private onFailure(): void {
    this.failures += 1;
    if (this.state === 'CLOSED' && this.failures >= this.options.failureThreshold) {
      this.open(this.options.cooldownMs);
    } else if (this.state === 'HALF_OPEN') {
      this.open(this.options.cooldownMs * 2);
    }
  }

  private open(cooldownMs: number): void {
    this.state = 'OPEN';
    this.nextAttemptTimestamp = Date.now() + cooldownMs;
    this.successes = 0;
    this.halfOpenProbeInFlight = false;
  }
}
