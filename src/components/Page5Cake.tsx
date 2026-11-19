import { useEffect, useState } from 'react';
import type { WishConfig } from '../types/wish';
import { getBannerFont, getContrastTextColor, isHexColorDark } from '../utils/wishLogic';

interface Page5CakeProps {
  wish: WishConfig;
  onBlowCelebration: () => void;
  onReplay: () => void;
  onCustomizeCopy: () => void;
}

export function Page5Cake({
  wish,
  onBlowCelebration,
  onReplay,
  onCustomizeCopy,
}: Page5CakeProps) {
  const [litCandles, setLitCandles] = useState<boolean[]>(() =>
    Array.from({ length: wish.candleCount }, () => true)
  );
  const [wished, setWished] = useState(false);

  useEffect(() => {
    setLitCandles(Array.from({ length: wish.candleCount }, () => true));
    setWished(false);
  }, [wish.candleCount]);

  const allLit = litCandles.length > 0 && litCandles.every(Boolean);
  const accentText = getContrastTextColor(wish.colors.accent);
  const surfaceText = getContrastTextColor(wish.colors.surface);
  const darkCanvas = isHexColorDark(wish.colors.background);
  const bannerFont = getBannerFont(wish.cakeBanner.fontId);

  const toggleCandle = (index: number) => {
    setLitCandles((prev) => prev.map((lit, idx) => (idx === index ? !lit : lit)));
  };

  const handleBlowCandles = () => {
    setLitCandles((prev) => prev.map(() => false));
    setWished(true);
    onBlowCelebration();
  };

  const handleRelight = () => {
    setLitCandles(Array.from({ length: wish.candleCount }, () => true));
    setWished(false);
  };

  return (
    <section className="relative z-10 min-h-[calc(100vh-140px)] flex flex-col justify-between">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center max-w-3xl mx-auto w-full">
        <h2
          className="text-3xl sm:text-5xl font-bold mb-3 text-balance"
          style={{
            fontFamily: 'var(--wish-display-font)',
            color: wish.colors.ink,
          }}
        >
          {wish.wishTitle}
        </h2>
        <p className="text-base sm:text-lg opacity-80 mb-8">{wish.wishSubtitle}</p>

        {wish.cakeBanner.enabled && (
          <div
            data-testid="cake-hanging-banner"
            className={`relative w-full max-w-xl mx-auto mb-6 select-none ${
              wish.effects.animations ? 'animate-gentle-bob' : ''
            }`}
          >
            {/* Hanging suspension cords & festive garland */}
            <svg
              aria-hidden="true"
              viewBox="0 0 560 46"
              className="w-full h-11 overflow-visible block"
            >
              <line
                x1="96"
                y1="0"
                x2="145"
                y2="44"
                stroke={wish.colors.secondary}
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />
              <line
                x1="464"
                y1="0"
                x2="415"
                y2="44"
                stroke={wish.colors.secondary}
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />
              <path
                d="M18,6 Q140,34 280,14 Q420,34 542,6"
                fill="none"
                stroke={wish.colors.secondary}
                strokeWidth="2"
                opacity="0.7"
              />
              <polygon points="48,15 62,19 52,31" fill={wish.colors.accent} opacity="0.88" />
              <polygon points="104,23 118,24 109,36" fill={wish.colors.secondary} opacity="0.92" />
              <polygon points="456,23 442,24 451,36" fill={wish.colors.secondary} opacity="0.92" />
              <polygon points="512,15 498,19 508,31" fill={wish.colors.accent} opacity="0.88" />
              <circle cx="96" cy="4" r="4" fill={wish.colors.secondary} />
              <circle cx="464" cy="4" r="4" fill={wish.colors.secondary} />
            </svg>

            {/* Oversized 3D extruded banner plaque wider than the cake */}
            <div className="relative mx-auto px-3 sm:px-6" style={{ perspective: '900px' }}>
              {/* Side 3D folded ribbon tails */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute left-0 top-3.5 w-10 h-12 rounded-l-sm -z-10 opacity-85"
                style={{
                  backgroundColor: wish.cakeBanner.backgroundColor,
                  filter: 'brightness(0.76)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 28% 50%)',
                }}
              />
              <div
                aria-hidden="true"
                className="hidden sm:block absolute right-0 top-3.5 w-10 h-12 rounded-r-sm -z-10 opacity-85"
                style={{
                  backgroundColor: wish.cakeBanner.backgroundColor,
                  filter: 'brightness(0.76)',
                  clipPath: 'polygon(0 0, 100% 0, 72% 50%, 100% 100%, 0 100%)',
                }}
              />

              {/* 3D depth backplate */}
              <div
                aria-hidden="true"
                className="absolute inset-x-4 sm:inset-x-7 top-2 -bottom-2 rounded-2xl -z-10"
                style={{
                  backgroundColor: wish.cakeBanner.backgroundColor,
                  filter: 'brightness(0.55)',
                  transform: 'rotateX(8deg)',
                  boxShadow: '0 22px 38px -12px rgba(15, 9, 6, 0.42)',
                }}
              />

              {/* Front 3D banner plaque */}
              <div
                className="relative px-7 py-5 sm:px-10 sm:py-6 rounded-2xl border-2"
                style={{
                  backgroundColor: wish.cakeBanner.backgroundColor,
                  borderColor: `${wish.colors.secondary}cc`,
                  transform: 'rotateX(6deg)',
                  boxShadow: `inset 0 2px 0 rgba(255,255,255,0.28), inset 0 -4px 10px rgba(0,0,0,0.2)`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 left-3.5 text-sm opacity-80"
                  style={{ color: wish.colors.secondary }}
                >
                  ✦
                </span>
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 right-3.5 text-sm opacity-80"
                  style={{ color: wish.colors.secondary }}
                >
                  ✦
                </span>

                <p
                  className="text-2xl sm:text-4xl font-bold leading-snug text-balance"
                  style={{
                    fontFamily: bannerFont.fontFamily,
                    color: wish.cakeBanner.textColor,
                    textShadow: '0 3px 0 rgba(0,0,0,0.22), 0 8px 18px rgba(0,0,0,0.18)',
                  }}
                >
                  {wish.cakeBanner.text}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="my-2 px-10 py-8 rounded-2xl inline-flex flex-col items-center shadow-sm"
          style={{
            backgroundColor: darkCanvas ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.65)',
            border: `1px solid ${wish.colors.secondary}44`,
          }}
        >
          <div className="flex items-end justify-center gap-6 mb-1.5">
            {litCandles.map((lit, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Candle ${index + 1}`}
                aria-pressed={lit}
                onClick={() => toggleCandle(index)}
                className="relative w-3 h-10 rounded-t cursor-pointer transition-transform hover:scale-y-105 focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{
                  background: `linear-gradient(to right, ${wish.colors.secondary}, #f5d08a)`,
                }}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -top-5 left-1/2 w-3.5 h-5 rounded-full transition-all duration-300 ${
                    lit ? 'opacity-100 scale-100 animate-flicker' : 'opacity-0 scale-0 -translate-x-1/2'
                  }`}
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 80%, #ff6b35 0%, #ffd166 45%, transparent 75%)',
                  }}
                />
              </button>
            ))}
          </div>

          <div className="w-56 flex flex-col items-center">
            <div
              className="h-7 w-full rounded-t-xl relative"
              style={{ backgroundColor: wish.colors.accent }}
            />
            <div className="w-full h-12 bg-[#f5ebe0]" />
            <div
              className="w-[92%] h-11"
              style={{ backgroundColor: wish.colors.secondary }}
            />
            <div
              className="w-[84%] h-10 rounded-b-lg"
              style={{ backgroundColor: wish.colors.surface }}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={!allLit}
            onClick={handleBlowCandles}
            className="px-7 py-3.5 rounded-md font-semibold text-base cursor-pointer transition-transform hover:-translate-y-0.5 disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: wish.colors.accent,
              color: accentText,
            }}
          >
            Blow out the candles
          </button>

          {!allLit && (
            <button
              type="button"
              onClick={handleRelight}
              className="px-5 py-3.5 rounded-md font-medium text-sm cursor-pointer border transition-colors"
              style={{
                borderColor: darkCanvas ? 'rgba(255,255,255,0.22)' : 'rgba(15,9,6,0.2)',
                color: wish.colors.ink,
              }}
            >
              Relight candles
            </button>
          )}
        </div>

        {wished && (
          <div className="mt-8 max-w-lg animate-card-in">
            <p
              className="animate-gentle-bob text-xl sm:text-2xl font-semibold text-balance"
              style={{
                fontFamily: 'var(--wish-display-font)',
                color: wish.colors.accent,
              }}
            >
              {wish.wishResultText}
            </p>
          </div>
        )}
      </div>

      <footer
        className="w-full px-6 py-8 text-center"
        style={{
          backgroundColor: wish.colors.surface,
          color: surfaceText,
        }}
      >
        <p className="text-sm opacity-80">{wish.footerText}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
          <button
            type="button"
            onClick={onReplay}
            className="text-sm font-medium underline underline-offset-4 cursor-pointer opacity-90 hover:opacity-100"
            style={{ color: wish.colors.secondary }}
          >
            Start over from the beginning
          </button>
          <button
            type="button"
            onClick={onCustomizeCopy}
            className="text-sm font-medium underline underline-offset-4 cursor-pointer opacity-90 hover:opacity-100"
            style={{ color: surfaceText }}
          >
            Customize or make your own wish
          </button>
        </div>
        <p className="mt-4 text-xs tracking-wider opacity-70">✦ Made by Karam Dwivedi</p>
      </footer>
    </section>
  );
}
