import { globalSensorFilter, globalVoiceQueue } from './SentraOptimizedEngine';
import { DeviceSensorManager, deviceSensorManager } from './DeviceSensorManager';
import { PriorityQueueManager, priorityQueue, type PriorityEvent, type PriorityLevel } from './PriorityQueue';
import { SecureStateRegistry } from './PerformancePrimitives';
import { HardwareTelemetryService, type HardwareTelemetryUpdate } from '../services/HardwareTelemetryService';

export interface SentraConfig {
  autoRequestPermissions?: boolean;
  maxQueueSize?: number;
}

export interface SystemMetrics {
  timestamp: number;
  mode: 'real' | 'unavailable';
  sensors: {
    gps: {
      lat: number | null;
      lon: number | null;
      accuracy: number | null;
      error: string | null;
      source: 'real' | 'unavailable';
    };
    battery: {
      level: number | null;
      charging: boolean | null;
      source: 'real' | 'unavailable';
    };
    orientation: {
      alpha: number | null;
      beta: number | null;
      gamma: number | null;
      source: 'real' | 'unavailable';
    };
    camera: { active: boolean; stream: MediaStream | null };
    audio: { speakerReady: boolean; ambientLevel: number | null };
  };
  processingLoad: {
    fps: number | null;
    inferenceTimeMs: number | null;
  };
}

type BatteryManager = {
  level: number;
  charging: boolean;
};

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManager>;
};

type WindowWithSensorState = Window & {
  __realLat?: number;
  __realLon?: number;
  __realAcc?: number;
  __lastAlpha?: number;
  __lastBeta?: number;
  __lastGamma?: number;
  __cameraActive?: boolean;
  __cameraStream?: MediaStream | null;
  __gpsError?: string;
  __batteryLevel?: number;
  __batteryCharging?: boolean;
};

