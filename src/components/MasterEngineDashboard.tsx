import { useCallback, useEffect, useRef, useState } from 'react';
import { evolis } from '../core/EVOLIS';
import { storageService } from '../services/StorageService';
import { initOCR, recognizeText, terminateOCR } from '../services/OCREngine';

type ConnectionStatus = 'ONLINE' | 'OFFLINE' | 'RECONNECTING';
type PriorityEvent = { type: string; text: string };
type QueuedEvent = { item: PriorityEvent; priority: number; order: number };

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

function getBusUrl(): string {
  if (import.meta.env.VITE_SENTRA_WS_URL) return import.meta.env.VITE_SENTRA_WS_URL;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'ws://localhost:8080';
  }
  return '';
}

function createMessageId(): string {
  return window.crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function MasterEngineDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraRequestRef = useRef(0);
  const queueRef = useRef(new SentraPriorityQueue());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('OFFLINE');
  const [busMessage, setBusMessage] = useState('Bus local sin conexión.');
  const [activeTelemetry, setActiveTelemetry] = useState('Esperando flujo de sensores...');
  const [ocrText, setOcrText] = useState('Sin texto detectado');
  const [isStarting, setIsStarting] = useState(false);
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [snapshotStatus, setSnapshotStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const url = getBusUrl();
    if (!url) {
      setBusMessage('Configura VITE_SENTRA_WS_URL para conectar el bus remoto.');
      return undefined;
    }

    let stopped = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let retryDelay = 1000;

    const connect = () => {
      if (stopped) return;
      setConnectionStatus('RECONNECTING');
      try {
        socket = new WebSocket(url);
      } catch {
        setConnectionStatus('OFFLINE');
        reconnectTimer = window.setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30000);
          connect();
        }, retryDelay);
        return;
      }

      const currentSocket = socket;
      currentSocket.onopen = () => {
        if (stopped) return;
        retryDelay = 1000;
        setConnectionStatus('ONLINE');
        setBusMessage(`Conectado a ${url}`);
        currentSocket.send(JSON.stringify({
          type: 'query',
          module: 'system',
          action: 'get_status',
          payload: {},
          timestamp: Date.now(),
          id: createMessageId(),
        }));
      };
      currentSocket.onmessage = (event) => {
        if (stopped) return;
        try {
          const message = JSON.parse(String(event.data)) as {
            type?: string;
            event?: string;
            data?: unknown;
            ok?: boolean;
            error?: string;
          };
          if (message.type === 'response') {
            setBusMessage(message.ok ? 'Estado del bus actualizado.' : message.error ?? 'Error al consultar el bus.');
          } else if (message.type === 'event' && message.event) {
            const item = { type: 'BUS_EVENT', text: message.event };
            queueRef.current.enqueue(item, 5);
            const next = queueRef.current.dequeue();
            if (next) setActiveTelemetry(`Bus: ${next.text}`);
          }
        } catch {
          setBusMessage('Se recibió un mensaje de bus no válido.');
        }
      };
      currentSocket.onclose = () => {
        if (stopped) return;
        setConnectionStatus('RECONNECTING');
        setBusMessage('Bus desconectado; reintentando conexión.');
        reconnectTimer = window.setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30000);
          connect();
        }, retryDelay);
      };
      currentSocket.onerror = () => currentSocket.close();
    };

    connect();
    return () => {
      stopped = true;
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

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
      } catch (ocrError) {
        console.error('[MasterEngineDashboard] Error de OCR:', ocrError);
        setError('No se pudo procesar el texto de la cámara.');
      } finally {
        scanning = false;
      }
    }, 2500);
    return () => window.clearInterval(interval);
  }, [isVisionActive]);

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
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      setSnapshotStatus(`Guardado y firmado en EVOLIS · ${evidence.entry.hash.slice(0, 16)}...`);
    } catch (saveError) {
      console.error('[MasterEngineDashboard] Error guardando snapshot:', saveError);
      setSnapshotStatus('');
      setError('No se pudo guardar la instantánea firmada.');
    }
  }, [activeTelemetry, connectionStatus, ocrText]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 bg-[#07100e] px-4 pb-6 pt-16 font-mono text-[#d5e8df] sm:px-6 sm:py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#00d4a0]/25 pb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#76ad99]">Edge node & vision pipeline v3.2</p>
          <h1 className="mt-1 text-lg font-bold tracking-[0.08em] text-[#9fffd9]">SENTRA MASTER ENGINE</h1>
        </div>
        <div className={`border px-3 py-2 text-[10px] font-bold tracking-wider ${connectionStatus === 'ONLINE' ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300' : connectionStatus === 'RECONNECTING' ? 'border-amber-500/50 bg-amber-950/50 text-amber-200' : 'border-rose-500/40 bg-rose-950/30 text-rose-200'}`} role="status" aria-live="polite">
          {connectionStatus}
        </div>
      </header>

      <p className="text-[10px] text-[#83a999]" aria-live="polite">{busMessage}</p>

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
          </div>
        </div>
      </section>

      <footer className="border-t border-[#00d4a0]/15 pt-3 text-center text-[10px] text-[#789788]">
        Soberanía de borde · Firma criptográfica EVOLIS · Procesamiento OCR local
      </footer>
    </main>
  );
}