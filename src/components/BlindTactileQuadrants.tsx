/**
 * BlindTactileQuadrants
 * 4 zonas táctiles ciegas para control de Visión y Sentinel.
 * Sin botones visibles: solo áreas táctiles con ARIA labels descriptivos.
 */

import React, { useRef, useCallback } from 'react';
import { quadrantGestures, Quadrant } from '../core/QuadrantGestures';
import { spatialAudioEngine } from '../core/SpatialAudioEngine';
import { deviceManager } from '../core/DeviceManager';

interface BlindTactileQuadrantsProps {
  onAction?: (action: string, quadrant: string, gesture: 'tap' | 'longPress') => void;
  className?: string;
}

const QUADRANT_LABELS: Record<Quadrant, string> = {
  TOP_LEFT: 'Visión en vivo. Toque para iniciar o detener la cámara.',
  TOP_RIGHT: 'Descripción instantánea. Toque para describir lo que hay enfrente.',
  BOTTOM_LEFT: 'Estado del guardián perimetral. Toque para reporte de seguridad.',
  BOTTOM_RIGHT: 'Silenciar voz y audio. Mantenga pulsado para cancelar las alertas.',
};

const QUADRANT_ORDER: Quadrant[] = [
  'TOP_LEFT',
  'TOP_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_RIGHT',
];

function getActionForQuadrant(q: Quadrant): string {
  switch (q) {
    case 'TOP_LEFT':
      return 'TOGGLE_EYES_MODE';
    case 'TOP_RIGHT':
      return 'DESCRIBE_NOW';
    case 'BOTTOM_LEFT':
      return 'SENTINEL_STATUS';
    case 'BOTTOM_RIGHT':
      return 'PANIC_OR_PERIMETER';
    default:
      return 'TOGGLE_EYES_MODE';
  }
}

export const BlindTactileQuadrants: React.FC<BlindTactileQuadrantsProps> = ({
  onAction,
  className = '',
}) => {
  const pressStartRef = useRef<Map<Quadrant, number>>(new Map());
  const audioInitRef = useRef<boolean>(false);

  const ensureAudioInit = useCallback(() => {
    if (!audioInitRef.current) {
      try {
        if (spatialAudioEngine && typeof spatialAudioEngine.init === 'function') {
          spatialAudioEngine.init();
        }
      } catch (_) {
        /* noop */
      }
      audioInitRef.current = true;
    }
  }, []);

  const handlePressStart = useCallback(
    (q: Quadrant) => {
      ensureAudioInit();
      pressStartRef.current.set(q, Date.now());
      try {
        deviceManager.vibratePattern('QUADRANT_TAP');
      } catch (_) {
        /* noop */
      }
    },
    [ensureAudioInit]
  );

  const handlePressEnd = useCallback(
    (q: Quadrant) => {
      const start = pressStartRef.current.get(q);
      if (start === undefined) return;
      const duration = Date.now() - start;
      pressStartRef.current.delete(q);
      quadrantGestures.handleGesture(q, duration);

      if (onAction) {
        const action = getActionForQuadrant(q);
        onAction(action, q, duration >= 600 ? 'longPress' : 'tap');
      }
    },
    [onAction]
  );

  const handleKeyDown = useCallback(
    (q: Quadrant) => (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ensureAudioInit();
        quadrantGestures.handleGesture(q, 100);
        if (onAction) {
          const action = getActionForQuadrant(q);
          onAction(action, q, 'tap');
        }
      }
    },
    [ensureAudioInit, onAction]
  );

  return (
    <div
      className={`blind-tactile-quadrants ${className}`}
      role="group"
      aria-label="Controles táctiles de Visión y Sentinel"
      aria-describedby="blind-quadrant-help"
    >
      <span id="blind-quadrant-help" className="blind-quadrant-visually-hidden">
        Cada cuadrante anuncia su función. Toca un área para ejecutarla; con teclado, enfócala y usa Enter o Espacio.
      </span>
      {QUADRANT_ORDER.map((q) => (
        <button
          key={q}
          type="button"
          className={`blind-quadrant blind-quadrant-${q.toLowerCase().replace('_', '-')}`}
          aria-label={QUADRANT_LABELS[q]}
          onPointerDown={() => handlePressStart(q)}
          onPointerUp={() => handlePressEnd(q)}
          onPointerCancel={() => handlePressEnd(q)}
          onKeyDown={handleKeyDown(q)}
        >
          <span className="blind-quadrant-visually-hidden">{QUADRANT_LABELS[q]}</span>
        </button>
      ))}
    </div>
  );
};

export default BlindTactileQuadrants;
