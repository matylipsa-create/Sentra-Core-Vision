import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useRealModeSensors, type Detection } from '../hooks/useRealModeSensors';
import { deviceManager } from '../core/DeviceManager';
import { voiceManager } from '../services/VoiceManager';
import { spatialAudioEngine } from '../core/SpatialAudioEngine';
import { sentraGuardianHub } from '../core/SentraGuardianHub';
import { cognitiveLoadManager } from '../core/CognitiveLoadManager';
import { hardwareAutoAdjust } from '../core/HardwareAutoAdjust';
import { initOCR, recognizeText, terminateOCR } from '../services/OCREngine';
import { evolis } from '../core/EVOLIS';
import type { PerceptionData } from '../core/PerceptionEngine';

const OBSTACLE_CLASSES = new Set([
  'person', 'bicycle', 'car', 'motorcycle', 'bus', 'train', 'truck', 'dog',
]);

const LABELS_ES: Record<string, string> = {
  person: 'persona', bicycle: 'bicicleta', car: 'auto', motorcycle: 'moto',
  bus: 'autobús', train: 'tren', truck: 'camión', dog: 'perro',
  chair: 'silla', couch: 'sofá', bench: 'banco', door: 'puerta',
  bottle: 'botella', backpack: 'mochila', handbag: 'bolso', suitcase: 'maleta',
  'traffic light': 'semáforo', 'stop sign': 'señal de alto', 'potted plant': 'planta',
};

export interface BlindVisionPanelActions {
  toggleCamera: () => void;
  setCamera: (active: boolean) => void;
  describeNow: () => void;
  readText: () => void;
  getPerception: () => PerceptionData | null;
}

function labelInSpanish(label: string): string {
  return LABELS_ES[label] ?? label;
}

function directionFor(detection: Detection, videoWidth: number): 'left' | 'center' | 'right' {
  const centerX = (detection.bbox[0] + detection.bbox[2] / 2) / videoWidth;
  if (centerX < 0.35) return 'left';
  if (centerX > 0.65) return 'right';
  return 'center';
}

function directionInSpanish(direction: 'left' | 'center' | 'right'): string {
  if (direction === 'left') return 'a tu izquierda';
  if (direction === 'right') return 'a tu derecha';
  return 'al frente';
}

