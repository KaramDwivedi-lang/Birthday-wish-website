import { useState, type ChangeEvent } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Lock,
  Music,
  Palette,
  Plus,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import {
  BANNER_FONTS,
  BANNER_SUGGESTIONS,
  FONT_PAIRS,
  MUSIC_TRACKS,
  THEME_PRESETS,
} from '../data/presets';
import type {
  DateDisplayFormat,
  MemoryItem,
  ThemePreset,
  WishConfig,
  WishPageNumber,
} from '../types/wish';
import { compressImageFile } from '../utils/imageUpload';

export type EditorTab = 'basics' | 'message' | 'pictures' | 'style';

export interface SavedUserStylePreferences {
  themeId: string;
  colors: WishConfig['colors'];
  fontPairId: string;
  effects: WishConfig['effects'];
}

interface EditorSidebarProps {
  wish: WishConfig;
  activeTab: EditorTab;
  savedStyleNotice: string;
  onTabChange: (tab: EditorTab) => void;
  onJumpPage: (page: WishPageNumber) => void;
  onChangeWish: (updater: (prev: WishConfig) => WishConfig) => void;
  onSaveStylePreferences: (prefs: SavedUserStylePreferences) => void;
  onApplySavedStylePreferences: () => void;
  hasSavedStylePreferences: boolean;
  onSelectMusicTrack: (trackId: string) => void;
  onOpenShare: () => void;
  onResetDefault: () => void;
  onClose: () => void;
}

const OCCASION_OPTIONS = [
  'Birthday',
  'Anniversary',
  'Congratulations',
  'Thank You',
  'Friendship',
  'Wedding',
  'Graduation',
];

