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
  const intervalRef = useRef<number | null>(null);
  const perceptionEngine = useRef(new PerceptionEngine());

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      console.log('[COCO-SSD] Iniciando carga...');
      try {
        const tf = await import('@tensorflow/tfjs');
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        await tf.ready();
        await tf.setBackend('webgl');
        const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        if (cancelled) return;
        modelRef.current = model as unknown as CocoSsdModel;
        console.log('[COCO-SSD] Modelo cargado exitosamente');
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
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active]);

  useEffect(() => {
    if (!active || state.loading || !modelRef.current) return;
    let lastProcessTime = 0;

    async function detect() {
      const video = videoRef.current;
      const model = modelRef.current;
      if (!video || !model || video.readyState < 2) return;
      const now = Date.now();
      if (now - lastProcessTime < 1000) return;
      lastProcessTime = now;
      try {
        console.log('[LOOP] Frame enviado al modelo');
        const predictions = await model.detect(video);
        const detections: Detection[] = predictions.map((p) => ({
          class: p.class, score: p.score, bbox: p.bbox as [number, number, number, number],
        }));
        console.log('[LOOP] Detecciones:', detections.length);
        perceptionEngine.current.setBioContext(bioSoftware.getState());
        const perception = perceptionEngine.current.process({
          visionDetections: detections,
          imageWidth: video.videoWidth || 300,
          imageHeight: video.videoHeight || 300,
        });
        const eval_ = moralNode.evaluate(`detect: ${detections.map((d) => d.class).join(', ')}`);
        if (eval_.allowed && detections.length > 0) {
          await evolis.record('vision', 'detection', JSON.stringify(detections.slice(0, 3)));
        }
        setState((s) => ({
          ...s, detections, perception,
          lastEval: { allowed: eval_.allowed, reason: eval_.decisions.find((d) => !d.passed)?.reason ?? 'OK' },
        }));
      } catch {
        // Detection errors are transient
      }
    }
    detect();
    intervalRef.current = window.setInterval(detect, intervalMs);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, state.loading, intervalMs, videoRef]);

  return state;
}
