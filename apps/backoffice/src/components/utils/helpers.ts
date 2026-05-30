// Web Audio Synthesizer Beep Sound
export const playBeep = () => {
    if (typeof window === 'undefined') return;
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800 Hz
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume 10%

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1); // 100ms beep duration
    } catch (e) {
        console.warn('Failed to play audio beep:', e);
    }
};

export const playErrorBeep = () => {
    if (typeof window === 'undefined') return;
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const audioCtx = new AudioContextClass();

        const playTone = (freq: number, delayMs: number, durationMs: number) => {
            setTimeout(() => {
                try {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);

                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

                    osc.start();
                    osc.stop(audioCtx.currentTime + (durationMs / 1000));
                } catch (err) {
                    console.warn('Failed to play tone:', err);
                }
            }, delayMs);
        };

        // Play two low-frequency sawtooth tones sequentially
        playTone(150, 0, 120);
        playTone(150, 180, 120);
    } catch (e) {
        console.warn('Failed to play audio error beep:', e);
    }
};