let sharedContext: AudioContext | null = null;
const INTERFACE_AUDIO_KEY = 'sentra-interface-audio';

export type InterfaceCue = 'click' | 'confirm' | 'critical';

export function isInterfaceAudioEnabled(): boolean {
  try {
    return window.localStorage.getItem(INTERFACE_AUDIO_KEY) === 'enabled';
  } catch {
    return false;
  }
}

export function setInterfaceAudioEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(INTERFACE_AUDIO_KEY, enabled ? 'enabled' : 'disabled');
  } catch (error) {
    console.warn('[engineSound] No se pudo guardar la preferencia de audio:', error);
  }
}

function getContext(): AudioContext {
  const AudioContextClass = window.AudioContext
    ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) throw new Error('Web Audio API no disponible');

  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new AudioContextClass();
  }
  if (sharedContext.state === 'suspended') {
    void sharedContext.resume();
  }
  return sharedContext;
}

function createNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * durationSeconds);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playEngineRoar(): number {
  try {
    const ctx = getContext();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.connect(ctx.destination);

    const igniteDuration = 0.25;
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, igniteDuration);
    const igniteFilter = ctx.createBiquadFilter();
    igniteFilter.type = 'bandpass';
    igniteFilter.frequency.setValueAtTime(1200, now);
    igniteFilter.Q.value = 0.7;
    const igniteGain = ctx.createGain();
    igniteGain.gain.setValueAtTime(0.5, now);
    igniteGain.gain.exponentialRampToValueAtTime(0.001, now + igniteDuration);
    noise.connect(igniteFilter).connect(igniteGain).connect(master);
    noise.start(now);
    noise.stop(now + igniteDuration);

    const engineStart = now + 0.12;
    const engineDuration = 1.4;
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, engineStart);
    osc1.frequency.exponentialRampToValueAtTime(140, engineStart + 0.35);
    osc1.frequency.exponentialRampToValueAtTime(90, engineStart + engineDuration);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(56.5, engineStart);
    osc2.frequency.exponentialRampToValueAtTime(143, engineStart + 0.35);
    osc2.frequency.exponentialRampToValueAtTime(91, engineStart + engineDuration);

    const engineFilter = ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(300, engineStart);
    engineFilter.frequency.exponentialRampToValueAtTime(2200, engineStart + 0.3);
    engineFilter.frequency.exponentialRampToValueAtTime(700, engineStart + engineDuration);
    engineFilter.Q.value = 1.2;

    const engineGain = ctx.createGain();
    engineGain.gain.setValueAtTime(0.0001, engineStart);
    engineGain.gain.exponentialRampToValueAtTime(0.35, engineStart + 0.15);
    engineGain.gain.exponentialRampToValueAtTime(0.2, engineStart + 0.5);
    engineGain.gain.exponentialRampToValueAtTime(0.0001, engineStart + engineDuration);

    osc1.connect(engineFilter);
    osc2.connect(engineFilter);
    engineFilter.connect(engineGain).connect(master);
    osc1.start(engineStart);
    osc2.start(engineStart);
    osc1.stop(engineStart + engineDuration);
    osc2.stop(engineStart + engineDuration);

    master.gain.setValueAtTime(1, now);
    return (engineStart - now + engineDuration) * 1000;
  } catch (error) {
    console.error('[engineSound] No se pudo sintetizar el rugido del motor:', error);
    return 0;
  }
}

export function playInterfaceCue(cue: InterfaceCue): void {
  if (!isInterfaceAudioEnabled()) return;
  try {
    const ctx = getContext();
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const tone = cue === 'critical'
      ? { start: 260, end: 180, duration: 0.22, volume: 0.055, type: 'triangle' as OscillatorType }
      : cue === 'confirm'
        ? { start: 640, end: 960, duration: 0.11, volume: 0.035, type: 'sine' as OscillatorType }
        : { start: 720, end: 520, duration: 0.035, volume: 0.018, type: 'sine' as OscillatorType };

    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.start, now);
    oscillator.frequency.exponentialRampToValueAtTime(tone.end, now + tone.duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(tone.volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + tone.duration);
  } catch (error) {
    console.warn('[engineSound] No se pudo reproducir el efecto de interfaz:', error);
  }
}