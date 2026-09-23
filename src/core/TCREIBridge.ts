export interface TCREIPrompt {
  context: string;
  perception: string;
  command: string;
  structured: {
    role: string;
    task: string;
    constraints: string[];
    expectedOutput: string;
  };
}

export interface TCREIResponse {
  text: string;
  confidence: number;
  source: 'local' | 'gemini';
}

export interface BridgeRequestPayload {
  prompt: string;
  context?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
}

export interface BridgeResponsePayload {
  success: boolean;
  data: string | null;
  error?: string;
  latencyMs: number;
  timestamp: number;
}

const MODULE_CONTEXTS: Record<string, string> = {
  vision: 'Asistencia visual para personas con discapacidad visual',
  seguridad: 'Monitoreo de seguridad y alertas',
  movimiento: 'Navegación y orientación espacial',
  juego: 'Experiencia interactiva y narrativa',
  aprendizaje: 'Educación y respuesta a preguntas',
  impacto: 'Gestión de energía y harvesting',
  silencio: 'Comunicación no verbal',
  evidencia: 'Trazabilidad y registro inmutable',
  bio: 'BioSoftware: inferencia activa, placebos cognitivos, reencuadre cognitivo, neuroplasticidad, epigenética, coherencia cardíaca',
};

const COMMON_MISSPELLINGS: Record<string, string> = {
  'como': 'cómo', 'que': 'qué', 'estas': 'estás', 'donde': 'dónde',
  'cuando': 'cuándo', 'quien': 'quién', 'cual': 'cuál', 'cuanto': 'cuánto',
  'por que': 'por qué', 'para que': 'para qué',
};

function normalizeAccents(text: string): string {
  let result = text;
  for (const [wrong, correct] of Object.entries(COMMON_MISSPELLINGS)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    result = result.replace(regex, correct);
  }
  return result;
}

export class TCREIBridge {
  private isCircuitOpen = false;
  private failureCount = 0;
  private readonly maxFailures = 3;
  private readonly cooldownMs = 10_000;
  private lastFailureTime = 0;

  constructor() {
    console.info('[TCREIBridge] Inicializando pasarela reforzada.');
  }

  async dispatch(payload: BridgeRequestPayload): Promise<BridgeResponsePayload> {
    const startTime = Date.now();
    const timestamp = () => Date.now();

    if (this.isCircuitBlocked()) {
      return {
        success: false,
        data: null,
        error: 'CircuitBreaker OPEN: TCREIBridge temporalmente suspendido.',
        latencyMs: timestamp() - startTime,
        timestamp: timestamp(),
      };
    }

    const validationError = this.validatePayload(payload);
    if (validationError) {
      return {
        success: false,
        data: null,
        error: validationError,
        latencyMs: timestamp() - startTime,
        timestamp: timestamp(),
      };
    }

    try {
      const result = await this.executeInternalTransport(
        this.sanitizePrompt(payload.prompt),
        payload.context ?? {},
      );
      this.resetFailures();
      return {
        success: true,
        data: result,
        latencyMs: timestamp() - startTime,
        timestamp: timestamp(),
      };
    } catch (error: unknown) {
      this.handleFailure();
      const message = error instanceof Error ? error.message : 'Error desconocido en el transporte del puente';
      console.error('[TCREIBridge] Error en despacho de pasarela:', message);
      return {
        success: false,
        data: null,
        error: message,
        latencyMs: timestamp() - startTime,
        timestamp: timestamp(),
      };
    }
  }

  private validatePayload(payload: BridgeRequestPayload): string | null {
    if (!payload || typeof payload.prompt !== 'string' || payload.prompt.trim().length === 0) {
      return 'Payload inválido: el prompt es obligatorio y debe ser un string válido.';
    }
    if (payload.maxTokens !== undefined && (!Number.isInteger(payload.maxTokens) || payload.maxTokens <= 0)) {
      return 'Payload inválido: maxTokens debe ser un entero positivo.';
    }
    if (
      payload.temperature !== undefined
      && (!Number.isFinite(payload.temperature) || payload.temperature < 0 || payload.temperature > 2)
    ) {
      return 'Payload inválido: temperature debe estar entre 0 y 2.';
    }
    return null;
  }

  private sanitizePrompt(prompt: string): string {
    return prompt.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  }

  private async executeInternalTransport(
    prompt: string,
    context: Record<string, unknown>,
  ): Promise<string> {
    if (!prompt) throw new Error('Prompt vacío tras sanitización');
    void context;
    return `[TCREIBridge ACK] Procesado correctamente: "${prompt.substring(0, 40)}..."`;
  }

  private isCircuitBlocked(): boolean {
    if (!this.isCircuitOpen) return false;
    if (Date.now() - this.lastFailureTime <= this.cooldownMs) return true;
    console.warn('[TCREIBridge] Cooldown expirado. Probando recuperación (HALF_OPEN).');
    this.isCircuitOpen = false;
    this.failureCount = 0;
    return false;
  }

  private handleFailure(): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.maxFailures) {
      this.isCircuitOpen = true;
      console.error(`[TCREIBridge] Límite de fallos (${this.maxFailures}) alcanzado.`);
    }
  }

  private resetFailures(): void {
    this.failureCount = 0;
    this.isCircuitOpen = false;
  }

  buildPrompt(module: string, perception: string, command: string): TCREIPrompt {
    const context = MODULE_CONTEXTS[module] ?? 'Asistencia general';
    const isBio = module === 'bio';
    const normalizedCommand = normalizeAccents(command);
    return {
      context,
      perception,
      command: normalizedCommand,
      structured: {
        role: 'Eres Sentra Core, un asistente soberano y offline-first',
        task: `Procesar comando "${normalizedCommand}" en contexto de ${context}`,
        constraints: [
          'Responder en español',
          'Ser conciso y directo',
          isBio ? 'Aplicar reencuadre cognitivo y placebo cognitivo cuando sea pertinente' : 'No inventar datos no presentes en la percepción',
          'Priorizar la seguridad del usuario',
        ],
        expectedOutput: 'Respuesta clara y accionable en menos de 100 palabras',
      },
    };
  }

  formatForLLM(prompt: TCREIPrompt): string {
    return [
      `Rol: ${prompt.structured.role}`,
      `Contexto: ${prompt.context}`,
      `Percepcion: ${prompt.perception}`,
      `Comando: ${prompt.command}`,
      `Tarea: ${prompt.structured.task}`,
      `Restricciones: ${prompt.structured.constraints.join('; ')}`,
      `Salida esperada: ${prompt.structured.expectedOutput}`,
    ].join('\n');
  }

  parseResponse(raw: string, source: 'local' | 'gemini'): TCREIResponse {
    const text = raw.trim();
    const confidence = source === 'gemini' ? 0.9 : 0.6;
    return { text, confidence, source };
  }
}

export const tcreiBridge = new TCREIBridge();
export const tcreiBridgeInstance = tcreiBridge;
