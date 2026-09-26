import { useEffect, useState } from 'react';
import {
  HardwareTelemetryService,
  type HardwareTelemetryLogEntry,
} from '../services/HardwareTelemetryService';
import { sensorHub, type LocationReading } from '../core/SensorHub';
import { BlindUnifiedUI } from './BlindUnifiedUI';

export default function BlindModeRoute() {
  const [engineStatus, setEngineStatus] = useState<'standby' | 'active'>('standby');
  const [telemetryLog, setTelemetryLog] = useState<HardwareTelemetryLogEntry[]>([]);

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

    return () => {
      disposed = true;
      stopSensors?.();
      stopReadings();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="flex w-full flex-col justify-between gap-2 border-b border-[#00ffcc]/20 bg-[#12121a] px-4 pb-4 pt-16 sm:flex-row sm:items-center sm:py-4 sm:pr-56">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${engineStatus === 'active' ? 'animate-pulse bg-[#00ffcc]' : 'bg-amber-400'}`} aria-hidden="true" />
          <span className="font-mono text-sm tracking-wider text-[#00ffcc]">SENTRA VISIÓN // EDGE</span>
        </div>
        <span className="font-mono text-xs text-gray-400" role="status">
          EDGE-HOST {engineStatus === 'active' ? 'ACTIVE' : 'STANDBY'}
        </span>
      </header>
      <BlindUnifiedUI telemetry={telemetryLog} />
    </div>
  );
}