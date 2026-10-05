import { useEffect, useState } from 'react';
import {
  HardwareTelemetryService,
  type HardwareTelemetryLogEntry,
} from '../services/HardwareTelemetryService';
import { sensorHub, type LocationReading } from '../core/SensorHub';
import { BlindUnifiedUI } from './BlindUnifiedUI';
import { useApp } from '../context/AppContext';
import { sentraGuardianHub } from '../core/SentraGuardianHub';

export default function BlindModeRoute() {
  const [engineStatus, setEngineStatus] = useState<'standby' | 'active'>('standby');
  const [telemetryLog, setTelemetryLog] = useState<HardwareTelemetryLogEntry[]>([]);
  const [guardianAlert, setGuardianAlert] = useState(false);
  const { humanVeto, evidenceCount } = useApp();

  useEffect(() => {
    let disposed = false;
    let stopSensors: (() => void) | undefined;
    const stopReadings = sensorHub.onReading((reading) => {
      if (disposed || reading.category !== 'location') return;
      const location = reading.value as LocationReading;
      setTelemetryLog((previous) => [
        ...previous.slice(-19),
        {
          timestamp: new Date(reading.timestamp).toISOString(),
          data: {
            type: 'GPS',
            lat: location.latitude,
            lon: location.longitude,
            accuracy: location.accuracy,
            source: 'REAL',
          },
        },
      ]);
    });

    HardwareTelemetryService.initRealSensors((data) => {
      if (disposed) return;
      setTelemetryLog((previous) => [
        ...previous.slice(-19),
        { timestamp: new Date().toISOString(), data },
      ]);
    }, { gps: false }).then((stop) => {
      if (disposed) {
        stop();
        return;
      }
      stopSensors = stop;
      setEngineStatus('active');
    }).catch((error: unknown) => {
      if (disposed) return;
      console.warn('[SentraCore] Modo seguro: sensores simulados o no disponibles en este entorno.', error);
      setEngineStatus('standby');
    });

    const unsubGuardian = sentraGuardianHub.subscribe((state) => {
      setGuardianAlert(state.sentinelAlertActive);
    });

    return () => {
      disposed = true;
      stopSensors?.();
      stopReadings();
      unsubGuardian();
    };
  }, []);

  const statusDotClass = guardianAlert
    ? 'blind-status-dot--alert'
    : engineStatus === 'active'
      ? 'blind-status-dot--active'
      : 'blind-status-dot--standby';

  const statusLabel = guardianAlert
    ? 'ALERTA DE SEGURIDAD'
    : engineStatus === 'active'
      ? 'SENTRA VISIÓN ACTIVO'
      : 'SENTRA VISIÓN EN ESPERA';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="blind-status-live" role="banner" aria-live="polite">
        <span className={`blind-status-dot ${statusDotClass}`} aria-hidden="true" />
        <span className="blind-status-text">{statusLabel}</span>
        {humanVeto && <span className="blind-status-badge blind-status-badge--veto">VETO ON</span>}
        <span className="blind-status-badge blind-status-badge--evolis">EVOLIS: {evidenceCount}</span>
      </div>
      <BlindUnifiedUI telemetry={telemetryLog} />
    </div>
  );
}
