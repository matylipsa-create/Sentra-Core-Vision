export type DecompositionStep = string;

export class TaskDecomposer {
  decompose(task: string): DecompositionStep[] {
    const text = (task ?? '').trim();
    if (!text) return [];

    const lower = text.toLowerCase();
    if (/(leer|lectura|texto|cartel|señal|letra)/i.test(lower)) {
      return [
        '1. Apuntá la cámara al cartel o texto.',
        '2. Toca LEER TEXTO.',
        '3. Escuchá la línea y confirmá la información.'
      ];
    }

    if (/(cruzar|cruce|pasar)/i.test(lower)) {
      return [
        '1. Parate en la vereda o zona segura.',
        '2. Revisá semáforos, personas y vehículos.',
        '3. Cruzá cuando el camino esté despejado.'
      ];
    }

    if (/(buscar|localizar|ubicar)/i.test(lower)) {
      return [
        '1. Apuntá la cámara a la zona de búsqueda.',
        '2. Escaneá con atención lenta.',
        '3. Confirmá la referencia más clara.'
      ];
    }

    const parts = text
      .split(/[,.;]|\s+y\s+|\s+luego\s+|\s+después\s+|\s+entonces\s+/i)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      return [`1. Revisá la instrucción: ${text}`];
    }

    return parts.map((part, index) => `${index + 1}. ${part.charAt(0).toUpperCase()}${part.slice(1)}`);
  }

  speakSteps(steps: string[], voiceManager: { speak?: (text: string, priority?: number) => void } | null | undefined): void {
    if (!Array.isArray(steps) || steps.length === 0) return;

    const fn = voiceManager?.speak ?? ((text: string) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    });

    let index = 0;
    const speakNext = () => {
      if (index >= steps.length) return;
      fn(steps[index], 3);
      index += 1;
      if (index < steps.length) {
        window.setTimeout(speakNext, 2000);
      }
    };

    if (typeof window !== 'undefined') {
      window.setTimeout(speakNext, 0);
    } else {
      speakNext();
    }
  }
}

export const taskDecomposer = new TaskDecomposer();
