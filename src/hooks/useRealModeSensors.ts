import { useEffect, useRef, useState } from 'react';
import { moralNode } from '../core/MoralNode';
import { evolis } from '../core/EVOLIS';
import { PerceptionEngine, PerceptionData } from '../core/PerceptionEngine';
import { bioSoftware } from '../core/BioSoftwareInterface';

export interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

export interface RealModeSensorsState {
  loading: boolean;
  error: string | null;
  detections: Detection[];
  perception: PerceptionData | null;
  lastEval: { allowed: boolean; reason: string } | null;
}

type CocoSsdModel = {
  detect: (img: HTMLVideoElement) => Promise<{ class: string; score: number; bbox: number[] }[]>;
};

export function useRealModeSensors(
  videoRef: React.RefObject<HTMLVideoElement>,
  active: boolean,
  intervalMs: number = 3000
): RealModeSensorsState {
  const [state, setState] = useState<RealModeSensorsState>({
    loading: true, error: null, detections: [], perception: null, lastEval: null,
  });
  const modelRef = useRef<CocoSsdModel | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const lastAuditRef = useRef({ signature: '', timestamp: 0 });
  const perceptionEngine = useRef(new PerceptionEngine());

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const tf = await import('@tensorflow/tfjs');
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        await tf.ready();
        try {
          await tf.setBackend('webgl');
        } catch (backendError: unknown) {
          console.warn('[COCO-SSD] WebGL no disponible; usando CPU.', backendError);
          await tf.setBackend('cpu');
        }
        const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        if (cancelled) return;
        modelRef.current = model as unknown as CocoSsdModel;
        setState((s) => ({ ...s, loading: false }));
      } catch (err) {
        console.error('[COCO-SSD] Error al cargar:', err);
        setState((s) => ({
          ...s, loading: false,
          error: err instanceof Error ? err.message : 'Error loading model',
        }));
      }
    }

    if (active) {
      loadModel();
    } else {
      setState({ loading: true, error: null, detections: [], perception: null, lastEval: null });
    }

    return () => {
      cancelled = true;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [active]);

  useEffect(() => {
    if (!active || state.loading || !modelRef.current) return;
    let adaptiveIntervalMs = intervalMs;
    let cancelled = false;

    const scheduleNext = () => {
      if (!cancelled) {
        timeoutRef.current = window.setTimeout(() => void detect(), adaptiveIntervalMs);
      }
    };

    async function detect() {
      if (cancelled) return;
      const video = videoRef.current;
      const model = modelRef.current;
      if (!video || !model) {
        scheduleNext();
        return;
      }
      if (video.readyState < 2) {
        scheduleNext();
        return;
      }

      const startedAt = performance.now();
      try {
        const predictions = await model.detect(video);
        const inferenceMs = performance.now() - startedAt;
        if (inferenceMs >= adaptiveIntervalMs * 0.8) {
          adaptiveIntervalMs = Math.min(10000, adaptiveIntervalMs + Math.max(500, Math.ceil(inferenceMs / 500) * 250));
        } else if (inferenceMs < adaptiveIntervalMs * 0.35) {
          adaptiveIntervalMs = Math.max(intervalMs, adaptiveIntervalMs - 250);
        }

        const detections: Detection[] = predictions.map((p) => ({
          class: p.class, score: p.score, bbox: p.bbox as [number, number, number, number],
        }));
        perceptionEngine.current.setBioContext(bioSoftware.getState());
        const perception = perceptionEngine.current.process({
          visionDetections: detections,
          imageWidth: video.videoWidth || 300,
          imageHeight: video.videoHeight || 300,
        });
        const eval_ = moralNode.evaluate(`detect: ${detections.map((d) => d.class).join(', ')}`);
        const labels = [...new Set(detections.map((detection) => detection.class))].sort();
        const signature = labels.join('|');
        const auditNow = Date.now();
        const lastAudit = lastAuditRef.current;
        if (eval_.allowed && labels.length > 0
          && (signature !== lastAudit.signature || auditNow - lastAudit.timestamp >= 30000)) {
          lastAuditRef.current = { signature, timestamp: auditNow };
          void evolis.record('vision', 'detection_summary', JSON.stringify({ labels, count: detections.length }))
            .catch((auditError: unknown) => console.warn('[COCO-SSD] No se pudo registrar el resumen:', auditError));
        }
        setState((s) => ({
          ...s, detections, perception,
          lastEval: { allowed: eval_.allowed, reason: eval_.decisions.find((d) => !d.passed)?.reason ?? 'OK' },
        }));
      } catch (detectionError: unknown) {
        console.warn('[COCO-SSD] Error transitorio durante inferencia.', detectionError);
      } finally {
        scheduleNext();
      }
    }
    void detect();
    return () => {
      cancelled = true;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [active, state.loading, intervalMs, videoRef]);

  return state;
}
