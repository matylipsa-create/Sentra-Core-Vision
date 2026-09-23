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
    audio: { speakerReady: boolean; currentFrequency: number };
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
};

export class SentraCoreEngine {
  public readonly sensors: DeviceSensorManager;
  public readonly queue: PriorityQueueManager;
  public readonly registry: SecureStateRegistry;
  private audioCtx: AudioContext | null = null;
  private cameraStream: MediaStream | null = null;
  private orientationListener: ((event: DeviceOrientationEvent) => void) | null = null;
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

  async initializeCore(videoElement?: HTMLVideoElement): Promise<boolean> {
    try {
      const AudioContextClass = window.AudioContext
        || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass && !this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx?.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (typeof DeviceMotionEvent !== 'undefined') {
        const motionEvent = DeviceMotionEvent as typeof DeviceMotionEvent & {
          requestPermission?: () => Promise<'granted' | 'denied'>;
        };
        if (typeof motionEvent.requestPermission === 'function') {
          const permission = await motionEvent.requestPermission();
          if (permission !== 'granted') {
            console.warn('[SentraCore] Permiso de orientación rechazado; se usará simulación.');
          }
          this.registerOrientationListener();
        }
      }

      if (videoElement && navigator.mediaDevices?.getUserMedia && !videoElement.srcObject) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        videoElement.srcObject = stream;
        this.cameraStream = stream;
        await videoElement.play();
      }

      this.playAcousticPulse(440, 0.1);
      globalVoiceQueue.enqueue('Núcleo Sentra activado.');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn(
        '[SentraCore] Algunos sensores físicos no están disponibles; se usará modo híbrido:',
        error,
      );
      this.playAcousticPulse(440, 0.1);
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
    const stream = videoElement?.srcObject instanceof MediaStream
      ? videoElement.srcObject
      : this.cameraStream;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoElement) videoElement.srcObject = null;
    this.cameraStream = null;
    if (this.orientationListener) {
      window.removeEventListener('deviceorientation', this.orientationListener);
      this.orientationListener = null;
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
}

function videoStreamIsActive(stream: MediaStream | null | undefined): boolean {
  return Boolean(stream?.getVideoTracks().some((track) => track.readyState === 'live'));
}

export const sentraEngine = new SentraCoreEngine();
