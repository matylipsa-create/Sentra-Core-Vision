import { evolis } from './EVOLIS';
import { usbService, USBDeviceInfo } from '../services/USBService';
import { ternaryEthics, Trit, TernaryEvaluation, TRIT_POS, TRIT_NEG } from './TernaryMath';
import { moralNode } from './MoralNode';

export type GuardianState = 'dormant' | 'active' | 'alert' | 'quarantine';

export interface GuardianAlert {
  id: string;
  type: 'usb_unknown' | 'usb_blocked' | 'chain_tamper' | 'chain_corrupt' | 'auth_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  deviceKey?: string;
}

export interface GuardianStatus {
  state: GuardianState;
  alerts: GuardianAlert[];
  usbTrust: Trit;
  chainTrust: Trit;
  overallTrust: TernaryEvaluation | null;
  monitoringUsb: boolean;
  monitoringChain: boolean;
  lastChainCheck: number | null;
  totalAlerts: number;
}

type GuardianListener = (status: GuardianStatus) => void;

const CHAIN_CHECK_INTERVAL_MS = 15000;

export class BacterialGuardian {
  private state: GuardianState = 'dormant';
  private alerts: GuardianAlert[] = [];
  private listeners: Set<GuardianListener> = new Set();
  private chainCheckInterval: number | null = null;
  private chainIntervalMs = CHAIN_CHECK_INTERVAL_MS;
  private lastChainValid = true;
  private lastChainCheck: number | null = null;
  private monitoringUsb = false;
  private monitoringChain = false;

  activate(): void {
    if (this.state === 'quarantine') return;
    this.state = 'active';
    this.startUsbMonitoring();
    this.startChainMonitoring();
    this.notify();
  }

  deactivate(): void {
    this.stopUsbMonitoring();
    this.stopChainMonitoring();
    this.state = 'dormant';
    this.notify();
  }

  isQuarantine(): boolean {
    return this.state === 'quarantine';
  }

  private startUsbMonitoring(): void {
    if (this.monitoringUsb) return;
    this.monitoringUsb = true;
    usbService.startMonitoring();
    usbService.subscribe((devices) => this.onUsbChange(devices));
  }

  private stopUsbMonitoring(): void {
    this.monitoringUsb = false;
  }

  private startChainMonitoring(): void {
    if (this.monitoringChain) return;
    this.monitoringChain = true;
    this.chainCheckInterval = window.setInterval(() => this.checkChain(), this.chainIntervalMs);
  }

  private stopChainMonitoring(): void {
    if (this.chainCheckInterval !== null) {
      clearInterval(this.chainCheckInterval);
      this.chainCheckInterval = null;
    }
    this.monitoringChain = false;
  }

  private onUsbChange(devices: USBDeviceInfo[]): void {
    for (const dev of devices) {
      const key = `${dev.vendorId}:${dev.productId}:${dev.serialNumber ?? 'unknown'}`;
      if (!dev.connected) continue;
      if (usbService.isPortInfected(key)) {
        this.addAlert('usb_blocked', 'critical', `Puerto infectado: VID ${dev.vendorId} PID ${dev.productId}`, key);
        continue;
      }
      if (usbService.isBlocked(key)) {
        this.addAlert('usb_blocked', 'high', `Dispositivo USB bloqueado persiste: VID ${dev.vendorId}`, key);
        continue;
      }
      if (!dev.authenticated) {
        this.addAlert('usb_unknown', 'medium', `Dispositivo USB no autenticado: VID ${dev.vendorId} PID ${dev.productId}`, key);
      }
    }
    this.updateState();
    this.notify();
  }

  monitorUSB(portId: string, deviceSignature: string): boolean {
    const suspicious = deviceSignature === 'unknown' || deviceSignature === '';
    if (suspicious) {
      this.activateDefense(portId);
      return false;
    }
    return true;
  }

  activateDefense(portId: string): void {
    usbService.blockPort(portId, 'Defensa activada: firma sospechosa');
    this.addAlert('auth_failed', 'high', `Defensa activada en puerto ${portId}`, portId);
    this.deployBacteria(portId);
    this.updateState();
    this.notify();
  }

  deployBacteria(portId: string): void {
    usbService.markInfected(portId);
    this.addAlert('usb_blocked', 'critical', `Bacteria desplegada en puerto ${portId}`, portId);
    this.updateState();
    this.notify();
  }