type PermissionedSensorEvent = {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export class SentraCoreEngine {
  public readonly sensors: DeviceSensorManager;
  public readonly queue: PriorityQueueManager;
  public readonly registry: SecureStateRegistry;
  private audioCtx: AudioContext | null = null;
  private cameraStream: MediaStream | null = null;
  private microphoneStream: MediaStream | null = null;
  private audioAnalyser: AnalyserNode | null = null;
  private audioSamples: Uint8Array<ArrayBuffer> | null = null;
  private motionListener: ((event: DeviceMotionEvent) => void) | null = null;
  private stopHardwareTelemetry: (() => void) | null = null;
  private lastMotionAlertAt = 0;
  private criticalSensorListeners = new Set<(message: string) => void>();
  private hardwareTelemetryListeners = new Set<(update: HardwareTelemetryUpdate) => void>();
  private lastAcceleration = { x: null as number | null, y: null as number | null, z: null as number | null };
  private inferenceMetrics = { fps: null as number | null, inferenceTimeMs: null as number | null };
  private lastRenderSampleAt: number | null = null;
  private renderFrameCount = 0;
  private isInitialized = false;
  private readonly config: Required<SentraConfig>;

  constructor(config: SentraConfig = {}) {
    this.config = {
      autoRequestPermissions: config.autoRequestPermissions ?? true,
      maxQueueSize: config.maxQueueSize ?? 100,
    };
    this.sensors = deviceSensorManager;
    this.queue = priorityQueue;
    this.registry = new SecureStateRegistry();
    this.queue.setMaxQueueSize(this.config.maxQueueSize);
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.info('[SentraCore] Iniciando secuencias del motor...');
      this.sensors.detectAvailableSensors();
      if (this.config.autoRequestPermissions) {
        await this.sensors.requestAllPermissions();
      }
      this.isInitialized = true;
      console.info('[SentraCore] Motor enlazado y operativo.');
      return true;
    } catch (error) {
      console.error('[SentraCore] Error crítico durante la inicialización:', error);
      return false;
    }
  }

  dispatchEvent(
    type: string,
    level: PriorityLevel,
    payload: Record<string, unknown> = {},
  ): PriorityEvent | null {
    return this.queue.enqueue({
      type,
      level,
      message: type,
      data: payload,
    });
  }

  async commitSnapshot(moduleName: string) {
    return this.registry.commitAuditSnapshot(moduleName);
  }

  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      sensors: this.sensors.getState(),
      queueSize: this.queue.size(),
      timestamp: Date.now(),
    };
  }

  onCriticalSensorAlert(listener: (message: string) => void): () => void {
    this.criticalSensorListeners.add(listener);
    return () => this.criticalSensorListeners.delete(listener);
  }

  onHardwareTelemetry(listener: (update: HardwareTelemetryUpdate) => void): () => void {
    this.hardwareTelemetryListeners.add(listener);
    return () => this.hardwareTelemetryListeners.delete(listener);
  }

  recordInferenceSample(inferenceTimeMs: number): void {
    this.inferenceMetrics = {
      fps: this.inferenceMetrics.fps,
      inferenceTimeMs,
    };
  }

  resetPerformanceMetrics(): void {
    this.inferenceMetrics = { fps: null, inferenceTimeMs: null };
    this.lastRenderSampleAt = null;
    this.renderFrameCount = 0;
  }

  recordRenderFrame(timestamp: number): void {
    if (this.lastRenderSampleAt === null) {
      this.lastRenderSampleAt = timestamp;
      return;
    }
    this.renderFrameCount += 1;
    const elapsedMs = timestamp - this.lastRenderSampleAt;
    if (elapsedMs < 1000) return;
    this.inferenceMetrics = {
      ...this.inferenceMetrics,
      fps: this.renderFrameCount * 1000 / elapsedMs,
    };
    this.lastRenderSampleAt = timestamp;
    this.renderFrameCount = 0;
  }

  getAccelerationSnapshot() {
    return { ...this.lastAcceleration };
  }

  isMicrophoneActive(): boolean {
    return Boolean(this.microphoneStream?.getAudioTracks().some((track) => track.readyState === 'live'));
  }

  getAmbientAudioLevel(): number | null {
    if (!this.audioAnalyser) return null;
    if (!this.audioSamples || this.audioSamples.length !== this.audioAnalyser.fftSize) {
      this.audioSamples = new Uint8Array(this.audioAnalyser.fftSize);
    }
    this.audioAnalyser.getByteTimeDomainData(this.audioSamples);
    let sumSquares = 0;
    for (const sample of this.audioSamples) {
      const amplitude = (sample - 128) / 128;
      sumSquares += amplitude * amplitude;
    }
    return Math.sqrt(sumSquares / this.audioSamples.length);
  }

  async initializeCore(videoElement?: HTMLVideoElement): Promise<boolean> {
    try {
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 200]);
    } catch (error) {
      console.info('[SentraCore] Feedback háptico no disponible:', error);
    }
    try {
      if (!this.stopHardwareTelemetry) {
        this.stopHardwareTelemetry = await HardwareTelemetryService.initRealSensors(
          (update) => this.handleHardwareTelemetry(update),
        );
      }
      const AudioContextClass = window.AudioContext
        || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass && !this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx?.state === 'suspended') {
        await this.audioCtx.resume();
      }

      await this.requestMotionAndOrientationPermissions();

      if (videoElement) {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('La API de cámara no está disponible en este navegador.');
        }
        if (!videoElement.srcObject) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          videoElement.srcObject = stream;
          this.cameraStream = stream;
        }
        this.cameraStream = videoElement.srcObject instanceof MediaStream ? videoElement.srcObject : null;
        if (!this.cameraStream) throw new Error('No se obtuvo un flujo de cámara real.');
        await videoElement.play();
        console.info('[SentraCore] Cámara trasera enlazada.');
      }

      await this.startAmbientAudioAnalysis();
      this.playAcousticPulse(440, 0.1);
      globalVoiceQueue.enqueue('Núcleo Sentra activado.');
      this.isInitialized = true;
      return true;
    } catch (error) {
      this.shutdownCore(videoElement);
      throw error;
    }
  }

  playAcousticPulse(frequency = 220, duration = 0.08): void {
    if (!this.audioCtx) return;
    try {
      const oscillator = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(this.audioCtx.destination);
      oscillator.start();
      oscillator.stop(this.audioCtx.currentTime + duration);
    } catch (error) {
      console.error('[AcousticResonance] Error al reproducir pulso:', error);
    }
  }

  shutdownCore(videoElement?: HTMLVideoElement): void {
    const cameraStream = videoElement?.srcObject instanceof MediaStream
      ? videoElement.srcObject
      : this.cameraStream;
    cameraStream?.getTracks().forEach((track) => track.stop());
    this.microphoneStream?.getTracks().forEach((track) => track.stop());
    if (videoElement) videoElement.srcObject = null;
    this.cameraStream = null;
    this.microphoneStream = null;
    this.audioAnalyser = null;
    this.stopHardwareTelemetry?.();
    this.stopHardwareTelemetry = null;
    const browserWindow = window as WindowWithSensorState;
    delete browserWindow.__batteryLevel;
    delete browserWindow.__batteryCharging;
    delete browserWindow.__realLat;
    delete browserWindow.__realLon;
    delete browserWindow.__realAcc;
    delete browserWindow.__gpsError;
    delete browserWindow.__lastAlpha;
    delete browserWindow.__lastBeta;
    delete browserWindow.__lastGamma;
    this.inferenceMetrics = { fps: null, inferenceTimeMs: null };
    this.lastRenderSampleAt = null;
    this.renderFrameCount = 0;
    this.lastAcceleration = { x: null, y: null, z: null };
    if (this.motionListener) {
      window.removeEventListener('devicemotion', this.motionListener);
      this.motionListener = null;
    }
    if (this.audioCtx) {
      void this.audioCtx.close().catch((error: unknown) => {
        console.warn('[SentraCore] No se pudo cerrar AudioContext:', error);
      });
      this.audioCtx = null;
    }
    globalSensorFilter.reset();
    globalVoiceQueue.enqueue('Núcleo Sentra desactivado.');
    this.isInitialized = false;
  }

  async fetchLiveMetrics(): Promise<SystemMetrics> {
    const timestamp = Date.now();
    const browserNavigator = navigator as NavigatorWithBattery;
    const browserWindow = window as WindowWithSensorState;
    let batteryLevel: number | null = browserWindow.__batteryLevel === undefined
      ? null
      : browserWindow.__batteryLevel;
    let batteryCharging: boolean | null = browserWindow.__batteryCharging ?? null;
    let batterySource: 'real' | 'unavailable' = batteryLevel === null ? 'unavailable' : 'real';

    if (batteryLevel === null && browserNavigator.getBattery) {
      try {
        const battery = await browserNavigator.getBattery();
        batteryLevel = battery.level;
        batteryCharging = battery.charging;
        batterySource = 'real';
      } catch (error) {
        console.warn('[SentraCore] No se pudo leer la batería real:', error);
      }
    }
    const hasRealGps = browserWindow.__realLat !== undefined && browserWindow.__realLon !== undefined;
    const rawAlpha = browserWindow.__lastAlpha ?? null;
    const rawBeta = browserWindow.__lastBeta ?? null;
    const rawGamma = browserWindow.__lastGamma ?? null;
    const hasRealOrientation = rawAlpha !== null || rawBeta !== null || rawGamma !== null;
    const cameraActive = videoStreamIsActive(this.cameraStream);
    const hasRealMetrics = hasRealGps || batteryLevel !== null || hasRealOrientation
      || cameraActive || this.audioCtx?.state === 'running' || this.getAmbientAudioLevel() !== null;

    return {
      timestamp,
      mode: hasRealMetrics ? 'real' : 'unavailable',
      sensors: {
        gps: {
          lat: hasRealGps ? browserWindow.__realLat! : null,
          lon: hasRealGps ? browserWindow.__realLon! : null,
          accuracy: hasRealGps ? browserWindow.__realAcc ?? null : null,
          error: browserWindow.__gpsError ?? null,
          source: hasRealGps ? 'real' : 'unavailable',
        },
        battery: { level: batteryLevel, charging: batteryCharging, source: batterySource },
        orientation: {
          alpha: rawAlpha === null ? null : globalSensorFilter.filter('orientation.alpha', rawAlpha),
          beta: rawBeta === null ? null : globalSensorFilter.filter('orientation.beta', rawBeta),
          gamma: rawGamma === null ? null : globalSensorFilter.filter('orientation.gamma', rawGamma),
          source: hasRealOrientation ? 'real' : 'unavailable',
        },
        camera: {
          active: cameraActive,
          stream: this.cameraStream,
        },
        audio: {
          speakerReady: this.audioCtx?.state === 'running',
          ambientLevel: this.getAmbientAudioLevel(),
        },
      },
      processingLoad: { ...this.inferenceMetrics },
    };
  }

  private handleHardwareTelemetry(update: HardwareTelemetryUpdate): void {
    const browserWindow = window as WindowWithSensorState;
    switch (update.type) {
      case 'GPS':
        if (update.source === 'REAL') {
          browserWindow.__realLat = update.lat;
          browserWindow.__realLon = update.lon;
          browserWindow.__realAcc = update.accuracy;
          delete browserWindow.__gpsError;
        } else {
          delete browserWindow.__realLat;
          delete browserWindow.__realLon;
          delete browserWindow.__realAcc;
          browserWindow.__gpsError = update.error;
          console.warn('[SentraCore] GPS real no disponible:', update.error);
        }
        break;
      case 'BATTERY':
        browserWindow.__batteryLevel = update.level;
        browserWindow.__batteryCharging = update.charging;
        break;
      case 'ORIENTATION':
        if (typeof update.alpha === 'number') browserWindow.__lastAlpha = update.alpha;
        else delete browserWindow.__lastAlpha;
        if (typeof update.beta === 'number') browserWindow.__lastBeta = update.beta;
        else delete browserWindow.__lastBeta;
        if (typeof update.gamma === 'number') browserWindow.__lastGamma = update.gamma;
        else delete browserWindow.__lastGamma;
        break;
    }
    for (const listener of this.hardwareTelemetryListeners) listener(update);
  }

  private async requestMotionAndOrientationPermissions(): Promise<void> {
    const requestPermission = async (sensorEvent: PermissionedSensorEvent): Promise<boolean> => {
      if (!sensorEvent.requestPermission) return true;
      try {
        return (await sensorEvent.requestPermission()) === 'granted';
      } catch (error) {
        console.warn('[SentraCore] Permiso de sensor rechazado:', error);
        return false;
      }
    };

    if ('DeviceMotionEvent' in window && !this.motionListener) {
      const allowed = await requestPermission(DeviceMotionEvent as unknown as PermissionedSensorEvent);
      if (allowed) {
        this.motionListener = (event) => {
          const acceleration = event.accelerationIncludingGravity ?? event.acceleration;
          if (!acceleration) return;
          this.lastAcceleration = {
            x: acceleration.x,
            y: acceleration.y,
            z: acceleration.z,
          };
          const highAcceleration = [acceleration.x, acceleration.y, acceleration.z]
            .some((axis) => typeof axis === 'number' && Math.abs(axis) > 15);
          const now = Date.now();
          if (highAcceleration && now - this.lastMotionAlertAt > 2000) {
            this.lastMotionAlertAt = now;
            console.warn('[SentraCore] Movimiento de alta aceleración detectado.');
            for (const listener of this.criticalSensorListeners) listener('high_acceleration');
            try {
              if ('vibrate' in navigator) navigator.vibrate(300);
            } catch (error) {
              console.info('[SentraCore] No se pudo emitir vibración de alerta:', error);
            }
          }
        };
        window.addEventListener('devicemotion', this.motionListener);
      }
    }
  }

  private async startAmbientAudioAnalysis(): Promise<void> {
    if (!this.audioCtx || !navigator.mediaDevices?.getUserMedia || this.microphoneStream) return;
    try {
      this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioAnalyser = this.audioCtx.createAnalyser();
      this.audioAnalyser.fftSize = 256;
      this.audioSamples = new Uint8Array(this.audioAnalyser.fftSize);
      this.audioCtx.createMediaStreamSource(this.microphoneStream).connect(this.audioAnalyser);
      console.info('[SentraCore] Analizador acústico ambiental activo.');
    } catch (error) {
      this.microphoneStream?.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
      this.audioAnalyser = null;
      this.audioSamples = null;
      this.audioSamples = null;
      console.info('[SentraCore] Micrófono no disponible; análisis acústico desactivado.', error);
    }
  }
}

