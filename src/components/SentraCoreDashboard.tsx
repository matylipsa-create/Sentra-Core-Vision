import { useCallback, useEffect, useRef, useState } from 'react';
import {
  sentraEngine,
  sentraExportSignedJSON,
  sentraFullAwaken,
  type SystemMetrics,
} from '../core/SentraCoreEngine';
import { playInterfaceCue } from '../lib/engineSound';
import { ResilientTCREIBus, type BusSnapshot } from '../services/ResilientTCREIBus';
import { useRealModeSensors } from '../hooks/useRealModeSensors';
import { useStableDetections } from '../hooks/useStableDetections';
import { hardwareAutoAdjust } from '../core/HardwareAutoAdjust';
import { deviceManager } from '../core/DeviceManager';

const MAX_TELEMETRY_EVENTS = 25;

type TelemetryEvent = {
  timestamp: string;
  event: string;
  status: string;
};

type CriticalAlert = {
  id: string;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
};

type TrendSample = {
  fps: number | null;
  audio: number | null;
  battery: number | null;
  acceleration: number | null;
};

function Sparkline({ values, label }: { values: number[]; label: string }) {
  const normalized = values.map((value) => Number.isFinite(value) ? value : 0);
  const maximum = Math.max(1, ...normalized);
  const minimum = Math.min(0, ...normalized);
  const range = Math.max(maximum - minimum, 1);
  const points = normalized.map((value, index) => {
    const x = normalized.length < 2 ? 50 : (index / (normalized.length - 1)) * 100;
    const y = 28 - ((value - minimum) / range) * 24;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg role="img" aria-label={`${label} trend`} viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-2 h-8 w-full overflow-visible">
      <polyline points={points} fill="none" stroke="var(--sentra-accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

interface SentraCoreDashboardProps {
  onOpenVisionDemo?: () => void;
}

export function SentraCoreDashboard({ onOpenVisionDemo }: SentraCoreDashboardProps = {}) {
  const [bus] = useState(() => new ResilientTCREIBus());
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const lastQueuedTelemetryRef = useRef(0);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [busSnapshot, setBusSnapshot] = useState<BusSnapshot>({
    status: 'OFFLINE', rttMs: null, queuedCount: 0, message: 'Bus local sin conexión.',
  });
  const [trendSamples, setTrendSamples] = useState<TrendSample[]>([]);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [cameraProfile] = useState(() => hardwareAutoAdjust.getProfile(deviceManager.detect()));
  const [isStarting, setIsStarting] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'environmental' | 'vision'>('specs');
  const [logs, setLogs] = useState<string[]>([]);
  const [telemetryFifo, setTelemetryFifo] = useState<TelemetryEvent[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>(() => {
    try {
      const savedAlerts = window.sessionStorage.getItem('sentra-critical-alerts');
      return savedAlerts ? JSON.parse(savedAlerts) as CriticalAlert[] : [];
    } catch {
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const alertSequenceRef = useRef(0);
  const resolvedAlertIdsRef = useRef(new Set<string>());
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastPerformanceAnomalyAtRef = useRef(0);
  const lastOrientationEventAtRef = useRef(0);
  const isVisionProcessing = isSystemActive && activeTab === 'vision' && cameraProfile.enableVision;
  const modelBase = cameraProfile.visionModel === 'none' ? 'lite_mobilenet_v2' : cameraProfile.visionModel;
  const visionSensors = useRealModeSensors(videoRef, isVisionProcessing, Math.max(1000, cameraProfile.visionIntervalMs), modelBase);
  const stableDetections = useStableDetections(visionSensors.detections, 'outdoor');

  const addLog = useCallback((message: string) => {
    setLogs((current) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...current].slice(0, 5));
  }, []);

  const recordCriticalAlert = useCallback((message: string) => {
    const normalizedMessage = message.replace(/\s+/g, ' ').trim();
    setCriticalAlerts((current) => {
      if (current.some((alert) => alert.message === normalizedMessage && !alert.resolvedAt)) return current;
      const createdAt = new Date().toISOString();
      alertSequenceRef.current += 1;
      return [{
        id: `${Date.now()}-${alertSequenceRef.current}`,
        message: normalizedMessage,
        createdAt,
        resolvedAt: null,
      }, ...current].slice(0, MAX_TELEMETRY_EVENTS);
    });
    setTelemetryFifo((current) => [{
      timestamp: new Date().toISOString(),
      event: `Alerta crítica: ${normalizedMessage}`,
      status: 'CRITICAL',
    }, ...current].slice(0, MAX_TELEMETRY_EVENTS));
    playInterfaceCue('critical');
  }, []);

  useEffect(() => {
    const unsubscribeSnapshot = bus.subscribe(setBusSnapshot);
    const unsubscribeEvents = bus.onEvent((name, data) => {
      if (name.toLowerCase().includes('alert') || name.toLowerCase().includes('critical')) {
        const detail = typeof data === 'string' ? data : JSON.stringify(data ?? {});
        recordCriticalAlert(`${name}: ${detail}`);
      }
    });
    const unsubscribeSensorAlerts = sentraEngine.onCriticalSensorAlert((message) => {
      recordCriticalAlert(message);
      void bus.enqueue('telemetry', {
        source: 'device_motion',
        type: 'critical_sensor_alert',
        message,
        observedAt: Date.now(),
      }).catch((queueError: unknown) => {
        console.error('[SentraCoreDashboard] No se pudo registrar la anomalía de movimiento:', queueError);
      });
    });
    const unsubscribeHardwareTelemetry = sentraEngine.onHardwareTelemetry((update) => {
      if (update.type === 'ORIENTATION') {
        const now = Date.now();
        if (now - lastOrientationEventAtRef.current < 1000) return;
        lastOrientationEventAtRef.current = now;
      }
      const timestamp = new Date().toISOString();
      const gpsUnavailable = update.type === 'GPS' && update.source === 'ERROR';
      const orientationUnavailable = update.type === 'ORIENTATION'
        && update.alpha === null && update.beta === null && update.gamma === null;
      const isUnavailable = gpsUnavailable || orientationUnavailable;
      const description = gpsUnavailable
        ? `GPS no disponible: ${update.error}`
        : orientationUnavailable ? 'Orientación no disponible en este dispositivo.' : `Lectura de hardware: ${update.type}`;
      setTelemetryFifo((current) => [{
        timestamp,
        event: description,
        status: isUnavailable ? 'UNAVAILABLE' : 'REAL',
      }, ...current].slice(0, MAX_TELEMETRY_EVENTS));
      void bus.enqueue('telemetry', {
        source: 'device_hardware',
        observedAt: timestamp,
        ...update,
      }).catch((queueError: unknown) => {
        console.error('[SentraCoreDashboard] No se pudo registrar telemetría física:', queueError);
      });
    });
    bus.start();
    return () => {
      unsubscribeSnapshot();
      unsubscribeEvents();
      unsubscribeSensorAlerts();
      unsubscribeHardwareTelemetry();
      bus.stop();
    };
  }, [bus, recordCriticalAlert]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem('sentra-critical-alerts', JSON.stringify(criticalAlerts));
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
  }, [criticalAlerts]);

  useEffect(() => {
    const videoElement = videoRef.current;
    const cameraStream = cameraStreamRef.current;
    if (!isSystemActive || activeTab !== 'vision' || !videoElement || !cameraStream) return;
    videoElement.srcObject = cameraStream;
    void videoElement.play().catch((playError: unknown) => {
      console.warn('[SentraCoreDashboard] No se pudo mostrar la vista de cámara:', playError);
      const message = playError instanceof Error ? playError.message : 'Error al reproducir el flujo de cámara.';
      setError(message);
      recordCriticalAlert(`No se pudo reproducir el flujo real de cámara: ${message}`);
      void bus.enqueue('telemetry', {
        source: 'device_camera',
        type: 'playback_error',
        message,
        observedAt: Date.now(),
      }).catch((queueError: unknown) => {
        console.error('[SentraCoreDashboard] No se pudo registrar el fallo de cámara:', queueError);
      });
    });
  }, [activeTab, bus, isSystemActive, recordCriticalAlert]);

  useEffect(() => {
    const video = videoRef.current;
    if (!isSystemActive || activeTab !== 'vision' || !video) return undefined;
    let frameId = 0;
    const measureRenderedFrames = (timestamp: number) => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        sentraEngine.recordRenderFrame(timestamp);
      }
      frameId = window.requestAnimationFrame(measureRenderedFrames);
    };
    frameId = window.requestAnimationFrame(measureRenderedFrames);
    return () => {
      window.cancelAnimationFrame(frameId);
      sentraEngine.resetPerformanceMetrics();
    };
  }, [activeTab, isSystemActive]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = detectionCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!isSystemActive || activeTab !== 'vision' || !video || !canvas || !context) return undefined;

    let frameId = 0;
    const renderDetections = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '14px sans-serif';
        stableDetections.forEach((detection) => {
          const [x, y, width, height] = detection.bbox;
          context.strokeStyle = detection.class === 'person' ? '#00d4ff' : '#00ff88';
          context.lineWidth = 3;
          context.strokeRect(x, y, width, height);
          const label = `${detection.class} ${Math.round(detection.score * 100)}%`;
          const labelWidth = context.measureText(label).width + 10;
          context.fillStyle = 'rgba(0, 0, 0, 0.75)';
          context.fillRect(x, Math.max(0, y - 22), labelWidth, 22);
          context.fillStyle = '#ffffff';
          context.fillText(label, x + 5, Math.max(15, y - 7));
        });
      }
      frameId = window.requestAnimationFrame(renderDetections);
    };
    frameId = window.requestAnimationFrame(renderDetections);
    return () => window.cancelAnimationFrame(frameId);
  }, [activeTab, isSystemActive, stableDetections]);

  useEffect(() => {
    if (!isSystemActive) return undefined;
    const cameraTrack = cameraStreamRef.current?.getVideoTracks().find((track) => track.readyState === 'live');
    if (!cameraTrack) return undefined;
    const handleTrackEnded = () => {
      recordCriticalAlert('El flujo real de cámara se interrumpió.');
      setError('La cámara dejó de transmitir. Reinicia el núcleo para recuperar visión.');
      void bus.enqueue('telemetry', {
        source: 'device_camera',
        type: 'stream_ended',
        observedAt: Date.now(),
      }).catch((queueError: unknown) => {
        console.error('[SentraCoreDashboard] No se pudo registrar la caída de cámara:', queueError);
      });
    };
    cameraTrack.addEventListener('ended', handleTrackEnded);
    return () => cameraTrack.removeEventListener('ended', handleTrackEnded);
  }, [bus, isSystemActive, recordCriticalAlert]);

  const handleActivateSystem = useCallback(async () => {
    if (isSystemActive) {
      setIsStarting(false);
      return;
    }
    setIsStarting(true);
    setError(null);
    addLog('Inicializando núcleo offline-first...');
    void bus.enqueue('operator_action', { action: 'activate_core', requestedAt: Date.now() })
      .catch((queueError: unknown) => console.error('[SentraCoreDashboard] No se pudo encolar la activación:', queueError));
    try {
      const initialized = await sentraFullAwaken(videoRef.current ?? undefined);
      const stream = videoRef.current?.srcObject;
      cameraStreamRef.current = stream instanceof MediaStream ? stream : null;
      addLog(initialized ? 'Cámara real y sensores disponibles inicializados.' : 'Núcleo iniciado sin sensores reales disponibles.');
      setIsSystemActive(true);
    } catch (activationError) {
      console.error('[SentraCoreDashboard] Error al inicializar el núcleo:', activationError);
      setError(activationError instanceof Error ? activationError.message : 'No se pudo inicializar el núcleo.');
      addLog('Error al inicializar el núcleo.');
    } finally {
      setIsStarting(false);
    }
  }, [addLog, bus, isSystemActive]);

  useEffect(() => {
    if (!isSystemActive) return undefined;

    let cancelled = false;
    const refreshMetrics = async () => {
      try {
        const liveMetrics = await sentraEngine.fetchLiveMetrics();
        if (!cancelled) {
          setMetrics(liveMetrics);
          const acceleration = sentraEngine.getAccelerationSnapshot();
          const accelerationMagnitude = acceleration.x === null || acceleration.y === null || acceleration.z === null
            ? null
            : Math.hypot(acceleration.x, acceleration.y, acceleration.z);
          setTrendSamples((current) => [...current, {
            fps: liveMetrics.processingLoad.fps,
            audio: liveMetrics.sensors.audio.ambientLevel,
            battery: liveMetrics.sensors.battery.level,
            acceleration: accelerationMagnitude,
          }].slice(-24));
          const hasRealReading = liveMetrics.sensors.gps.source === 'real'
            || liveMetrics.sensors.battery.source === 'real'
            || liveMetrics.sensors.orientation.source === 'real'
            || liveMetrics.sensors.camera.active
            || liveMetrics.sensors.audio.ambientLevel !== null;
          if (hasRealReading) {
            setTelemetryFifo((current) => [{
              timestamp: new Date().toISOString(),
              event: 'Muestra de sensores reales recibida.',
              status: 'REAL',
            }, ...current].slice(0, MAX_TELEMETRY_EVENTS));
          }
          const inferenceTimeMs = liveMetrics.processingLoad.inferenceTimeMs;
          const measuredFps = liveMetrics.processingLoad.fps;
          const hasPerformanceAnomaly = (inferenceTimeMs !== null && inferenceTimeMs > 500)
            || (measuredFps !== null && measuredFps < 5);
          if (hasPerformanceAnomaly
            && Date.now() - lastPerformanceAnomalyAtRef.current >= 10000) {
            lastPerformanceAnomalyAtRef.current = Date.now();
            const performanceDescription = inferenceTimeMs !== null && inferenceTimeMs > 500
              ? `Latencia de inferencia medida: ${inferenceTimeMs.toFixed(1)} ms`
              : `Caída de render medida: ${measuredFps?.toFixed(1) ?? '--'} FPS`;
            setTelemetryFifo((current) => [{
              timestamp: new Date().toISOString(),
              event: performanceDescription,
              status: 'WARNING',
            }, ...current].slice(0, MAX_TELEMETRY_EVENTS));
            void bus.enqueue('telemetry', {
              source: 'measured_video_performance',
              type: 'performance_anomaly',
              fps: measuredFps,
              inferenceTimeMs,
              observedAt: Date.now(),
            }).catch((queueError: unknown) => {
              console.error('[SentraCoreDashboard] No se pudo registrar la latencia:', queueError);
            });
          }
          if (hasRealReading && Date.now() - lastQueuedTelemetryRef.current >= 5000) {
            lastQueuedTelemetryRef.current = Date.now();
            void bus.enqueue('telemetry', {
              timestamp: liveMetrics.timestamp,
              mode: liveMetrics.mode,
              gps: liveMetrics.sensors.gps,
              battery: liveMetrics.sensors.battery,
              orientation: liveMetrics.sensors.orientation,
              audio: liveMetrics.sensors.audio,
              processingLoad: liveMetrics.processingLoad,
              acceleration,
            }).catch((queueError: unknown) => {
              console.error('[SentraCoreDashboard] No se pudo encolar telemetría:', queueError);
            });
          }
        }
      } catch (metricsError) {
        console.error('[SentraCoreDashboard] Error al leer telemetría:', metricsError);
        if (!cancelled) setError('No se pudo actualizar la telemetría.');
      }
    };

    void refreshMetrics();
    const intervalId = window.setInterval(() => void refreshMetrics(), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [bus, isSystemActive]);

  useEffect(() => () => {
    sentraEngine.shutdownCore(videoRef.current ?? undefined);
  }, []);

  const handlePulse = () => {
    sentraEngine.playAcousticPulse(440, 0.1);
    addLog('Pulso acústico de prueba emitido a 440 Hz.');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await sentraExportSignedJSON();
      addLog('Telemetría exportada con firma simulada EVOLIS Chain.');
      playInterfaceCue('confirm');
    } catch (exportError) {
      console.error('[SentraCoreDashboard] Error al exportar telemetría:', exportError);
      setError('No se pudo exportar la telemetría.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLock = () => {
    void bus.enqueue('operator_action', { action: 'lock_core', requestedAt: Date.now() })
      .catch((queueError: unknown) => console.error('[SentraCoreDashboard] No se pudo encolar el bloqueo:', queueError));
    sentraEngine.shutdownCore(videoRef.current ?? undefined);
    cameraStreamRef.current = null;
    setMetrics(null);
    setTelemetryFifo([]);
    setIsSystemActive(false);
    setActiveTab('specs');
  };

  const handleResolveAlert = useCallback((alert: CriticalAlert) => {
    if (alert.resolvedAt || resolvedAlertIdsRef.current.has(alert.id)) return;
    resolvedAlertIdsRef.current.add(alert.id);
    const resolvedAt = new Date().toISOString();
    setCriticalAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, resolvedAt } : item));
    setTelemetryFifo((current) => [{
      timestamp: resolvedAt,
      event: `Alerta resuelta por operador: ${alert.message}`,
      status: 'RESOLVED',
    }, ...current].slice(0, MAX_TELEMETRY_EVENTS));
    addLog(`Alerta resuelta: ${alert.message}`);
    void bus.enqueue('operator_action', {
      action: 'resolve_critical_alert',
      alertId: alert.id,
      message: alert.message,
      resolvedAt,
    }).catch((queueError: unknown) => {
      console.error('[SentraCoreDashboard] No se pudo registrar la resolución:', queueError);
    });
    void sentraEngine.fetchLiveMetrics().then(setMetrics).catch((metricsError: unknown) => {
      console.error('[SentraCoreDashboard] No se pudieron refrescar métricas tras resolver alerta:', metricsError);
      setError('Alerta registrada; no se pudo refrescar la telemetría.');
    });
  }, [addLog, bus]);

  const battery = metrics?.sensors.battery.level;
  const unresolvedAlertCount = criticalAlerts.filter((alert) => !alert.resolvedAt).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05090a] p-4 font-mono text-[#00ffcc] sm:p-6">
      {!isSystemActive ? (
        <section className="relative flex min-h-[calc(100vh-2rem)] flex-col items-center justify-between overflow-hidden border border-[#00ffcc]/10 bg-[#030708] px-5 py-12 sm:min-h-[calc(100vh-3rem)] sm:px-10">
          <video ref={videoRef} autoPlay playsInline muted aria-hidden="true" className="pointer-events-none absolute h-px w-px opacity-0" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,255,180,0.08)_0%,_transparent_58%)]" />
          <header className="relative z-10 mt-4 text-center sm:mt-8">
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#00c995] sm:text-xs">Secure system bootstrap</p>
            <h1 className="text-4xl font-black tracking-[0.12em] text-[#b7ffe9] drop-shadow-[0_0_16px_rgba(0,255,180,0.35)] sm:text-6xl">SENTRA CORE</h1>
            <div className="mx-auto mt-5 h-px w-28 bg-[#00ffb4] shadow-[0_0_14px_rgba(0,255,180,0.7)]" />
          </header>

          <div className="relative z-10 my-12 w-full max-w-md border border-[#00ffb4]/30 bg-[#03150f]/70 p-5 text-center shadow-[0_0_28px_rgba(0,255,180,0.08)] backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7acbb0]">Estado del núcleo</p>
            <p className="mt-2 text-xs font-bold tracking-[0.12em] text-[#afffe5] sm:text-sm">{isStarting ? 'INICIALIZANDO // ESPERA' : 'STANDBY // READY FOR IGNITION'}</p>
            {error && <p className="mt-4 text-xs text-red-300" role="alert">{error}</p>}
          </div>

          <div className="relative z-10 mb-2 w-full max-w-xs text-center">
            <button
              type="button"
              onClick={() => void handleActivateSystem()}
              disabled={isStarting}
              data-interface-sound="skip"
              className="flex min-h-14 w-full items-center justify-center gap-3 border border-[#78ffd3] bg-[#043527]/75 px-5 py-4 text-sm font-bold tracking-[0.18em] text-[#baffea] shadow-[0_0_24px_rgba(0,255,180,0.18)] transition hover:bg-[#00b881]/20 hover:shadow-[0_0_34px_rgba(0,255,180,0.35)] disabled:cursor-wait disabled:opacity-60"
            >
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full bg-[#00ffb4] ${isStarting ? 'animate-pulse' : 'animate-ping'}`} />
              {isStarting ? 'INITIALIZING...' : 'START ENGINE'}
            </button>
            <p className="mt-3 text-[10px] text-[#629583]">La cámara se activa al iniciar el núcleo.</p>
          </div>
        </section>
      ) : (
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#00ffcc]/25 pb-4">
            <div>
              <h1 className="text-lg font-bold tracking-[0.12em] text-[#b7ffe9]">SENTRA CORE <span className="text-[#48ba98]">// V4.2</span></h1>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#62a78f]">Sistema operativo activo · {metrics?.mode.toUpperCase() ?? 'UNAVAILABLE'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-[#00ffb4]/25 px-3 py-2 text-[10px] text-[#8ddfc3]">{metrics?.processingLoad.fps?.toFixed(1) ?? '--'} FPS</span>
              <span className="border border-[#00ffb4]/25 px-3 py-2 text-[10px] text-[#8ddfc3]">LAT {metrics?.processingLoad.inferenceTimeMs?.toFixed(1) ?? '--'} ms</span>
              <span className={`border px-3 py-2 text-[10px] ${unresolvedAlertCount ? 'border-red-400/40 text-red-200' : 'border-[#00ffb4]/25 text-[#8ddfc3]'}`}>ALERTAS {unresolvedAlertCount}</span>
              <span className="border border-[#00ffb4]/25 px-3 py-2 text-[10px] text-[#8ddfc3]">DETECCIONES {isVisionProcessing ? stableDetections.length : '--'}</span>
              <span className="border border-[#00ffb4]/25 px-3 py-2 text-[10px] text-[#8ddfc3]">{busSnapshot.status} · RTT {busSnapshot.rttMs === null ? '--' : `${busSnapshot.rttMs} ms`} · Q {busSnapshot.queuedCount}</span>
              <button type="button" onClick={() => void handleExport()} disabled={isExporting} className="min-h-10 border border-[#00ffb4]/35 px-3 py-2 text-[10px] font-bold tracking-wide text-[#baffea] transition hover:bg-[#00ffb4]/10 disabled:opacity-50">
                {isExporting ? 'EXPORTANDO...' : 'EXPORTAR JSON'}
              </button>
              <button type="button" onClick={handleLock} className="min-h-10 border border-red-400/35 px-3 py-2 text-[10px] font-bold tracking-wide text-red-200 transition hover:bg-red-400/10">LOCK NUCLEUS</button>
            </div>
          </header>

          {error && <p className="border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200" role="alert">{error}</p>}

          {criticalAlerts.length > 0 && (
            <section aria-label="Alertas críticas del sistema" className="border border-red-400/30 bg-red-950/20 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-bold tracking-[0.12em] text-red-200">EVENTOS CRÍTICOS</h2>
                <span className="text-[10px] text-red-100/70">{unresolvedAlertCount} pendientes</span>
              </div>
              <ul className="space-y-2">
                {criticalAlerts.slice(0, 5).map((alert) => (
                  <li key={alert.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-red-400/15 pt-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-red-100">{alert.message}</p>
                      <time className="text-[10px] text-red-100/60" dateTime={alert.resolvedAt ?? alert.createdAt}>
                        {alert.resolvedAt ? `Resuelta ${new Date(alert.resolvedAt).toLocaleTimeString()}` : new Date(alert.createdAt).toLocaleTimeString()}
                      </time>
                    </div>
                    <button type="button" onClick={() => handleResolveAlert(alert)} disabled={Boolean(alert.resolvedAt)} className="min-h-11 shrink-0 border border-red-300/40 px-3 py-2 text-[10px] font-bold text-red-100 transition hover:bg-red-300/10 disabled:cursor-default disabled:opacity-50">
                      {alert.resolvedAt ? 'RESUELTA' : 'RESOLVER'}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav aria-label="Secciones del núcleo" role="tablist" className="grid grid-cols-3 border-b border-[#00ffcc]/20">
            {([
              ['specs', 'SPECS MOTOR'],
              ['environmental', 'SENSORES'],
              ['vision', 'VISIÓN'],
            ] as const).map(([tab, label]) => (
              <button key={tab} id={`core-tab-${tab}`} type="button" role="tab" aria-selected={activeTab === tab} aria-controls={`core-panel-${tab}`} onClick={() => setActiveTab(tab)} className={`min-h-12 border-b-2 px-2 py-3 text-[10px] font-bold tracking-[0.12em] transition sm:text-xs ${activeTab === tab ? 'border-[#00ffb4] bg-[#00ffb4]/[0.06] text-[#c0ffeb]' : 'border-transparent text-[#638f80] hover:text-[#a1d9c4]'}`}>
                {label}
              </button>
            ))}
          </nav>

          <section id={`core-panel-${activeTab}`} role="tabpanel" aria-labelledby={`core-tab-${activeTab}`} className="flex-1 border border-[#00ffcc]/15 bg-[#07100e]/65 p-4 sm:p-6">
            {activeTab === 'specs' && (
              <div className="space-y-5">
                <h2 className="border-b border-[#00ffcc]/20 pb-2 text-xs font-bold tracking-[0.12em] text-[#baffea]">TELEMETRÍA DE HARDWARE & MOTOR</h2>
                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <div className="border border-[#00ffcc]/15 bg-black/30 p-4"><span className="block text-[#629583]">Rendimiento observado</span><strong className="mt-2 block text-sm text-[#c0ffeb]">{metrics?.processingLoad.fps?.toFixed(1) ?? '--'} FPS / {metrics?.processingLoad.inferenceTimeMs?.toFixed(1) ?? '--'} ms</strong><Sparkline label="FPS" values={trendSamples.flatMap((sample) => sample.fps === null ? [] : [sample.fps])} /></div>
                  <div className="border border-[#00ffcc]/15 bg-black/30 p-4"><span className="block text-[#629583]">Núcleo</span><strong className="mt-2 block text-sm text-[#c0ffeb]">{metrics?.mode.toUpperCase() ?? 'UNAVAILABLE'}</strong></div>
                  <div className="border border-[#00ffcc]/15 bg-black/30 p-4"><span className="block text-[#629583]">GPS</span><strong className="mt-2 block text-sm text-[#c0ffeb]">{metrics?.sensors.gps.source.toUpperCase() ?? 'UNAVAILABLE'}</strong><span className="mt-1 block break-words text-[10px] text-[#629583]">{metrics?.sensors.gps.error ?? `± ${metrics?.sensors.gps.accuracy?.toFixed(0) ?? '--'} m`}</span></div>
                  <div className="border border-[#00ffcc]/15 bg-black/30 p-4"><span className="block text-[#629583]">Audio / batería</span><strong className="mt-2 block text-sm text-[#c0ffeb]">{metrics?.sensors.audio.speakerReady ? 'SYNTH ACTIVE' : 'MUTED'} · {metrics?.sensors.battery.level == null ? '--' : `${Math.round(metrics.sensors.battery.level * 100)}%`}</strong><Sparkline label="Battery" values={trendSamples.flatMap((sample) => sample.battery === null ? [] : [sample.battery])} /></div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="border border-[#00ffcc]/15 bg-black/25 p-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#8db4a5]"><h3 className="font-bold tracking-wider">ACOUSTIC RESONANCE</h3><span>MIC RMS: {metrics?.sensors.audio.ambientLevel?.toFixed(3) ?? 'OFF'}</span></div>
                    {metrics?.sensors.audio.ambientLevel == null
                      ? <p className="mt-4 text-[10px] text-[#638f80]">Lectura acústica no disponible.</p>
                      : <div className="mt-4 h-3 overflow-hidden border border-[#00ffcc]/25 bg-black/50" role="meter" aria-label="Nivel de audio real" aria-valuemin={0} aria-valuemax={1} aria-valuenow={metrics.sensors.audio.ambientLevel}>
                        <div className="h-full bg-[#00ffcc]/70 transition-[width]" style={{ width: `${Math.min(metrics.sensors.audio.ambientLevel * 100, 100)}%` }} />
                      </div>}
                    <button type="button" onClick={handlePulse} className="mt-4 min-h-11 w-full border border-[#00ffcc]/25 py-2 text-[10px] transition hover:border-[#00ffcc] hover:text-white">TEST PULSO ACÚSTICO (440 Hz)</button>
                  </section>
                  <section className="border border-[#00ffcc]/15 bg-black/25 p-4 text-[10px] text-[#95b5a8]">
                    <div className="mb-2 flex justify-between text-[#baffea]"><h3 className="font-bold tracking-wider">TELEMETRY FIFO</h3><span>{telemetryFifo.length}/{MAX_TELEMETRY_EVENTS}</span></div>
                    <div className="max-h-32 overflow-y-auto" aria-label="Flujo de telemetría">{telemetryFifo.length === 0 ? <span>Esperando telemetría...</span> : telemetryFifo.map((item) => <div key={item.timestamp} className="flex gap-2 border-t border-[#00ffcc]/10 py-1.5"><time className="shrink-0 text-[#629583]" dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</time><span className="min-w-0 flex-1 truncate">{item.event}</span><span className="shrink-0 text-[#70e4b5]">{item.status}</span></div>)}</div>
                    <div className="mt-3 max-h-16 overflow-y-auto border-t border-[#00ffcc]/10 pt-2 text-[#729687]">{logs.length === 0 ? 'Sin acciones registradas.' : logs.map((log) => <div key={log}>{log}</div>)}</div>
                  </section>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {onOpenVisionDemo && <button type="button" onClick={onOpenVisionDemo} className="min-h-11 border border-[#00ffcc]/35 px-4 py-2 text-[10px] font-bold tracking-wider text-[#aaffdf] transition hover:bg-[#00ffcc]/10">ABRIR DEMO DE VISIÓN</button>}
                </div>
              </div>
            )}

            {activeTab === 'environmental' && (
              <div className="space-y-5">
                <h2 className="border-b border-[#00ffcc]/20 pb-2 text-xs font-bold tracking-[0.12em] text-[#baffea]">SENSORES DEL DISPOSITIVO</h2>
                <div className="divide-y divide-[#00ffcc]/10 border-y border-[#00ffcc]/10 text-xs">
                  <div className="flex flex-wrap justify-between gap-2 py-4"><span className="text-[#88b3a2]">Posición GPS</span><strong className="text-[#c0ffeb]">{metrics?.sensors.gps.lat?.toFixed(4) ?? '--'}, {metrics?.sensors.gps.lon?.toFixed(4) ?? '--'}</strong></div>
                  <div className="flex flex-wrap justify-between gap-2 py-4"><span className="text-[#88b3a2]">Origen GPS</span><strong className="uppercase text-[#83e2bd]">{metrics?.sensors.gps.source ?? 'standby'}</strong></div>
                  <div className="flex flex-wrap justify-between gap-2 py-4"><span className="text-[#88b3a2]">Orientación (Alpha)</span><strong className="text-[#c0ffeb]">{metrics?.sensors.orientation.alpha?.toFixed(1) ?? '--'}°</strong></div>
                  <div className="flex flex-wrap justify-between gap-2 py-4"><span className="text-[#88b3a2]">Batería del dispositivo</span><strong className="text-[#c0ffeb]">{battery == null ? 'No disponible' : `${Math.round(battery * 100)}%`}</strong></div>
                  <div className="flex flex-wrap justify-between gap-2 py-4"><span className="text-[#88b3a2]">Nivel de audio ambiental</span><strong className="text-[#c0ffeb]">{metrics?.sensors.audio.ambientLevel?.toFixed(3) ?? 'No disponible'}</strong></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border border-[#00ffcc]/15 bg-black/25 p-4"><h3 className="text-[10px] text-[#88b3a2]">AUDIO AMBIENTAL</h3><Sparkline label="Ambient audio" values={trendSamples.flatMap((sample) => sample.audio === null ? [] : [sample.audio])} /></div>
                  <div className="border border-[#00ffcc]/15 bg-black/25 p-4"><h3 className="text-[10px] text-[#88b3a2]">ACELERÓMETRO · MAGNITUD</h3><strong className="mt-1 block text-sm text-[#c0ffeb]">{trendSamples.at(-1)?.acceleration?.toFixed(2) ?? 'No disponible'} m/s²</strong><Sparkline label="Acceleration" values={trendSamples.flatMap((sample) => sample.acceleration === null ? [] : [sample.acceleration])} /></div>
                </div>
                <p className="text-[10px] leading-relaxed text-[#638f80]">Los valores dependen de los permisos y sensores disponibles en este dispositivo. Los sensores sin lectura aparecen como no disponibles.</p>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="flex min-h-[360px] flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#00ffcc]/20 pb-2">
                  <h2 className="text-xs font-bold tracking-[0.12em] text-[#baffea]">VISIÓN ARTIFICIAL</h2>
                  <span className="text-[10px] text-[#83e2bd]">INFERENCE: {metrics?.processingLoad.inferenceTimeMs?.toFixed(1) ?? '--'} ms</span>
                </div>
                <div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-hidden border border-[#00ffcc]/25 bg-black">
                  <video ref={videoRef} autoPlay playsInline muted aria-label="Vista de cámara en vivo" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                  <canvas ref={detectionCanvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
                  {!cameraProfile.enableVision && <p className="absolute bottom-3 left-3 z-10 max-w-[90%] bg-black/80 px-3 py-2 text-[10px] text-[#baffea]">Inferencia desactivada por el perfil de capacidad del dispositivo.</p>}
                  {isVisionProcessing && visionSensors.loading && <p className="absolute bottom-3 left-3 z-10 bg-black/75 px-3 py-2 text-[10px] text-[#baffea]">CARGANDO MODELO LOCAL…</p>}
                  {isVisionProcessing && visionSensors.error && <p role="alert" className="absolute bottom-3 left-3 z-10 max-w-[90%] break-words bg-red-950/90 px-3 py-2 text-[10px] text-red-100">Inferencia local no disponible: {visionSensors.error}</p>}
                  {!isSystemActive && <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-xs text-[#668478]">ESPERANDO ACTIVACIÓN DE CÁMARA...</div>}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-[#00ffcc]/15"><span className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#00ffcc]" /><span className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#00ffcc]" /><span className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#00ffcc]" /><span className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#00ffcc]" /></div>
                  {!isSystemActive && <p className="relative z-10 bg-black/70 px-4 py-2 text-[10px] tracking-wider text-[#83b5a0]">CÁMARA EN ESPERA</p>}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default SentraCoreDashboard;
