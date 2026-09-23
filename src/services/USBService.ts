export interface USBDeviceInfo {
  vendorId: number;
  productId: number;
  manufacturerName: string | null;
  productName: string | null;
  serialNumber: string | null;
  connected: boolean;
  authenticated: boolean;
  firstSeen: number;
  lastSeen: number;
}

export interface USBAuthChallenge {
  deviceId: string;
  challenge: string;
  timestamp: number;
  resolved: Trit;
}

export type PortStatus = 'blocked' | 'allowed' | 'infected';

type Trit = 1 | 0 | -1;

const SUSPICIOUS_VID_RANGES: { min: number; max: number; reason: string }[] = [
  { min: 0x0000, max: 0x0000, reason: 'VID invalido o nulo' },
];


export class USBService {
  private devices: Map<string, USBDeviceInfo> = new Map();
  private blockedDevices: Set<string> = new Set();
  private infectedDevices: Set<string> = new Set();
  private listeners: Set<(devices: USBDeviceInfo[]) => void> = new Set();
  private monitoring = false;
  private usb: USBDeviceManager | null = null;
  private handleConnect: ((event: USBConnectionEvent) => void) | null = null;
  private handleDisconnect: ((event: USBConnectionEvent) => void) | null = null;

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
  }

  private deviceKey(d: { vendorId: number; productId: number; serialNumber?: string | null }): string {
    return `${d.vendorId}:${d.productId}:${d.serialNumber ?? 'unknown'}`;
  }

  async requestDevice(): Promise<USBDeviceInfo | null> {
    if (!this.isSupported()) return null;
    try {
      const nav = navigator as Navigator & {
        usb: {
          requestDevice: (opts: { filters: Record<string, unknown>[] }) => Promise<USBDeviceInternal>;
        };
      };
      const device = await nav.usb.requestDevice({ filters: [] });
      return this.registerDevice(device);
    } catch {
      return null;
    }
  }

  private registerDevice(raw: USBDeviceInternal): USBDeviceInfo {
    const key = this.deviceKey(raw);
    if (this.blockedDevices.has(key)) {
      return this.devices.get(key) ?? this.createInfo(raw, false);
    }
    const existing = this.devices.get(key);
    const info: USBDeviceInfo = {
      vendorId: raw.vendorId,
      productId: raw.productId,
      manufacturerName: raw.manufacturerName ?? existing?.manufacturerName ?? null,
      productName: raw.productName ?? existing?.productName ?? null,
      serialNumber: raw.serialNumber ?? existing?.serialNumber ?? null,
      connected: true,
      authenticated: existing?.authenticated ?? false,
      firstSeen: existing?.firstSeen ?? Date.now(),
      lastSeen: Date.now(),
    };
    this.devices.set(key, info);
    this.notify();
    return info;
  }

  private createInfo(raw: USBDeviceInternal, connected: boolean): USBDeviceInfo {
    return {
      vendorId: raw.vendorId,
      productId: raw.productId,
      manufacturerName: raw.manufacturerName ?? null,
      productName: raw.productName ?? null,
      serialNumber: raw.serialNumber ?? null,
      connected,
      authenticated: false,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    };
  }

  startMonitoring(): void {
    if (this.monitoring || !this.isSupported()) return;
    this.monitoring = true;
    const nav = navigator as Navigator & { usb: USBDeviceManager };
    this.usb = nav.usb;
    this.handleConnect = (e) => {
      this.registerDevice(e.device);
    };
    this.handleDisconnect = (e) => {
      const key = this.deviceKey(e.device);
      const info = this.devices.get(key);
      if (info) {
        info.connected = false;
        info.lastSeen = Date.now();
        this.devices.set(key, info);
        this.notify();
      }
    };
    this.usb.addEventListener('connect', this.handleConnect);
    this.usb.addEventListener('disconnect', this.handleDisconnect);
  }

  stopMonitoring(): void {
    if (!this.usb) return;
    if (this.handleConnect) this.usb.removeEventListener('connect', this.handleConnect);
    if (this.handleDisconnect) this.usb.removeEventListener('disconnect', this.handleDisconnect);
    this.handleConnect = null;
    this.handleDisconnect = null;
    this.usb = null;
    this.monitoring = false;
  }

  authenticateDevice(key: string): boolean {
    const info = this.devices.get(key);
    if (!info) return false;
    if (this.blockedDevices.has(key)) return false;
    const suspicious = SUSPICIOUS_VID_RANGES.find(
      (r) => info.vendorId >= r.min && info.vendorId <= r.max
    );
    if (suspicious) {
      this.blockDevice(key, suspicious.reason);
      return false;
    }
    info.authenticated = true;
    info.lastSeen = Date.now();
    this.devices.set(key, info);
    this.notify();
    return true;
  }

  blockDevice(key: string, _reason?: string): void {
    this.blockedDevices.add(key);
    const info = this.devices.get(key);
    if (info) {
      info.authenticated = false;
      info.connected = false;
      this.devices.set(key, info);
    }
    this.notify();
  }

  unblockDevice(key: string): void {
    this.blockedDevices.delete(key);
    this.infectedDevices.delete(key);
    const info = this.devices.get(key);
    if (info) {
      info.authenticated = false;
      this.devices.set(key, info);
    }
    this.notify();
  }

  blockPort(portId: string, reason?: string): void {
    this.blockDevice(portId, reason);
  }

  unblockPort(portId: string): void {
    this.unblockDevice(portId);
  }

  markInfected(portId: string): void {
    this.infectedDevices.add(portId);
    this.blockedDevices.add(portId);
    const info = this.devices.get(portId);
    if (info) {
      info.authenticated = false;
      info.connected = false;
      this.devices.set(portId, info);
    }
    this.notify();
  }

  vaccinatePort(portId: string): void {
    this.infectedDevices.delete(portId);
    this.blockedDevices.delete(portId);
    const info = this.devices.get(portId);
    if (info) {
      info.authenticated = true;
      this.devices.set(portId, info);
    }
    this.notify();
  }

  isPortInfected(portId: string): boolean {
    return this.infectedDevices.has(portId);
  }

  getPortStatus(portId: string): PortStatus {
    if (this.infectedDevices.has(portId)) return 'infected';
    if (this.blockedDevices.has(portId)) return 'blocked';
    return 'allowed';
  }

  isBlocked(key: string): boolean {
    return this.blockedDevices.has(key);
  }

  getDevices(): USBDeviceInfo[] {
    return Array.from(this.devices.values());
  }

  getBlockedCount(): number {
    return this.blockedDevices.size;
  }

  getAuthenticatedCount(): number {
    return Array.from(this.devices.values()).filter((d) => d.authenticated).length;
  }

  evaluateTrust(): Trit {
    if (this.devices.size === 0) return 0;
    if (this.blockedDevices.size > 0) return -1;
    const allAuth = Array.from(this.devices.values()).every((d) => d.authenticated || !d.connected);
    if (allAuth) return 1;
    return 0;
  }

  subscribe(cb: (devices: USBDeviceInfo[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.getDevices());
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    for (const cb of this.listeners) cb(this.getDevices());
  }

  isMonitoring(): boolean {
    return this.monitoring;
  }
}

interface USBDeviceInternal {
  vendorId: number;
  productId: number;
  manufacturerName?: string | null;
  productName?: string | null;
  serialNumber?: string | null;
  connected?: boolean;
}

interface USBConnectionEvent {
  device: USBDeviceInternal;
}

interface USBDeviceManager {
  requestDevice(options: { filters: Record<string, unknown>[] }): Promise<USBDeviceInternal>;
  addEventListener(type: 'connect' | 'disconnect', listener: (event: USBConnectionEvent) => void): void;
  removeEventListener(type: 'connect' | 'disconnect', listener: (event: USBConnectionEvent) => void): void;
}

export const usbService = new USBService();
