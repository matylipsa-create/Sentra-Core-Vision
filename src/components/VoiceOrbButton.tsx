import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { voiceManager } from '../services/VoiceManager';
import { deviceManager } from '../core/DeviceManager';

type OrbState = 'idle' | 'listening' | 'speaking' | 'disabled';

interface VoiceOrbButtonProps {
  onCommand?: (command: string) => boolean;
}

export function VoiceOrbButton({ onCommand }: VoiceOrbButtonProps = {}) {
  const {
    voiceEnabled, isPassiveListening,
    togglePassiveListening, toggleVoice,
    processCommand,
  } = useApp();

  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [oneShotListening, setOneShotListening] = useState(false);
  const [localSttAvailable, setLocalSttAvailable] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastTapRef = useRef(0);
  const dispatchCommand = useCallback((command: string) => {
    if (onCommand?.(command)) return;
    void processCommand(command);
  }, [onCommand, processCommand]);

  useEffect(() => {
    const SRC =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (SRC) {
      const recognition = new SRC();
      if (!('processLocally' in recognition)) {
        setLocalSttAvailable(false);
        recognitionRef.current = null;
        return;
      }
      recognition.processLocally = true;
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        dispatchCommand(transcript);
      };
      recognition.onend = () => {
        setOneShotListening(false);
        setOrbState(isPassiveListening ? 'listening' : 'idle');
      };
      recognition.onerror = () => {
        setOneShotListening(false);
        setOrbState(isPassiveListening ? 'listening' : 'idle');
      };
      recognitionRef.current = recognition;
      setLocalSttAvailable(true);
    } else setLocalSttAvailable(false);
  }, [dispatchCommand, isPassiveListening]);

  useEffect(() => {
    if (isPassiveListening) {
      const ok = voiceManager.startPassiveListening(dispatchCommand);
      if (!ok) {
        voiceManager.speak('Escucha pasiva no disponible en este dispositivo', 2);
        togglePassiveListening();
        return;
      }
      setOrbState('listening');
      deviceManager.vibrate([60, 30, 60]);
    } else {
      voiceManager.stopPassiveListening();
      if (!oneShotListening) setOrbState('idle');
    }
    return () => {
      voiceManager.stopPassiveListening();
    };
  }, [isPassiveListening, dispatchCommand, togglePassiveListening, oneShotListening]);

  useEffect(() => {
    if (!voiceEnabled) {
      setOrbState('disabled');
      voiceManager.stopPassiveListening();
    } else if (orbState === 'disabled') {
      setOrbState(isPassiveListening ? 'listening' : 'idle');
    }
  }, [voiceEnabled, isPassiveListening]);

  useEffect(() => {
    const checkSpeaking = window.setInterval(() => {
      if (voiceManager.isSpeaking() && !oneShotListening && !isPassiveListening) {
        setOrbState('speaking');
      } else if (orbState === 'speaking' && !voiceManager.isSpeaking()) {
        setOrbState(isPassiveListening ? 'listening' : 'idle');
      }
    }, 200);
    return () => clearInterval(checkSpeaking);
  }, [oneShotListening, isPassiveListening, orbState]);

  const handleActivate = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      deviceManager.vibrate([50, 30, 50]);
      toggleVoice();
      return;
    }
    lastTapRef.current = now;

    if (!voiceEnabled) {
      toggleVoice();
      return;
    }

    if (oneShotListening) {
      recognitionRef.current?.stop();
      setOneShotListening(false);
      setOrbState(isPassiveListening ? 'listening' : 'idle');
      deviceManager.vibrate(80);
      return;
    }

    if (isPassiveListening) {
      togglePassiveListening();
      deviceManager.vibrate(80);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setOneShotListening(true);
        setOrbState('listening');
        deviceManager.vibrate(120);
      } catch {
        setOneShotListening(false);
      }
    } else {
      voiceManager.speak('El reconocimiento de voz local no está disponible en este navegador.', 2);
      setLocalSttAvailable(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleActivate();
    }
  };

  const ariaLabel = orbState === 'listening'
    ? 'Detener conversacion por voz bidireccional'
    : orbState === 'speaking'
      ? 'Sentra Core esta hablando'
      : orbState === 'disabled'
        ? 'Voz desactivada, doble toque para activar'
        : 'Iniciar conversacion por voz bidireccional';

  return (
    <div className="voice-orb-container">
      <button
        className={`voice-orb voice-orb--${orbState}`}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-pressed={orbState === 'listening'}
        role="button"
      >
        <span className="voice-orb-ring" aria-hidden="true" />
        <span className="voice-orb-ring voice-orb-ring--2" aria-hidden="true" />
        <span className="voice-orb-ring voice-orb-ring--3" aria-hidden="true" />
        <span className="voice-orb-core" aria-hidden="true">
          {orbState === 'listening' && '\u{1F3A4}'}
          {orbState === 'speaking' && '\u{1F50A}'}
          {orbState === 'idle' && '\u{1F5E3}'}
          {orbState === 'disabled' && '\u{1F507}'}
        </span>
      </button>
      <span className="voice-orb-label" aria-live="polite">
        {orbState === 'listening' && 'Escuchando...'}
        {orbState === 'speaking' && 'Hablando...'}
        {orbState === 'idle' && (localSttAvailable === false ? 'STT local no disponible' : 'Toca para hablar')}
        {orbState === 'disabled' && 'Voz apagada'}
      </span>
    </div>
  );
}
