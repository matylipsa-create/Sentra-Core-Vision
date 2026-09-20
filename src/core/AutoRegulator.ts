import { HardwarePlatform, HardwareProfile, HardwareProfiler, hardwareProfiler } from './HardwareProfiler';
import { sensorPriorityManager } from './SensorPriorityManager';

export interface OptimalConfig {
  detectionModel: 'lite' | 'full';
  computeBackend: 'webgl' | 'webgpu' | 'cpu';
  enabledSensors: string[];
  transmissionInterval: number;
  ttsRate: number;
  vibrationEnabled: boolean;
  ocrEnabled: boolean;
  vlmEnabled: boolean;
  audio3DEnabled: boolean;
}

type HardwareChangeCallback = (profile: HardwareProfile) => void;
type EnergyChangeCallback = (profile: ReturnType<HardwareProfiler['getEnergyProfile']>) => void;
type ConnectivityChangeCallback = (profile: ReturnType<HardwareProfiler['getConnectivityProfile']>) => void;

const TRANSMISSION_INTERVALS: Partial<Record<HardwarePlatform, number>> = {
  mobile: 15 * 60 * 1000,
  desktop: 60 * 1000,
  totem: 5 * 60 * 1000,
};

export class AutoRegulator {
  private hardwareCallbacks = new Set<HardwareChangeCallback>();
  private energyCallbacks = new Set<EnergyChangeCallback>();
  private connectivityCallbacks = new Set<ConnectivityChangeCallback>();
  private currentConfig: OptimalConfig | null = null;

  getOptimalConfig(): OptimalConfig {
    const profile = hardwareProfiler.getHardwareProfile();
    const energy = hardwareProfiler.getEnergyProfile();
    const connectivity = hardwareProfiler.getConnectivityProfile();
    const capacity = profile.computeCapacity;
    const transmissionInterval = TRANSMISSION_INTERVALS[profile.platform] ?? 15 * 60 * 1000;
    const enabledSensors = sensorPriorityManager.getSensorsForProfile(profile);
    const energyLimitedSensors = energy.level < 20
      ? sensorPriorityManager.filterByEnergy(enabledSensors, energy.level)
      : enabledSensors;

    const config: OptimalConfig = {
      detectionModel: capacity === 'low' ? 'lite' : 'full',
      computeBackend: capacity === 'high' ? 'webgpu' : capacity === 'medium' ? 'webgl' : 'cpu',
      enabledSensors: energyLimitedSensors,
      transmissionInterval: connectivity.online ? transmissionInterval : Math.max(transmissionInterval, 15 * 60 * 1000),
      ttsRate: profile.platform === 'desktop' ? 2.0 : 1.5,
      vibrationEnabled: profile.hasVibration,
      ocrEnabled: capacity !== 'low' && connectivity.online,
      vlmEnabled: capacity === 'high' && connectivity.online,
      audio3DEnabled: capacity !== 'low' && profile.hasMicrophone,
    };
    this.currentConfig = config;
    return config;
  }

  applyConfig(config: OptimalConfig): void {
    this.currentConfig = { ...config, enabledSensors: [...config.enabledSensors] };
  }

  getAppliedConfig(): OptimalConfig | null {
    return this.currentConfig
      ? { ...this.currentConfig, enabledSensors: [...this.currentConfig.enabledSensors] }
      : null;
  }

  onHardwareChange(callback: HardwareChangeCallback): () => void {
    this.hardwareCallbacks.add(callback);
    return () => this.hardwareCallbacks.delete(callback);
  }

  onEnergyChange(callback: EnergyChangeCallback): () => void {
    this.energyCallbacks.add(callback);
    return () => this.energyCallbacks.delete(callback);
  }

  onConnectivityChange(callback: ConnectivityChangeCallback): () => void {
    this.connectivityCallbacks.add(callback);
    return () => this.connectivityCallbacks.delete(callback);
  }

  notifyChanges(): void {
    const hardware = hardwareProfiler.getHardwareProfile();
    const energy = hardwareProfiler.getEnergyProfile();
    const connectivity = hardwareProfiler.getConnectivityProfile();
    this.hardwareCallbacks.forEach((callback) => callback(hardware));
    this.energyCallbacks.forEach((callback) => callback(energy));
    this.connectivityCallbacks.forEach((callback) => callback(connectivity));
  }
}

export const autoRegulator = new AutoRegulator();