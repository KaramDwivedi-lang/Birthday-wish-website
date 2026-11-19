import { useEffect, useRef, useState } from 'react';
import { PartyPopper } from 'lucide-react';
import type { WishConfig } from '../types/wish';
import { computeCountdownRemaining, isHexColorDark } from '../utils/wishLogic';

interface HeroCountdownProps {
  wish: WishConfig;
  onReachedCelebration: () => void;
}

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

export function HeroCountdown({ wish, onReachedCelebration }: HeroCountdownProps) {
  const { countdown, colors } = wish;
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [justCelebrated, setJustCelebrated] = useState(false);
  const firedForTargetRef = useRef<string | null>(null);
  const onReachedRef = useRef(onReachedCelebration);
  onReachedRef.current = onReachedCelebration;

  useEffect(() => {
    if (!countdown.enabled) return;
    setNowMs(Date.now());
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);
    return () => window.clearInterval(timer);
  }, [countdown.enabled, countdown.targetDateTime]);

  const remaining = computeCountdownRemaining(countdown.targetDateTime, nowMs);

  useEffect(() => {
    if (!countdown.enabled || !remaining.isValid) return;

    if (!remaining.isReached) {
      if (firedForTargetRef.current === countdown.targetDateTime) {
        firedForTargetRef.current = null;
      }
      setJustCelebrated(false);
      return;
    }

    if (firedForTargetRef.current !== countdown.targetDateTime) {
      firedForTargetRef.current = countdown.targetDateTime;
      setJustCelebrated(true);
      onReachedRef.current();
      const timeout = window.setTimeout(() => setJustCelebrated(false), 3200);
      return () => window.clearTimeout(timeout);
    }
  }, [countdown.enabled, countdown.targetDateTime, remaining.isReached, remaining.isValid]);

  if (!countdown.enabled || !remaining.isValid) {
    return null;
  }

  const darkCanvas = isHexColorDark(colors.background);
  const borderColor = darkCanvas ? 'rgba(255,255,255,0.14)' : 'rgba(15,9,6,0.12)';
  const cardBg = darkCanvas ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.65)';

  if (remaining.isReached) {
    return (
      <div
        data-testid="hero-countdown"
        data-reached="true"
        role="status"
        aria-live="polite"
        className={`mx-auto mb-9 max-w-lg rounded-xl px-6 py-4 transition-all duration-500 ${
          justCelebrated ? 'scale-[1.03]' : 'scale-100'
        }`}
        style={{
          backgroundColor: cardBg,
          border: `1.5px solid ${colors.accent}`,
          boxShadow: justCelebrated ? `0 0 28px ${colors.accent}40` : 'none',
          color: colors.ink,
        }}
      >
        <div className="flex items-center justify-center gap-2.5">
          <PartyPopper className="w-5 h-5 shrink-0" style={{ color: colors.accent }} aria-hidden="true" />
          <p
            className="text-base sm:text-lg font-semibold"
            style={{ fontFamily: 'var(--wish-display-font)', color: colors.ink }}
          >
            {countdown.reachedText || 'The celebration moment has arrived!'}
          </p>
        </div>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: padTwo(remaining.days) },
    { label: 'Hours', value: padTwo(remaining.hours) },
    { label: 'Minutes', value: padTwo(remaining.minutes) },
    { label: 'Seconds', value: padTwo(remaining.seconds) },
  ];

  return (
    <section
      data-testid="hero-countdown"
      data-reached="false"
      aria-label="Celebration countdown"
      className="mx-auto mb-9 max-w-lg rounded-xl px-5 py-4"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        color: colors.ink,
      }}
    >
      {countdown.label && (
        <p
          className="text-xs font-medium tracking-wider uppercase mb-3 opacity-80"
          style={{ color: colors.secondary }}
        >
          {countdown.label}
        </p>
      )}
      <div className="grid grid-cols-4 divide-x" style={{ borderColor }}>
        {units.map((unit) => (
          <div key={unit.label} className="px-2 sm:px-4 text-center" style={{ borderColor }}>
            <div
              className="text-2xl sm:text-3xl font-bold tabular-nums leading-none"
              style={{ fontFamily: 'var(--wish-display-font)', color: colors.ink }}
            >
              {unit.value}
            </div>
            <div className="mt-1 text-[11px] font-medium opacity-70">{unit.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
