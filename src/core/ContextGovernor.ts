import { evolis } from './EVOLIS';

export type ContextDecisionType = 'allow' | 'filter' | 'summarize' | 'block';

export interface ContextDecision {
  type: ContextDecisionType;
  reason: string;
  originalInput: string;
  processedInput: string;
  confidence: number;
  timestamp: number;
}

export interface GovernanceEvent {
  id: string;
  type: ContextDecisionType;
  reason: string;
  input: string;
  output: string;
  timestamp: number;
}

export interface ContextGovernorPort {
  isCriticalActive(): boolean;
  setPriorityLevel(level: 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE'): void;
}

const MAX_GOVERNANCE_LOG = 50;

const SPAM_PATTERNS = [
  /\b(\S+)\1{5,}/gi,
];

const NOISE_KEYWORDS = [
  'spam', 'advertencia', 'promo', 'descuento exclusivo',
];

const CONTEXT_RELEVANCE_KEYWORDS: Record<string, string[]> = {
  vision: ['ver', 'detectar', 'escena', 'objeto', 'persona', 'camara', 'describir', 'que ves'],
  bio: ['respirar', 'coherencia', 'estres', 'calmar', 'placebo', 'reencuadre', 'neuroplasticidad', 'epigenetica'],
  seguridad: ['alerta', 'peligro', 'usb', 'guardian', 'monitoreo', 'sincronizacion'],
  evidencia: ['evidencia', 'evolis', 'cadena', 'hash', 'verificar', 'exportar'],
  aprendizaje: ['pregunta', 'saber', 'aprender', 'explicar', 'que es'],
  identidad: ['identidad', 'quien eres', 'como te llamas', 'personalidad', 'tono', 'valores'],
};

const SUMMARY_THRESHOLD = 500;

export class ContextGovernor {
  private log: GovernanceEvent[] = [];
  private totalGoverned = 0;
  private totalBlocked = 0;
  private totalSummarized = 0;

  governContext(input: string, module: string): ContextDecision {
    const timestamp = Date.now();
    const trimmed = input.trim();

    if (trimmed.length === 0) {
      return this.makeDecision('block', 'Entrada vacia', input, '', 0, timestamp);
    }

    if (this.isSpam(trimmed)) {
      return this.makeDecision('block', 'Entrada marcada como spam', input, '', 0, timestamp);
    }

    if (this.isNoise(trimmed)) {
      return this.makeDecision('filter', 'Entrada filtrada por ruido', input, '', 0.3, timestamp);
    }

    if (trimmed.length > SUMMARY_THRESHOLD) {
      const summary = this.summarizeContext(trimmed);
      return this.makeDecision('summarize', 'Contexto resumido por longitud', input, summary, 0.8, timestamp);
    }

    const relevance = this.assessRelevance(trimmed, module);
    if (relevance < 0.2) {
      return this.makeDecision('filter', 'Baja relevancia para el modulo activo', input, trimmed, relevance, timestamp);
    }

    return this.makeDecision('allow', 'Contexto aceptado', input, trimmed, relevance, timestamp);
  }

  filterInput(input: string): boolean {
    if (input.trim().length === 0) return false;
    if (this.isSpam(input)) return false;
    if (this.isNoise(input)) return false;
    return true;
  }

  summarizeContext(input: string): string {
    const sentences = input.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (sentences.length <= 3) return input.trim();

    const scored = sentences.map((s) => ({
      text: s,
      score: this.scoreSentence(s),
    }));

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 3).sort((a, b) => {
      const ia = input.indexOf(a.text);
      const ib = input.indexOf(b.text);
      return ia - ib;
    });

    return top.map((s) => s.text).join('. ') + '.';
  }

  getGovernanceLog(): GovernanceEvent[] {
    return [...this.log];
  }

  getStats(): { totalGoverned: number; totalBlocked: number; totalSummarized: number } {
    return {
      totalGoverned: this.totalGoverned,
      totalBlocked: this.totalBlocked,
      totalSummarized: this.totalSummarized,
    };
  }

  private makeDecision(
    type: ContextDecisionType,
    reason: string,
    originalInput: string,
    processedInput: string,
    confidence: number,
    timestamp: number
  ): ContextDecision {
    this.totalGoverned++;
    if (type === 'block') this.totalBlocked++;
    if (type === 'summarize') this.totalSummarized++;

    const event: GovernanceEvent = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      type,
      reason,
      input: originalInput.slice(0, 200),
      output: processedInput.slice(0, 200),
      timestamp,
    };
    this.log.push(event);
    if (this.log.length > MAX_GOVERNANCE_LOG) this.log.shift();

    evolis.record('governance', type, reason).catch(() => {});

    return { type, reason, originalInput, processedInput, confidence, timestamp };
  }

  private isSpam(text: string): boolean {
    return SPAM_PATTERNS.some((pattern) => pattern.test(text));
  }

  private isNoise(text: string): boolean {
    const lower = text.toLowerCase();
    return NOISE_KEYWORDS.some((kw) => lower.includes(kw)) && text.length < 50;
  }

  private assessRelevance(input: string, module: string): number {
    const lower = input.toLowerCase();
    const keywords = CONTEXT_RELEVANCE_KEYWORDS[module] ?? [];
    if (keywords.length === 0) return 0.5;

    let matches = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) matches++;
    }

    const generalWords = ['hola', 'ayuda', 'que puedes', 'comandos', 'quien eres', 'como estas'];
    for (const gw of generalWords) {
      if (lower.includes(gw)) matches += 0.5;
    }

    return Math.min(1, matches / Math.max(3, keywords.length));
  }

  private scoreSentence(sentence: string): number {
    let score = 0;
    if (sentence.length > 20 && sentence.length < 200) score += 1;
    if (/\b(que|como|donde|cuando|por que|cual)\b/i.test(sentence)) score += 0.5;
    if (/\b(detectar|ver|procesar|comando|evidencia|bio|seguridad)\b/i.test(sentence)) score += 0.5;
    return score;
  }

  private _priorityLevel: 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE' = 'NAVIGATION';

  public setPriorityLevel(level: 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE'): void {
    this._priorityLevel = level;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sentra:priority-change', { detail: { level } }));
    }
  }

  public getPriorityLevel(): 'CRITICAL' | 'NAVIGATION' | 'DESCRIPTIVE' {
    return this._priorityLevel;
  }

  public isCriticalActive(): boolean {
    return this._priorityLevel === 'CRITICAL';
  }
}

export const contextGovernor = new ContextGovernor();
