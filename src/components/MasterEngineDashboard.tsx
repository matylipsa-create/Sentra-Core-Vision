import { useCallback, useEffect, useRef, useState } from 'react';
import { evolis } from '../core/EVOLIS';
import { storageService } from '../services/StorageService';
import { initOCR, recognizeText, terminateOCR } from '../services/OCREngine';
import { ResilientTCREIBus } from '../services/ResilientTCREIBus';
import { downloadAuditReport, type AuditFormat } from '../services/AuditReportExporter';
import { downloadImprovementReport, generarInformeMejoras, type ImprovementFormat } from '../services/ImprovementReport';
import {
  downloadAirGapAcknowledgementFile,
  downloadAirGapDeltaFile,
  getAirGapSourceId,
  importAirGapAcknowledgementFile,
  importAirGapDeltaFile,
  type AirGapImportResult,
} from '../services/AirGapSyncTransport';
import { playInterfaceCue } from '../lib/engineSound';

type ConnectionStatus = 'ONLINE' | 'OFFLINE' | 'RECONNECTING';
type PriorityEvent = { type: string; text: string };
type QueuedEvent = { item: PriorityEvent; priority: number; order: number };
interface BackendPerformance {
  cpuPercent: number;
  memoryRssMb: number;
  heapUsedMb: number;
  websocketRttMs: number | null;
  websocketClients: number;
  bufferedBytes: number;
  backpressuredClients: number;
  cepRecentSignals: number;
  queueHealth: 'healthy' | 'backpressured';
}

class SentraPriorityQueue {
  private heap: QueuedEvent[] = [];
  private order = 0;

  enqueue(item: PriorityEvent, priority: number): void {
    const entry = { item, priority, order: this.order++ };
    this.heap.push(entry);
    let index = this.heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (!this.hasHigherPriority(this.heap[index], this.heap[parent])) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  dequeue(): PriorityEvent | null {
    const first = this.heap[0];
    const last = this.heap.pop();
    if (!first || !last) return first?.item ?? null;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let highest = index;
        if (left < this.heap.length && this.hasHigherPriority(this.heap[left], this.heap[highest])) highest = left;
        if (right < this.heap.length && this.hasHigherPriority(this.heap[right], this.heap[highest])) highest = right;
        if (highest === index) break;
        [this.heap[index], this.heap[highest]] = [this.heap[highest], this.heap[index]];
        index = highest;
      }
    }
    return first.item;
  }

  size(): number {
    return this.heap.length;
  }

  private hasHigherPriority(first: QueuedEvent, second: QueuedEvent): boolean {
    return first.priority < second.priority
      || (first.priority === second.priority && first.order < second.order);
  }
}

