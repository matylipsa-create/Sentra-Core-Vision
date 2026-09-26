import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { voiceManager } from '../services/VoiceManager';
import { deviceManager } from '../core/DeviceManager';

const ONBOARDED_KEY = 'sentra-onboarded';
const WELCOME_TTS = 'Bienvenido a Sentra Visión. Usa el botón para activar la cámara. También puedes dar doble toque en el fondo para activar o desactivar.';

interface VisionOnboardingProps {
  children: ReactNode;
}

export function VisionOnboarding({ children }: VisionOnboardingProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    let alreadyOnboarded = false;
    try {
      alreadyOnboarded = localStorage.getItem(ONBOARDED_KEY) === 'true';
    } catch { /* localStorage unavailable */ }

    if (!alreadyOnboarded) {
      setShowOverlay(true);
      const timer = setTimeout(() => {
        try { voiceManager.speak(WELCOME_TTS, 2); } catch { /* noop */ }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDED_KEY, 'true');
    } catch { /* localStorage unavailable */ }
    try { deviceManager.vibrate(80); } catch { /* noop */ }
    setShowOverlay(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss();
    }
  };

  if (!showOverlay) return <>{children}</>;

  return (
    <>
      {children}
      <div
        className="vision-onboarding-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-instructions"
      >
        <div className="vision-onboarding-card">
          <h2 id="onboarding-title" className="vision-onboarding-title">
            Bienvenido a Sentra Visión
          </h2>
          <p id="onboarding-instructions" className="vision-onboarding-text">
            Usa el botón para activar la cámara. También puedes dar doble toque en el fondo para activar o desactivar.
          </p>
          <button
            className="vision-onboarding-btn"
            onClick={handleDismiss}
            onKeyDown={handleKeyDown}
            aria-label="Entendido: cerrar mensaje de bienvenida y comenzar a usar Sentra Visión"
            role="button"
            tabIndex={0}
          >
            Entendido
          </button>
        </div>
      </div>
    </>
  );
}

export default VisionOnboarding;
