import { TCREIBridge, TCREIResponse } from './TCREIBridge';
import { bioSoftware } from './BioSoftwareInterface';

export interface GeminiConfig {
  apiKey?: string;
  model: string;
}

interface GeminiCandidate {
  text: string;
  score: number;
}

const LOCAL_KNOWLEDGE: { keywords: string[]; response: string }[] = [
  {
    keywords: ['hola', 'buenos', 'buenas', 'hey', 'saludos'],
    response: 'Hola, soy Sentra Core. Estoy listo para ayudarte. Dime que necesitas.',
  },
  {
    keywords: ['quien eres', 'que eres', 'que es sentra'],
    response: 'Soy Sentra Core, una navaja suiza soberana. Funciono offline, con veto humano y trazabilidad inalterable.',
  },
  {
    keywords: ['ayuda', 'help', 'comandos'],
    response: 'Puedes pedirme: describir lo que veo, navegar, registrar evidencia, o cambiar de modo.',
  },
  {
    keywords: ['bateria', 'energia'],
    response: 'Puedo gestionar el consumo en modos: ultra ahorro, normal y alto rendimiento.',
  },
  {
    keywords: ['persona', 'gente', 'alguien', 'cuerpo'],
    response: 'Detecto presencia de personas en el campo de vision.',
  },
  {
    keywords: ['peligro', 'riesgo', 'alerta', 'emergencia'],
    response: 'Alerta: situacion de riesgo detectada. Manten la calma y sigue mis indicaciones.',
  },
  {
    keywords: ['estres', 'ansiedad', 'nervios', 'preocupado', 'tension'],
    response: 'Detecto estres. El reencuadre cognitivo puede ayudarte: lo que sientes es energia para actuar, no una amenaza. Prueba una sesion de coherencia cardiaca.',
  },
  {
    keywords: ['respirar', 'respiracion', 'calmar', 'relajar', 'coherencia'],
    response: 'Inicia coherencia cardiaca: inhala 4 segundos, exhala 6 segundos. 5 ciclos por minuto. Tu sistema nervioso se sincroniza con cada respiracion.',
  },
  {
    keywords: ['placebo', 'creer', 'expectativa', 'mejorar'],
    response: 'El placebo cognitivo funciona: tu cerebro responde a la expectativa de mejoria. Creer en la mejoria activa mecanismos de reparacion reales.',
  },
  {
    keywords: ['neuroplasticidad', 'cambiar habito', 'aprender nuevo', 'reorganizar'],
    response: 'Tu cerebro se reorganiza hasta los 100 anos. Cada repeticion fortalece conexiones neuronales. La practica deliberada crea nuevas rutas.',
  },
  {
    keywords: ['epigenetica', 'genes', 'adn', 'herencia'],
    response: 'Tus genes son el piano, tus habits son las manos que lo tocan. El estres cronico activa genes inflamatorios, la calma los silencia.',
  },
  {
    keywords: ['inferencia activa', 'prediccion', 'incertidumbre', 'sorpresa'],
    response: 'Tu cerebro predice lo que va a pasar y minimiza el error de prediccion. La sorpresa es informacion, integrarla reduce la incertidumbre.',
  },
];

export class GeminiService {
  private config: GeminiConfig;
  private bridge: TCREIBridge;
  private useRemote = false;
  private worldConnected = false;
  private offlineCache: Map<string, TCREIResponse> = new Map();
  private envApiKey: string;

  constructor(config?: Partial<GeminiConfig>) {
    this.config = { model: 'gemini-2.0-flash', ...config };
    this.bridge = new TCREIBridge();
    this.envApiKey = import.meta.env?.VITE_GEMINI_API_KEY ?? '';
    if (this.envApiKey) {
      this.config.apiKey = this.envApiKey;
      this.useRemote = true;
    }
  }

  private getEffectiveApiKey(): string | undefined {
    return this.config.apiKey || this.envApiKey;
  }

  setApiKey(key: string): void {
    this.config.apiKey = key || this.envApiKey;
  }

  setRemoteEnabled(enabled: boolean): void {
    this.useRemote = enabled && !!this.getEffectiveApiKey();
  }

  setWorldConnected(connected: boolean): void {
    this.worldConnected = connected;
  }

  isRemoteEnabled(): boolean {
    return this.useRemote;
  }

  isWorldConnected(): boolean {
    return this.worldConnected;
  }

