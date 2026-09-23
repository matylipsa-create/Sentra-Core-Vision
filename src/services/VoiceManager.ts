export interface VoiceCue {
  id: string;
  text: string;
  priority: number;
  timestamp: number;
}

export type PassiveListenCallback = (transcript: string) => void;

const VOICE_STORAGE_KEY = 'sentra_voice_uri';
const VOICE_RATE_STORAGE_KEY = 'sentra_voice_rate';
const VALID_RATES = [1.0, 1.5, 2.0] as const;

const COMMON_MISSPELLINGS: Record<string, string> = {
  'como': 'cómo', 'que': 'qué', 'estas': 'estás', 'donde': 'dónde',
  'cuando': 'cuándo', 'quien': 'quién', 'cual': 'cuál', 'cuanto': 'cuánto',
  'por que': 'por qué', 'para que': 'para qué', 'cual es': 'cuál es',
  'que es': 'qué es', 'que hay': 'qué hay', 'que ves': 'qué ves',
  'quien eres': 'quién eres', 'que eres': 'qué eres',
  'como estas': 'cómo estás', 'como te llamas': 'cómo te llamas',
  'donde estoy': 'dónde estoy', 'que detectas': 'qué detectas',
  'que puedo': 'qué puedo', 'que quieres': 'qué quieres',
  'cual es tu nombre': 'cuál es tu nombre',
};

function normalizeAccents(text: string): string {
  let result = text;
  for (const [wrong, correct] of Object.entries(COMMON_MISSPELLINGS)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    result = result.replace(regex, correct);
  }
  return result;
}

export class VoiceManager {
  private synth: SpeechSynthesis | null = null;
  private queue: VoiceCue[] = [];
  private current: VoiceCue | null = null;
  private lastSpoken: Map<string, number> = new Map();
  private dedupeWindowMs = 5000;
  private enabled = true;
  private selectedVoiceURI: string | null = null;
  private rate: number = 1.0;
  private passiveRecognition: SpeechRecognition | null = null;
  private passiveActive = false;
  private passiveCallback: PassiveListenCallback | null = null;
  private passiveRestartTimer: number | null = null;
  private readonly handleVoicesChanged = (): void => {
    this.applySavedVoice();
  };

  constructor() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.selectedVoiceURI = this.loadSavedVoice();
      this.rate = this.loadSavedRate();
      this.synth.addEventListener('voiceschanged', this.handleVoicesChanged);
    }

  }

  dispose(): void {
    this.stopPassiveListening();
    this.stop();
    this.synth?.removeEventListener('voiceschanged', this.handleVoicesChanged);
    this.synth = null;
  }

  private loadSavedVoice(): string | null {
    try {
      return localStorage.getItem(VOICE_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private loadSavedRate(): number {
    try {
      const raw = localStorage.getItem(VOICE_RATE_STORAGE_KEY);
      const parsed = raw ? parseFloat(raw) : 1.0;
      return VALID_RATES.includes(parsed as (typeof VALID_RATES)[number]) ? parsed : 1.0;
    } catch {
      return 1.0;
    }
  }

  setRate(rate: number): void {
    if (!VALID_RATES.includes(rate as (typeof VALID_RATES)[number])) return;
    this.rate = rate;
    try {
      localStorage.setItem(VOICE_RATE_STORAGE_KEY, String(rate));
    } catch {
      // localStorage may be unavailable
    }
  }

  getRate(): number {
    return this.rate;
  }

  private applySavedVoice(): void {
    if (!this.selectedVoiceURI || !this.synth) return;
    const voices = this.synth.getVoices();
    const match = voices.find((v) => v.voiceURI === this.selectedVoiceURI);
    if (match) this.synth.speak(new SpeechSynthesisUtterance(''));
  }

  setVoice(voiceURI: string): void {
    this.selectedVoiceURI = voiceURI;
    try {
      localStorage.setItem(VOICE_STORAGE_KEY, voiceURI);
    } catch {
      // localStorage may be unavailable
    }
  }

  getSelectedVoiceURI(): string | null {
    return this.selectedVoiceURI;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  speak(text: string, priority = 5): void {
    if (!this.enabled || !this.synth) return;
    const normalized = normalizeAccents(text);
    const now = Date.now();
    const last = this.lastSpoken.get(normalized);
    if (last && now - last < this.dedupeWindowMs) return;
    this.lastSpoken.set(normalized, now);
    const cue: VoiceCue = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      text: normalized, priority, timestamp: now,
    };
    this.queue.push(cue);
    this.queue.sort((a, b) => a.priority - b.priority);
    this.processQueue();
  }

  private processQueue(): void {
    if (!this.synth || this.current) return;
    const next = this.queue.shift();
    if (!next) return;
    this.current = next;
    const utterance = new SpeechSynthesisUtterance(next.text);
    utterance.lang = 'es-ES';
    utterance.rate = this.rate;
    if (this.selectedVoiceURI) {
      const voices = this.synth.getVoices();
      const voice = voices.find((v) => v.voiceURI === this.selectedVoiceURI);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
    }
    utterance.onend = () => { this.current = null; this.processQueue(); };
    utterance.onerror = () => { this.current = null; this.processQueue(); };
    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) this.synth.cancel();
    this.current = null;
    this.queue = [];
  }

  startPassiveListening(callback: PassiveListenCallback): boolean {
    if (this.passiveActive) return true;
    const SRC =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SRC) return false;

    this.passiveCallback = callback;
    const recognition = new SRC();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const raw = last[0].transcript.trim();
        const transcript = normalizeAccents(raw);
        if (transcript && this.passiveCallback) {
          this.passiveCallback(transcript);
        }
      }
    };
    recognition.onend = () => {
      if (this.passiveActive) {
        this.passiveRestartTimer = window.setTimeout(() => {
          if (this.passiveActive) {
            try { recognition.start(); } catch { /* already started */ }
          }
        }, 300);
      }
    };
    recognition.onerror = () => {
      if (this.passiveActive && this.passiveRestartTimer === null) {
        this.passiveRestartTimer = window.setTimeout(() => {
          this.passiveRestartTimer = null;
          if (this.passiveActive) {
            try { recognition.start(); } catch { /* already started */ }
          }
        }, 1000);
      }
    };

    this.passiveRecognition = recognition;
    this.passiveActive = true;
    try { recognition.start(); } catch { /* already started */ }
    return true;
  }

  stopPassiveListening(): void {
    this.passiveActive = false;
    if (this.passiveRestartTimer !== null) {
      clearTimeout(this.passiveRestartTimer);
      this.passiveRestartTimer = null;
    }
    if (this.passiveRecognition) {
      try { this.passiveRecognition.stop(); } catch { /* not started */ }
      this.passiveRecognition = null;
    }
    this.passiveCallback = null;
  }

  isPassiveListening(): boolean {
    return this.passiveActive;
  }

  pause(): void { if (this.synth) this.synth.pause(); }
  resume(): void { if (this.synth) this.synth.resume(); }
  getQueueLength(): number { return this.queue.length; }
  isSpeaking(): boolean { return this.current !== null; }
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public speakPriority(
    text: string,
    priority: 'critical' | 'normal' | 'low' = 'normal'
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (priority === 'critical') {
      synth.cancel();
    } else if (priority === 'low') {
      if (synth.speaking) return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = priority === 'critical' ? 1.3 : 1.1;
    utterance.pitch = priority === 'critical' ? 1.1 : 1.0;
    synth.speak(utterance);
  }
}

export const voiceManager = new VoiceManager();