  vaccinatePort(portId: string): void {
    usbService.vaccinatePort(portId);
    this.alerts = this.alerts.filter((a) => a.deviceKey !== portId);
    this.updateState();
    this.notify();
  }

  isPortInfected(portId: string): boolean {
    return usbService.isPortInfected(portId);
  }

  async checkChain(): Promise<boolean> {
    this.lastChainCheck = Date.now();
    try {
      const valid = await evolis.verify();
      if (!valid && this.lastChainValid) {
        this.addAlert('chain_tamper', 'critical', 'Alteracion detectada en la cadena de evidencia EVOLIS');
        this.enterQuarantine();
      } else if (!valid) {
        this.addAlert('chain_corrupt', 'critical', 'Cadena EVOLIS sigue corrupta tras verificacion');
      }
      this.lastChainValid = valid;
      this.updateState();
      this.notify();
      return valid;
    } catch {
      this.addAlert('chain_corrupt', 'high', 'Error al verificar cadena EVOLIS');
      this.lastChainValid = false;
      this.updateState();
      this.notify();
      return false;
    }
  }

  private enterQuarantine(): void {
    this.state = 'quarantine';
    this.stopUsbMonitoring();
    this.stopChainMonitoring();
  }

  private updateState(): void {
    if (this.state === 'quarantine') return;
    const hasCritical = this.alerts.some((a) => a.severity === 'critical');
    const hasHigh = this.alerts.some((a) => a.severity === 'high');
    if (hasCritical) {
      this.state = 'quarantine';
    } else if (hasHigh) {
      this.state = 'alert';
    } else {
      this.state = 'active';
    }
  }

  private addAlert(
    type: GuardianAlert['type'],
    severity: GuardianAlert['severity'],
    message: string,
    deviceKey?: string
  ): void {
    const recent = this.alerts.find(
      (a) => a.type === type && a.deviceKey === deviceKey && Date.now() - a.timestamp < 10000
    );
    if (recent) return;
    const alert: GuardianAlert = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      type,
      severity,
      message,
      timestamp: Date.now(),
      deviceKey,
    };
    this.alerts.push(alert);
    if (this.alerts.length > 50) this.alerts.shift();
  }

  resolveAlert(id: string): void {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.updateState();
    this.notify();
  }

  clearAlerts(): void {
    this.alerts = [];
    if (this.state === 'quarantine' || this.state === 'alert') {
      this.state = 'active';
    }
    this.notify();
  }

  dismissQuarantine(): void {
    this.lastChainValid = true;
    this.alerts = [];
    this.state = 'active';
    this.startUsbMonitoring();
    this.startChainMonitoring();
    this.notify();
  }

  getOverallTrust(): TernaryEvaluation {
    const chainValid = this.lastChainValid;
    const usbTrit = usbService.evaluateTrust();
    const evaluation = ternaryEthics.evaluate(
      true,
      moralNode.getVetoStatus(),
      chainValid,
      usbTrit !== TRIT_NEG
    );
    if (moralNode.getVetoStatus()) {
      return { ...evaluation, value: TRIT_NEG, label: 'negative', score: -1, confidence: 1 };
    }
    return evaluation;
  }

  getUsbTrust(): Trit {
    return usbService.evaluateTrust();
  }

  getChainTrust(): Trit {
    return this.lastChainValid ? TRIT_POS : TRIT_NEG;
  }

  getStatus(): GuardianStatus {
    const trust = this.getOverallTrust();
    return {
      state: this.state,
      alerts: [...this.alerts],
      usbTrust: this.getUsbTrust(),
      chainTrust: this.getChainTrust(),
      overallTrust: trust,
      monitoringUsb: this.monitoringUsb,
      monitoringChain: this.monitoringChain,
      lastChainCheck: this.lastChainCheck,
      totalAlerts: this.alerts.length,
    };
  }

  subscribe(cb: GuardianListener): () => void {
    this.listeners.add(cb);
    cb(this.getStatus());
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    const status = this.getStatus();
    for (const cb of this.listeners) cb(status);
  }

  private _contextGovernor: any = null;

  public setContextGovernor(governor: any): void {
    this._contextGovernor = governor;
  }

  public emitTernarySignal(signal: -1 | 0 | 1): void {
    if (!this._contextGovernor) return;
    if (signal === -1) {
      this._contextGovernor.setPriorityLevel('CRITICAL');
    } else if (signal === 1) {
      this._contextGovernor.setPriorityLevel('NAVIGATION');
    }
  }
}

export const bacterialGuardian = new BacterialGuardian();
