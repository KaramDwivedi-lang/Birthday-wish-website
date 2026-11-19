import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface ConfettiController {
  launchConfetti: (count?: number) => void;
  launchCelebration: () => void;
  launchFirecrackerCelebration: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle' | 'spark';
  life: number;
  decay: number;
  gravity: number;
}

interface ConfettiCanvasProps {
  colors: string[];
  enableConfetti: boolean;
  enableSound: boolean;
}

export const ConfettiCanvas = forwardRef<ConfettiController, ConfettiCanvasProps>(
  function ConfettiCanvas({ colors, enableConfetti, enableSound }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animatingRef = useRef(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, []);

    const getAudioCtx = (): AudioContext | null => {
      if (!enableSound || typeof window === 'undefined') return null;
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return null;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new Ctx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          void ctx.resume();
        }
        return ctx;
      } catch {
        return null;
      }
    };

    const playChime = () => {
      const ctx = getAudioCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.14, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.42);
        });
      } catch {
        // Audio context blocked or unsupported
      }
    };

    const playFirecrackerSound = () => {
      const ctx = getAudioCtx();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.7, now);
        master.connect(ctx.destination);

        // 1. Short ascending skyrocket whistle
        const whistle = ctx.createOscillator();
        const whistleGain = ctx.createGain();
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(480, now);
        whistle.frequency.exponentialRampToValueAtTime(1450, now + 0.16);
        whistleGain.gain.setValueAtTime(0.001, now);
        whistleGain.gain.linearRampToValueAtTime(0.18, now + 0.03);
        whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        whistle.connect(whistleGain);
        whistleGain.connect(master);
        whistle.start(now);
        whistle.stop(now + 0.19);

        // 2. Crisp white-noise buffer for firecracker pops & crackles
        const bufferSize = Math.floor(ctx.sampleRate * 0.14);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
        }

        const crackleOffsets = [
          0.14, 0.19, 0.23, 0.29, 0.34, 0.42, 0.46, 0.53,
          0.61, 0.68, 0.77, 0.85, 0.94, 1.05, 1.18, 1.31,
        ];
        crackleOffsets.forEach((offset, idx) => {
          const t = now + offset;
          const src = ctx.createBufferSource();
          src.buffer = noiseBuffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1600 + (idx % 4) * 550, t);
          filter.Q.setValueAtTime(1.1, t);

          const popGain = ctx.createGain();
          const peak = idx % 3 === 0 ? 0.85 : 0.48;
          popGain.gain.setValueAtTime(peak, t);
          popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

          src.connect(filter);
          filter.connect(popGain);
          popGain.connect(master);
          src.start(t);
          src.stop(t + 0.13);
        });

        // 3. Deep firework aerial boom thumps
        [0.16, 0.45, 0.82].forEach((offset, idx) => {
          const t = now + offset;
          const boomOsc = ctx.createOscillator();
          const boomGain = ctx.createGain();
          boomOsc.type = 'sine';
          boomOsc.frequency.setValueAtTime(155 - idx * 15, t);
          boomOsc.frequency.exponentialRampToValueAtTime(38, t + 0.26);
          boomGain.gain.setValueAtTime(0.5, t);
          boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
          boomOsc.connect(boomGain);
          boomGain.connect(master);
          boomOsc.start(t);
          boomOsc.stop(t + 0.3);
        });

        // 4. Celebratory high chime sparkle at finale
        [783.99, 1046.5, 1318.51].forEach((freq, idx) => {
          const t = now + 0.55 + idx * 0.09;
          const chime = ctx.createOscillator();
          const cGain = ctx.createGain();
          chime.type = 'triangle';
          chime.frequency.setValueAtTime(freq, t);
          cGain.gain.setValueAtTime(0.12, t);
          cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          chime.connect(cGain);
          cGain.connect(master);
          chime.start(t);
          chime.stop(t + 0.48);
        });
      } catch {
        // Audio context blocked or unsupported
      }
    };

    const startLoop = () => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      const tick = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
          animatingRef.current = false;
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.985;
          p.rotation += p.rotationSpeed;
          p.life -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else if (p.shape === 'spark') {
            ctx.fillRect(-p.size * 0.9, -1.5, p.size * 1.8, 3);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        if (particlesRef.current.length > 0) {
          requestAnimationFrame(tick);
        } else {
          animatingRef.current = false;
        }
      };
      requestAnimationFrame(tick);
    };

    const spawnBurst = (
      count: number,
      originX?: number,
      originY?: number,
      gravity = 0.18,
      sparkMode = false
    ) => {
      if (!enableConfetti) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const basePalette = colors.length > 0 ? colors : ['#e8a849', '#c44736', '#1a5c5a', '#f5d08a'];
      const palette = sparkMode
        ? [...basePalette, '#ffd166', '#ff6b35', '#ffffff']
        : basePalette;
      const x = originX ?? canvas.width / 2;
      const y = originY ?? canvas.height * 0.35;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = sparkMode ? Math.random() * 11 + 4 : Math.random() * 8 + 4;
        particlesRef.current.push({
          x: sparkMode ? x : x + (Math.random() - 0.5) * 160,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (sparkMode ? 2 : 4),
          color: palette[Math.floor(Math.random() * palette.length)],
          size: sparkMode ? Math.random() * 7 + 4 : Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 18,
          shape: sparkMode
            ? Math.random() > 0.35
              ? 'spark'
              : 'circle'
            : Math.random() > 0.45
              ? 'rect'
              : 'circle',
          life: 1,
          decay: sparkMode ? Math.random() * 0.016 + 0.011 : Math.random() * 0.012 + 0.008,
          gravity,
        });
      }
      startLoop();
    };

    useImperativeHandle(ref, () => ({
      launchConfetti(count = 110) {
        spawnBurst(count);
        playChime();
      },
      launchCelebration() {
        const canvas = canvasRef.current;
        spawnBurst(130);
        playChime();
        if (canvas) {
          setTimeout(() => spawnBurst(75, canvas.width * 0.3, canvas.height * 0.38, 0.12), 180);
          setTimeout(() => spawnBurst(75, canvas.width * 0.7, canvas.height * 0.38, 0.12), 340);
          setTimeout(() => spawnBurst(95, canvas.width * 0.5, canvas.height * 0.32, 0.05), 500);
        }
      },
      launchFirecrackerCelebration() {
        const canvas = canvasRef.current;
        playFirecrackerSound();
        spawnBurst(110, undefined, undefined, 0.16, true);
        if (canvas) {
          setTimeout(
            () => spawnBurst(95, canvas.width * 0.26, canvas.height * 0.34, 0.14, true),
            160
          );
          setTimeout(
            () => spawnBurst(95, canvas.width * 0.74, canvas.height * 0.32, 0.14, true),
            340
          );
          setTimeout(
            () => spawnBurst(120, canvas.width * 0.5, canvas.height * 0.24, 0.12, true),
            560
          );
          setTimeout(
            () => spawnBurst(90, canvas.width * 0.38, canvas.height * 0.42, 0.12, false),
            820
          );
        }
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        data-testid="confetti-canvas"
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-50"
      />
    );
  }
);
