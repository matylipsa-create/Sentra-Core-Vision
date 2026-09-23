/**
 * SentraGuardianHub — Hub central del Motor de Contexto y Prioridad Operativa.
 *
 * Unifica Visión y Sentinel con 3 niveles jerárquicos:
 *   CRÍTICO (Sentinel) > NAVEGACIÓN (Visión) > DESCRIPTIVO (TTS a demanda)
 *
 * Sentinel interrumpe Visión de forma determinista con cooldown de 5s.
 * Audio 3D binaural real vía SpatialAudioEngine. Haptics vía DeviceManager.
 * TTS unificado vía SentraVisionAccessibility.announcePriority.
 * Prioridad delegada a ContextGovernor (sin estado duplicado).
 */

import { priorityQueue, type PriorityLevel } from './PriorityQueue';
import { spatialAudioEngine } from './SpatialAudioEngine';
import { deviceManager } from './DeviceManager';
import { quadrantGestures, type Quadrant } from './QuadrantGestures';
import { evolis } from './EVOLIS';
import { contextGovernor } from './ContextGovernor';
import { bacterialGuardian } from './BacterialGuardian';
import { eventRouter } from './EventRouter';
import { voiceManager } from '../services/VoiceManager';
import SentraVisionAccessibility from '../modules/SentraVisionAccessibility';

export interface VisionDetectionInput {
  label: string;
  confidence: number;
  panX?: number;
  distance?: number;
}

export interface SentinelEventInput {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  source: string;
}

export interface HubState {
  sentinelAlertActive: boolean;
  currentPriorityLevel: PriorityLevel;
  lastSentinelEvent: SentinelEventInput | null;
  lastVisionDetection: VisionDetectionInput | null;
  spatialAudioEnabled: boolean;
}

type HubListener = (state: HubState) => void;
type QuadrantHandler = (quadrant: Quadrant) => void;

type GovernorLevel = 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE';

const SENTINEL_RELEASE_MS = 5000;

function fromGovernorLevel(level: GovernorLevel): PriorityLevel {
  if (level === 'CRITICAL') return 'critical';
  if (level === 'NAVIGATION') return 'navigation';
  return 'descriptive';
}

/**
 * Registra un evento en EVOLIS sin romper si falla.
 */
function safeEvolisRecord(module: string, type: string, detail: string): void {
  try {
    void evolis.record(module, type, detail).catch((error: unknown) => {
      console.warn('[SentraGuardianHub] Error registrando EVOLIS:', error);
    });
  } catch (error: unknown) {
    console.warn('[SentraGuardianHub] Error iniciando registro EVOLIS:', error);
  }
}

/**
 * setTimeout seguro (funciona en browser y SSR).
 */
function safeSetTimeout(fn: () => void, ms: number): number {
  if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
    return window.setTimeout(fn, ms);
  }
  return setTimeout(fn, ms) as unknown as number;
}

/**
 * clearTimeout seguro.
 */
function safeClearTimeout(id: number | null): void {
  if (id === null) return;
  try {
    if (typeof window !== 'undefined' && typeof window.clearTimeout === 'function') {
      window.clearTimeout(id);
    } else {
      clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
    }
  } catch (_) {
    /* noop */
  }
}

/**
 * Cancela el speechSynthesis si está disponible.
 */
function safeCancelSpeech(): void {
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch (_) {
    /* noop */
  }
}

class SentraGuardianHub {
  private sentinelAlertActive = false;
  private lastSentinelEvent: SentinelEventInput | null = null;
  private lastVisionDetection: VisionDetectionInput | null = null;
  private spatialAudioEnabled = true;
  private listeners = new Set<HubListener>();
  private sentinelReleaseTimer: number | null = null;
  private quadrantTapHandlers = new Map<Quadrant, QuadrantHandler>();
  private quadrantLongPressHandlers = new Map<Quadrant, QuadrantHandler>();
  private _multimodalInitialized = false;
  private accessibility = new SentraVisionAccessibility({ minConfidence: 0.5 });

