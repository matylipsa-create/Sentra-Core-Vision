import { useState, useRef, useCallback, useEffect } from 'react';
import { voiceManager } from '../services/VoiceManager';
import { deviceManager } from '../core/DeviceManager';
import { spatialAudioEngine } from '../core/SpatialAudioEngine';
import { useRealModeSensors, type Detection } from '../hooks/useRealModeSensors';
import { initOCR, recognizeText, terminateOCR } from '../services/OCREngine';
import { describeScene } from '../lib/spatialTranslator';
import { useStableDetections } from '../hooks/useStableDetections';

const LABEL_ES: Record<string, string> = {
  person: 'persona',
  bicycle: 'bicicleta',
  car: 'auto',
  motorcycle: 'moto',
  airplane: 'avión',
  bus: 'autobús',
  train: 'tren',
  truck: 'camión',
  boat: 'barco',
  'traffic light': 'semáforo',
  'fire hydrant': 'hidrante',
  'stop sign': 'señal de alto',
  'parking meter': 'parquímetro',
  bench: 'banco',
  bird: 'pájaro',
  cat: 'gato',
  dog: 'perro',
  horse: 'caballo',
  sheep: 'oveja',
  cow: 'vaca',
  elephant: 'elefante',
  bear: 'oso',
  zebra: 'cebra',
  giraffe: 'jirafa',
  backpack: 'mochila',
  umbrella: 'paraguas',
  handbag: 'cartera',
  tie: 'corbata',
  suitcase: 'maleta',
  frisbee: 'frisbee',
  skis: 'esquís',
  snowboard: 'snowboard',
  'sports ball': 'pelota',
  kite: 'cometa',
  'baseball bat': 'bate',
  'baseball glove': 'guante',
  skateboard: 'patineta',
  surfboard: 'tabla de surf',
  'tennis racket': 'raqueta',
  bottle: 'botella',
  'wine glass': 'copa',
  cup: 'taza',
  fork: 'tenedor',
  knife: 'cuchillo',
  spoon: 'cuchara',
  bowl: 'tazón',
  banana: 'banana',
  apple: 'manzana',
  sandwich: 'sándwich',
  orange: 'naranja',
  broccoli: 'brócoli',
  carrot: 'zanahoria',
  'hot dog': 'pancho',
  pizza: 'pizza',
  donut: 'dona',
  cake: 'torta',
  chair: 'silla',
  couch: 'sofá',
  'potted plant': 'planta',
  bed: 'cama',
  'dining table': 'mesa',
  toilet: 'inodoro',
  tv: 'televisor',
  laptop: 'notebook',
  mouse: 'mouse',
  remote: 'control',
  keyboard: 'teclado',
  'cell phone': 'celular',
  microwave: 'microondas',
  oven: 'horno',
  toaster: 'tostadora',
  sink: 'pileta',
  refrigerator: 'heladera',
  book: 'libro',
  clock: 'reloj',
  vase: 'florero',
  scissors: 'tijeras',
  'teddy bear': 'oso de peluche',
  'hair drier': 'secador',
  toothbrush: 'cepillo de dientes',
};

function translateLabel(className: string): string {
  return LABEL_ES[className] ?? className;
}

const TTS_RATES = [1.0, 1.5, 2.0] as const;
const DEBOUNCE_MS = 3000;

function computeBboxArea(d: Detection, videoWidth: number, videoHeight: number): number {
  const [, , w, h] = d.bbox;
  const area = (w * h) / (videoWidth * videoHeight);
  return Math.max(0, Math.min(1, area));
}

function getHapticPatternForArea(area: number): string {
  if (area > 0.2) return 'VISION_VERY_CLOSE';
  if (area >= 0.1) return 'VISION_CLOSE';
  return 'VISION_FAR';
}

interface VisionScreenProps {
  onToggle?: (active: boolean) => void;
}

