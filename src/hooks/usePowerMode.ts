import { useCallback, useEffect, useState } from 'react';
import { PowerManager, PowerMode, PowerProfile } from '../core/PowerManager';

export function usePowerMode(): {
  mode: PowerMode;
  profile: PowerProfile;
  batteryLevel: number | null;
  isCharging: boolean;
  setMode: (mode: PowerMode) => void;
  allProfiles: PowerProfile[];
} {
  const [powerManager] = useState(() => new PowerManager());
  const [mode, setModeState] = useState<PowerMode>(powerManager.getMode());
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    powerManager.initBatteryMonitor().then(() => {
      setBatteryLevel(powerManager.getBatteryLevelSync());
      setIsCharging(powerManager.isChargingStatus());
    });
    const interval = window.setInterval(() => {
      setBatteryLevel(powerManager.getBatteryLevelSync());
      setIsCharging(powerManager.isChargingStatus());
    }, 30000);
    return () => clearInterval(interval);
  }, [powerManager]);

  const setMode = useCallback((newMode: PowerMode) => {
    powerManager.setMode(newMode);
    setModeState(newMode);
  }, [powerManager]);

  return {
    mode, profile: powerManager.getProfile(),
    batteryLevel, isCharging, setMode,
    allProfiles: powerManager.getAllProfiles(),
  };
}
