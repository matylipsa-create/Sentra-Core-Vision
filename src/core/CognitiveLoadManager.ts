import { bioSoftware } from './BioSoftwareInterface';
import { voiceManager } from '../services/VoiceManager';

export type CognitiveMode = 'STABILIZE' | 'OBSERVE' | 'ASSIST';

export interface CognitiveLoadState {
  load: number;
  mode: CognitiveMode;
  voiceInstructionsQueue: number;
  stabilized: boolean;
  lastUpdate: number;
}

type CognitiveListener = (state: CognitiveLoadState) => void;

const LOAD_THRESHOLD_STABILIZE = 0.75;
const LOAD_THRESHOLD_OBSERVE = 0.5;
const MAX_VOICE_INSTRUCTIONS = 3;
const STORE_KEY = 'cognitive_load_state';

class CognitiveLoadManager {
  private state: CognitiveLoadState = {
    load: 0.3,
    mode: 'ASSIST',
    voiceInstructionsQueue: 0,
    stabilized: false,
    lastUpdate: Date.now(),
  };
  private listeners = new Set<CognitiveListener>();
  private voiceBuffer: string[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const saved = await import('../services/StorageService').then((m) =>
        m.storageService.loadState<CognitiveLoadState>(STORE_KEY)
      );
      if (saved) this.state = { ...this.state, ...saved };
    } catch { /* storage unavailable */ }
  }

  getCognitiveLoad(): number {
    return this.state.load;
  }

  getState(): CognitiveLoadState {
    return { ...this.state };
  }

  setMode(mode: CognitiveMode): void {
    this.state.mode = mode;
    this.state.lastUpdate = Date.now();
    if (mode === 'STABILIZE') {
      this.state.stabilized = true;
      this.voiceBuffer = [];
      this.state.voiceInstructionsQueue = 0;
    } else {
      this.state.stabilized = false;
    }
    this.notify();
    this.persist();
  }

  shouldStabilize(): boolean {
    return this.state.load >= LOAD_THRESHOLD_STABILIZE;
  }

  updateLoadFromBio(): void {
    const bioState = bioSoftware.getState();
    const stress = bioState.stressLevel;
    const focus = bioState.focusLevel;
    const coherence = bioState.cardiacCoherence;
    const computed = stress * 0.5 + (1 - focus) * 0.3 + (1 - coherence) * 0.2;
    this.state.load = Math.max(0, Math.min(1, computed));
    this.state.lastUpdate = Date.now();

    if (this.state.load >= LOAD_THRESHOLD_STABILIZE && this.state.mode !== 'STABILIZE') {
      this.setMode('STABILIZE');
      voiceManager.speak('Carga cognitiva alta. Estabilizando interfaz.', 2);
    } else if (this.state.load >= LOAD_THRESHOLD_OBSERVE && this.state.load < LOAD_THRESHOLD_STABILIZE && this.state.mode === 'ASSIST') {
      this.setMode('OBSERVE');
    } else if (this.state.load < LOAD_THRESHOLD_OBSERVE && this.state.mode !== 'ASSIST') {
      this.setMode('ASSIST');
    }

    this.notify();
    this.persist();
  }

  filterVoiceInstructions(instructions: string[]): string[] {
    if (this.state.mode === 'STABILIZE') {
      return instructions.slice(0, 1);
    }
    if (this.state.mode === 'OBSERVE') {
      return instructions.slice(0, 2);
    }
    return instructions.slice(0, MAX_VOICE_INSTRUCTIONS);
  }

  enqueueVoiceInstruction(instruction: string): void {
    if (this.state.mode === 'STABILIZE') {
      this.voiceBuffer.push(instruction);
      this.state.voiceInstructionsQueue = this.voiceBuffer.length;
      this.notify();
      return;
    }
    this.voiceBuffer.push(instruction);
    this.flushVoiceBuffer();
  }

  private flushVoiceBuffer(): void {
    const filtered = this.filterVoiceInstructions(this.voiceBuffer);
    this.voiceBuffer = this.voiceBuffer.slice(filtered.length);
    this.state.voiceInstructionsQueue = this.voiceBuffer.length;
    for (const text of filtered) {
      voiceManager.speak(text, 3);
    }
    this.notify();
  }

  resetLoad(): void {
    this.state.load = 0.3;
    this.state.mode = 'ASSIST';
    this.state.stabilized = false;
    this.state.voiceInstructionsQueue = 0;
    this.state.lastUpdate = Date.now();
    this.voiceBuffer = [];
    this.notify();
    this.persist();
  }

  subscribe(listener: CognitiveListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = this.getState();
    for (const listener of this.listeners) listener(snapshot);
  }

  private async persist(): Promise<void> {
    try {
      const { storageService } = await import('../services/StorageService');
      await storageService.saveState(STORE_KEY, this.state);
    } catch { /* storage unavailable */ }
  }

  private _priorityEvents: Array<{ level: string; timestamp: number }> = [];

  public recordPriorityEvent(level: 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE'): void {
    const now = Date.now();
    this._priorityEvents.push({ level, timestamp: now });
    this._priorityEvents = this._priorityEvents.filter((e) => now - e.timestamp < 60000);
  }

  public getLoadLevel(): 'low' | 'medium' | 'high' {
    const now = Date.now();
    const recent = this._priorityEvents.filter((e) => now - e.timestamp < 60000);
    const score =
      recent.filter((e) => e.level === 'CRITICAL').length * 3 +
      recent.filter((e) => e.level === 'NAVIGATION').length;
    const bioLoad = this.state.load;
    if (score >= 20 || bioLoad >= 0.8) return 'high';
    if (score >= 8 || bioLoad >= 0.55) return 'medium';
    return 'low';
  }

  public shouldThrottle(): boolean {
    return this.getLoadLevel() === 'high';
  }

  public getFilteredEvents<T extends { level?: string; priority?: string; type?: string }>(events: T[]): T[] {
    if (!this.shouldThrottle()) return events;
    return events.filter((event) => {
      const level = String(event.level ?? event.priority ?? event.type ?? 'INFO').toUpperCase();
      return level === 'CRITICAL' || level === 'NAVIGATION';
    });
  }

  public getPriorityBreakdown(): { critical: number; navigation: number; descriptive: number } {
    const now = Date.now();
    const recent = this._priorityEvents.filter((e) => now - e.timestamp < 60000);
    return {
      critical: recent.filter((e) => e.level === 'CRITICAL').length,
      navigation: recent.filter((e) => e.level === 'NAVIGATION').length,
      descriptive: recent.filter((e) => e.level === 'DESCRIPTIVE').length,
    };
  }
}

export const cognitiveLoadManager = new CognitiveLoadManager();