  async query(module: string, perception: string, command: string): Promise<TCREIResponse> {
    const cacheKey = `${module}:${command}:${perception}`;
    const cached = this.offlineCache.get(cacheKey);
    if (cached && !this.useRemote) return cached;

    const prompt = this.bridge.buildPrompt(module, perception, command);
    const effectiveKey = this.getEffectiveApiKey();
    if (this.useRemote && effectiveKey) {
      try {
        const raw = await this.callRemote(prompt);
        const response = this.bridge.parseResponse(raw, 'gemini');
        this.offlineCache.set(cacheKey, response);
        return response;
      } catch {
        const local = this.localResponse(prompt, command, perception);
        this.offlineCache.set(cacheKey, local);
        return local;
      }
    }
    const local = this.localResponse(prompt, command, perception);
    if (!this.useRemote) this.offlineCache.set(cacheKey, local);
    return local;
  }

  private async callRemote(prompt: ReturnType<TCREIBridge['buildPrompt']>): Promise<string> {
    const formatted = this.bridge.formatForLLM(prompt);
    const key = this.getEffectiveApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: formatted }] }],
      }),
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');
    return text;
  }

  private localResponse(
    prompt: ReturnType<TCREIBridge['buildPrompt']>,
    command: string,
    perception: string
  ): TCREIResponse {
    const lower = command.toLowerCase();

    if (prompt.context.startsWith('BioSoftware')) {
      const bioResp = this.bioResponse(lower);
      if (bioResp) return this.bridge.parseResponse(bioResp, 'local');
    }

    if (perception && perception !== 'Sin percepcion activa') {
      const detectionResp = this.generateOfflineResponse(perception, lower);
      if (detectionResp) return this.bridge.parseResponse(detectionResp, 'local');
    }

    let best: GeminiCandidate | null = null;
    for (const entry of LOCAL_KNOWLEDGE) {
      const score = entry.keywords.reduce(
        (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
        0
      );
      if (score > 0 && (!best || score > best.score)) {
        best = { text: entry.response, score };
      }
    }
    const text = best
      ? best.text
      : `Procesando "${command}" en contexto de ${prompt.context}. Modo offline activo.`;
    return this.bridge.parseResponse(text, 'local');
  }

  private bioResponse(lower: string): string | null {
    const bioState = bioSoftware.getState();
    if (bioState.activeProtocol) {
      const reframe = bioSoftware.getReframe();
      if (reframe) return reframe;
    }
    if (lower.includes('coherencia') || lower.includes('respirar') || lower.includes('calmar')) {
      return 'Inicia coherencia cardiaca: inhala 4 segundos, exhala 6 segundos. 5 ciclos por minuto. Tu sistema nervioso se sincroniza con cada respiracion.';
    }
    if (lower.includes('estres') || lower.includes('ansiedad')) {
      return 'El reencuadre cognitivo puede ayudarte: lo que sientes como estres es energia disponible para actuar, no una amenaza. Prueba una sesion de reencuadre.';
    }
    if (lower.includes('placebo')) {
      return 'El placebo cognitivo funciona: tu cerebro responde a la expectativa de mejoria. Creer en la mejoria activa mecanismos de reparacion reales.';
    }
    if (lower.includes('habito') || lower.includes('neuroplasticidad')) {
      return 'Tu cerebro se reorganiza con cada repeticion. La practica deliberada crea nuevas rutas neuronales. Nunca es tarde para cambiar.';
    }
    if (lower.includes('genes') || lower.includes('epigenetica')) {
      return 'Tus genes son el piano, tus habits son las manos que lo tocan. El estres cronico activa genes inflamatorios, la calma los silencia.';
    }
    return null;
  }

  private generateOfflineResponse(perception: string, command: string): string | null {
    const lower = command.toLowerCase();
    const wantsDescription = ['describir', 'describeme', 'que ves', 'que detectas', 'ver', 'detectar', 'escena', 'que hay']
      .some((kw) => lower.includes(kw));

    const personMatch = perception.match(/(\d+)\s+persona/i);
    const objectsMatch = perception.match(/Objetos:\s*(.+)/i);

    if (personMatch || objectsMatch) {
      const parts: string[] = [];
      if (personMatch) {
        const count = parseInt(personMatch[1], 10);
        parts.push(count === 1 ? 'Veo una persona' : `Veo ${count} personas`);
      }
      if (objectsMatch) {
        const objects = objectsMatch[1].split(',').map((o) => o.trim()).filter(Boolean);
        if (objects.length > 0) {
          parts.push(`Detecto: ${objects.join(', ')}`);
        }
      }
      if (parts.length > 0) {
        return parts.join('. ') + '. Modo offline activo.';
      }
    }

    if (wantsDescription && perception !== 'Sin datos sensoriales') {
      return `Percepcion actual: ${perception}. Modo offline activo.`;
    }

    return null;
  }
}

export const geminiService = new GeminiService();
