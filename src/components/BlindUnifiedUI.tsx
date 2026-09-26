import { useEffect } from "react";
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

  const handleQuadrantAction = (action: string) => {
    switch (action) {
      case 'TOGGLE_EYES_MODE':
      case 'DESCRIBE_NOW':
        sentraGuardianHub.requestDescription();
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
        sentraGuardianHub.silenceAll();
        break;
    }
  };

  return (
    <main className="sentra-app-shell">
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
      <BlindTactileQuadrants onAction={handleQuadrantAction} />
    </main>
  );
}

export default BlindUnifiedUI;