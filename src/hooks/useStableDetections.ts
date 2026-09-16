import { useRef, useEffect, useState } from 'react';
import type { Detection } from '../lib/spatialTranslator';
import { refineDetections } from '../lib/detectionRefiner';

const FRAME_BUFFER = 3;
const MIN_HITS = 2;

interface TrackedDetection extends Detection {
  hits: number;
  lastSeen: number;
}

export function useStableDetections(rawDetections: Detection[], context: 'indoor' | 'outdoor' | 'any' = 'outdoor') {
  const [stable, setStable] = useState<Detection[]>([]);
  const trackedRef = useRef<Map<string, TrackedDetection>>(new Map());
  const frameRef = useRef<Detection[][]>([]);

  useEffect(() => {
    const refined = refineDetections(rawDetections, context);

    frameRef.current.push(refined);
    if (frameRef.current.length > FRAME_BUFFER) frameRef.current.shift();

    const now = Date.now();
    const tracked = trackedRef.current;

    for (const det of refined) {
      const key = `${det.class}_${Math.round(det.bbox[0] / 50)}_${Math.round(det.bbox[1] / 50)}`;
      const existing = tracked.get(key);
      if (existing) {
        existing.hits += 1;
        existing.lastSeen = now;
        existing.bbox = existing.bbox.map((v, i) => (v + det.bbox[i]) / 2) as [number, number, number, number];
        existing.score = det.score;
      } else {
        tracked.set(key, { ...det, hits: 1, lastSeen: now });
      }
    }

    for (const [key, item] of tracked) {
      if (now - item.lastSeen > 1000) tracked.delete(key);
    }

    const confirmed = Array.from(tracked.values())
      .filter((d) => d.hits >= MIN_HITS)
      .map(({ hits, lastSeen, ...det }) => det);

    setStable(confirmed);
  }, [rawDetections, context]);

  return stable;
}
