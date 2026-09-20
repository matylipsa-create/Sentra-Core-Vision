const CRITICAL_SENSORS = ['PIR', 'camera', 'microphone'];
const STANDARD_SENSORS = [...CRITICAL_SENSORS, 'IMU', 'GPS', 'temp'];
const OPTIONAL_SENSORS = [...STANDARD_SENSORS, 'OCR', 'VLM', 'audio3D'];

export class SensorPriorityManager {
  getPriority(sensorId: string): number {
    const normalized = sensorId.toLowerCase();
    if (CRITICAL_SENSORS.some((sensor) => sensor.toLowerCase() === normalized)) return 1;
    if (STANDARD_SENSORS.some((sensor) => sensor.toLowerCase() === normalized)) return 3;
    if (OPTIONAL_SENSORS.some((sensor) => sensor.toLowerCase() === normalized)) return 5;
    return 5;
  }

  filterByEnergy(sensors: string[], energyBudget: number): string[] {
    const allowed = energyBudget < 20
      ? CRITICAL_SENSORS
      : energyBudget <= 80
        ? STANDARD_SENSORS
        : OPTIONAL_SENSORS;
    return sensors.filter((sensor) => allowed.some((candidate) => candidate.toLowerCase() === sensor.toLowerCase()));
  }

  getCriticalSensors(): string[] {
    return [...CRITICAL_SENSORS];
  }

  getStandardSensors(): string[] {
    return [...STANDARD_SENSORS];
  }

  getOptionalSensors(): string[] {
    return [...OPTIONAL_SENSORS];
  }
}

export const sensorPriorityManager = new SensorPriorityManager();