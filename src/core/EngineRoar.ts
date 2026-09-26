let audioCtx: AudioContext | null = null;

export function playEngineRoar(): void {
  try {
    const AudioContextClass = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const duration = 1.8;
    const stopTime = now + duration;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(45, now);
    osc1.frequency.exponentialRampToValueAtTime(130, now + 0.4);
    osc1.frequency.exponentialRampToValueAtTime(65, stopTime);
    osc2.frequency.setValueAtTime(47, now);
    osc2.frequency.exponentialRampToValueAtTime(134, now + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(67, stopTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(450, stopTime);
    filter.Q.value = 4;

    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(250, now);
    noiseFilter.frequency.linearRampToValueAtTime(600, now + 0.5);
    noiseFilter.Q.value = 3;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.15);
    gainNode.gain.setValueAtTime(0.4, now + 1.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    whiteNoise.start(now);
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    whiteNoise.stop(stopTime);
  } catch (error) {
    console.warn('Web Audio API no disponible o bloqueada por políticas del navegador:', error);
  }
}