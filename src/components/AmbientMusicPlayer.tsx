import { useEffect, useRef } from 'react';
import { getMusicTrack } from '../utils/wishLogic';

interface AmbientMusicPlayerProps {
  soundEnabled: boolean;
  musicPlaying: boolean;
  trackId: string;
  onAutoStarted: () => void;
}

export function AmbientMusicPlayer({
  soundEnabled,
  musicPlaying,
  trackId,
  onAutoStarted,
}: AmbientMusicPlayerProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const stepRef = useRef(0);
  const unlockedRef = useRef(false);
  const onAutoStartedRef = useRef(onAutoStarted);
  onAutoStartedRef.current = onAutoStarted;

  const ensureContext = () => {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!ctxRef.current) {
      const ctx = new AudioCtx();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 3400;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;

      const master = ctx.createGain();
      master.gain.value = 0.58;

      filter.connect(compressor);
      compressor.connect(master);
      master.connect(ctx.destination);

      ctxRef.current = ctx;
      filterRef.current = filter;
      masterRef.current = master;
    }

    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  useEffect(() => {
    if (!soundEnabled) return;

    const handleFirstGesture = (e: Event) => {
      if (unlockedRef.current) return;
      const ctx = ensureContext();
      if (!ctx) return;
      unlockedRef.current = true;
      const target = e.target as HTMLElement | null;
      if (!target?.closest?.('[data-music-toggle]')) {
        onAutoStartedRef.current();
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [soundEnabled]);

  useEffect(() => {
    stepRef.current = 0;
  }, [trackId]);

  useEffect(() => {
    if (!soundEnabled || !musicPlaying) {
      if (masterRef.current && ctxRef.current) {
        masterRef.current.gain.setTargetAtTime(0.0001, ctxRef.current.currentTime, 0.15);
      }
      return;
    }

    const ctx = ensureContext();
    if (!ctx || !filterRef.current || !masterRef.current) return;

    masterRef.current.gain.setTargetAtTime(0.58, ctx.currentTime, 0.16);
    const track = getMusicTrack(trackId);

    const playNote = () => {
      const activeCtx = ctxRef.current;
      const filter = filterRef.current;
      if (!activeCtx || !filter || activeCtx.state !== 'running') return;

      const idx = stepRef.current % track.notes.length;
      const freq = track.notes[idx];
      const now = activeCtx.currentTime;

      const osc = activeCtx.createOscillator();
      const harmonyOsc = activeCtx.createOscillator();
      const overtone = activeCtx.createOscillator();
      const noteGain = activeCtx.createGain();
      const harmonyGain = activeCtx.createGain();
      const overtoneGain = activeCtx.createGain();

      osc.type = track.wave;
      osc.frequency.setValueAtTime(freq, now);

      // Warm fifth/third harmonic bloom for richer celebratory presence
      harmonyOsc.type = 'triangle';
      harmonyOsc.frequency.setValueAtTime(freq * 1.25, now);
      harmonyGain.gain.value = 0.24;

      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2, now);
      overtoneGain.gain.value = 0.16;

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.24, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.05);

      osc.connect(noteGain);
      harmonyOsc.connect(harmonyGain);
      harmonyGain.connect(noteGain);
      overtone.connect(overtoneGain);
      overtoneGain.connect(noteGain);
      noteGain.connect(filter);

      osc.start(now);
      harmonyOsc.start(now);
      overtone.start(now);
      osc.stop(now + 1.1);
      harmonyOsc.stop(now + 1.1);
      overtone.stop(now + 1.1);

      const bassFreq = track.bassRoots[idx];
      if (bassFreq) {
        const bassOsc = activeCtx.createOscillator();
        const bassOctave = activeCtx.createOscillator();
        const bassGain = activeCtx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);
        bassOctave.type = 'sine';
        bassOctave.frequency.setValueAtTime(bassFreq * 2, now);

        bassGain.gain.setValueAtTime(0.0001, now);
        bassGain.gain.linearRampToValueAtTime(0.22, now + 0.08);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        bassOsc.connect(bassGain);
        bassOctave.connect(bassGain);
        bassGain.connect(filter);
        bassOsc.start(now);
        bassOctave.start(now);
        bassOsc.stop(now + 2.3);
        bassOctave.stop(now + 2.3);
      }

      stepRef.current = (stepRef.current + 1) % track.notes.length;
    };

    playNote();
    const interval = window.setInterval(playNote, track.tempoMs);
    return () => window.clearInterval(interval);
  }, [soundEnabled, musicPlaying, trackId]);

  return null;
}
