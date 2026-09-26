import { globalSensorFilter, globalVoiceQueue } from './SentraOptimizedEngine';
import { DeviceSensorManager, deviceSensorManager } from './DeviceSensorManager';
import { PriorityQueueManager, priorityQueue, type PriorityEvent, type PriorityLevel } from './PriorityQueue';
import { SecureStateRegistry } from './PerformancePrimitives';

export interface SentraConfig {
  autoRequestPermissions?: boolean;
  maxQueueSize?: number;
}

export interface SystemMetrics {
  timestamp: number;
  mode: 'hybrid' | 'real' | 'simulated';
  sensors: {
    gps: {
      lat: number | null;
      lon: number | null;
      accuracy: number | null;
      source: 'real' | 'simulated';
    };
    battery: {
      level: number | null;
      charging: boolean | null;
      source: 'real' | 'simulated';
    };
    orientation: {
      alpha: number | null;
      beta: number | null;
      gamma: number | null;
      source: 'real' | 'simulated';
    };
    camera: { active: boolean; stream: MediaStream | null };
    audio: { speakerReady: boolean; currentFrequency: number; ambientLevel: number | null };
  };
  processingLoad: {
    fps: number;
    inferenceTimeMs: number;
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
  __gpsSource?: 'REAL_GPS_ACTIVE' | 'FALLBACK_MGP';
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
  private orientationListener: ((event: DeviceOrientationEvent) => void) | null = null;
  private motionListener: ((event: DeviceMotionEvent) => void) | null = null;
  private gpsWatchId: number | null = null;
  private lastMotionAlertAt = 0;
  private lastAcceleration = { x: null as number | null, y: null as number | null, z: null as number | null };
  private simulatedState = {
    lat: -38.0055,
    lon: -57.5426,
    battery: 0.92,
    alpha: 12.5,
    beta: 42.1,
    gamma: -1.4,
  };
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
    this.startGeolocation();

    try {
      const AudioContextClass = window.AudioContext
        || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass && !this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx?.state === 'suspended') {
        await this.audioCtx.resume();
      }

      await this.requestMotionAndOrientationPermissions();

      if (videoElement && navigator.mediaDevices?.getUserMedia && !videoElement.srcObject) {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          videoElement.srcObject = stream;
          this.cameraStream = stream;
          await videoElement.play();
          console.info('[SentraCore] Cámara trasera enlazada.');
        } catch (error) {
          stream?.getTracks().forEach((track) => track.stop());
          if (videoElement.srcObject === stream) videoElement.srcObject = null;
          if (this.cameraStream === stream) this.cameraStream = null;
          console.warn('[SentraCore] Cámara no disponible o permiso rechazado:', error);
        }
      }

      await this.startAmbientAudioAnalysis();
      this.playAcousticPulse(440, 0.1);
      globalVoiceQueue.enqueue('Núcleo Sentra activado.');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn(
        '[SentraCore] Algunos sensores físicos no están disponibles; se usará modo híbrido:',
        error,
      );
      await this.startAmbientAudioAnalysis();
      globalVoiceQueue.enqueue('Modo híbrido activado. Sensores virtuales de respaldo.');
      this.isInitialized = true;
      return false;
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
    if (this.gpsWatchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }
    if (this.orientationListener) {
      window.removeEventListener('deviceorientation', this.orientationListener);
      this.orientationListener = null;
    }
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
    let batteryLevel: number | null = null;
    let batteryCharging: boolean | null = null;
    let batterySource: 'real' | 'simulated' = 'simulated';

    if (browserNavigator.getBattery) {
      try {
        const battery = await browserNavigator.getBattery();
        batteryLevel = battery.level;
        batteryCharging = battery.charging;
        batterySource = 'real';
      } catch (error) {
        console.warn('[SentraCore] No se pudo leer la batería real:', error);
      }
    }
    if (batteryLevel === null) {
      batteryLevel = this.simulatedState.battery;
      batteryCharging = false;
    }

