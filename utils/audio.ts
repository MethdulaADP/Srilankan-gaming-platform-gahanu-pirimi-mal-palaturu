
// Simple procedural sound generator using Web Audio API
// No mp3 files required!

let audioCtx: AudioContext | null = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

export const playClickSound = () => {
    const ctx = initAudio();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Randomize pitch slightly for "organic" feel
    // Base frequency 400-600Hz
    const baseFreq = 500 + Math.random() * 200;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    // "Pop" effect: Frequency drop
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    // Envelope: Short attack, decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01); // Increased volume
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
};

export const playTypingSound = () => {
    const ctx = initAudio();
    if (!ctx) return;

    // Simulate mechanical switch: Short, sharp "tick"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Randomize slightly for realism
    const freq = 1500 + Math.random() * 500;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Very short envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
};

export const playSuccesSound = () => {
    const ctx = initAudio();
    if (!ctx) return;

    // High pitched "Ding"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
}
