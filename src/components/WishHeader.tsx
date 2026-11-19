import type { WishConfig, WishPageNumber } from '../types/wish';
import { getContrastTextColor, isHexColorDark } from '../utils/wishLogic';

interface WishHeaderProps {
  wish: WishConfig;
  currentPage: WishPageNumber;
  isUnlocked: boolean;
  isEditing: boolean;
  onSelectPage: (page: WishPageNumber) => void;
  onToggleEditor: () => void;
}

const PAGE_ITEMS: { page: WishPageNumber; label: string }[] = [
  { page: 1, label: '1. Gate' },
  { page: 2, label: '2. Welcome' },
  { page: 3, label: '3. Letter' },
  { page: 4, label: '4. Memories' },
  { page: 5, label: '5. Wish' },
];

export function WishHeader({
  wish,
  currentPage,
  isUnlocked,
  isEditing,
  onSelectPage,
  onToggleEditor,
}: WishHeaderProps) {
  const darkCanvas = isHexColorDark(wish.colors.background);
  const borderColor = darkCanvas ? 'rgba(255,255,255,0.12)' : 'rgba(15,9,6,0.1)';
  const accentText = getContrastTextColor(wish.colors.accent);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 backdrop-blur-md transition-colors"
      style={{
        backgroundColor: darkCanvas ? 'rgba(11, 16, 32, 0.88)' : 'rgba(250, 246, 240, 0.88)',
        borderBottom: `1px solid ${borderColor}`,
        color: wish.colors.ink,
      }}
    >
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectPage(isUnlocked ? 2 : 1);
        }}
        className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 rounded"
        style={{ fontFamily: 'var(--wish-display-font)', color: wish.colors.ink }}
      >
        For {wish.recipientName}
      </a>

      <nav className="hidden md:flex items-center gap-6" aria-label="Wish pages">
        {PAGE_ITEMS.map((item) => {
          const disabled = item.page > 1 && !isUnlocked && !isEditing;
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPage(item.page)}
              className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 transition-opacity cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-4 rounded ${
                active ? 'underline underline-offset-8' : 'opacity-75 hover:opacity-100'
              }`}
              style={{
                color: active ? wish.colors.accent : wish.colors.ink,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onToggleEditor}
          className="px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            backgroundColor: wish.colors.accent,
            color: accentText,
          }}
        >
          {isEditing ? 'Done Editing' : 'Customize'}
        </button>
      </div>
    </header>
  );
}