export function MasterEngineDashboard() {
  const [improvementReport] = useState(generarInformeMejoras);
  const [bus] = useState(() => new ResilientTCREIBus());
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraRequestRef = useRef(0);
  const lastQueuedOcrRef = useRef('');
  const queueRef = useRef(new SentraPriorityQueue());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('OFFLINE');
  const [busMessage, setBusMessage] = useState('Bus local sin conexión.');
  const [rttMs, setRttMs] = useState<number | null>(null);
  const [outboxCount, setOutboxCount] = useState(0);
  const [backendPerformance, setBackendPerformance] = useState<BackendPerformance | null>(null);
  const [activeTelemetry, setActiveTelemetry] = useState('Esperando flujo de sensores...');
  const [ocrText, setOcrText] = useState('Sin texto detectado');
  const [isStarting, setIsStarting] = useState(false);
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [snapshotStatus, setSnapshotStatus] = useState('');
  const [auditStatus, setAuditStatus] = useState('');
  const [improvementStatus, setImprovementStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingImprovements, setIsExportingImprovements] = useState(false);
  const [airGapPeerId, setAirGapPeerId] = useState('');
  const [airGapSourceId, setAirGapSourceId] = useState('');
  const [airGapPassphrase, setAirGapPassphrase] = useState('');
  const [isSyncingAirGap, setIsSyncingAirGap] = useState(false);
  const [airGapStatus, setAirGapStatus] = useState('');
  const [lastAirGapImport, setLastAirGapImport] = useState<AirGapImportResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void getAirGapSourceId().then((sourceId) => {
      if (!cancelled) setAirGapSourceId(sourceId);
    }).catch((identityError: unknown) => {
      if (!cancelled) setAirGapStatus(identityError instanceof Error ? identityError.message : 'No se pudo cargar la identidad del nodo.');
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const unsubscribeSnapshot = bus.subscribe((snapshot) => {
      setConnectionStatus(snapshot.status);
      setBusMessage(snapshot.message);
      setRttMs(snapshot.rttMs);
      setOutboxCount(snapshot.queuedCount);
    });
    const unsubscribeEvents = bus.onEvent((name, data) => {
      if (name === 'system.performance' && data && typeof data === 'object') {
        setBackendPerformance(data as BackendPerformance);
        return;
      }
      const item = { type: 'BUS_EVENT', text: name };
      queueRef.current.enqueue(item, 5);
      const next = queueRef.current.dequeue();
      if (next) setActiveTelemetry(`Bus: ${next.text}`);
      if (name.includes('alert') || name.includes('critical')) {
        console.warn('[MasterEngineDashboard] Alerta crítica del bus:', data);
        playInterfaceCue('critical');
      }
    });
    bus.start();
    return () => {
      unsubscribeSnapshot();
      unsubscribeEvents();
      bus.stop();
    };
  }, [bus]);

  useEffect(() => {
    if (!isVisionActive) return undefined;
    let scanning = false;
    const interval = window.setInterval(async () => {
      const video = videoRef.current;
      if (scanning || !video || video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) return;
      scanning = true;
      try {
        const text = await recognizeText(video);
        const result = text || 'Sin texto detectado';
        setOcrText(result);
        queueRef.current.enqueue({ type: 'OCR_SCAN', text: result }, text ? 1 : 8);
        const next = queueRef.current.dequeue();
        if (next) setActiveTelemetry(`Procesado: ${next.type} -> ${next.text}`);
        if (text && text !== lastQueuedOcrRef.current) {
          lastQueuedOcrRef.current = text;
          void bus.enqueue('telemetry', { source: 'ocr', text, capturedAt: Date.now() })
            .catch((queueError: unknown) => console.error('[MasterEngineDashboard] No se pudo encolar OCR:', queueError));
        }
      } catch (ocrError) {
        console.error('[MasterEngineDashboard] Error de OCR:', ocrError);
        setError('No se pudo procesar el texto de la cámara.');
      } finally {
        scanning = false;
      }
    }, 2500);
    return () => window.clearInterval(interval);
  }, [bus, isVisionActive]);

  useEffect(() => () => {
    cameraRequestRef.current += 1;
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    void terminateOCR();
  }, []);

  const handleStartVision = useCallback(async () => {
    if (isStarting || isVisionActive) return;
    setIsStarting(true);
    setError('');
    setSnapshotStatus('');
    const requestId = ++cameraRequestRef.current;
    let stream: MediaStream | null = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API unavailable');
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const video = videoRef.current;
      if (!video) throw new Error('Camera preview unavailable');
      cameraStreamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      await initOCR();
      setOcrText('Analizando imagen...');
      setIsVisionActive(true);
      setActiveTelemetry('Cámara activa; iniciando análisis OCR local.');
    } catch (startError) {
      stream?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      setError(startError instanceof Error && startError.name === 'NotAllowedError'
        ? 'Permite el acceso a la cámara para iniciar la visión.'
        : 'No se pudo iniciar la cámara o el motor OCR.');
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, isVisionActive]);

  const handleStopVision = useCallback(() => {
    cameraRequestRef.current += 1;
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsVisionActive(false);
    setOcrText('Sin texto detectado');
    void terminateOCR();
  }, []);

  const handleSecureSnapshot = useCallback(async () => {
    setSnapshotStatus('Firmando y guardando...');
    setError('');
    const snapshot = {
      nodeId: 'SENTRA_CORE_01',
      telemetry: activeTelemetry,
      ocr: ocrText,
      connectionStatus,
      timestamp: Date.now(),
    };
    try {
      const evidence = await evolis.record('master_engine', 'secure_snapshot', JSON.stringify(snapshot));
      await storageService.saveEvidence(evidence);
      await bus.enqueue('operator_action', { action: 'secure_snapshot', evidenceId: evidence.id, snapshot });
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      playInterfaceCue('confirm');
      setSnapshotStatus(`Guardado y firmado en EVOLIS · ${evidence.entry.hash.slice(0, 16)}...`);
    } catch (saveError) {
      console.error('[MasterEngineDashboard] Error guardando snapshot:', saveError);
      setSnapshotStatus('');
      setError('No se pudo guardar la instantánea firmada.');
    }
  }, [activeTelemetry, bus, connectionStatus, ocrText]);

  const handleAuditExport = useCallback(async (format: AuditFormat) => {
    setIsExporting(true);
    setError('');
    setAuditStatus('Preparando reporte EVOLIS...');
    try {
      const count = await downloadAuditReport(format);
      setAuditStatus(`Reporte ${format.toUpperCase()} exportado · ${count} registros firmados.`);
      playInterfaceCue('confirm');
    } catch (exportError) {
      console.error('[MasterEngineDashboard] Error exportando reporte:', exportError);
      setAuditStatus('');
      setError('No se pudo exportar el reporte EVOLIS.');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleImprovementExport = useCallback((format: ImprovementFormat) => {
    setIsExportingImprovements(true);
    setError('');
    try {
      downloadImprovementReport(format);
      setImprovementStatus(`Reporte de mejoras ${format.toUpperCase()} exportado.`);
      playInterfaceCue('confirm');
    } catch (exportError) {
      console.error('[MasterEngineDashboard] Error exportando mejoras:', exportError);
      setImprovementStatus('');
      setError('No se pudo exportar el reporte de mejoras.');
    } finally {
      setIsExportingImprovements(false);
    }
  }, []);

  const handleAirGapExport = useCallback(async () => {
    setIsSyncingAirGap(true);
    setAirGapStatus('Cifrando y preparando el paquete...');
    try {
      const count = await downloadAirGapDeltaFile(
        storageService,
        airGapPeerId.trim(),
        airGapSourceId,
        airGapPassphrase,
      );
      setAirGapStatus(`Paquete exportado en ${count} bloques cifrados.`);
    } catch (syncError) {
      setAirGapStatus(syncError instanceof Error ? syncError.message : 'No se pudo exportar el paquete.');
    } finally {
      setIsSyncingAirGap(false);
    }
  }, [airGapPassphrase, airGapPeerId, airGapSourceId]);

  const handleAirGapImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsSyncingAirGap(true);
    setAirGapStatus('Verificando y aplicando el delta...');
    try {
      const result = await importAirGapDeltaFile(storageService, file, airGapPassphrase);
      setLastAirGapImport(result);
      setAirGapStatus(`Cadena ${result.sourceId} importada hasta ${result.appliedThrough}.`);
    } catch (syncError) {
      setAirGapStatus(syncError instanceof Error ? syncError.message : 'No se pudo importar el paquete.');
    } finally {
      setIsSyncingAirGap(false);
      event.target.value = '';
    }
  }, [airGapPassphrase]);

  const handleAirGapAcknowledgementExport = useCallback(async () => {
    if (!lastAirGapImport) return;
    setIsSyncingAirGap(true);
    try {
      const count = await downloadAirGapAcknowledgementFile(lastAirGapImport, airGapSourceId, airGapPassphrase);
      setAirGapStatus(`Acuse exportado en ${count} bloques cifrados.`);
    } catch (syncError) {
      setAirGapStatus(syncError instanceof Error ? syncError.message : 'No se pudo exportar el acuse.');
    } finally {
      setIsSyncingAirGap(false);
    }
  }, [airGapPassphrase, airGapSourceId, lastAirGapImport]);

  const handleAirGapAcknowledgementImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsSyncingAirGap(true);
    try {
      const acknowledgement = await importAirGapAcknowledgementFile(
        storageService,
        file,
        airGapPeerId.trim(),
        airGapPassphrase,
      );
      setAirGapStatus(`Acuse verificado; cursor ${acknowledgement.lastIndex} confirmado para ${acknowledgement.recipientId}.`);
    } catch (syncError) {
      setAirGapStatus(syncError instanceof Error ? syncError.message : 'No se pudo importar el acuse.');
    } finally {
      setIsSyncingAirGap(false);
      event.target.value = '';
    }
  }, [airGapPassphrase, airGapPeerId]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 bg-[#07100e] px-4 pb-6 pt-16 font-mono text-[#d5e8df] sm:px-6 sm:py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#00d4a0]/25 pb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#76ad99]">Edge node & vision pipeline v3.2</p>
          <h1 className="mt-1 text-lg font-bold tracking-[0.08em] text-[#9fffd9]">SENTRA MASTER ENGINE</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className={`border px-3 py-2 font-bold tracking-wider ${connectionStatus === 'ONLINE' ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300' : connectionStatus === 'RECONNECTING' ? 'border-amber-500/50 bg-amber-950/50 text-amber-200' : 'border-rose-500/40 bg-rose-950/30 text-rose-200'}`} role="status" aria-live="polite">{connectionStatus}</span>
          <span className="border border-[#00d4a0]/20 px-3 py-2 text-[#aaffdf]">RTT {rttMs === null ? '--' : `${rttMs} ms`}</span>
          <span className="border border-[#00d4a0]/20 px-3 py-2 text-[#aaffdf]">OUTBOX {outboxCount}</span>
        </div>
      </header>

      <p className="text-[10px] text-[#83a999]" aria-live="polite">{busMessage}</p>

      <section aria-label="Salud y profiling del backend" className="grid grid-cols-2 gap-px border border-[#00d4a0]/20 bg-[#00d4a0]/15 sm:grid-cols-4">
        <div className="bg-[#0b1713] px-3 py-2"><p className="text-[9px] uppercase text-[#789788]">CPU backend</p><p className="mt-1 text-xs text-[#c1ffe8]">{backendPerformance ? `${backendPerformance.cpuPercent.toFixed(1)}%` : '--'}</p></div>
        <div className="bg-[#0b1713] px-3 py-2"><p className="text-[9px] uppercase text-[#789788]">Memoria RSS / heap</p><p className="mt-1 text-xs text-[#c1ffe8]">{backendPerformance ? `${backendPerformance.memoryRssMb} / ${backendPerformance.heapUsedMb} MB` : '--'}</p></div>
        <div className="bg-[#0b1713] px-3 py-2"><p className="text-[9px] uppercase text-[#789788]">RTT WebSocket / clientes</p><p className="mt-1 text-xs text-[#c1ffe8]">{backendPerformance ? `${backendPerformance.websocketRttMs ?? '--'} ms / ${backendPerformance.websocketClients}` : '--'}</p></div>
        <div className="bg-[#0b1713] px-3 py-2"><p className="text-[9px] uppercase text-[#789788]">Colas / CEP</p><p className={`mt-1 text-xs ${backendPerformance?.queueHealth === 'backpressured' ? 'text-amber-200' : 'text-[#c1ffe8]'}`}>{backendPerformance ? `${backendPerformance.queueHealth} · ${Math.round(backendPerformance.bufferedBytes / 1024)} KB · ${backendPerformance.cepRecentSignals} señales` : '--'}</p></div>
      </section>

      {error && <p role="alert" className="border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">{error}</p>}

      <section className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2" aria-label="Motor de visión y telemetría">
        <div className="flex min-h-[280px] flex-col border border-[#00d4a0]/20 bg-black/40 p-3">
          <div className="relative flex-1 overflow-hidden bg-black" style={{ aspectRatio: '4 / 3' }}>
            <video ref={videoRef} muted playsInline aria-label="Vista en vivo de la cámara" className="absolute inset-0 h-full w-full object-cover opacity-85" />
            {!isVisionActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#030706] px-5 text-center">
                <p className="text-xs text-[#7eaa98]">La cámara y el OCR se inician cuando lo solicites.</p>
                <button type="button" onClick={() => void handleStartVision()} disabled={isStarting} className="min-h-11 border border-[#00d4a0]/50 px-4 py-2 text-xs font-bold text-[#aaffdf] transition hover:bg-[#00d4a0]/10 disabled:cursor-wait disabled:opacity-60">
                  {isStarting ? 'INICIANDO...' : 'INICIAR VISIÓN'}
                </button>
              </div>
            )}
            {isVisionActive && <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 bg-black/75 px-2 py-2 text-[10px] text-[#aaffdf]"><span className="truncate">OCR LOCAL · {ocrText}</span><button type="button" onClick={handleStopVision} className="min-h-8 shrink-0 border border-[#00d4a0]/40 px-2 hover:bg-[#00d4a0]/10">DETENER</button></div>}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 border border-[#00d4a0]/20 bg-[#0b1713] p-4">
          <div>
            <h2 className="text-sm font-semibold text-[#aaffdf]">Telemetría y cola de prioridad</h2>
            <p className="mt-3 min-h-16 break-words border border-[#00d4a0]/10 bg-black/35 p-3 text-xs leading-relaxed text-[#c6d9d0]" aria-live="polite">{activeTelemetry}</p>
            <p className="mt-3 text-[10px] text-[#789788]">Eventos en cola: {queueRef.current.size()}</p>
          </div>
          <div>
            <button type="button" onClick={() => void handleSecureSnapshot()} className="min-h-12 w-full border border-[#00d4a0]/45 bg-[#0c392b] px-4 py-3 text-xs font-bold tracking-wide text-[#c1ffe8] transition hover:bg-[#10533d]">
              FIRMAR Y GUARDAR SNAPSHOT
            </button>
            {snapshotStatus && <p className="mt-3 break-all text-[10px] text-[#8de0b8]" role="status" aria-live="polite">{snapshotStatus}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => void handleAuditExport('json')} disabled={isExporting} className="min-h-10 border border-[#00d4a0]/30 px-2 py-2 text-[10px] text-[#aaffdf] transition hover:bg-[#00d4a0]/10 disabled:opacity-50">AUDITORÍA JSON</button>
              <button type="button" onClick={() => void handleAuditExport('csv')} disabled={isExporting} className="min-h-10 border border-[#00d4a0]/30 px-2 py-2 text-[10px] text-[#aaffdf] transition hover:bg-[#00d4a0]/10 disabled:opacity-50">AUDITORÍA CSV</button>
            </div>
            {auditStatus && <p className="mt-2 text-[10px] text-[#8de0b8]" role="status" aria-live="polite">{auditStatus}</p>}
          </div>
        </div>
      </section>

      <section className="border border-[#00d4a0]/20 bg-[#0b1713] p-4" aria-labelledby="airgap-sync-title">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#00d4a0]/15 pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#789788]">AES-256-GCM · PBKDF2-SHA-256</p>
            <h2 id="airgap-sync-title" className="mt-1 text-sm font-semibold text-[#aaffdf]">Intercambio air-gapped EVOLIS</h2>
          </div>
          <span className="text-[10px] text-[#789788]">Nodo {airGapSourceId ? airGapSourceId.slice(7, 15) : '...'}</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-[10px] text-[#83a999]" htmlFor="airgap-peer-id">ID del nodo receptor
            <input id="airgap-peer-id" value={airGapPeerId} onChange={(event) => setAirGapPeerId(event.target.value)} autoComplete="off" className="mt-1 min-h-10 w-full border border-[#00d4a0]/20 bg-black/40 px-2 text-xs text-[#d5e8df] outline-none focus-visible:ring-2 focus-visible:ring-[#00d4a0]" />
          </label>
          <label className="text-[10px] text-[#83a999]" htmlFor="airgap-passphrase">Frase de intercambio (mínimo 12 caracteres)
            <input id="airgap-passphrase" type="password" autoComplete="new-password" value={airGapPassphrase} onChange={(event) => setAirGapPassphrase(event.target.value)} className="mt-1 min-h-10 w-full border border-[#00d4a0]/20 bg-black/40 px-2 text-xs text-[#d5e8df] outline-none focus-visible:ring-2 focus-visible:ring-[#00d4a0]" />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void handleAirGapExport()} disabled={isSyncingAirGap || !airGapSourceId || airGapPeerId.trim().length === 0 || airGapPassphrase.length < 12} className="min-h-10 border border-[#00d4a0]/35 px-3 text-[10px] text-[#aaffdf] hover:bg-[#00d4a0]/10 disabled:opacity-40">EXPORTAR DELTA CIFRADO</button>
          <label className={`flex min-h-10 cursor-pointer items-center border border-[#00d4a0]/35 px-3 text-[10px] text-[#aaffdf] hover:bg-[#00d4a0]/10 ${isSyncingAirGap || airGapPassphrase.length < 12 ? 'pointer-events-none opacity-40' : ''}`}>
            IMPORTAR PAQUETE
            <input type="file" accept="application/vnd.sentra.airgap+json,.json" disabled={isSyncingAirGap || airGapPassphrase.length < 12} onChange={(event) => void handleAirGapImport(event)} className="sr-only" />
          </label>
          {lastAirGapImport && <button type="button" onClick={() => void handleAirGapAcknowledgementExport()} disabled={isSyncingAirGap || airGapPassphrase.length < 12} className="min-h-10 border border-amber-300/30 px-3 text-[10px] text-amber-100 hover:bg-amber-300/10 disabled:opacity-40">EXPORTAR ACUSE</button>}
          <label className={`flex min-h-10 cursor-pointer items-center border border-amber-300/30 px-3 text-[10px] text-amber-100 hover:bg-amber-300/10 ${isSyncingAirGap || airGapPassphrase.length < 12 || airGapPeerId.trim().length === 0 ? 'pointer-events-none opacity-40' : ''}`}>
            IMPORTAR ACUSE
            <input type="file" accept="application/vnd.sentra.airgap+json,.json" disabled={isSyncingAirGap || airGapPassphrase.length < 12 || airGapPeerId.trim().length === 0} onChange={(event) => void handleAirGapAcknowledgementImport(event)} className="sr-only" />
          </label>
        </div>
        {airGapStatus && <p className="mt-2 break-words text-[10px] text-[#8de0b8]" role="status" aria-live="polite">{airGapStatus}</p>}
      </section>

      <section className="border border-[#00d4a0]/20 bg-[#0b1713] p-4" aria-labelledby="improvement-report-title">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#00d4a0]/15 pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#789788]">{improvementReport.modulo} · v{improvementReport.version}</p>
            <h2 id="improvement-report-title" className="mt-1 text-sm font-semibold text-[#aaffdf]">Reporte de mejoras propuestas</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleImprovementExport('json')} disabled={isExportingImprovements} className="min-h-10 border border-[#00d4a0]/30 px-3 py-2 text-[10px] text-[#aaffdf] transition hover:bg-[#00d4a0]/10 disabled:opacity-50">JSON</button>
            <button type="button" onClick={() => handleImprovementExport('csv')} disabled={isExportingImprovements} className="min-h-10 border border-[#00d4a0]/30 px-3 py-2 text-[10px] text-[#aaffdf] transition hover:bg-[#00d4a0]/10 disabled:opacity-50">CSV</button>
          </div>
        </div>
        <ul className="divide-y divide-[#00d4a0]/10">
          {improvementReport.recomendaciones.map(({ categoria, descripcion, accionSugerida, prioridad }) => (
            <li key={categoria} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-semibold text-[#c1ffe8]">{categoria}</h3>
                  <span className={`border px-2 py-1 text-[9px] uppercase ${prioridad === 'Alta' ? 'border-rose-400/40 bg-rose-950/30 text-rose-200' : prioridad === 'Media' ? 'border-amber-400/40 bg-amber-950/30 text-amber-200' : 'border-[#00d4a0]/30 text-[#aaffdf]'}`}>{prioridad}</span>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-[#83a999]">{descripcion}</p>
              </div>
              <p className="text-[10px] leading-relaxed text-[#c6d9d0]">{accionSugerida}</p>
            </li>
          ))}
        </ul>
        {improvementStatus && <p className="mt-2 text-[10px] text-[#8de0b8]" role="status" aria-live="polite">{improvementStatus}</p>}
      </section>

      <footer className="border-t border-[#00d4a0]/15 pt-3 text-center text-[10px] text-[#789788]">
        Soberanía de borde · Firma criptográfica EVOLIS · Procesamiento OCR local
      </footer>
    </main>
  );
}