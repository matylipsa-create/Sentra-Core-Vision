export type SensorKind = 'gps' | 'accelerometer' | 'gyroscope' | 'magnetometer' | 'ambient-light' | 'proximity' | 'camera' | 'microphone';
export type SensorDevice = 'pc' | 'phone' | 'shared';

export interface AvailableSensor {
  id: string;
  kind: SensorKind;
  device: SensorDevice;
  available: boolean;
  active: boolean;
}

type SensorChangeListener = (sensors: AvailableSensor[]) => void;

function hasNavigator(): boolean {
  return typeof navigator !== 'undefined';
}

export class DeviceSensorManager {
  private sensors: AvailableSensor[] = [];
  private listeners = new Set<SensorChangeListener>();

  async requestAllPermissions(): Promise<boolean> {
    if (!hasNavigator()) return false;

    const permissionResults = await Promise.allSettled([
      this.requestGeolocation(),
      this.requestMotionPermission(),
    ]);
    this.detectAvailableSensors();
    return permissionResults.some((result) => result.status === 'fulfilled' && result.value);
  }

  detectAvailableSensors(): AvailableSensor[] {
    const nav = hasNavigator() ? navigator : null;
    const ua = nav?.userAgent ?? '';
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    const device: SensorDevice = isMobile ? 'phone' : 'pc';

    this.sensors = [
      { id: 'gps', kind: 'gps', device, available: !!nav && 'geolocation' in nav, active: false },
      { id: 'accelerometer', kind: 'accelerometer', device, available: typeof window !== 'undefined' && 'Accelerometer' in window, active: false },
      { id: 'gyroscope', kind: 'gyroscope', device, available: typeof window !== 'undefined' && 'Gyroscope' in window, active: false },
      { id: 'magnetometer', kind: 'magnetometer', device, available: typeof window !== 'undefined' && 'Magnetometer' in window, active: false },
      { id: 'ambient-light', kind: 'ambient-light', device, available: typeof window !== 'undefined' && 'AmbientLightSensor' in window, active: false },
      { id: 'proximity', kind: 'proximity', device, available: typeof window !== 'undefined' && 'ProximitySensor' in window, active: false },
      { id: 'camera', kind: 'camera', device: 'shared', available: !!nav && !!nav.mediaDevices?.getUserMedia, active: false },
      { id: 'microphone', kind: 'microphone', device: 'shared', available: !!nav && !!nav.mediaDevices?.getUserMedia, active: false },
    ];

    this.notify();
    return this.sensors;
  }

  activateSensor(id: string): void {
    const sensor = this.sensors.find((s) => s.id === id);
    if (sensor) sensor.active = true;
    this.notify();
  }

  deactivateSensor(id: string): void {
    const sensor = this.sensors.find((s) => s.id === id);
    if (sensor) sensor.active = false;
    this.notify();
  }

  onSensorChange(listener: SensorChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.sensors);
    return () => this.listeners.delete(listener);
  }

  getState(): ReadonlyArray<AvailableSensor> {
    return this.sensors.map((sensor) => ({ ...sensor }));
  }

  private async requestGeolocation(): Promise<boolean> {
    if (!('geolocation' in navigator)) return false;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 30_000 },
      );
    });
  }

  private async requestMotionPermission(): Promise<boolean> {
    if (typeof DeviceMotionEvent === 'undefined') return false;
    const motionEvent = DeviceMotionEvent as typeof DeviceMotionEvent & {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (!motionEvent.requestPermission) {
      return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
    }
    return (await motionEvent.requestPermission()) === 'granted';
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.sensors);
  }
}

export const deviceSensorManager = new DeviceSensorManager();
