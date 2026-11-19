import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MailOpen, Sparkles, X } from 'lucide-react';
import type { WishConfig } from '../types/wish';
import { getContrastTextColor, isHexColorDark } from '../utils/wishLogic';

interface Page3MessageProps {
  wish: WishConfig;
}

interface FloatingHeart {
  id: number;
  offsetX: number;
}

export function Page3Message({ wish }: Page3MessageProps) {
  const [poppedNote, setPoppedNote] = useState<{ index: number; text: string } | null>(null);
  const [loveCount, setLoveCount] = useState(0);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  const surfaceText = getContrastTextColor(wish.colors.surface);
  const darkSurface = isHexColorDark(wish.colors.surface);
  const accentText = getContrastTextColor(wish.colors.accent);

  const handleSendLove = () => {
    setLoveCount((c) => c + 1);
    const burst = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      offsetX: (Math.random() - 0.5) * 90,
    }));
    setHearts((prev) => [...prev.slice(-12), ...burst]);
  };

  return (
    <section
      className="relative z-10 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-5 py-12 transition-colors overflow-hidden"
      style={{
        backgroundColor: `${wish.colors.surface}ee`,
        color: surfaceText,
      }}
    >
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              backgroundColor: darkSurface ? 'rgba(255,255,255,0.08)' : 'rgba(15,9,6,0.06)',
              border: `1px solid ${wish.colors.secondary}55`,
              color: wish.colors.secondary,
            }}
          >
            <MailOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Personal Keepsake Notes</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl font-bold mb-3 text-balance"
            style={{
              fontFamily: 'var(--wish-display-font)',
              color: darkSurface ? wish.colors.secondary : wish.colors.ink,
            }}
          >
            {wish.messageTitle}
          </h2>
          <p className="text-sm opacity-75">Tap any note card to pop it open closer</p>
        </motion.div>

        {/* Wax-seal Greeting Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 170, damping: 18 }}
          className="relative max-w-xl mx-auto mb-8 px-6 py-4 rounded-2xl text-center shadow-lg"
          style={{
            backgroundColor: darkSurface ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)',
            border: `1.5px solid ${wish.colors.secondary}66`,
          }}
        >
          <span
            aria-hidden="true"
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: wish.colors.accent, color: accentText }}
          >
            <Heart className="w-4 h-4 fill-current" />
          </span>
          <p
            className="text-2xl sm:text-3xl font-bold pt-1"
            style={{
              fontFamily: 'var(--wish-display-font)',
              color: wish.colors.secondary,
            }}
          >
            {wish.messageGreeting}
          </p>
        </motion.div>

        {/* Staggered Floating Note Cards (anti-article layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {wish.messageParagraphs.map((para, idx) => {
            const tiltClass =
              wish.effects.animations
                ? idx % 2 === 0
                  ? 'animate-float-a'
                  : 'animate-float-b'
                : '';
            const spanFull =
              wish.messageParagraphs.length % 2 === 1 && idx === wish.messageParagraphs.length - 1;

            return (
              <div
                key={idx}
                className={`${tiltClass} ${
                  spanFull ? 'md:col-span-2 md:max-w-xl md:mx-auto w-full' : ''
                }`}
              >
                <motion.button
                  type="button"
                  onClick={() => setPoppedNote({ index: idx, text: para })}
                  initial={{ opacity: 0, y: 24, rotate: idx % 2 === 0 ? -2 : 2 }}
                  animate={{ opacity: 1, y: 0, rotate: idx % 2 === 0 ? -1 : 1 }}
                  whileHover={{ scale: 1.03, y: -6, rotate: 0 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: 'spring',
                    stiffness: 180,
                    damping: 17,
                    delay: idx * 0.1,
                  }}
                  className="group relative w-full text-left rounded-2xl p-6 sm:p-7 shadow-xl cursor-pointer overflow-hidden"
                  style={{
                    backgroundColor: darkSurface
                      ? 'rgba(255,255,255,0.07)'
                      : 'rgba(255,255,255,0.92)',
                    border: `1px solid ${wish.colors.secondary}55`,
                    color: darkSurface ? '#faf6f0' : wish.colors.ink,
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{
                      background: `linear-gradient(90deg, ${wish.colors.secondary}, ${wish.colors.accent})`,
                    }}
                  />
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: wish.colors.secondary }}
                    >
                      <Sparkles className="w-3 h-3" aria-hidden="true" />
                      <span>Note 0{idx + 1}</span>
                    </span>
                    <span className="text-[11px] font-medium opacity-55 group-hover:opacity-95 transition-opacity">
                      Tap to pop ↗
                    </span>
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed opacity-95">{para}</p>
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Floating Sign-off Stamp + Interactive Heart Reaction */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="relative max-w-md mx-auto mt-10 p-6 rounded-2xl text-center shadow-lg"
          style={{
            backgroundColor: darkSurface ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)',
            border: `1px solid ${wish.colors.secondary}44`,
          }}
        >
          {/* Floating hearts burst */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-4 flex justify-center">
            {hearts.map((h) => (
              <Heart
                key={h.id}
                className="animate-heart-up absolute w-5 h-5 fill-current"
                style={{
                  color: wish.colors.accent,
                  transform: `translateX(${h.offsetX}px)`,
                }}
              />
            ))}
          </div>

          <p className="text-sm opacity-75">{wish.messageSignOff}</p>
          <p
            className="text-2xl font-bold mt-1 mb-4"
            style={{
              fontFamily: 'var(--wish-display-font)',
              color: wish.colors.secondary,
            }}
          >
            {wish.senderName}
          </p>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleSendLove}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold cursor-pointer shadow-sm"
            style={{
              backgroundColor: wish.colors.accent,
              color: accentText,
            }}
          >
            <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>Send Love Back{loveCount > 0 ? ` (${loveCount})` : ''}</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Note Spotlight Pop-up Modal */}
      <AnimatePresence>
        {poppedNote && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Keepsake note ${poppedNote.index + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setPoppedNote(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-lg rounded-2xl p-7 sm:p-9 shadow-2xl"
              style={{
                backgroundColor: wish.colors.background,
                color: wish.colors.ink,
                border: `2px solid ${wish.colors.secondary}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close note pop-up"
                onClick={() => setPoppedNote(null)}
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
                style={{ backgroundColor: wish.colors.accent, color: accentText }}
              >
                <X className="w-4 h-4" />
              </button>

              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: wish.colors.secondary }}
              >
                Note 0{poppedNote.index + 1} · From {wish.senderName}
              </p>
              <p
                className="text-xl sm:text-2xl leading-relaxed font-medium"
                style={{ fontFamily: 'var(--wish-display-font)' }}
              >
                “{poppedNote.text}”
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
