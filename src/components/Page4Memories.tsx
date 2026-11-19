import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Heart, Play, Sparkles, X, ZoomIn } from 'lucide-react';
import { MEMORY_GRADIENTS } from '../data/presets';
import type { WishConfig } from '../types/wish';
import { getContrastTextColor, isHexColorDark } from '../utils/wishLogic';

interface Page4MemoriesProps {
  wish: WishConfig;
}

const POLAROID_TILTS = [-2.2, 1.8, -1.5, 2.3];

export function Page4Memories({ wish }: Page4MemoriesProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const darkCanvas = isHexColorDark(wish.colors.background);
  const cardBorder = darkCanvas ? 'rgba(255,255,255,0.16)' : 'rgba(15,9,6,0.12)';
  const accentText = getContrastTextColor(wish.colors.accent);

  const selectedMemory =
    selectedIndex !== null && wish.memories[selectedIndex] ? wish.memories[selectedIndex] : null;

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) =>
          prev === null ? 0 : (prev + 1) % Math.max(1, wish.memories.length)
        );
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev === null
            ? 0
            : (prev - 1 + wish.memories.length) % Math.max(1, wish.memories.length)
        );
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex, wish.memories.length]);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="relative z-10 min-h-[calc(100vh-140px)] px-5 sm:px-8 py-14 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              backgroundColor: darkCanvas ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${wish.colors.secondary}55`,
              color: wish.colors.secondary,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Interactive Polaroid Keepsakes</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl font-bold mb-3 text-balance"
            style={{
              fontFamily: 'var(--wish-display-font)',
              color: wish.colors.ink,
            }}
          >
            {wish.memoriesTitle}
          </h2>
          <p className="text-base sm:text-lg opacity-80">{wish.memoriesSubtitle}</p>

          {wish.memories.length > 0 && (
            <div className="mt-5 flex justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedIndex(0)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer shadow-sm"
                style={{
                  backgroundColor: wish.colors.accent,
                  color: accentText,
                }}
              >
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Pop Open Memory Deck</span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {wish.memories.length === 0 ? (
          <div
            className="max-w-md mx-auto text-center rounded-2xl p-10 opacity-75"
            style={{ border: `1px solid ${cardBorder}` }}
          >
            <p className="text-sm">No memories added yet. Open Customize to add photos and stories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-2">
            {wish.memories.map((memory, idx) => {
              const gradient = MEMORY_GRADIENTS[memory.gradientIndex % MEMORY_GRADIENTS.length];
              const tilt = POLAROID_TILTS[idx % POLAROID_TILTS.length];
              const floatClass = wish.effects.animations
                ? idx % 2 === 0
                  ? 'animate-float-a'
                  : 'animate-float-b'
                : '';
              const liked = Boolean(likedIds[memory.id]);

              return (
                <div key={memory.id} className={floatClass}>
                  <motion.article
                    initial={{ opacity: 0, y: 28, rotate: tilt * 1.4, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
                    whileHover={{ y: -10, rotate: 0, scale: 1.03 }}
                    transition={{
                      type: 'spring',
                      stiffness: 185,
                      damping: 17,
                      delay: idx * 0.08,
                    }}
                    className="group relative flex flex-col h-full rounded-xl p-3 pb-5 shadow-xl"
                    style={{
                      border: `1px solid ${cardBorder}`,
                      backgroundColor: darkCanvas ? 'rgba(20, 27, 51, 0.9)' : '#ffffff',
                    }}
                  >
                    {/* Decorative washi tape accent */}
                    <span
                      aria-hidden="true"
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 rounded-xs opacity-80 shadow-xs"
                      style={{
                        backgroundColor: idx % 2 === 0 ? wish.colors.secondary : wish.colors.accent,
                        transform: `rotate(${idx % 2 === 0 ? -3 : 3}deg)`,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      aria-label={`View memory: ${memory.title}`}
                      className="relative h-48 w-full rounded-lg overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {memory.imageUrl ? (
                        <img
                          src={memory.imageUrl}
                          alt={memory.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-end p-4"
                          style={{ background: gradient }}
                        >
                          <span className="text-xs font-medium text-white/90 tracking-wide">
                            {memory.date || 'Keepsake Moment'}
                          </span>
                        </div>
                      )}
                      <span
                        className="absolute right-2.5 bottom-2.5 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-hidden="true"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Pop</span>
                      </span>
                    </button>

                    <div className="pt-4 px-1.5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        {memory.date ? (
                          <p
                            className="text-[11px] font-semibold tracking-wider uppercase"
                            style={{ color: wish.colors.secondary }}
                          >
                            {memory.date}
                          </p>
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => toggleLike(memory.id)}
                          aria-label={`Favorite memory ${memory.title}`}
                          aria-pressed={liked}
                          className="p-1 rounded-full cursor-pointer transition-transform hover:scale-125"
                          style={{ color: liked ? wish.colors.accent : wish.colors.ink }}
                        >
                          <Heart
                            className={`w-4 h-4 ${liked ? 'fill-current opacity-100' : 'opacity-35 hover:opacity-80'}`}
                          />
                        </button>
                      </div>
                      <h3
                        className="text-xl font-bold mb-1.5 leading-snug"
                        style={{
                          fontFamily: 'var(--wish-display-font)',
                          color: wish.colors.ink,
                        }}
                      >
                        {memory.title}
                      </h3>
                      <p className="text-sm opacity-80 leading-relaxed">{memory.caption}</p>
                    </div>
                  </motion.article>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMemory && selectedIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={selectedMemory.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              key={selectedMemory.id}
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
              style={{
                backgroundColor: wish.colors.background,
                color: wish.colors.ink,
                border: `2px solid ${wish.colors.secondary}66`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close memory lightbox"
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/65 text-white flex items-center justify-center hover:bg-black/85 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {selectedMemory.imageUrl ? (
                <img
                  src={selectedMemory.imageUrl}
                  alt={selectedMemory.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[58vh] object-cover"
                />
              ) : (
                <div
                  className="w-full h-64"
                  style={{
                    background:
                      MEMORY_GRADIENTS[selectedMemory.gradientIndex % MEMORY_GRADIENTS.length],
                  }}
                />
              )}

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  {selectedMemory.date && (
                    <p
                      className="text-xs font-semibold tracking-wider uppercase"
                      style={{ color: wish.colors.secondary }}
                    >
                      {selectedMemory.date}
                    </p>
                  )}
                  <span className="text-xs opacity-60">
                    {selectedIndex + 1} of {wish.memories.length}
                  </span>
                </div>
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ fontFamily: 'var(--wish-display-font)' }}
                >
                  {selectedMemory.title}
                </h3>
                <p className="text-base opacity-85 leading-relaxed">{selectedMemory.caption}</p>

                {wish.memories.length > 1 && (
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-black/10">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIndex(
                          (selectedIndex - 1 + wish.memories.length) % wish.memories.length
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer hover:opacity-80"
                      style={{ borderColor: cardBorder }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedIndex((selectedIndex + 1) % wish.memories.length)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                      style={{ backgroundColor: wish.colors.accent, color: accentText }}
                    >
                      <span>Next Memory</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
