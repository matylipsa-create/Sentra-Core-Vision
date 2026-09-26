import { useEffect, useState } from 'react';
import { deviceSensorManager, type AvailableSensor } from '../core/DeviceSensorManager';
import { voiceManager } from '../services/VoiceManager';
import { deviceManager } from '../core/DeviceManager';

const labels: Record<string, string> = { gps: 'GPS', accelerometer: 'Acelerómetro', gyroscope: 'Giroscopio', magnetometer: 'Magnetómetro', 'ambient-light': 'Luz ambiental', proximity: 'Proximidad', camera: 'Cámara', microphone: 'Micrófono' };

export function AccessibleSensorUI() {
  const [sensors, setSensors] = useState<AvailableSensor[]>([]);
  useEffect(() => deviceSensorManager.onSensorChange(setSensors), []);
  const refresh = () => { const next = deviceSensorManager.detectAvailableSensors(); setSensors(next); voiceManager.speak(`${next.filter((sensor) => sensor.available).length} sensores disponibles`, 3); };
  const toggle = (sensor: AvailableSensor) => { deviceSensorManager[sensor.active ? 'deactivateSensor' : 'activateSensor'](sensor.id); deviceManager.vibrate(70); voiceManager.speak(`${labels[sensor.kind]} ${sensor.active ? 'desactivado' : 'activado'}`, 3); };

  return <section className="accessible-sensor-ui" aria-labelledby="sensor-control-title" aria-describedby="sensor-control-help">
    <div className="sensor-ui-header"><div><p className="sensor-ui-eyebrow">Hardware real</p><h2 id="sensor-control-title">Sensores del dispositivo</h2></div><button className="sensor-ui-refresh" onClick={refresh} aria-label="Actualizar sensores">Actualizar</button></div>
    <p className="sensor-ui-description" id="sensor-control-help">Controla GPS, movimiento, cámara, micrófono y sensores disponibles en este teléfono o PC.</p>
    <div className="accessible-sensor-grid" role="list">
      {sensors.map((sensor) => <article className={`accessible-sensor-card ${sensor.active ? 'is-active' : ''}`} key={sensor.id} role="listitem"><div><span className="sensor-status-dot" aria-hidden="true" /><strong>{labels[sensor.kind]}</strong><span className="sensor-device">{sensor.device === 'pc' ? 'PC' : sensor.device === 'phone' ? 'Teléfono' : 'Compartido'}</span></div><p>{sensor.available ? (sensor.active ? 'Activo' : 'Disponible') : 'No disponible'}</p><button disabled={!sensor.available} onClick={() => toggle(sensor)} aria-label={`${sensor.active ? 'Desactivar' : 'Activar'} ${labels[sensor.kind]}`}>{sensor.active ? 'Desactivar' : 'Activar'}</button></article>)}
    </div>
  </section>;
}