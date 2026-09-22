import { sha256 } from '../lib/crypto';

export type SyncTransport = 'syncthing' | 'bluetooth_mesh' | 'lora' | 'offline';

export interface SyncPeer {
  id: string;
  name: string;
  transport: SyncTransport;
  lastSeen: number;
  connected: boolean;
}

export interface SyncPacket {
  id: string;
  sourceId: string;
  targetId: string | null;
  module: string;
  payload: unknown;
  timestamp: number;
  signature: string;
}

export interface SyncStatus {
  transport: SyncTransport;
  peers: SyncPeer[];
  pendingPackets: number;
  syncedPackets: number;
  lastSync: number | null;
  bluetoothConnected: boolean;
}

const SENTRA_SERVICE_UUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const SENTRA_CHARACTERISTIC_UUID = 'a1b2c3d4-e5f6-4789-abcd-ef0123456789';

export class SyncManager {
  private peers: Map<string, SyncPeer> = new Map();
  private pending: SyncPacket[] = [];
  private synced: SyncPacket[] = [];
  private transport: SyncTransport = 'offline';
  private deviceId: string;
  private bluetoothDevice: BluetoothDevice | null = null;
  private bluetoothCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  constructor(deviceId: string) {
    this.deviceId = deviceId;
  }

  setTransport(transport: SyncTransport): void {
    if (transport !== this.transport) {
      this.disconnectBluetooth();
    }
    this.transport = transport;
  }

  getTransport(): SyncTransport {
    return this.transport;
  }

  registerPeer(peer: SyncPeer): void {
    this.peers.set(peer.id, peer);
  }

  removePeer(id: string): void {
    this.peers.delete(id);
  }

  getPeers(): SyncPeer[] {
    return Array.from(this.peers.values());
  }

  enqueue(packet: Omit<SyncPacket, 'id' | 'sourceId' | 'timestamp' | 'signature'>): SyncPacket {
    const full: SyncPacket = {
      ...packet,
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      sourceId: this.deviceId,
      timestamp: Date.now(),
      signature: 'pending',
    };
    this.pending.push(full);
    return full;
  }

  private async signPacket(packet: SyncPacket): Promise<string> {
    const data = `${packet.id}:${packet.sourceId}:${packet.timestamp}:${packet.module}:${JSON.stringify(packet.payload || {})}`;
    return sha256(data);
  }

  async connectBluetooth(): Promise<boolean> {
    if (!('bluetooth' in navigator)) return false;
    try {
      const device = await (navigator as Navigator & {
        bluetooth: {
          requestDevice: (opts: RequestDeviceOptions) => Promise<BluetoothDevice>;
        };
      }).bluetooth.requestDevice({
        filters: [{ services: [SENTRA_SERVICE_UUID] }],
        optionalServices: [SENTRA_SERVICE_UUID],
      });

      this.bluetoothDevice = device;
      device.addEventListener('gattserverdisconnected', () => {
        this.bluetoothCharacteristic = null;
        this.bluetoothDevice = null;
      });

      const server = await device.gatt?.connect();
      if (!server) return false;
      const service = await server.getPrimaryService(SENTRA_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(SENTRA_CHARACTERISTIC_UUID);
      this.bluetoothCharacteristic = characteristic;

      const peerId = device.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
      this.registerPeer({
        id: peerId,
        name: device.name ?? 'Dispositivo Bluetooth',
        transport: 'bluetooth_mesh',
        lastSeen: Date.now(),
        connected: true,
      });

      return true;
    } catch {
      return false;
    }
  }

  disconnectBluetooth(): void {
    if (this.bluetoothCharacteristic) {
      this.bluetoothCharacteristic = null;
    }
    if (this.bluetoothDevice?.gatt?.connected) {
      this.bluetoothDevice.gatt.disconnect();
    }
    this.bluetoothDevice = null;
    for (const [id, peer] of this.peers) {
      if (peer.transport === 'bluetooth_mesh') {
        this.peers.delete(id);
      }
    }
  }

  isBluetoothConnected(): boolean {
    return !!this.bluetoothDevice?.gatt?.connected;
  }

  async sync(): Promise<number> {
    if (this.transport === 'offline' || this.peers.size === 0) return 0;
    const toSync = [...this.pending];
    this.pending = [];

    if (this.transport === 'bluetooth_mesh' && this.bluetoothCharacteristic) {
      for (const packet of toSync) {
        packet.signature = await this.signPacket(packet);
        try {
          const encoder = new TextEncoder();
          const data = encoder.encode(JSON.stringify(packet));
          await this.bluetoothCharacteristic.writeValue(data);
          this.synced.push(packet);
        } catch {
          this.pending.push(packet);
        }
      }
    } else {
      for (const packet of toSync) {
        packet.signature = await this.signPacket(packet);
        this.synced.push(packet);
      }
    }

    return toSync.length;
  }

  getStatus(): SyncStatus {
    return {
      transport: this.transport,
      peers: this.getPeers(),
      pendingPackets: this.pending.length,
      syncedPackets: this.synced.length,
      lastSync: this.synced.length > 0
        ? this.synced[this.synced.length - 1].timestamp : null,
      bluetoothConnected: this.isBluetoothConnected(),
    };
  }

  getSyncedPackets(): SyncPacket[] {
    return [...this.synced];
  }

  clearSynced(): void {
    this.synced = [];
  }
}

export const syncManager = new SyncManager(
  crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
);
