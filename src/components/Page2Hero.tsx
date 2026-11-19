import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarHeart, Gift, Heart, PartyPopper, Sparkles } from 'lucide-react';
import type { WishConfig } from '../types/wish';
import { formatWishDate, getContrastTextColor, isHexColorDark } from '../utils/wishLogic';
import { HeroCountdown } from './HeroCountdown';

interface Page2HeroProps {
  wish: WishConfig;
  onCelebrate: () => void;
  onNext: () => void;
}

const SURPRISE_TOASTS = [
  'Wishing you endless joy & bright mornings!',
  'May every wish you whisper today come true!',
  'Cheers to laughter, magic, and unforgettable memories!',
  'Sending you the warmest hug & golden vibes!',
];

export function Page2Hero({ wish, onCelebrate, onNext }: Page2HeroProps) {
  const [toastIndex, setToastIndex] = useState<number | null>(null);
  const [cheersCount, setCheersCount] = useState(0);

  const formattedDate = formatWishDate(
    wish.celebrationDate,
    wish.dateDisplayFormat,
    wish.customDateLabel
  );
  const darkCanvas = isHexColorDark(wish.colors.background);
  const accentText = getContrastTextColor(wish.colors.accent);
  const ghostBorder = darkCanvas ? 'rgba(255,255,255,0.28)' : 'rgba(15,9,6,0.22)';
  const cardBg = darkCanvas ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.78)';
  const cardBorder = darkCanvas ? 'rgba(255,255,255,0.14)' : 'rgba(15,9,6,0.1)';

  const handlePopSurprise = () => {
    setToastIndex((prev) => (prev === null ? 0 : (prev + 1) % SURPRISE_TOASTS.length));
    setCheersCount((c) => c + 1);
    onCelebrate();
  };

  return (
    <section
      id="top"
      className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-5 sm:px-8 py-12 text-center overflow-hidden"
    >
      {/* Dynamic glowing aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full blur-3xl opacity-35"
        style={{
          background: `radial-gradient(circle, ${wish.colors.secondary}66 0%, ${wish.colors.accent}38 45%, transparent 72%)`,
        }}
      />

      <div className="relative z-10 max-w-5xl w-full mx-auto">
        {/* Floating desktop keepsake widgets flanking the hero */}
        <div className="hidden lg:block pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: -6 }}
            animate={{ opacity: 1, x: 0, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 0.15 }}
            className={`pointer-events-auto absolute left-2 top-8 w-52 p-3.5 rounded-2xl backdrop-blur-md shadow-lg text-left ${
              wish.effects.animations ? 'animate-float-a' : ''
            }`}
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${wish.colors.secondary}28`, color: wish.colors.secondary }}
              >
                <CalendarHeart className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                {wish.occasion} Edition
              </span>
            </div>
            <p
              className="text-sm font-bold leading-snug"
              style={{ fontFamily: 'var(--wish-display-font)', color: wish.colors.ink }}
            >
              {formattedDate || 'Special Celebration'}
            </p>
            <p className="text-xs opacity-70 mt-0.5">From {wish.senderName}</p>
          </motion.div>

          <motion.button
            type="button"
            onClick={handlePopSurprise}
            initial={{ opacity: 0, x: 30, rotate: 6 }}
            animate={{ opacity: 1, x: 0, rotate: 3 }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.25 }}
            className={`pointer-events-auto absolute right-2 top-12 w-56 p-3.5 rounded-2xl backdrop-blur-md shadow-lg text-left cursor-pointer ${
              wish.effects.animations ? 'animate-float-b' : ''
            }`}
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${wish.colors.accent}44`,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: wish.colors.accent }}>
                <Gift className="w-3.5 h-3.5" />
                <span>Surprise Pop-Up</span>
              </span>
              {cheersCount > 0 && (
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${wish.colors.accent}22`, color: wish.colors.accent }}
                >
                  +{cheersCount}
                </span>
              )}
            </div>
            <p className="text-xs font-medium opacity-90">
              Tap to pop a celebratory wish & confetti burst!
            </p>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase mb-5 shadow-xs"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${wish.colors.secondary}55`,
              color: wish.colors.secondary,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {formattedDate}
              {wish.heroEyebrow ? ` · ${wish.heroEyebrow}` : ''}
            </span>
          </div>

          {wish.heroPhotoUrl && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 190, damping: 18 }}
              className="mb-6 flex justify-center"
            >
              <div
                className={`p-2 rounded-2xl shadow-xl ${wish.effects.animations ? 'animate-gentle-bob' : ''}`}
                style={{
                  backgroundColor: cardBg,
                  border: `2px solid ${wish.colors.secondary}77`,
                }}
              >
                <img
                  src={wish.heroPhotoUrl}
                  alt={wish.recipientName}
                  referrerPolicy="no-referrer"
                  className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-xl"
                />
              </div>
            </motion.div>
          )}

          <h1
            aria-label={wish.recipientName}
            className="text-6xl sm:text-8xl font-black tracking-tight leading-none mb-5 text-balance"
            style={{
              fontFamily: 'var(--wish-display-font)',
              color: wish.colors.ink,
              textShadow: darkCanvas
                ? `0 10px 30px ${wish.colors.accent}33`
                : `0 10px 26px ${wish.colors.secondary}28`,
            }}
          >
            {wish.effects.animations
              ? Array.from(wish.recipientName).map((char, idx) => (
                  <span
                    key={`${char}-${idx}`}
                    aria-hidden="true"
                    className="animate-letter-jump"
                    style={{ ['--char-delay' as string]: `${idx * 0.12}s` }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))
              : wish.recipientName}
          </h1>

          <div
            aria-hidden="true"
            className="mx-auto mb-5 w-28 h-1 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${wish.colors.accent}, ${wish.colors.secondary}, transparent)`,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="relative overflow-hidden max-w-xl mx-auto mb-7 px-6 py-4 rounded-2xl backdrop-blur-sm shadow-sm"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
            }}
          >
            <p className="text-base sm:text-lg font-normal leading-relaxed opacity-95">
              {wish.heroTagline}
            </p>
          </motion.div>

          <HeroCountdown wish={wish} onReachedCelebration={onCelebrate} />

          {/* Interactive Surprise Pop-Up Toast */}
          <AnimatePresence mode="wait">
            {toastIndex !== null && (
              <motion.div
                key={toastIndex}
                role="status"
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="mb-6 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl shadow-md text-sm font-semibold"
                style={{
                  backgroundColor: wish.colors.surface,
                  color: getContrastTextColor(wish.colors.surface),
                  border: `1.5px solid ${wish.colors.secondary}`,
                }}
              >
                <Heart className="w-4 h-4 shrink-0" style={{ color: wish.colors.accent }} />
                <span>{SURPRISE_TOASTS[toastIndex]}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={handlePopSurprise}
              className="relative overflow-hidden inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-base cursor-pointer shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: wish.colors.accent,
                color: accentText,
              }}
            >
              <PartyPopper className="w-4 h-4" aria-hidden="true" />
              <span>Celebrate!</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="px-7 py-3.5 rounded-lg font-semibold text-base cursor-pointer backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                border: `1.5px solid ${ghostBorder}`,
                color: wish.colors.ink,
                backgroundColor: cardBg,
              }}
            >
              Read my message →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
