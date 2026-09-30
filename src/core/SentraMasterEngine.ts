import { sentraEngine, type SystemMetrics } from './SentraCoreEngine';
import type { AuditRecord } from './PerformancePrimitives';

export interface MasterDetectionInput {
  label: string;
  box: [number, number, number, number];
}

export interface ProcessedMasterDetection {
  object: string;
  priority: number;
  distance_meters: null;
  relative_position: string;
  bounding_box: [number, number, number, number];
}

export interface MasterFrameOptions {
  detailLevel?: 'suave' | 'analitico';
  speechRate?: number;
  allowSpeech?: boolean;
  speak?: (text: string, rate: number) => void;
}

export interface MasterHardwareState {
  gps: { lat: number | null; lng: number | null; accuracy: number | null; source: 'real' | 'unavailable' };
  orientation: { alpha: number | null; beta: number | null; gamma: number | null };
  battery: { level: number | null; charging: boolean | null };
  audioRms: number | null;
}

const VOCABULARY = new Map<string, { priority: number; name: string }>([
  ['persona', { priority: 1, name: 'persona' }],
  ['colectivo', { priority: 2, name: 'colectivo' }],
  ['autobus', { priority: 2, name: 'colectivo' }],
  ['bus', { priority: 2, name: 'colectivo' }],
  ['micro', { priority: 2, name: 'micro' }],
  ['gato', { priority: 3, name: 'gato' }],
  ['perro', { priority: 3, name: 'perro' }],
  ['ordenador', { priority: 4, name: 'ordenador' }],
  ['notebook', { priority: 4, name: 'notebook' }],
  ['televisor', { priority: 4, name: 'televisor' }],
  ['mesa', { priority: 5, name: 'mesa' }],
  ['sillon', { priority: 5, name: 'sillon' }],
  ['silla', { priority: 5, name: 'silla' }],
  ['puerta', { priority: 6, name: 'puerta' }],
  ['pasillo', { priority: 7, name: 'pasillo' }],
  ['calle', { priority: 7, name: 'calle' }],
]);

const MAX_AUDIT_HISTORY = 100;

export class SentraMasterEngine {
  private lastSpokenTimestamp = 0;
  private readonly cooldownMs = 2800;
  private auditTail: Promise<void> = Promise.resolve();
  private readonly auditHistory: AuditRecord[] = [];
  private readonly hardwareState: MasterHardwareState = {
    gps: { lat: null, lng: null, accuracy: null, source: 'unavailable' },
    orientation: { alpha: null, beta: null, gamma: null },
    battery: { level: null, charging: null },
    audioRms: null,
  };

  getHardwareState(): MasterHardwareState {
    return {
      gps: { ...this.hardwareState.gps },
      orientation: { ...this.hardwareState.orientation },
      battery: { ...this.hardwareState.battery },
      audioRms: this.hardwareState.audioRms,
    };
  }

  getAuditHistory(): AuditRecord[] {
    return [...this.auditHistory];
  }

  estimatePosition(x: number, width: number): string {
    const center = (x / Math.max(width, 1));
    if (center < 0.3) return 'a tu extrema izquierda';
    if (center < 0.45) return 'a tu izquierda';
    if (center > 0.7) return 'a tu extrema derecha';
    if (center > 0.55) return 'a tu derecha';
    return 'al frente directo';
  }

  processFrame(
    rawDetections: MasterDetectionInput[],
    imageWidth: number,
    _imageHeight: number,
    options: MasterFrameOptions = {},
  ): ProcessedMasterDetection[] {
    const detailLevel = options.detailLevel ?? 'analitico';
    const processed = rawDetections.map((detection) => {
      const label = normalizeLabel(detection.label);
      const vocabulary = VOCABULARY.get(label);
      return {
        object: vocabulary?.name ?? detection.label,
        priority: vocabulary?.priority ?? 8,
        distance_meters: null,
        relative_position: this.estimatePosition(detection.box[0] + detection.box[2] / 2, imageWidth),
        bounding_box: detection.box,
      };
    }).sort((first, second) => first.priority - second.priority);

    const now = Date.now();
    if (
      processed.length > 0
      && options.allowSpeech !== false
      && options.speak
      && now - this.lastSpokenTimestamp >= this.cooldownMs
    ) {
      const limit = detailLevel === 'suave' ? 2 : 4;
      const description = processed.slice(0, limit).map((item) => (
        detailLevel === 'suave'
          ? `${item.object} ${item.relative_position}`
          : `${item.object}, ubicado ${item.relative_position}`
      ));
      options.speak(`Detectado: ${description.join('. ')}.`, clampSpeechRate(options.speechRate ?? 1));
      this.lastSpokenTimestamp = now;
      void this.commitAuditSnapshot('SENTRA-MASTER', processed).catch((error: unknown) => {
        console.warn('[SentraMaster] No se pudo registrar la auditoría:', error);
      });
    }

    return processed;
  }

  async commitAuditSnapshot(
    moduleName = 'SENTRA-MASTER',
    processedDetections: ProcessedMasterDetection[] = [],
  ): Promise<AuditRecord> {
    const task = this.auditTail.then(async () => {
      const metrics = await sentraEngine.fetchLiveMetrics();
      this.updateHardwareState(metrics);
      sentraEngine.registry.set('master.hardware', this.getHardwareState());
      sentraEngine.registry.set('master.perception', processedDetections);
      const record = await sentraEngine.commitSnapshot(moduleName);
      this.auditHistory.push(record);
      if (this.auditHistory.length > MAX_AUDIT_HISTORY) this.auditHistory.shift();
      return record;
    });
    this.auditTail = task.then(() => undefined, () => undefined);
    return task;
  }

  private updateHardwareState(metrics: SystemMetrics): void {
    this.hardwareState.gps = {
      lat: metrics.sensors.gps.lat,
      lng: metrics.sensors.gps.lon,
      accuracy: metrics.sensors.gps.accuracy,
      source: metrics.sensors.gps.source,
    };
    this.hardwareState.orientation = { ...metrics.sensors.orientation };
    this.hardwareState.battery = {
      level: metrics.sensors.battery.level === null ? null : Math.round(metrics.sensors.battery.level * 100),
      charging: metrics.sensors.battery.charging,
    };
    this.hardwareState.audioRms = metrics.sensors.audio.ambientLevel;
  }
}

function normalizeLabel(label: string): string {
  return label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
}

function clampSpeechRate(rate: number): number {
  return Math.min(Math.max(rate, 0.8), 2.5);
}

export const sentraMaster = new SentraMasterEngine();