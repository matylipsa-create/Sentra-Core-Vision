export interface DeviceCapabilities {
  platform: 'mobile' | 'desktop' | 'tablet';
  hasCamera: boolean;
  hasGPS: boolean;
  hasAccelerometer: boolean;
  hasGyroscope: boolean;
  hasVibration: boolean;
  hasBluetooth: boolean;
  cores: number | null;
  memory: number | null;
  hasServiceWorker: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  touchscreen: boolean;
}

export class DeviceManager {
  detect(): DeviceCapabilities {
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    const isTablet = /iPad|Tablet/i.test(ua);
    const platform: DeviceCapabilities['platform'] = isTablet
      ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;
    const cores = navigator.hardwareConcurrency ?? null;

    return {
      platform,
      hasCamera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasGPS: 'geolocation' in navigator,
      hasAccelerometer: 'DeviceMotionEvent' in window,
      hasGyroscope: 'DeviceOrientationEvent' in window,
      hasVibration: 'vibrate' in navigator,
      hasBluetooth: 'bluetooth' in navigator,
      cores,
      memory,
      hasServiceWorker: 'serviceWorker' in navigator,
      isOnline: navigator.onLine,
      isStandalone:
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true,
      touchscreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  }

  async requestCamera(): Promise<MediaStream | null> {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
    } catch {
      return null;
    }
  }

  async requestGPS(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  vibrate(pattern: number | number[]): void {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  private _hapticPatterns: Record<string, number[]> = {
    SENTINEL_ALERT: [400, 100, 400, 100, 800],
    WARNING: [200, 100, 200],
    NOTIFICATION: [100, 50, 100],
    CONFIRM: [200],
    QUADRANT_TAP: [50],
    VISION_VERY_CLOSE: [200, 50, 200, 50, 200],
    VISION_CLOSE: [150, 50, 150],
    VISION_FAR: [80],
  };

  public vibratePattern(name: string): void {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    const pattern = this._hapticPatterns[name];
    if (!pattern) {
      console.warn('[DeviceManager] Patrón desconocido:', name);
      return;
    }
    try {
      navigator.vibrate(pattern);
    } catch { /* vibrate not supported */ }
  }

  public registerHapticPattern(name: string, pattern: number[]): void {
    this._hapticPatterns[name] = pattern;
  }
}

export const deviceManager = new DeviceManager();
