import { useCallback, useEffect, useRef, useState } from "react";
import { SensorDashboard } from "./SensorDashboard";
import { AccessibleSensorUI } from "./AccessibleSensorUI";
import { sensorHub } from "../core/SensorHub";
import { perceptionEngine } from "../core/PerceptionEngine";
import { sensorModule } from "../modules/SensorModule";
import { createSimulatedSensors } from "../sensors/SimulatedSensors";
import { createNativeSensors } from "../services/NativeSensorService";
import { createGPSSensor } from "../services/GPSSensorService";
import type { HardwareTelemetryLogEntry } from "../services/HardwareTelemetryService";
import { sentraGuardianHub } from "../core/SentraGuardianHub";
import { BlindTactileQuadrants } from "./BlindTactileQuadrants";
import { BlindVisionPanel, type BlindVisionPanelActions } from "./BlindVisionPanel";
import { voiceManager } from "../services/VoiceManager";
import { VoiceOrbButton } from "./VoiceOrbButton";
import { useApp } from "../context/AppContext";

interface BlindUnifiedUIProps {
  telemetry: HardwareTelemetryLogEntry[];
}

function describeTelemetry(entry: HardwareTelemetryLogEntry): string {
  const { data } = entry;
  switch (data.type) {
    case "GPS":
      return data.source === "ERROR"
        ? `GPS no disponible: ${data.error}`
        : `GPS ${data.lat.toFixed(5)}, ${data.lon.toFixed(5)} (±${Math.round(data.accuracy)} m)`;
    case "BATTERY":
      return `Batería ${data.level}% · ${data.charging ? "cargando" : "sin carga"}`;
    case "ORIENTATION":
      return `Orientación α ${data.alpha?.toFixed(1) ?? "--"}° · β ${data.beta?.toFixed(1) ?? "--"}° · γ ${data.gamma?.toFixed(1) ?? "--"}°`;
  }
}

export function BlindUnifiedUI({ telemetry }: BlindUnifiedUIProps) {
  const visionActionsRef = useRef<BlindVisionPanelActions>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { processCommand, isPassiveListening, togglePassiveListening } = useApp();

  useEffect(() => {
    // Wiring multimodal: conecta hub → governor, router, accessibility, voice
    sentraGuardianHub.initMultimodal();

    // Sensores reales nativos (Accelerometer, Gyroscope, AmbientLight, GPS)
    for (const sensor of createNativeSensors()) {
      try { sensorHub.register(sensor); } catch { /* id collision */ }
    }
    const gps = createGPSSensor();
    if (gps) {
      try { sensorHub.register(gps); } catch { /* id collision */ }
    }

    // Sensores simulados como fallback — siempre disponibles
    for (const sensor of createSimulatedSensors()) {
      try { sensorHub.register(sensor); } catch { /* id collision */ }
    }

    perceptionEngine.start();
    sensorModule.start();
    sensorHub.startAll();

    return () => {
      sensorHub.stopAll();
      perceptionEngine.stop();
      sensorModule.stop();
    };
  }, []);

  const handleVoiceCommand = useCallback((command: string): boolean => {
    const normalized = command.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const visionActions = visionActionsRef.current;

    if (/(activa|inicia|enciende).*(camara|vision)/.test(normalized)) {
      visionActions?.setCamera(true);
      return true;
    }
    if (/(desactiva|deten|apaga|para).*(camara|vision)/.test(normalized)) {
      visionActions?.setCamera(false);
      return true;
    }
    if (/(lee|leer|lectura).*(texto|cartel|letrero)/.test(normalized)) {
      visionActions?.readText();
      return true;
    }
    if (/(describe|descripcion|que ves|que hay delante|que hay enfrente)/.test(normalized)) {
      visionActions?.describeNow();
      return true;
    }
    if (/(silencio|calla|deja de hablar)/.test(normalized)) {
      sentraGuardianHub.silenceAll();
      if (isPassiveListening) togglePassiveListening();
      return true;
    }

    void processCommand(command, visionActions?.getPerception() ?? undefined);
    return true;
  }, [isPassiveListening, processCommand, togglePassiveListening]);

  const handleQuadrantAction = (action: string, _quadrant: string, gesture: 'tap' | 'longPress') => {
    switch (action) {
      case 'TOGGLE_EYES_MODE':
        visionActionsRef.current?.toggleCamera();
        break;
      case 'DESCRIBE_NOW':
        visionActionsRef.current?.describeNow();
        break;
      case 'SENTINEL_STATUS': {
        const state = sentraGuardianHub.getState();
        sentraGuardianHub.onSentinelEvent({
          severity: 'low',
          message: state.sentinelAlertActive
            ? 'Guardian en alerta. Perimetro comprometido.'
            : 'Perimetro seguro. Sin alertas.',
          source: 'quadrant',
        });
        break;
      }
      case 'PANIC_OR_PERIMETER':
        if (gesture === 'longPress') {
          sentraGuardianHub.silenceAll();
          try { navigator.vibrate?.([100, 60, 100]); } catch { /* optional haptics */ }
        } else {
          voiceManager.speak('Mantén pulsado este cuadrante para silenciar todas las alertas.', 3);
        }
        break;
    }
  };

  return (
    <main className="sentra-app-shell">
      <BlindVisionPanel ref={visionActionsRef} />
      <section className="blind-voice-entry" aria-label="Conversación por voz">
        <VoiceOrbButton onCommand={handleVoiceCommand} />
      </section>
      <details
        className="blind-advanced-tools"
        onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}
      >
        <summary>Más funciones y ajustes</summary>
        {advancedOpen && (
          <div className="blind-advanced-content">
            <div className="blind-vision-actions">
              <button type="button" className="blind-action-btn" onClick={() => visionActionsRef.current?.describeNow()}>
                Describir el entorno
              </button>
              <button type="button" className="blind-action-btn" onClick={() => visionActionsRef.current?.readText()}>
                Leer texto con OCR
              </button>
            </div>
            <p>Para historial, reversión y controles clásicos:</p>
            <a href="/vision">Abrir herramientas avanzadas</a>
            <section className="hardware-telemetry" aria-labelledby="hardware-telemetry-title">
              <header className="hardware-telemetry-header">
                <h2 id="hardware-telemetry-title">Telemetría de hardware</h2>
                <span>{telemetry.length}/20</span>
              </header>
              <ol className="hardware-telemetry-list" aria-label="Eventos recientes de sensores reales">
                {telemetry.length === 0 ? (
                  <li>Esperando lecturas de sensores...</li>
                ) : telemetry.map((entry) => (
                  <li key={`${entry.timestamp}-${entry.data.type}`}>
                    <time dateTime={entry.timestamp}>{new Date(entry.timestamp).toLocaleTimeString("es-ES")}</time>
                    <span>{describeTelemetry(entry)}</span>
                  </li>
                ))}
              </ol>
            </section>
            <AccessibleSensorUI />
            <SensorDashboard />
          </div>
        )}
      </details>
      <BlindTactileQuadrants onAction={handleQuadrantAction} />
    </main>
  );
}

export default BlindUnifiedUI;