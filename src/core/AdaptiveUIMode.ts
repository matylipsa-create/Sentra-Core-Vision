export type AdaptiveUIMode = 'smooth' | 'analytical' | 'silent';

const STORAGE_KEY = 'sentra_ui_detail_mode';
const DEFAULT_MODE: AdaptiveUIMode = 'smooth';

function readStoredMode(): AdaptiveUIMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'smooth' || raw === 'analytical' || raw === 'silent') return raw;
  } catch {
    // localStorage unavailable.
  }
  return DEFAULT_MODE;
}

class AdaptiveUIModeManager {
  private currentMode: AdaptiveUIMode = DEFAULT_MODE;

  constructor() {
    this.currentMode = readStoredMode();
  }

  getMode(): AdaptiveUIMode {
    this.currentMode = readStoredMode();
    return this.currentMode;
  }

  setMode(mode: AdaptiveUIMode): AdaptiveUIMode {
    this.currentMode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage unavailable.
    }
    return this.currentMode;
  }

  adaptDescription(sceneDesc: string, mode: AdaptiveUIMode = this.getMode()): string {
    const safeText = (sceneDesc ?? '').trim();
    if (!safeText) return 'Sin eventos relevantes.';

    if (mode === 'smooth') {
      const critical = /(persona|peligro|señal|semáforo|obstáculo|auto|camión|moto|persona|cruce|peatón)/i.test(safeText);
      return critical ? 'Camino con atención requerida.' : 'Camino despejado.';
    }

    if (mode === 'silent') {
      return safeText;
    }

    return safeText;
  }
}

export const adaptiveUIMode = new AdaptiveUIModeManager();
