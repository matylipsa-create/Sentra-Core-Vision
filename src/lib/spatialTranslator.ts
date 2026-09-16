export type DistanceRange = 'IMMINENT' | 'STEP' | 'TRAJECTORY' | 'BACKGROUND';

export interface Detection {
  class: string;
  bbox: [number, number, number, number];
  score: number;
}

export interface SpatialDescription {
  text: string;
  range: DistanceRange;
  direction: 'left' | 'center' | 'right';
  priority: number;
}

const DISTANCE_RANGES: Array<{ max: number; range: DistanceRange; phrase: string }> = [
  { max: 0.8, range: 'IMMINENT', phrase: 'muy cerca' },
  { max: 1.5, range: 'STEP', phrase: 'a un paso' },
  { max: 3.0, range: 'TRAJECTORY', phrase: 'a dos metros' },
  { max: Infinity, range: 'BACKGROUND', phrase: 'lejos' },
];

export function getDistanceRange(sizeRatio: number): { range: DistanceRange; phrase: string } {
  const approxDistance = 1.5 * (1 - sizeRatio);
  for (const { max, range, phrase } of DISTANCE_RANGES) {
    if (approxDistance < max) return { range, phrase };
  }
  return { range: 'BACKGROUND', phrase: 'lejos' };
}

export function getDirection(centerX: number): 'left' | 'center' | 'right' {
  if (centerX < 0.35) return 'left';
  if (centerX > 0.65) return 'right';
  return 'center';
}

export function getDirectionPhrase(direction: 'left' | 'center' | 'right'): string {
  if (direction === 'left') return 'a tu izquierda';
  if (direction === 'right') return 'a tu derecha';
  return 'al frente';
}

export function describeDetection(
  det: Detection,
  labelES: string,
  videoWidth: number = 640,
  videoHeight: number = 480
): SpatialDescription {
  const [x, , w, h] = det.bbox;
  const centerX = (x + w / 2) / videoWidth;
  const sizeRatio = Math.min(1, (w * h) / (videoWidth * videoHeight));
  const { range, phrase } = getDistanceRange(sizeRatio);
  const direction = getDirection(centerX);
  const directionPhrase = getDirectionPhrase(direction);

  const text = `${labelES} ${phrase} ${directionPhrase}`;

  const priorityMap: Record<DistanceRange, number> = {
    IMMINENT: 1,
    STEP: 2,
    TRAJECTORY: 3,
    BACKGROUND: 4,
  };

  return { text, range, direction, priority: priorityMap[range] };
}

export function describeScene(
  detections: Detection[],
  translate: (label: string) => string,
  videoWidth: number = 640,
  videoHeight: number = 480
): string {
  if (detections.length === 0) return '';

  const descriptions = detections
    .map((det) => describeDetection(det, translate(det.class), videoWidth, videoHeight))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);

  return descriptions.map((d) => d.text).join('. ');
}