export function VisionScreen({ onToggle }: VisionScreenProps) {
  const [isActive, setIsActive] = useState(false);
  const [lastDescription, setLastDescription] = useState('');
  const [detectionCount, setDetectionCount] = useState(0);
  const [detectedLabels, setDetectedLabels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ttsRate, setTtsRate] = useState<number>(voiceManager.getRate());
  const [isOCRLoading, setIsOCRLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef(0);
  const lastSpokenRef = useRef<string>('');
  const lastSpokenTimeRef = useRef<number>(0);
  const audioInitRef = useRef(false);

  const speak = useCallback((text: string) => {
    console.log('[TTS] Text:', text);
    console.log('[TTS] Speaking...');
    try {
      if (voiceManager && typeof (voiceManager as any).speak === 'function') {
        (voiceManager as any).speak(text, 2);
        return;
      }
    } catch { /* noop */ }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1; u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  }, []);

  const ensureAudioInit = useCallback(() => {
    if (audioInitRef.current) return;
    try {
      spatialAudioEngine.init();
    } catch { /* noop */ }
    audioInitRef.current = true;
  }, []);

  const handleRateChange = useCallback((rate: number) => {
    voiceManager.setRate(rate);
    setTtsRate(rate);
  }, []);

  const { detections: rawDetections, error: detectionError } = useRealModeSensors(
    videoRef,
    isActive,
    3000
  );

  const detections = useStableDetections(rawDetections, 'outdoor');

  useEffect(() => {
    return () => {
      terminateOCR();
    };
  }, []);

  useEffect(() => {
    console.log('[USE-EFFECT] Detections:', detections.length);
    console.log('[DETECTIONS] Count:', detections.length);
    if (detections.length === 0) return;
    const video = videoRef.current;
    const videoWidth = video?.videoWidth || 300;
    const videoHeight = video?.videoHeight || 300;

    const labels = detections.map((d: Detection) => translateLabel(d.class));
    setDetectedLabels(labels);
    setDetectionCount(detections.length);
    console.log('[DETECTION] Count:', detections.length);
    const sceneDesc = describeScene(detections, translateLabel);
    const now = Date.now();
    const isSame = sceneDesc === lastSpokenRef.current;
    const timeSinceLast = now - lastSpokenTimeRef.current;
    const shouldSpeak = !isSame || (isSame && timeSinceLast >= DEBOUNCE_MS);

    if (shouldSpeak) {
      lastSpokenRef.current = sceneDesc;
      lastSpokenTimeRef.current = now;
      setLastDescription(sceneDesc);

      const primaryDetection = detections[0];
      const area = computeBboxArea(primaryDetection, videoWidth, videoHeight);

      try { deviceManager.vibratePattern(getHapticPatternForArea(area)); } catch { /* noop */ }

      try {
        const panX = ((primaryDetection.bbox[0] + primaryDetection.bbox[2] / 2) / videoWidth - 0.5) * 2;
        const distance = 3 * (1 - area);
        spatialAudioEngine.playSpatialBeep(panX, distance);
      } catch { /* noop */ }

      speak(sceneDesc);
    }
  }, [detections, speak]);

  const handleToggle = useCallback(async () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle?.(newState);
    setError(null);
    lastSpokenRef.current = '';

    ensureAudioInit();

    if (newState) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.01);
        console.log('[AUDIO] AudioContext desbloqueado');
      } catch (err) {
        console.error('[AUDIO] Error al desbloquear:', err);
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0.001;
        window.speechSynthesis.speak(silentUtterance);
        window.speechSynthesis.cancel();
        console.log('[TTS] speechSynthesis desbloqueado');
      }
    }

    try {
      if (deviceManager && typeof (deviceManager as any).vibratePattern === 'function') {
        (deviceManager as any).vibratePattern('QUADRANT_TAP');
      }
    } catch { /* noop */ }

    if (newState) {
      speak('Visión activada. Describiendo entorno.');
      if (videoRef.current) {
        console.log('[CAMERA] Activando...');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }, audio: false
          });
          console.log('[CAMERA] OK:', stream.getVideoTracks()[0]?.label);
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (err) {
          console.error('[CAMERA] Error:', (err as { name?: string }).name, (err as { message?: string }).message);
          setError('No se pudo acceder a la cámara');
          speak('Error al activar cámara');
          setIsActive(false);
        }
      }
    } else {
      speak('Visión desactivada.');
      setDetectionCount(0);
      setDetectedLabels([]);
      setLastDescription('');
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isActive, speak, onToggle, ensureAudioInit]);

  useEffect(() => {
    const handleDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTapRef.current < 300 && lastTapRef.current > 0) {
        e.preventDefault();
        handleToggle();
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    };
    window.addEventListener('touchstart', handleDoubleTap, { passive: false });
    return () => window.removeEventListener('touchstart', handleDoubleTap);
  }, [handleToggle]);

  const handleReadText = useCallback(async () => {
    if (!isActive) {
      speak('Activá visión primero');
      return;
    }
    setIsOCRLoading(true);
    setOcrText('');
    speak('Leyendo texto. Un momento.');
    try {
      await initOCR();
      const text = await recognizeText(videoRef.current!);
      if (text) {
        setOcrText(text);
        speak(text);
      } else {
        speak('No se detectó texto');
      }
    } catch {
      speak('Error al leer texto');
    } finally {
      setIsOCRLoading(false);
    }
  }, [isActive, speak]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const effectiveError = error || detectionError;

  return (
    <div className="vision-screen" role="application" aria-label="Sentra Visión — asistencia visual con detección de objetos y descripción por voz">
      <h1 className="vision-title" aria-level={1}>Sentra Visión</h1>

      <button
        className={`vision-main-button ${isActive ? 'active' : 'inactive'}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-label={isActive ? 'Desactivar visión: detener cámara y detección de objetos' : 'Activar visión: iniciar cámara y detección de objetos con descripción por voz'}
        aria-pressed={isActive}
        role="button"
        tabIndex={0}
      >
        {isActive ? 'DESACTIVAR' : 'ACTIVAR VISIÓN'}
      </button>

      <div className="tts-rate-selector" role="group" aria-label="Velocidad de voz para descripciones">
        <span className="tts-rate-label" id="tts-rate-label">Voz:</span>
        {TTS_RATES.map((rate) => (
          <button
            key={rate}
            className={`tts-rate-btn ${ttsRate === rate ? 'tts-rate-btn--active' : ''}`}
            onClick={() => handleRateChange(rate)}
            aria-label={`Velocidad de voz ${rate} veces`}
            aria-pressed={ttsRate === rate}
            role="button"
            tabIndex={0}
          >
            {rate === 1.0 ? '1x' : `${rate}x`}
          </button>
        ))}
      </div>

      <button
        className="vision-ocr-button"
        onClick={handleReadText}
        disabled={!isActive || isOCRLoading}
        aria-label={isOCRLoading ? 'Leyendo texto con OCR, espere' : 'Leer texto de la cámara con OCR'}
        role="button"
        tabIndex={0}
      >
        {isOCRLoading ? 'LEYENDO...' : 'LEER TEXTO'}
      </button>

      {ocrText && (
        <div className="vision-ocr-text" role="region" aria-live="polite" aria-label="Texto reconocido por OCR">
          {ocrText}
        </div>
      )}

      <div className="vision-status" role="status" aria-live="polite" aria-atomic="true" aria-label="Estado de la cámara y detecciones">
        <p className="vision-camera-status">
          Cámara: <strong>{isActive ? 'ACTIVA' : 'INACTIVA'}</strong>
        </p>
        {isActive && (
          <>
            <p className="vision-detection-count">
              Objetos detectados: <strong>{detectionCount}</strong>
            </p>
            {detectedLabels.length > 0 && (
              <p className="vision-detected-labels" aria-label={`Objetos detectados: ${detectedLabels.slice(0, 3).join(', ')}`}>
                {detectedLabels.slice(0, 3).join(', ')}
              </p>
            )}
            {lastDescription && (
              <p className="vision-last-description" aria-label={`Última descripción: ${lastDescription}`}>
                "{lastDescription}"
              </p>
            )}
          </>
        )}
        {effectiveError && (
          <p className="vision-error" role="alert" aria-label={`Error: ${effectiveError}`}>⚠️ {effectiveError}</p>
        )}
      </div>

      <p className="vision-hint" aria-hidden="true">
        Doble toque en pantalla para activar/desactivar
      </p>

      <video ref={videoRef} className="vision-hidden-video" aria-hidden="true" playsInline tabIndex={-1} />
    </div>
  );
}

export default VisionScreen;
