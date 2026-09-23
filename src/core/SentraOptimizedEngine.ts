/**
 * @fileoverview Filtro EMA y cola de voz asíncrona para el ciclo Sentra Core.
 */

export class SensorFilter {
  private readonly alpha: number;
  private readonly smoothedValues = new Map<string, number>();

  constructor(alpha = 0.2) {
    if (!Number.isFinite(alpha)) throw new RangeError('alpha debe ser finito.');
    this.alpha = Math.max(0.01, Math.min(1, alpha));
  }

  filter(sensorKey: string, rawValue: number): number {
    if (!Number.isFinite(rawValue)) return rawValue;
    const previous = this.smoothedValues.get(sensorKey);
    if (previous === undefined) {
      this.smoothedValues.set(sensorKey, rawValue);
      return rawValue;
    }
    const smoothed = this.alpha * rawValue + (1 - this.alpha) * previous;
    this.smoothedValues.set(sensorKey, smoothed);
    return smoothed;
  }

  reset(): void {
    this.smoothedValues.clear();
  }
}

export class OptimizedVoiceQueue {
  private readonly queue: string[] = [];
  private isSpeaking = false;
  private readonly synth: SpeechSynthesis | null;

  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis
      : null;
  }

  enqueue(text: string, priority = false): void {
    const normalizedText = text.trim();
    if (!normalizedText || !this.synth) return;
    if (priority) {
      this.queue.unshift(normalizedText);
      if (this.synth.speaking) {
        this.synth.cancel();
        this.isSpeaking = false;
      }
    } else {
      this.queue.push(normalizedText);
    }
    this.processQueue();
  }

  clear(): void {
    this.queue.length = 0;
    this.synth?.cancel();
    this.isSpeaking = false;
  }

  dispose(): void {
    this.clear();
  }

  private processQueue(): void {
    if (this.isSpeaking || this.queue.length === 0 || !this.synth) return;
    const text = this.queue.shift();
    if (!text) return;

    this.isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-AR';
    utterance.rate = 1.15;
    const complete = (): void => {
      this.isSpeaking = false;
      this.processQueue();
    };
    utterance.onend = complete;
    utterance.onerror = complete;
    this.synth.speak(utterance);
  }
}

export const globalSensorFilter = new SensorFilter(0.25);
export const globalVoiceQueue = new OptimizedVoiceQueue();
