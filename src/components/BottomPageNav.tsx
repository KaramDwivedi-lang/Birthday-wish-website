import { Music, Volume2, VolumeX } from 'lucide-react';
import { MUSIC_TRACKS } from '../data/presets';
import type { WishConfig, WishPageNumber } from '../types/wish';
import { isHexColorDark } from '../utils/wishLogic';

interface BottomPageNavProps {
  wish: WishConfig;
  currentPage: WishPageNumber;
  isUnlocked: boolean;
  isEditing: boolean;
  musicPlaying: boolean;
  onToggleMusic: () => void;
  onSelectMusicTrack: (trackId: string) => void;
  onSelectPage: (page: WishPageNumber) => void;
}

export function BottomPageNav({
  wish,
  currentPage,
  isUnlocked,
  isEditing,
  musicPlaying,
  onToggleMusic,
  onSelectMusicTrack,
  onSelectPage,
}: BottomPageNavProps) {
  const darkCanvas = isHexColorDark(wish.colors.background);
  const borderColor = darkCanvas ? 'rgba(255,255,255,0.14)' : 'rgba(15,9,6,0.14)';
  const minPage: WishPageNumber = isUnlocked && !isEditing ? 2 : 1;
  const canGoBack = currentPage > minPage;
  const canGoNext = currentPage < 5 && (isUnlocked || isEditing);

  return (
    <nav
      aria-label="Page step navigation"
      className="sticky bottom-0 z-20 flex flex-col px-4 sm:px-8 pt-2.5 pb-2 backdrop-blur-md"
      style={{
        backgroundColor: darkCanvas ? 'rgba(11, 16, 32, 0.92)' : 'rgba(250, 246, 240, 0.92)',
        borderTop: `1px solid ${borderColor}`,
        color: wish.colors.ink,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => onSelectPage(Math.max(1, currentPage - 1) as WishPageNumber)}
          className="px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:underline underline-offset-4"
        >
          ← Back
        </button>

        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="flex items-center gap-2 shrink-0" aria-label={`Page ${currentPage} of 5`}>
            {([1, 2, 3, 4, 5] as WishPageNumber[]).map((p) => {
              const active = currentPage === p;
              const disabled = p > 1 && !isUnlocked && !isEditing;
              return (
                <button
                  key={p}
                  type="button"
                  disabled={disabled}
                  aria-label={`Go to page ${p}`}
                  onClick={() => onSelectPage(p)}
                  className="p-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span
                    className="block rounded-full transition-all"
                    style={{
                      width: active ? '22px' : '8px',
                      height: '8px',
                      backgroundColor: active ? wish.colors.accent : wish.colors.ink,
                      opacity: active ? 1 : 0.25,
                    }}
                  />
                </button>
              );
            })}
          </div>

          {wish.effects.sound && (
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                data-music-toggle="true"
                onClick={onToggleMusic}
                aria-label={musicPlaying ? 'Mute background music' : 'Play background music'}
                aria-pressed={musicPlaying}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-opacity opacity-90 hover:opacity-100 whitespace-nowrap shrink-0"
                style={{
                  border: `1px solid ${borderColor}`,
                  color: wish.colors.ink,
                }}
              >
                {musicPlaying ? (
                  <Volume2 className="w-3.5 h-3.5" style={{ color: wish.colors.accent }} aria-hidden="true" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{musicPlaying ? 'Music On' : 'Music Off'}</span>
              </button>

              <div
                className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                style={{
                  border: `1px solid ${borderColor}`,
                  color: wish.colors.ink,
                }}
              >
                <Music className="w-3 h-3 opacity-70 shrink-0" aria-hidden="true" />
                <select
                  aria-label="Choose background music"
                  value={wish.effects.musicTrackId}
                  onChange={(e) => onSelectMusicTrack(e.target.value)}
                  className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer max-w-[220px] truncate"
                  style={{ color: wish.colors.ink }}
                >
                  {MUSIC_TRACKS.map((track) => (
                    <option
                      key={track.id}
                      value={track.id}
                      style={{
                        backgroundColor: darkCanvas ? '#141b33' : '#faf6f0',
                        color: darkCanvas ? '#f8f5ef' : '#0f3d3c',
                      }}
                    >
                      {track.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => onSelectPage(Math.min(5, currentPage + 1) as WishPageNumber)}
          className="px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:underline underline-offset-4"
        >
          Next →
        </button>
      </div>

      <p
        data-testid="creator-tag-mark"
        className="mt-1 text-center text-[11px] font-medium tracking-wider opacity-70"
      >
        ✦ Made by Karam Dwivedi
      </p>
    </nav>
  );
}
