export type HardwareTelemetryUpdate =
  | { type: 'GPS'; lat: number; lon: number; accuracy: number; source: 'REAL' }
  | { type: 'GPS'; error: string; source: 'ERROR' }
  | { type: 'BATTERY'; level: number; charging: boolean }
  | { type: 'ORIENTATION'; alpha: number | null; beta: number | null; gamma: number | null; source: 'REAL' };

export type HardwareTelemetryListener = (update: HardwareTelemetryUpdate) => void;

type BatteryState = EventTarget & {
  level: number;
  charging: boolean;
};

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryState>;
};

type PermissionedOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export class HardwareTelemetryService {
  static async initRealSensors(onUpdate: HardwareTelemetryListener): Promise<() => void> {
    let gpsWatchId: number | null = null;
    let battery: BatteryState | null = null;
    let disposed = false;

    const onBatteryChange = () => {
      if (!disposed && battery) {
        onUpdate({
          type: 'BATTERY',
          level: Math.round(battery.level * 100),
          charging: battery.charging,
        });
      }
    };
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (!disposed) {
        onUpdate({
          type: 'ORIENTATION',
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma,
          source: 'REAL',
        });
      }
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        gpsWatchId = navigator.geolocation.watchPosition(
          (position) => {
            if (!disposed) {
              onUpdate({
                type: 'GPS',
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                accuracy: position.coords.accuracy,
                source: 'REAL',
              });
            }
          },
          (error) => {
            if (!disposed) onUpdate({ type: 'GPS', error: error.message, source: 'ERROR' });
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 },
        );
      } catch (error) {
        onUpdate({
          type: 'GPS',
          error: error instanceof Error ? error.message : 'Geolocalización no disponible.',
          source: 'ERROR',
        });
      }
    } else {
      onUpdate({ type: 'GPS', error: 'Geolocalización no soportada.', source: 'ERROR' });
    }

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      const orientationConstructor = DeviceOrientationEvent as PermissionedOrientationEvent;
      let permitted = true;
      if (orientationConstructor.requestPermission) {
        try {
          permitted = (await orientationConstructor.requestPermission()) === 'granted';
        } catch (error) {
          permitted = false;
          console.warn('[HardwareTelemetry] No se concedió permiso de orientación:', error);
        }
      }
      if (permitted && !disposed) window.addEventListener('deviceorientation', onOrientation, true);
    }

    const browserNavigator = typeof navigator === 'undefined' ? null : navigator as NavigatorWithBattery;
    if (browserNavigator?.getBattery) {
      try {
        battery = await browserNavigator.getBattery();
        if (!disposed) {
          onBatteryChange();
          battery.addEventListener('levelchange', onBatteryChange);
          battery.addEventListener('chargingchange', onBatteryChange);
        }
      } catch (error) {
        console.warn('[HardwareTelemetry] No se pudo acceder al estado de batería:', error);
      }
    }

    return () => {
      disposed = true;
      if (gpsWatchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', onOrientation, true);
      }
      battery?.removeEventListener('levelchange', onBatteryChange);
      battery?.removeEventListener('chargingchange', onBatteryChange);
    };
  }
}