export function EditorSidebar({
  wish,
  activeTab,
  savedStyleNotice,
  onTabChange,
  onJumpPage,
  onChangeWish,
  onSaveStylePreferences,
  onApplySavedStylePreferences,
  hasSavedStylePreferences,
  onSelectMusicTrack,
  onOpenShare,
  onResetDefault,
  onClose,
}: EditorSidebarProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const updateField = <K extends keyof WishConfig>(key: K, value: WishConfig[K]) => {
    onChangeWish((prev) => {
      if (key === 'recipientName' && typeof value === 'string') {
        const oldName = prev.recipientName.trim();
        const newName = value.trim();
        let nextGreeting = prev.messageGreeting;
        let nextResult = prev.wishResultText;
        if (oldName && newName) {
          if (nextGreeting.includes(oldName)) {
            nextGreeting = nextGreeting.split(oldName).join(newName);
          }
          if (nextResult.includes(oldName)) {
            nextResult = nextResult.split(oldName).join(newName);
          }
        }
        return {
          ...prev,
          recipientName: value,
          messageGreeting: nextGreeting,
          wishResultText: nextResult,
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const applyPresetTheme = (preset: ThemePreset) => {
    const nextColors = { ...preset.colors };
    onChangeWish((prev) => ({
      ...prev,
      themeId: preset.id,
      colors: nextColors,
    }));
    onSaveStylePreferences({
      themeId: preset.id,
      colors: nextColors,
      fontPairId: wish.fontPairId,
      effects: wish.effects,
    });
  };

  const updateColor = (colorKey: keyof WishConfig['colors'], hex: string) => {
    onChangeWish((prev) => {
      const nextColors = { ...prev.colors, [colorKey]: hex };
      onSaveStylePreferences({
        themeId: 'custom',
        colors: nextColors,
        fontPairId: prev.fontPairId,
        effects: prev.effects,
      });
      return {
        ...prev,
        themeId: 'custom',
        colors: nextColors,
      };
    });
  };

  const selectFontPair = (fontPairId: string) => {
    onChangeWish((prev) => {
      onSaveStylePreferences({
        themeId: prev.themeId,
        colors: prev.colors,
        fontPairId,
        effects: prev.effects,
      });
      return { ...prev, fontPairId };
    });
  };

  const handleHeroPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await compressImageFile(file, 720, 0.84);
      updateField('heroPhotoUrl', dataUrl);
      onJumpPage(2);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      e.target.value = '';
    }
  };

  const handleMemoryPhotoUpload = async (memoryId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await compressImageFile(file, 960, 0.82);
      onChangeWish((prev) => ({
        ...prev,
        memories: prev.memories.map((m) =>
          m.id === memoryId ? { ...m, imageUrl: dataUrl } : m
        ),
      }));
      onJumpPage(4);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Photo upload failed.');
    } finally {
      e.target.value = '';
    }
  };

  const updateMemory = (id: string, patch: Partial<MemoryItem>) => {
    onChangeWish((prev) => ({
      ...prev,
      memories: prev.memories.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  const addMemory = () => {
    const nextIndex = wish.memories.length;
    const newItem: MemoryItem = {
      id: `mem-${Date.now().toString(36)}`,
      title: 'A new moment',
      date: '2026',
      caption: 'Write a short memory or inside joke here.',
      imageUrl: '',
      gradientIndex: nextIndex % 4,
    };
    onChangeWish((prev) => ({ ...prev, memories: [...prev.memories, newItem] }));
    onJumpPage(4);
  };

  const removeMemory = (id: string) => {
    onChangeWish((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== id),
    }));
  };

  const handleTabSwitch = (tab: EditorTab) => {
    onTabChange(tab);
    if (tab === 'basics') onJumpPage(1);
    if (tab === 'message') onJumpPage(3);
    if (tab === 'pictures') onJumpPage(4);
  };

  return (
    <aside
      aria-label="Wish Customizer Studio"
      className="w-full lg:w-[420px] xl:w-[450px] shrink-0 bg-white text-slate-900 border-r border-slate-200 flex flex-col lg:h-[calc(100vh-61px)] lg:sticky lg:top-[61px] z-20"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Customize This Wish</h2>
          <p className="text-xs text-slate-500">Live changes update the preview instantly</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close customize panel"
          className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Customization categories"
        className="grid grid-cols-4 gap-1 p-1.5 bg-slate-100 border-b border-slate-200"
      >
        {(
          [
            { id: 'basics', label: 'Details', Icon: Lock },
            { id: 'message', label: 'Message', Icon: Type },
            { id: 'pictures', label: 'Photos', Icon: ImagePlus },
            { id: 'style', label: 'Theme', Icon: Palette },
          ] as const
        ).map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleTabSwitch(id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                active
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'basics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-recipient" className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient name
                </label>
                <input
                  id="edit-recipient"
                  type="text"
                  value={wish.recipientName}
                  onChange={(e) => updateField('recipientName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-2 focus:outline-slate-900"
                />
              </div>
              <div>
                <label htmlFor="edit-sender" className="block text-xs font-semibold text-slate-700 mb-1">
                  Your name / sign-off
                </label>
                <input
                  id="edit-sender"
                  type="text"
                  value={wish.senderName}
                  onChange={(e) => updateField('senderName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-2 focus:outline-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-occasion" className="block text-xs font-semibold text-slate-700 mb-1">
                Occasion
              </label>
              <select
                id="edit-occasion"
                value={OCCASION_OPTIONS.includes(wish.occasion) ? wish.occasion : 'Custom'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== 'Custom') updateField('occasion', val);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-2 focus:outline-slate-900"
              >
                {OCCASION_OPTIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
                <option value="Custom">Custom occasion</option>
              </select>
              {!OCCASION_OPTIONS.includes(wish.occasion) && (
                <input
                  type="text"
                  aria-label="Custom occasion name"
                  value={wish.occasion}
                  onChange={(e) => updateField('occasion', e.target.value)}
                  placeholder="e.g., Retirement, Farewell"
                  className="mt-2 w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Celebration Date
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-date" className="block text-xs font-medium text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    id="edit-date"
                    type="date"
                    value={wish.celebrationDate}
                    onChange={(e) => updateField('celebrationDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="edit-date-format" className="block text-xs font-medium text-slate-700 mb-1">
                    Date style
                  </label>
                  <select
                    id="edit-date-format"
                    value={wish.dateDisplayFormat}
                    onChange={(e) =>
                      updateField('dateDisplayFormat', e.target.value as DateDisplayFormat)
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    <option value="full">November 19, 2026</option>
                    <option value="month-day">November 19</option>
                    <option value="short">Nov 19, 2026</option>
                    <option value="custom">Custom label</option>
                  </select>
                </div>
              </div>
              {wish.dateDisplayFormat === 'custom' && (
                <input
                  type="text"
                  aria-label="Custom date text"
                  value={wish.customDateLabel}
                  onChange={(e) => updateField('customDateLabel', e.target.value)}
                  placeholder="e.g., Golden Jubilee · Autumn 2026"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Hero Countdown Timer
                  </h3>
                  <p className="text-xs text-slate-500">Triggers confetti celebration at target time</p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={wish.countdown.enabled}
                    onChange={(e) =>
                      updateField('countdown', { ...wish.countdown, enabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-slate-900 rounded"
                  />
                  <span>{wish.countdown.enabled ? 'Visible' : 'Hidden'}</span>
                </label>
              </div>

              {wish.countdown.enabled && (
                <div className="space-y-2.5">
                  <div>
                    <label
                      htmlFor="edit-countdown-target"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Target date & time
                    </label>
                    <input
                      id="edit-countdown-target"
                      type="datetime-local"
                      value={wish.countdown.targetDateTime.slice(0, 16)}
                      onChange={(e) =>
                        updateField('countdown', {
                          ...wish.countdown,
                          targetDateTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-countdown-label"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Countdown label
                    </label>
                    <input
                      id="edit-countdown-label"
                      type="text"
                      value={wish.countdown.label}
                      onChange={(e) =>
                        updateField('countdown', { ...wish.countdown, label: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-countdown-reached"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Celebration message when reached
                    </label>
                    <input
                      id="edit-countdown-reached"
                      type="text"
                      value={wish.countdown.reachedText}
                      onChange={(e) =>
                        updateField('countdown', { ...wish.countdown, reachedText: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const future = new Date(Date.now() + 5000);
                      const pad = (n: number) => String(n).padStart(2, '0');
                      const localIso = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(
                        future.getDate()
                      )}T${pad(future.getHours())}:${pad(future.getMinutes())}:${pad(
                        future.getSeconds()
                      )}`;
                      updateField('countdown', { ...wish.countdown, targetDateTime: localIso });
                      onJumpPage(2);
                    }}
                    className="w-full py-1.5 px-3 rounded-md border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    Preview 5s Countdown Finale
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Password Gate
                  </h3>
                  <p className="text-xs text-slate-500">Protect the opening page with a secret word</p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={wish.passwordEnabled}
                    onChange={(e) => updateField('passwordEnabled', e.target.checked)}
                    className="w-4 h-4 accent-slate-900 rounded"
                  />
                  <span>{wish.passwordEnabled ? 'Locked' : 'Open'}</span>
                </label>
              </div>

              {wish.passwordEnabled && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="edit-password" className="block text-xs font-medium text-slate-700 mb-1">
                      Secret word / password
                    </label>
                    <div className="relative">
                      <input
                        id="edit-password"
                        type={showPassword ? 'text' : 'password'}
                        value={wish.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? 'Hide secret password' : 'Show secret password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="edit-hint" className="block text-xs font-medium text-slate-700 mb-1">
                      Password hint
                    </label>
                    <input
                      id="edit-hint"
                      type="text"
                      value={wish.passwordHint}
                      onChange={(e) => updateField('passwordHint', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="edit-gate-title" className="block text-xs font-medium text-slate-700 mb-1">
                  Entrance title
                </label>
                <input
                  id="edit-gate-title"
                  type="text"
                  value={wish.gateTitle}
                  onChange={(e) => updateField('gateTitle', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="edit-gate-sub" className="block text-xs font-medium text-slate-700 mb-1">
                  Entrance subtitle
                </label>
                <input
                  id="edit-gate-sub"
                  type="text"
                  value={wish.gateSubtitle}
                  onChange={(e) => updateField('gateSubtitle', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'message' && (
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Page 2 · Welcome Banner
              </h3>
              <div>
                <label htmlFor="edit-eyebrow" className="block text-xs font-medium text-slate-700 mb-1">
                  Top eyebrow text
                </label>
                <input
                  id="edit-eyebrow"
                  type="text"
                  value={wish.heroEyebrow}
                  onChange={(e) => updateField('heroEyebrow', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="edit-tagline" className="block text-xs font-medium text-slate-700 mb-1">
                  Hero tagline
                </label>
                <textarea
                  id="edit-tagline"
                  rows={2}
                  value={wish.heroTagline}
                  onChange={(e) => updateField('heroTagline', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Page 3 · Personal Letter
                </h3>
                <button
                  type="button"
                  onClick={() => onJumpPage(3)}
                  className="text-xs font-medium text-slate-600 underline cursor-pointer"
                >
                  Preview Page 3
                </button>
              </div>

              <div>
                <label htmlFor="edit-msg-title" className="block text-xs font-medium text-slate-700 mb-1">
                  Letter heading
                </label>
                <input
                  id="edit-msg-title"
                  type="text"
                  value={wish.messageTitle}
                  onChange={(e) => updateField('messageTitle', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="edit-greeting" className="block text-xs font-medium text-slate-700 mb-1">
                  Greeting line
                </label>
                <input
                  id="edit-greeting"
                  type="text"
                  value={wish.messageGreeting}
                  onChange={(e) => updateField('messageGreeting', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">Message paragraphs</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateField('messageParagraphs', [...wish.messageParagraphs, ''])
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add paragraph
                  </button>
                </div>
                {wish.messageParagraphs.map((para, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      aria-label={`Message paragraph ${idx + 1}`}
                      value={para}
                      onChange={(e) => {
                        const next = [...wish.messageParagraphs];
                        next[idx] = e.target.value;
                        updateField('messageParagraphs', next);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                    {wish.messageParagraphs.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove paragraph ${idx + 1}`}
                        onClick={() =>
                          updateField(
                            'messageParagraphs',
                            wish.messageParagraphs.filter((_, i) => i !== idx)
                          )
                        }
                        className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="edit-signoff" className="block text-xs font-medium text-slate-700 mb-1">
                  Closing line
                </label>
                <input
                  id="edit-signoff"
                  type="text"
                  value={wish.messageSignOff}
                  onChange={(e) => updateField('messageSignOff', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Page 5 · Cake & Finale
                </h3>
                <button
                  type="button"
                  onClick={() => onJumpPage(5)}
                  className="text-xs font-medium text-slate-600 underline cursor-pointer"
                >
                  Preview Page 5
                </button>
              </div>
              <div>
                <label htmlFor="edit-wish-title" className="block text-xs font-medium text-slate-700 mb-1">
                  Cake heading
                </label>
                <input
                  id="edit-wish-title"
                  type="text"
                  value={wish.wishTitle}
                  onChange={(e) => updateField('wishTitle', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="edit-wish-result" className="block text-xs font-medium text-slate-700 mb-1">
                  Reveal message after blowing candles
                </label>
                <textarea
                  id="edit-wish-result"
                  rows={2}
                  value={wish.wishResultText}
                  onChange={(e) => updateField('wishResultText', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="edit-footer-text" className="block text-xs font-medium text-slate-700 mb-1">
                  Footer note
                </label>
                <input
                  id="edit-footer-text"
                  type="text"
                  value={wish.footerText}
                  onChange={(e) => updateField('footerText', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pictures' && (
          <div className="space-y-5">
            {uploadError && (
              <p role="alert" className="p-3 rounded-md bg-red-50 text-red-700 text-xs font-medium">
                {uploadError}
              </p>
            )}

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Optional Hero Portrait (Page 2)
              </h3>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
                  <ImagePlus className="w-4 h-4" />
                  <span>{wish.heroPhotoUrl ? 'Replace Portrait' : 'Upload Portrait'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroPhotoUpload}
                    className="sr-only"
                  />
                </label>
                {wish.heroPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => updateField('heroPhotoUrl', '')}
                    className="text-xs font-medium text-red-600 hover:underline cursor-pointer"
                  >
                    Remove portrait
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Page 4 · Memories Gallery
                </h3>
                <button
                  type="button"
                  onClick={addMemory}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold cursor-pointer hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Memory
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  aria-label="Memories section title"
                  value={wish.memoriesTitle}
                  onChange={(e) => updateField('memoriesTitle', e.target.value)}
                  placeholder="Section heading"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
                <input
                  type="text"
                  aria-label="Memories section subtitle"
                  value={wish.memoriesSubtitle}
                  onChange={(e) => updateField('memoriesSubtitle', e.target.value)}
                  placeholder="Section subtitle"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>

              <div className="space-y-4">
                {wish.memories.map((memory, idx) => (
                  <div
                    key={memory.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600">
                        Memory {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMemory(memory.id)}
                        aria-label={`Delete memory ${memory.title}`}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {memory.imageUrl && (
                      <div className="relative h-28 rounded-md overflow-hidden border border-slate-200">
                        <img
                          src={memory.imageUrl}
                          alt={memory.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>{memory.imageUrl ? 'Change Picture' : 'Upload Picture'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMemoryPhotoUpload(memory.id, e)}
                          className="sr-only"
                        />
                      </label>
                      {memory.imageUrl && (
                        <button
                          type="button"
                          onClick={() => updateMemory(memory.id, { imageUrl: '' })}
                          className="text-xs text-slate-600 hover:text-red-600 underline cursor-pointer"
                        >
                          Use gradient card
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      aria-label={`Memory ${idx + 1} title`}
                      value={memory.title}
                      onChange={(e) => updateMemory(memory.id, { title: e.target.value })}
                      placeholder="Memory title"
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
                    />
                    <input
                      type="text"
                      aria-label={`Memory ${idx + 1} date`}
                      value={memory.date}
                      onChange={(e) => updateMemory(memory.id, { date: e.target.value })}
                      placeholder="Date or moment label (e.g., Summer 2025)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                    />
                    <textarea
                      rows={2}
                      aria-label={`Memory ${idx + 1} caption`}
                      value={memory.caption}
                      onChange={(e) => updateMemory(memory.id, { caption: e.target.value })}
                      placeholder="Short story..."
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Predefined Themes
                </h3>
                {savedStyleNotice && (
                  <span className="text-[11px] font-medium text-emerald-700">{savedStyleNotice}</span>
                )}
              </div>

              <div className="space-y-2">
                {THEME_PRESETS.map((preset) => {
                  const selected = wish.themeId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPresetTheme(preset)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selected
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{preset.name}</p>
                        <p className="text-xs text-slate-500 truncate">{preset.description}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[
                          preset.colors.background,
                          preset.colors.surface,
                          preset.colors.accent,
                          preset.colors.secondary,
                        ].map((hex, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-black/15"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                        {selected && <Check className="w-4 h-4 ml-1 text-slate-900" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Custom Color Palette
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {(
                  [
                    { key: 'background', label: 'Page Background' },
                    { key: 'surface', label: 'Letter & Footer Surface' },
                    { key: 'ink', label: 'Main Text & Headings' },
                    { key: 'accent', label: 'Primary Button & Frosting' },
                    { key: 'secondary', label: 'Gold / Highlight Accent' },
                  ] as const
                ).map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-slate-200 bg-white"
                  >
                    <label htmlFor={`color-${key}`} className="text-xs font-medium text-slate-700">
                      {label}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 uppercase">
                        {wish.colors[key]}
                      </span>
                      <input
                        id={`color-${key}`}
                        type="color"
                        value={wish.colors[key]}
                        onChange={(e) => updateColor(key, e.target.value)}
                        className="w-8 h-7 rounded border border-slate-200 cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Text Font Pairings
              </h3>
              <div className="space-y-2">
                {FONT_PAIRS.map((pair) => {
                  const selected = wish.fontPairId === pair.id;
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      onClick={() => selectFontPair(pair.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selected
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <p
                          className="text-base font-bold text-slate-900"
                          style={{ fontFamily: pair.displayFont }}
                        >
                          {pair.name}
                        </p>
                        <p
                          className="text-xs text-slate-500"
                          style={{ fontFamily: pair.bodyFont }}
                        >
                          {pair.description}
                        </p>
                      </div>
                      {selected && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Cake & Effects</span>
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Number of candles ({wish.candleCount})</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateField('candleCount', count)}
                      className={`w-7 h-7 rounded text-xs font-semibold cursor-pointer ${
                        wish.candleCount === count
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <span>Confetti & fireworks burst</span>
                <input
                  type="checkbox"
                  checked={wish.effects.confetti}
                  onChange={(e) => {
                    const nextEffects = { ...wish.effects, confetti: e.target.checked };
                    updateField('effects', nextEffects);
                    onSaveStylePreferences({
                      themeId: wish.themeId,
                      colors: wish.colors,
                      fontPairId: wish.fontPairId,
                      effects: nextEffects,
                    });
                  }}
                  className="w-4 h-4 accent-slate-900"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <span>Enthusiastic background music & firecrackers</span>
                <input
                  type="checkbox"
                  checked={wish.effects.sound}
                  onChange={(e) => {
                    const nextEffects = { ...wish.effects, sound: e.target.checked };
                    updateField('effects', nextEffects);
                    onSaveStylePreferences({
                      themeId: wish.themeId,
                      colors: wish.colors,
                      fontPairId: wish.fontPairId,
                      effects: nextEffects,
                    });
                  }}
                  className="w-4 h-4 accent-slate-900"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <span>Balloons, bubbles & jumping text</span>
                <input
                  type="checkbox"
                  checked={wish.effects.animations}
                  onChange={(e) => {
                    const nextEffects = { ...wish.effects, animations: e.target.checked };
                    updateField('effects', nextEffects);
                    onSaveStylePreferences({
                      themeId: wish.themeId,
                      colors: wish.colors,
                      fontPairId: wish.fontPairId,
                      effects: nextEffects,
                    });
                  }}
                  className="w-4 h-4 accent-slate-900"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Music className="w-3.5 h-3.5" />
                <span>Background Music (Royalty-Free)</span>
              </div>
              <div className="space-y-1.5">
                {MUSIC_TRACKS.map((track) => {
                  const selected = wish.effects.musicTrackId === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        onSelectMusicTrack(track.id);
                        onSaveStylePreferences({
                          themeId: wish.themeId,
                          colors: wish.colors,
                          fontPairId: wish.fontPairId,
                          effects: { ...wish.effects, musicTrackId: track.id },
                        });
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        selected
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900">{track.title}</span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 whitespace-nowrap">
                            {track.occasion}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{track.description}</p>
                      </div>
                      {selected && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    3D Cake Hanging Banner
                  </h3>
                  <p className="text-xs text-slate-500">Oversized decoration over the Page 5 cake</p>
                </div>
                <button
                  type="button"
                  onClick={() => onJumpPage(5)}
                  className="text-xs font-medium text-slate-600 underline cursor-pointer whitespace-nowrap"
                >
                  Preview Page 5
                </button>
              </div>

              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <span>Show 3D hanging banner</span>
                <input
                  type="checkbox"
                  checked={wish.cakeBanner.enabled}
                  onChange={(e) => {
                    updateField('cakeBanner', { ...wish.cakeBanner, enabled: e.target.checked });
                    onJumpPage(5);
                  }}
                  className="w-4 h-4 accent-slate-900"
                />
              </label>

              {wish.cakeBanner.enabled && (
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs font-medium text-slate-700 mb-1.5">
                      Quick banner messages
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {BANNER_SUGGESTIONS.map((msg) => (
                        <button
                          key={msg}
                          type="button"
                          onClick={() => {
                            updateField('cakeBanner', { ...wish.cakeBanner, text: msg });
                            onJumpPage(5);
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-medium border cursor-pointer transition-colors ${
                            wish.cakeBanner.text === msg
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {msg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-cake-banner-text"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Custom banner text
                    </label>
                    <input
                      id="edit-cake-banner-text"
                      type="text"
                      value={wish.cakeBanner.text}
                      onFocus={() => onJumpPage(5)}
                      onChange={(e) =>
                        updateField('cakeBanner', { ...wish.cakeBanner, text: e.target.value })
                      }
                      placeholder="Write any celebration message..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-cake-banner-font"
                      className="block text-xs font-medium text-slate-700 mb-1"
                    >
                      Banner font
                    </label>
                    <select
                      id="edit-cake-banner-font"
                      value={wish.cakeBanner.fontId}
                      onChange={(e) => {
                        updateField('cakeBanner', { ...wish.cakeBanner, fontId: e.target.value });
                        onJumpPage(5);
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                    >
                      {BANNER_FONTS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-md border border-slate-200 bg-white">
                      <label htmlFor="banner-text-color" className="text-xs font-medium text-slate-700">
                        Text color
                      </label>
                      <input
                        id="banner-text-color"
                        type="color"
                        value={wish.cakeBanner.textColor}
                        onChange={(e) => {
                          updateField('cakeBanner', {
                            ...wish.cakeBanner,
                            textColor: e.target.value,
                          });
                          onJumpPage(5);
                        }}
                        className="w-8 h-7 rounded border border-slate-200 cursor-pointer bg-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-md border border-slate-200 bg-white">
                      <label htmlFor="banner-bg-color" className="text-xs font-medium text-slate-700">
                        Banner color
                      </label>
                      <input
                        id="banner-bg-color"
                        type="color"
                        value={wish.cakeBanner.backgroundColor}
                        onChange={(e) => {
                          updateField('cakeBanner', {
                            ...wish.cakeBanner,
                            backgroundColor: e.target.value,
                          });
                          onJumpPage(5);
                        }}
                        className="w-8 h-7 rounded border border-slate-200 cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasSavedStylePreferences && (
              <button
                type="button"
                onClick={onApplySavedStylePreferences}
                className="w-full py-2 px-3 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Apply My Saved Style Settings
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onResetDefault}
          title="Reset wish back to original template"
          className="px-3 py-2.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={onOpenShare}
          className="flex-1 py-2.5 px-4 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>Save & Share</span>
        </button>
      </div>
    </aside>
  );
}
