/**
 * Sentra Core Vision - Accessibility Bridge Module
 * Transforma eventos de visión táctica en salida de voz/háptica para TalkBack y NVDA.
 */

export interface AccessibilityConfig {
  minConfidence?: number;
  cooldownMs?: number;
}

export interface VisionDetection {
  label: string;
  distance?: number;
  clockPosition?: string;
  confidence: number;
}

export interface VoicePriorityPort {
  speakPriority(text: string, priority: 'critical' | 'normal' | 'low'): void;
}

class SentraVisionAccessibility {
  private minConfidence: number;
  private cooldownMs: number;
  private lastAnnounced: Map<string, number> = new Map();
  private synth: SpeechSynthesis | null = null;
  private ariaAnnouncer: HTMLDivElement | null = null;

  constructor(config: AccessibilityConfig = {}) {
    this.minConfidence = config.minConfidence ?? 0.65;
    this.cooldownMs = config.cooldownMs ?? 2500;
    this.initAccessibility();
  }

  private initAccessibility(): void {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
    if (typeof document !== 'undefined') {
      this.ariaAnnouncer = document.createElement('div');
      this.ariaAnnouncer.setAttribute('id', 'sentra-vision-live-region');
      this.ariaAnnouncer.setAttribute('aria-live', 'assertive');
      this.ariaAnnouncer.setAttribute('aria-atomic', 'true');
      this.ariaAnnouncer.style.cssText =
        'position:absolute; width:1px; height:1px; margin:-1px; overflow:hidden; clip:rect(0,0,0,0);';
      document.body.appendChild(this.ariaAnnouncer);
    }
  }

  processDetections(detections: VisionDetection[]): void {
    const now = Date.now();
    for (const item of detections) {
      if (item.confidence < this.minConfidence) continue;
      const objectKey = `${item.label}_${item.clockPosition ?? 'unknown'}`;
      const lastTime = this.lastAnnounced.get(objectKey) ?? 0;
      if (now - lastTime > this.cooldownMs) {
        const message = this.formatSpatialMessage(item);
        this.announce(message);
        this.triggerHapticFeedback(item.distance);
        this.lastAnnounced.set(objectKey, now);
      }
    }
  }

  private formatSpatialMessage(item: VisionDetection): string {
    let msg = item.label;
    if (item.clockPosition) msg += ` a las ${item.clockPosition}`;
    if (item.distance !== undefined) msg += `, a ${item.distance} metros`;
    return msg;
  }

  private announce(message: string): void {
    if (this.ariaAnnouncer) {
      this.ariaAnnouncer.textContent = '';
      window.setTimeout(() => {
        if (this.ariaAnnouncer) this.ariaAnnouncer.textContent = message;
      }, 50);
    }
    if (this.synth && !this.synth.speaking) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      this.synth.speak(utterance);
    }
  }

  private triggerHapticFeedback(distance?: number): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (distance !== undefined && distance < 1.0) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      } else if (distance !== undefined && distance < 2.5) {
        navigator.vibrate(200);
      }
    }
  }

  private voiceManager: VoicePriorityPort | null = null;

  public setVoiceManager(voiceManager: VoicePriorityPort): void {
    this.voiceManager = voiceManager;
  }

  public announcePriority(text: string, priority: 'critical' | 'normal' | 'low' = 'normal'): void {
    if (this.voiceManager) {
      this.voiceManager.speakPriority(text, priority);
      return;
    }
    this.announce(text);
  }
}

export default SentraVisionAccessibility;
