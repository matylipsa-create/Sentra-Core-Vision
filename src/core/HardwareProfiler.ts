export type HardwarePlatform = 'mobile' | 'desktop' | 'tablet' | 'totem';
export type ComputeCapacity = 'low' | 'medium' | 'high';

export interface HardwareProfile {
  platform: HardwarePlatform;
  cores: number;
  memory: number;
  hasCamera: boolean;
  hasGPS: boolean;
  hasIMU: boolean;
  hasMicrophone: boolean;
  hasLoRa: boolean;
  hasWebGL: boolean;
  hasWebGPU: boolean;
  hasVibration: boolean;
  hasTTS: boolean;
  computeCapacity: ComputeCapacity;
}

type ExtendedNavigator = Navigator & {
  deviceMemory?: number;
  connection?: { effectiveType?: string; type?: string };
};

function getNavigator(): ExtendedNavigator | null {
  return typeof navigator === 'undefined' ? null : navigator as ExtendedNavigator;
}

function getWindow(): Window | null {
  return typeof window === 'undefined' ? null : window;
}

export class HardwareProfiler {
  detectPlatform(): HardwarePlatform {
    const currentNavigator = getNavigator();
    const userAgent = currentNavigator?.userAgent ?? '';
    if (/Totem|Sentra.*LoRa|LoRa.*Sentra/i.test(userAgent)) return 'totem';
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) return 'tablet';
    if (/Android|iPhone|iPod|Mobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  getAvailableSensors(): string[] {
    const currentNavigator = getNavigator();
    const currentWindow = getWindow();
    const sensors: string[] = [];
    if (currentNavigator?.mediaDevices?.getUserMedia) sensors.push('camera', 'microphone');
    if (currentNavigator && 'geolocation' in currentNavigator) sensors.push('gps');
    if (currentWindow && ('DeviceMotionEvent' in currentWindow || 'DeviceOrientationEvent' in currentWindow)) sensors.push('imu');
    if (this.detectPlatform() === 'totem') sensors.push('pir', 'temperature', 'humidity', 'lora');
    return [...new Set(sensors)];
  }

  getComputeCapacity(): ComputeCapacity {
    const currentNavigator = getNavigator();
    const cores = currentNavigator?.hardwareConcurrency ?? 2;
    const memory = currentNavigator?.deviceMemory ?? 2;
    if (cores >= 8 && memory >= 8) return 'high';
    if (cores >= 4 && memory >= 4) return 'medium';
    return 'low';
  }

  getEnergyProfile(): { source: string; level: number; charging: boolean } {
    const currentNavigator = getNavigator();
    const battery = (currentNavigator as Navigator & {
      getBattery?: () => Promise<{ level: number; charging: boolean }>;
    } | null)?.getBattery;
    return {
      source: this.detectPlatform() === 'totem' ? 'harvesting' : this.detectPlatform() === 'desktop' ? 'grid' : 'battery',
      level: battery ? 100 : 100,
      charging: false,
    };
  }

  getConnectivityProfile(): { online: boolean; type: string } {
    const currentNavigator = getNavigator();
    const connection = currentNavigator?.connection;
    return {
      online: currentNavigator?.onLine ?? false,
      type: connection?.type ?? connection?.effectiveType ?? 'unknown',
    };
  }

  getAccessibilityProfile(): { screenReader: boolean; vibration: boolean; tts: boolean } {
    const currentNavigator = getNavigator();
    const currentWindow = getWindow();
    return {
      screenReader: currentWindow?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
      vibration: 'vibrate' in (currentNavigator ?? {}),
      tts: 'speechSynthesis' in (currentWindow ?? {}),
    };
  }

  getHardwareProfile(): HardwareProfile {
    const currentNavigator = getNavigator();
    const currentWindow = getWindow();
    const platform = this.detectPlatform();
    const cores = currentNavigator?.hardwareConcurrency ?? 2;
    const memory = currentNavigator?.deviceMemory ?? 2;
    return {
      platform,
      cores,
      memory,
      hasCamera: !!currentNavigator?.mediaDevices?.getUserMedia,
      hasGPS: !!currentNavigator && 'geolocation' in currentNavigator,
      hasIMU: !!currentWindow && ('DeviceMotionEvent' in currentWindow || 'DeviceOrientationEvent' in currentWindow),
      hasMicrophone: !!currentNavigator?.mediaDevices?.getUserMedia,
      hasLoRa: platform === 'totem' && this.getAvailableSensors().includes('lora'),
      hasWebGL: typeof WebGLRenderingContext !== 'undefined',
      hasWebGPU: !!currentNavigator && 'gpu' in currentNavigator,
      hasVibration: 'vibrate' in (currentNavigator ?? {}),
      hasTTS: 'speechSynthesis' in (currentWindow ?? {}),
      computeCapacity: this.getComputeCapacity(),
    };
  }
}

export const hardwareProfiler = new HardwareProfiler();