  getState(): HubState {
    return {
      sentinelAlertActive: this.sentinelAlertActive,
      currentPriorityLevel: fromGovernorLevel(contextGovernor.getPriorityLevel()),
      lastSentinelEvent: this.lastSentinelEvent,
      lastVisionDetection: this.lastVisionDetection,
      spatialAudioEnabled: this.spatialAudioEnabled,
    };
  }

  subscribe(listener: HubListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  setSpatialAudioEnabled(enabled: boolean): void {
    this.spatialAudioEnabled = enabled;
    this.notify();
  }

  initSpatialAudio(): void {
    try {
      if (!spatialAudioEngine.isInitialized()) {
        spatialAudioEngine.init();
      }
    } catch (error: unknown) {
      console.warn('[SentraGuardianHub] Error inicializando audio espacial:', error);
    }
  }

  initMultimodal(): void {
    if (this._multimodalInitialized) return;

    try {
      bacterialGuardian.setContextGovernor(contextGovernor);
      eventRouter.setContextGovernor(contextGovernor);
      this.accessibility.setVoiceManager(voiceManager);

      if (typeof window !== 'undefined') {
        (window as unknown as { __sentraAccessibility?: SentraVisionAccessibility }).__sentraAccessibility =
          this.accessibility;
      }

      this._multimodalInitialized = true;
      console.log('[SentraGuardianHub] Multimodal wiring completado.');
    } catch (err) {
      console.warn('[SentraGuardianHub] Error en initMultimodal:', err);
    }
  }

  onVisionDetection(detection: VisionDetectionInput): void {
    // FIX BUG 1+2: consultar governor, no solo estado interno.
    // Si el governor está en CRITICAL (por Sentinel, BacterialGuardian, etc.),
    // bloquear visión sin importar quién lo puso.
    if (this.sentinelAlertActive || contextGovernor.isCriticalActive()) {
      safeEvolisRecord('guardian_hub', 'vision_blocked_by_sentinel', detection.label);
      return;
    }

    this.lastVisionDetection = detection;

    // FIX BUG 2: solo poner NAVIGATION si el governor no está ya en un nivel superior.
    // No pisar CRITICAL.
    const currentLevel = contextGovernor.getPriorityLevel();
    if (currentLevel !== 'CRITICAL') {
      contextGovernor.setPriorityLevel('NAVIGATION');
    }

    try {
      priorityQueue.enqueue({
        level: 'navigation',
        type: 'vision_detection',
        message: detection.label,
        data: {
          confidence: detection.confidence,
          panX: detection.panX,
          distance: detection.distance,
        },
      });
    } catch (_) {
      /* noop */
    }

    if (
      this.spatialAudioEnabled &&
      detection.panX !== undefined &&
      detection.distance !== undefined
    ) {
      try {
        spatialAudioEngine.playSpatialBeep(detection.panX, detection.distance);
      } catch (_) {
        /* noop */
      }
    }

    this.notify();
  }

  onSentinelEvent(event: SentinelEventInput): void {
    this.lastSentinelEvent = event;

    if (event.severity === 'high' || event.severity === 'critical') {
      this.sentinelAlertActive = true;
      contextGovernor.setPriorityLevel('CRITICAL');

      safeCancelSpeech();
      try {
        deviceManager.vibratePattern('SENTINEL_ALERT');
      } catch (_) {
        /* noop */
      }

      this.announceCritical(event.message);

      try {
        priorityQueue.enqueue({
          level: 'critical',
          type: 'sentinel_alert',
          message: event.message,
          data: { severity: event.severity, source: event.source },
        });
      } catch (_) {
        /* noop */
      }

      safeEvolisRecord(
        'guardian_hub',
        'SENTINEL_ALERT',
        JSON.stringify({
          severity: event.severity,
          source: event.source,
          message: event.message,
        })
      );

      if (this.sentinelReleaseTimer) safeClearTimeout(this.sentinelReleaseTimer);
      this.sentinelReleaseTimer = safeSetTimeout(() => {
        this.sentinelAlertActive = false;
        // FIX BUG 3: volver a NAVIGATION (default), no a DESCRIPTIVE.
        contextGovernor.setPriorityLevel('NAVIGATION');
        this.sentinelReleaseTimer = null;
        safeEvolisRecord('guardian_hub', 'PRIORITY_CHANGE', 'sentinel_released');
        this.notify();
      }, SENTINEL_RELEASE_MS);
    } else if (event.severity === 'medium') {
      try {
        deviceManager.vibratePattern('WARNING');
      } catch (_) {
        /* noop */
      }
      this.announceNormal(event.message);
      try {
        priorityQueue.enqueue({
          level: 'critical',
          type: 'sentinel_warning',
          message: event.message,
          data: { severity: event.severity, source: event.source },
        });
      } catch (_) {
        /* noop */
      }
    } else {
      this.announceNormal(event.message);
    }

    this.notify();
  }

  requestDescription(): void {
    if (this.sentinelAlertActive || contextGovernor.isCriticalActive()) return;
    contextGovernor.setPriorityLevel('DESCRIPTIVE');
    this.notify();
  }

  silenceAll(): void {
    safeCancelSpeech();
    try {
      spatialAudioEngine.stopAll();
    } catch (_) {
      /* noop */
    }
    this.sentinelAlertActive = false;
    contextGovernor.setPriorityLevel('NAVIGATION');
    if (this.sentinelReleaseTimer) {
      safeClearTimeout(this.sentinelReleaseTimer);
      this.sentinelReleaseTimer = null;
    }
    safeEvolisRecord('guardian_hub', 'SILENCE_ALL', 'manual');
    this.notify();
  }

  registerQuadrantTap(quadrant: Quadrant, handler: QuadrantHandler): void {
    this.quadrantTapHandlers.set(quadrant, handler);
    try {
      quadrantGestures.onQuadrantTap(quadrant, () => {
        this.initSpatialAudio();
        try {
          deviceManager.vibratePattern('QUADRANT_TAP');
        } catch (_) {
          /* noop */
        }
        safeEvolisRecord('guardian_hub', 'QUADRANT_TAP', quadrant);
        handler(quadrant);
      });
    } catch (err) {
      console.warn('[SentraGuardianHub] Error registrando tap:', err);
    }
  }

  registerQuadrantLongPress(quadrant: Quadrant, handler: QuadrantHandler): void {
    this.quadrantLongPressHandlers.set(quadrant, handler);
    try {
      quadrantGestures.onQuadrantLongPress(quadrant, () => {
        safeEvolisRecord('guardian_hub', 'QUADRANT_LONG_PRESS', quadrant);
        handler(quadrant);
      });
    } catch (err) {
      console.warn('[SentraGuardianHub] Error registrando long press:', err);
    }
  }

  private announceCritical(message: string): void {
    try {
      this.accessibility.announcePriority(message, 'critical');
    } catch (_) {
      /* noop */
    }
  }

  private announceNormal(message: string): void {
    try {
      this.accessibility.announcePriority(message, 'normal');
    } catch (_) {
      /* noop */
    }
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.warn('[SentraGuardianHub] Error en listener:', err);
      }
    }
  }

  dispose(): void {
    if (this.sentinelReleaseTimer) {
      safeClearTimeout(this.sentinelReleaseTimer);
      this.sentinelReleaseTimer = null;
    }
    try {
      quadrantGestures.dispose();
    } catch (_) {
      /* noop */
    }
    this.listeners.clear();
    this.quadrantTapHandlers.clear();
    this.quadrantLongPressHandlers.clear();
  }
}

export const sentraGuardianHub = new SentraGuardianHub();
export default sentraGuardianHub;