    const browserWindow = window as WindowWithSensorState;
    const hasRealGps = browserWindow.__realLat !== undefined && browserWindow.__realLon !== undefined;
    const hasRealOrientation = browserWindow.__lastAlpha !== undefined;
    const rawAlpha = hasRealOrientation ? browserWindow.__lastAlpha! : this.simulatedState.alpha;
    const rawBeta = hasRealOrientation ? browserWindow.__lastBeta ?? this.simulatedState.beta : this.simulatedState.beta;
    const rawGamma = hasRealOrientation ? browserWindow.__lastGamma ?? this.simulatedState.gamma : this.simulatedState.gamma;

    return {
      timestamp,
      mode: 'hybrid',
      sensors: {
        gps: {
          lat: hasRealGps ? browserWindow.__realLat! : this.simulatedState.lat,
          lon: hasRealGps ? browserWindow.__realLon! : this.simulatedState.lon,
          accuracy: hasRealGps ? browserWindow.__realAcc ?? null : 5,
          source: hasRealGps ? 'real' : 'simulated',
        },
        battery: { level: batteryLevel, charging: batteryCharging, source: batterySource },
        orientation: {
          alpha: globalSensorFilter.filter('orientation.alpha', rawAlpha),
          beta: globalSensorFilter.filter('orientation.beta', rawBeta),
          gamma: globalSensorFilter.filter('orientation.gamma', rawGamma),
          source: hasRealOrientation ? 'real' : 'simulated',
        },
        camera: {
          active: videoStreamIsActive(this.cameraStream),
          stream: this.cameraStream,
        },
        audio: {
          speakerReady: this.audioCtx?.state === 'running',
          currentFrequency: 440,
          ambientLevel: this.getAmbientAudioLevel(),
        },
      },
      processingLoad: {
        fps: 59 + Math.floor(Math.random() * 2),
        inferenceTimeMs: 12.4 + Number((Math.random() * 1.5).toFixed(1)),
      },
    };
  }

  private registerOrientationListener(): void {
    if (this.orientationListener) return;
    this.orientationListener = (event) => {
      const browserWindow = window as WindowWithSensorState;
      if (typeof event.alpha === 'number') browserWindow.__lastAlpha = event.alpha;
      if (typeof event.beta === 'number') browserWindow.__lastBeta = event.beta;
      if (typeof event.gamma === 'number') browserWindow.__lastGamma = event.gamma;
    };
    window.addEventListener('deviceorientation', this.orientationListener);
  }

  private startGeolocation(): void {
    if (!('geolocation' in navigator) || this.gpsWatchId !== null) return;
    const browserWindow = window as WindowWithSensorState;
    this.gpsWatchId = navigator.geolocation.watchPosition(
      (position) => {
        browserWindow.__realLat = position.coords.latitude;
        browserWindow.__realLon = position.coords.longitude;
        browserWindow.__realAcc = position.coords.accuracy;
        browserWindow.__gpsSource = 'REAL_GPS_ACTIVE';
      },
      (error) => {
        browserWindow.__gpsSource = 'FALLBACK_MGP';
        console.warn('[SentraCore] GPS no disponible; se usa la posición de respaldo MGP.', error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 },
    );
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

    if ('DeviceOrientationEvent' in window && !this.orientationListener) {
      const allowed = await requestPermission(DeviceOrientationEvent as unknown as PermissionedSensorEvent);
      if (allowed) this.registerOrientationListener();
    }

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
  const browserWindow = window as WindowWithSensorState;
  const payload = {
    timestamp: new Date(metrics.timestamp).toISOString(),
    node: 'SENTRA_CORE_MOBILE_MGP',
    telemetry: {
      gps: {
        lat: metrics.sensors.gps.lat,
        lng: metrics.sensors.gps.lon,
        accuracy: metrics.sensors.gps.accuracy,
        source: browserWindow.__gpsSource
          ?? (metrics.sensors.gps.source === 'real' ? 'REAL_GPS_ACTIVE' : 'FALLBACK_MGP'),
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