export const BlindVisionPanel = forwardRef<BlindVisionPanelActions>(function BlindVisionPanel(_props, ref) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastAnnouncementRef = useRef({ signature: '', timestamp: 0 });
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReadingText, setIsReadingText] = useState(false);
  const profile = useRef(hardwareAutoAdjust.getProfile(deviceManager.detect())).current;
  const intervalMs = Math.max(2000, profile.visionIntervalMs || 5000);
  const { loading, error: modelError, detections } = useRealModeSensors(videoRef, cameraActive, intervalMs);

  useEffect(() => {
    if (!cameraActive) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Este navegador no permite acceder a la cámara.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        if (cancelled) return;
        setCameraError(error instanceof Error ? error.message : 'No se pudo iniciar la cámara.');
        setCameraActive(false);
        voiceManager.speak('No se pudo iniciar la cámara. Revisa el permiso de cámara del navegador.', 2);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [cameraActive]);

  const toggleCamera = useCallback(() => {
    setCameraError(null);
    sentraGuardianHub.initSpatialAudio();
    const next = !cameraActive;
    setCameraActive(next);
    deviceManager.vibrate(80);
    voiceManager.speak(next ? 'Iniciando cámara y detección local.' : 'Cámara desactivada.', 2);
  }, [cameraActive]);

  const describeNow = useCallback(() => {
    if (!cameraActive) {
      voiceManager.speak('La cámara está desactivada. Toca el cuadrante superior izquierdo para iniciarla.', 2);
      return;
    }
    if (loading) {
      voiceManager.speak('Cargando el modelo local de detección.', 3);
      return;
    }
    if (detections.length === 0) {
      voiceManager.speak('No identifico objetos con confianza en este momento.', 3);
      return;
    }

    const videoWidth = videoRef.current?.videoWidth || 640;
    const videoHeight = videoRef.current?.videoHeight || 480;
    const ranked = [...detections]
      .filter((detection) => detection.score >= 0.35)
      .sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]))
      .slice(0, 3);
    if (ranked.length === 0) {
      voiceManager.speak('No identifico objetos con confianza en este momento.', 3);
      return;
    }

    const descriptions = ranked.map((detection) => {
      const direction = directionFor(detection, videoWidth);
      const areaRatio = (detection.bbox[2] * detection.bbox[3]) / (videoWidth * videoHeight);
      const size = areaRatio >= 0.2 ? ', ocupa gran parte de la imagen' : '';
      return `${labelInSpanish(detection.class)} ${directionInSpanish(direction)}${size}`;
    });
    voiceManager.speak(`En la imagen: ${descriptions.join('. ')}. La cercanía se estima por tamaño y puede no corresponder a la distancia real.`, 3);
    deviceManager.vibratePattern('NOTIFICATION');

    const primary = ranked[0];
    const centerX = (primary.bbox[0] + primary.bbox[2] / 2) / videoWidth;
    spatialAudioEngine.playSpatialBeep((centerX - 0.5) * 2, 10);
  }, [cameraActive, detections, loading]);

  useEffect(() => {
    if (!cameraActive || detections.length === 0) return;
    const videoWidth = videoRef.current?.videoWidth || 640;
    const videoHeight = videoRef.current?.videoHeight || 480;
    const primary = [...detections]
      .filter((detection) => detection.score >= 0.4)
      .sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]))[0];
    if (!primary) return;

    const direction = directionFor(primary, videoWidth);
    const area = Math.min(1, (primary.bbox[2] * primary.bbox[3]) / (videoWidth * videoHeight));
    const possibleObstacle = OBSTACLE_CLASSES.has(primary.class) && area >= 0.12;
    const signature = `${primary.class}:${direction}:${possibleObstacle}`;
    const now = Date.now();
    const previous = lastAnnouncementRef.current;
    const cooldownMs = possibleObstacle ? 6000 : 15000;
    if (signature === previous.signature && now - previous.timestamp < cooldownMs) return;
    if (!possibleObstacle && now - previous.timestamp < cooldownMs) return;

    lastAnnouncementRef.current = { signature, timestamp: now };
    const objectDescription = `${labelInSpanish(primary.class)} ${directionInSpanish(direction)}`;
    if (possibleObstacle) {
      const message = `Posible obstáculo: ${objectDescription}, de gran tamaño en la imagen. Detente y verifica con tu técnica habitual.`;
      voiceManager.stop();
      voiceManager.speak(message, 1);
      deviceManager.vibratePattern(area >= 0.25 ? 'VISION_VERY_CLOSE' : 'VISION_CLOSE');
      void evolis.record('blind_vision', 'possible_obstacle_alert', JSON.stringify({
        object: primary.class,
        direction,
        imageScale: 'large',
      })).catch((auditError: unknown) => console.warn('[BlindVision] No se pudo registrar alerta:', auditError));
    } else if (!cognitiveLoadManager.shouldThrottle()) {
      voiceManager.speak(`Detectado: ${objectDescription}.`, 4);
    }

    const centerX = (primary.bbox[0] + primary.bbox[2] / 2) / videoWidth;
    sentraGuardianHub.onVisionDetection({
      label: labelInSpanish(primary.class),
      confidence: primary.score,
      panX: (centerX - 0.5) * 2,
      distance: 10,
    });
  }, [cameraActive, detections]);

  const handleReadText = useCallback(async () => {
    const video = videoRef.current;
    if (!cameraActive || !video || video.readyState < 2 || isReadingText) {
      if (!cameraActive) voiceManager.speak('Primero activa la cámara para leer texto.', 3);
      return;
    }
    setIsReadingText(true);
    try {
      await initOCR();
      const text = await recognizeText(video);
      if (!text) {
        voiceManager.speak('No consigo leer texto en esta imagen.', 3);
        return;
      }
      voiceManager.speak(`Texto detectado: ${text.slice(0, 400)}`, 2);
      void evolis.record('blind_vision', 'ocr_read', JSON.stringify({ characters: text.length }))
        .catch((auditError: unknown) => console.warn('[BlindVision] No se pudo registrar OCR:', auditError));
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'No se pudo leer el texto.');
      voiceManager.speak('No se pudo leer el texto.', 2);
    } finally {
      setIsReadingText(false);
    }
  }, [cameraActive, isReadingText]);

  const setCamera = useCallback((active: boolean) => {
    if (active !== cameraActive) toggleCamera();
  }, [cameraActive, toggleCamera]);

  const getPerception = useCallback((): PerceptionData | null => {
    if (detections.length === 0) return null;
    const imageWidth = videoRef.current?.videoWidth || 640;
    const imageHeight = videoRef.current?.videoHeight || 480;
    return {
      visionDetections: detections.map(({ class: label, score, bbox }) => ({ class: label, score, bbox })),
      imageWidth,
      imageHeight,
      summary: detections.slice(0, 5).map((detection) => labelInSpanish(detection.class)).join(', '),
    };
  }, [detections]);

  useImperativeHandle(ref, () => ({
    toggleCamera,
    setCamera,
    describeNow,
    readText: () => { void handleReadText(); },
    getPerception,
  }), [describeNow, getPerception, handleReadText, setCamera, toggleCamera]);

  useEffect(() => () => {
    void terminateOCR();
  }, []);

  return (
    <div className="blind-vision-panel" role="region" aria-label="Asistencia visual para personas ciegas">
      <div className="blind-vision-heading">
        <div>
          <h2 className="blind-panel-title">Sentra Visión</h2>
          <p className="blind-panel-desc">Inferencia en el dispositivo. La cámara se activa a demanda; el primer uso puede requerir Internet para descargar el modelo.</p>
        </div>
        <span className="blind-vision-status" role="status" aria-live="polite">
          {!cameraActive ? 'Cámara apagada' : isReadingText ? 'Leyendo texto' : loading ? 'Cargando modelo' : cameraError || modelError ? 'Revisa permisos o modelo' : 'Visión activa'}
        </span>
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="blind-live-video"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="blind-vision-actions">
        <button
          className="blind-action-btn blind-camera-btn"
          onClick={toggleCamera}
          aria-label={cameraActive ? 'Detener cámara' : 'Activar cámara'}
          aria-pressed={cameraActive}
        >
          {cameraActive ? 'Detener cámara' : 'Activar cámara'}
        </button>
      </div>

      {(cameraError || modelError) && (
        <p className="blind-error" role="alert">{cameraError || `No se pudo cargar el modelo local: ${modelError}`}</p>
      )}

      {cameraActive && !loading && !cameraError && !modelError && detections.length > 0 && (
        <div className="blind-detections" aria-live="polite">
          <h3 className="blind-detections-title">Detecciones ({detections.length})</h3>
          <ul className="blind-detection-list">
            {detections.slice(0, 5).map((d: Detection, i: number) => (
              <li key={i} className="blind-detection-item">
                <span className="blind-detection-class">{d.class}</span>
                <span className="blind-detection-score">{Math.round(d.score * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
