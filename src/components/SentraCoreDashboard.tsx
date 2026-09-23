import { useCallback, useEffect, useRef, useState } from 'react';
import { sentraEngine, type SystemMetrics } from '../core/SentraCoreEngine';

const INITIAL_BARS = [40, 70, 45, 90, 60, 85, 30, 95, 50, 75];

export function SentraCoreDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = useCallback((message: string) => {
    setLogs((current) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...current].slice(0, 5));
  }, []);

  const handleActivateSystem = useCallback(async () => {
    if (isSystemActive) return;
    setError(null);
    addLog('Inicializando núcleo offline-first...');
    try {
      const initialized = await sentraEngine.initializeCore(videoRef.current ?? undefined);
      addLog(initialized
        ? 'Hardware nativo vinculado con éxito.'
        : 'Modo híbrido activado (sensores virtuales de respaldo).');
      setIsSystemActive(true);
      sentraEngine.playAcousticPulse(587.33, 0.15);
    } catch (activationError) {
      console.error('[SentraCoreDashboard] Error al inicializar el núcleo:', activationError);
      setError('No se pudo inicializar el núcleo.');
      addLog('Error al inicializar el núcleo.');
    }
  }, [addLog, isSystemActive]);

  useEffect(() => {
    if (!isSystemActive) return undefined;

    let cancelled = false;
    const refreshMetrics = async () => {
      try {
        const liveMetrics = await sentraEngine.fetchLiveMetrics();
        if (!cancelled) setMetrics(liveMetrics);
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
  }, [isSystemActive]);

  useEffect(() => () => {
    sentraEngine.shutdownCore(videoRef.current ?? undefined);
  }, []);

  const handlePulse = () => {
    sentraEngine.playAcousticPulse(440, 0.1);
    addLog('Pulso acústico de prueba emitido a 440 Hz.');
  };

  const battery = metrics?.sensors.battery.level;

  return (
    <main className="min-h-screen bg-[#050507] p-4 font-mono text-[#00ffcc] select-none">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4">
        <header className="flex flex-col items-center justify-between gap-3 rounded-lg border border-[#00ffcc]/30 bg-[#0a0a0f]/80 p-4 shadow-[0_0_15px_rgba(0,255,204,0.1)] backdrop-blur-md md:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-[#00ffcc]" />
            <div>
              <h1 className="text-lg font-bold tracking-widest text-white">
                SENTRA CORE // <span className="text-[#00ffcc]">EDGE MGP</span>
              </h1>
              <p className="text-xs text-zinc-500">
                SYS_STATUS: {isSystemActive ? 'ONLINE - AIR-GAPPED' : 'STANDBY'}
              </p>
            </div>
          </div>
          {!isSystemActive ? (
            <button
              type="button"
              onClick={() => void handleActivateSystem()}
              className="rounded border border-[#00ffcc] bg-[#00ffcc]/10 px-6 py-2 font-bold tracking-wider text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.3)] transition-all hover:bg-[#00ffcc] hover:text-black"
            >
              INICIALIZAR NÚCLEO
            </button>
          ) : (
            <div className="flex gap-2 text-xs">
              <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-400">
                MODE: {metrics?.mode.toUpperCase() ?? 'HYBRID'}
              </span>
              <span className="rounded border border-emerald-800 bg-emerald-950/50 px-2 py-1 text-emerald-400">
                FPS: {metrics?.processingLoad.fps ?? 60}
              </span>
            </div>
          )}
        </header>

        {error && <p className="rounded border border-red-500/50 bg-red-950/30 p-3 text-sm text-red-300" role="alert">{error}</p>}

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#08080c] p-3">
            <div className="mb-2 flex justify-between text-xs text-zinc-400">
              <span>[ SENSORY_01: VISION_FEED ]</span>
              <span className="text-cyan-400">INFERENCE: {metrics?.processingLoad.inferenceTimeMs.toFixed(1) ?? '12.4'}ms</span>
            </div>
            <div className="relative flex min-h-[220px] flex-1 items-center justify-center overflow-hidden rounded border border-zinc-900 bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover opacity-80" />
              {!isSystemActive && <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-xs text-zinc-600">ESPERANDO ACTIVACIÓN DE CÁMARA...</div>}
              <div className="absolute left-2 top-2 h-2 w-2 border-l-2 border-t-2 border-[#00ffcc]" />
              <div className="absolute right-2 top-2 h-2 w-2 border-r-2 border-t-2 border-[#00ffcc]" />
              <div className="absolute bottom-2 left-2 h-2 w-2 border-b-2 border-l-2 border-[#00ffcc]" />
              <div className="absolute bottom-2 right-2 h-2 w-2 border-b-2 border-r-2 border-[#00ffcc]" />
            </div>
          </section>

          <section className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-[#08080c] p-3">
            <div className="mb-2 flex justify-between text-xs text-zinc-400">
              <span>[ SENSORY_02: ACOUSTIC_RESONANCE ]</span>
              <span className={metrics?.sensors.audio.speakerReady ? 'text-emerald-400' : 'text-amber-500'}>
                {metrics?.sensors.audio.speakerReady ? 'SYNTH_ACTIVE' : 'MUTED'}
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded border border-zinc-900 bg-black/40 p-4">
              <div className="flex h-16 w-full items-end justify-center gap-1">
                {INITIAL_BARS.map((height, index) => (
                  <div key={index} className="w-2 rounded-t bg-[#00ffcc]/40 transition-all duration-150" style={{ height: `${isSystemActive ? height : height * 0.2}%` }} />
                ))}
              </div>
              <button type="button" onClick={handlePulse} disabled={!isSystemActive} className="w-full rounded border border-zinc-700 bg-zinc-900 py-2 text-xs transition-colors hover:border-[#00ffcc] hover:text-[#00ffcc] disabled:opacity-40">
                TEST PULSO ACÚSTICO (440Hz)
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-[#08080c] p-3 text-xs">
            <div className="mb-1 flex justify-between text-zinc-400"><span>[ HARDWARE_TELEMETRY ]</span><span>EDGE_HOST</span></div>
            <div className="flex flex-col gap-1.5 rounded border border-zinc-900 bg-black/40 p-2">
              <div className="flex justify-between"><span className="text-zinc-500">GPS Lat/Lon:</span><span className="text-white">{metrics?.sensors.gps.lat?.toFixed(4) ?? '--'}, {metrics?.sensors.gps.lon?.toFixed(4) ?? '--'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">GPS Source:</span><span className="uppercase text-cyan-400">{metrics?.sensors.gps.source ?? 'standby'}</span></div>
            </div>
            <div className="flex flex-col gap-1.5 rounded border border-zinc-900 bg-black/40 p-2">
              <div className="flex justify-between"><span className="text-zinc-500">Orientación (Alpha):</span><span className="text-white">{metrics?.sensors.orientation.alpha?.toFixed(1) ?? '--'}°</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Batería Dispositivo:</span><span className="text-emerald-400">{battery === null || battery === undefined ? '--' : `${Math.round(battery * 100)}%`}</span></div>
            </div>
            <div className="max-h-[100px] flex-1 overflow-y-auto rounded border border-zinc-900 bg-black/60 p-2 text-[10px] text-zinc-400">
              {logs.length === 0 ? <span>Sin eventos registrados.</span> : logs.map((log) => <div key={log}>{log}</div>)}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default SentraCoreDashboard;