function videoStreamIsActive(stream: MediaStream | null | undefined): boolean {
  return Boolean(stream?.getVideoTracks().some((track) => track.readyState === 'live'));
}

export const sentraEngine = new SentraCoreEngine();

export async function sentraFullAwaken(videoElement?: HTMLVideoElement): Promise<boolean> {
  return sentraEngine.initializeCore(videoElement);
}

export async function sentraExportSignedJSON(): Promise<void> {
  const metrics = await sentraEngine.fetchLiveMetrics();
  const payload = {
    timestamp: new Date(metrics.timestamp).toISOString(),
    node: 'SENTRA_CORE_DEVICE',
    telemetry: {
      gps: {
        lat: metrics.sensors.gps.lat,
        lng: metrics.sensors.gps.lon,
        accuracy: metrics.sensors.gps.accuracy,
        source: metrics.sensors.gps.source === 'real' ? 'REAL_GPS_ACTIVE' : 'UNAVAILABLE',
      },
      orientation: metrics.sensors.orientation,
      acceleration: sentraEngine.getAccelerationSnapshot(),
      cameraActive: metrics.sensors.camera.active,
      microphoneActive: sentraEngine.isMicrophoneActive(),
      ambientAudioLevel: metrics.sensors.audio.ambientLevel,
      systemMode: metrics.mode,
    },
    hardware: {
      vibration: 'vibrate' in navigator,
      orientationSupport: 'DeviceOrientationEvent' in window,
      motionSupport: 'DeviceMotionEvent' in window,
      cameraSupport: Boolean(navigator.mediaDevices?.getUserMedia),
      audioContext: Boolean(window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext),
    },
    signature: { scheme: 'EVOLIS_CHAIN_SIMULATED', simulated: true },
  };

  const serializedPayload = JSON.stringify(payload, null, 2);
  const signatureDigest = await createSimulatedSignature(serializedPayload);
  const blob = new Blob([
    JSON.stringify({ ...payload, signature: { ...payload.signature, ...signatureDigest } }, null, 2),
  ], { type: 'application/json' });
  const objectUrl = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = objectUrl;
  downloadAnchor.download = `sentra_telemetry_${Date.now()}.json`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function createSimulatedSignature(payload: string): Promise<{ algorithm: string; digest: string }> {
  if (globalThis.crypto?.subtle) {
    const digestBuffer = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    const digest = Array.from(new Uint8Array(digestBuffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
    return { algorithm: 'SHA-256 (simulated EVOLIS integrity digest)', digest };
  }

  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(payload)) {
    hash = Math.imul(hash ^ byte, 0x01000193);
  }
  return { algorithm: 'FNV-1a-32 (simulation only; SHA-256 unavailable)', digest: (hash >>> 0).toString(16).padStart(8, '0') };
}
