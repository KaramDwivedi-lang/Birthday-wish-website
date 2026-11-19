import type { CSSProperties } from 'react';
import type { WishConfig, WishPageNumber } from '../types/wish';
import { isHexColorDark } from '../utils/wishLogic';

interface CelebrationBackdropProps {
  wish: WishConfig;
  currentPage: WishPageNumber;
}

const BALLOONS = [
  { left: '4%', size: 46, duration: '17s', delay: '0s', colorKey: 'accent' as const },
  { left: '12%', size: 36, duration: '21s', delay: '-6s', colorKey: 'secondary' as const },
  { left: '84%', size: 48, duration: '19s', delay: '-3s', colorKey: 'secondary' as const },
  { left: '92%', size: 38, duration: '23s', delay: '-11s', colorKey: 'accent' as const },
  { left: '22%', size: 34, duration: '24s', delay: '-14s', colorKey: 'surface' as const },
  { left: '76%', size: 35, duration: '20s', delay: '-9s', colorKey: 'accent' as const },
];

const BUBBLES = [
  { left: '8%', size: 22, duration: '13s', delay: '-2s' },
  { left: '18%', size: 14, duration: '16s', delay: '-7s' },
  { left: '29%', size: 26, duration: '19s', delay: '-4s' },
  { left: '44%', size: 16, duration: '15s', delay: '-10s' },
  { left: '62%', size: 24, duration: '18s', delay: '-5s' },
  { left: '73%', size: 15, duration: '14s', delay: '-9s' },
  { left: '88%', size: 28, duration: '17s', delay: '-1s' },
  { left: '95%', size: 18, duration: '20s', delay: '-12s' },
];

const STARS = [
  { left: '10%', top: '18%', size: 18, delay: '0s', duration: '3.4s' },
  { left: '24%', top: '76%', size: 14, delay: '0.8s', duration: '4.1s' },
  { left: '38%', top: '14%', size: 12, delay: '1.5s', duration: '3.8s' },
  { left: '68%', top: '20%', size: 16, delay: '0.4s', duration: '3.5s' },
  { left: '82%', top: '72%', size: 20, delay: '1.2s', duration: '4.2s' },
  { left: '91%', top: '28%', size: 14, delay: '2.1s', duration: '3.9s' },
];

export function CelebrationBackdrop({ wish, currentPage }: CelebrationBackdropProps) {
  const { colors, effects } = wish;
  const darkSurface = currentPage === 3 ? isHexColorDark(colors.surface) : isHexColorDark(colors.background);

  return (
    <div
      data-testid="celebration-backdrop"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      {/* Rich layered celebratory gradients & atmospheric glows */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            currentPage === 3
              ? `radial-gradient(circle at 18% 22%, ${colors.secondary}26 0%, transparent 48%), radial-gradient(circle at 82% 78%, ${colors.accent}24 0%, transparent 50%)`
              : `radial-gradient(ellipse 68% 52% at 15% 20%, ${colors.secondary}2e 0%, transparent 62%), radial-gradient(ellipse 64% 54% at 86% 24%, ${colors.accent}24 0%, transparent 60%), radial-gradient(ellipse 72% 50% at 50% 94%, ${colors.secondary}30 0%, transparent 65%)`,
        }}
      />

      {/* Subtle decorative bokeh dot pattern */}
      <div
        className="absolute inset-0"
        style={{
          opacity: darkSurface ? 0.14 : 0.2,
          backgroundImage: `radial-gradient(${colors.secondary} 1.4px, transparent 1.4px), radial-gradient(${colors.accent} 1.2px, transparent 1.2px)`,
          backgroundSize: '56px 56px',
          backgroundPosition: '0 0, 28px 28px',
        }}
      />

      {effects.animations && (
        <>
          {/* Shimmering rising bubbles */}
          {BUBBLES.map((b, idx) => (
            <span
              key={`bubble-${idx}`}
              className="animate-bubble absolute -bottom-16 rounded-full"
              style={
                {
                  left: b.left,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  border: `1.5px solid ${idx % 2 === 0 ? colors.secondary : colors.accent}66`,
                  background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.65), ${
                    idx % 2 === 0 ? colors.secondary : colors.accent
                  }22)`,
                  '--duration': b.duration,
                  '--delay': b.delay,
                } as CSSProperties
              }
            />
          ))}

          {/* Floating celebration balloons */}
          {BALLOONS.map((balloon, idx) => {
            const fill =
              balloon.colorKey === 'surface'
                ? darkSurface
                  ? colors.secondary
                  : colors.surface
                : colors[balloon.colorKey];
            return (
              <div
                key={`balloon-${idx}`}
                className="animate-balloon absolute -bottom-32 opacity-0"
                style={
                  {
                    left: balloon.left,
                    width: `${balloon.size}px`,
                    '--duration': balloon.duration,
                    '--delay': balloon.delay,
                  } as CSSProperties
                }
              >
                <svg
                  viewBox="0 0 64 96"
                  fill="none"
                  className="w-full h-auto drop-shadow-sm"
                >
                  <ellipse cx="32" cy="30" rx="22" ry="26" fill={fill} fillOpacity="0.82" />
                  <ellipse cx="24" cy="21" rx="6" ry="9" fill="#ffffff" fillOpacity="0.32" transform="rotate(-18 24 21)" />
                  <polygon points="29,56 35,56 32,61" fill={fill} fillOpacity="0.85" />
                  <path
                    d="M32 61 Q26 72 34 80 T30 95"
                    stroke={fill}
                    strokeOpacity="0.55"
                    strokeWidth="1.6"
                    fill="none"
                  />
                </svg>
              </div>
            );
          })}

          {/* Twinkling four-point stars */}
          {STARS.map((star, idx) => (
            <svg
              key={`star-${idx}`}
              viewBox="0 0 24 24"
              className="animate-twinkle absolute"
              style={
                {
                  left: star.left,
                  top: star.top,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  color: idx % 2 === 0 ? colors.secondary : colors.accent,
                  '--duration': star.duration,
                  '--delay': star.delay,
                } as CSSProperties
              }
            >
              <path
                fill="currentColor"
                d="M12 1L14.6 9.4L23 12L14.6 14.6L12 23L9.4 14.6L1 12L9.4 9.4L12 1Z"
              />
            </svg>
          ))}
        </>
      )}
    </div>
  );
}
