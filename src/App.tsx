import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { QrCode } from 'lucide-react';
import { AmbientMusicPlayer } from './components/AmbientMusicPlayer';
import { BottomPageNav } from './components/BottomPageNav';
import { CelebrationBackdrop } from './components/CelebrationBackdrop';
import { ConfettiCanvas, type ConfettiController } from './components/ConfettiCanvas';
import {
  EditorSidebar,
  type EditorTab,
  type SavedUserStylePreferences,
} from './components/EditorSidebar';
import { Page1Gate } from './components/Page1Gate';
import { Page2Hero } from './components/Page2Hero';
import { Page3Message } from './components/Page3Message';
import { Page4Memories } from './components/Page4Memories';
import { Page5Cake } from './components/Page5Cake';
import { QrCodeModal } from './components/QrCodeModal';
import { ShareModal } from './components/ShareModal';
import { WishHeader } from './components/WishHeader';
import { DEFAULT_WISH } from './data/presets';
import type { WishConfig, WishPageNumber } from './types/wish';
import { getFontPair, sanitizeWishConfig } from './utils/wishLogic';

const STYLE_PREFS_STORAGE_KEY = 'keepsake_user_style_prefs_v1';
const DRAFT_PREFIX = 'keepsake_draft_v1_';

function readSavedStylePrefs(): SavedUserStylePreferences | null {
  try {
    const raw = localStorage.getItem(STYLE_PREFS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedUserStylePreferences;
    if (!parsed || !parsed.colors || !parsed.fontPairId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function App() {
  const [wish, setWish] = useState<WishConfig>(() => sanitizeWishConfig(DEFAULT_WISH));
  const [currentPage, setCurrentPage] = useState<WishPageNumber>(1);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>('basics');
  const [shareOpen, setShareOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [loadingWish, setLoadingWish] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const reqId = params.get('wish');
    return Boolean(reqId && reqId !== DEFAULT_WISH.id);
  });
  const [savedStyleNotice, setSavedStyleNotice] = useState('');
  const [hasSavedStylePrefs, setHasSavedStylePrefs] = useState<boolean>(() =>
    Boolean(readSavedStylePrefs())
  );
  const [musicPlaying, setMusicPlaying] = useState(false);
  const userMutedMusicRef = useRef(false);

  const confettiRef = useRef<ConfettiController | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('wish') || DEFAULT_WISH.id;
    const autostart = params.get('autostart') === '1';
    const openEdit = params.get('edit') === '1';

    if (openEdit) {
      setIsEditing(true);
    }

    let cancelled = false;

    async function loadWish() {
      try {
        const res = await fetch(`/api/wishes/${encodeURIComponent(requestedId)}`);
        if (res.ok) {
          const data = (await res.json()) as { wish?: WishConfig };
          if (!cancelled && data.wish) {
            const loaded = sanitizeWishConfig(data.wish);
            setWish(loaded);
            setLastSavedId(loaded.id);
            const openAccess = !loaded.passwordEnabled || !loaded.password.trim() || autostart;
            setIsUnlocked(openAccess);
            setCurrentPage(openAccess ? 2 : 1);
            setLoadingWish(false);
            return;
          }
        }
      } catch {
        // Fallback to local draft or default template
      }

      if (!cancelled) {
        let loaded = sanitizeWishConfig(DEFAULT_WISH);
        try {
          const draftRaw = localStorage.getItem(`${DRAFT_PREFIX}${requestedId}`);
          if (draftRaw) {
            loaded = sanitizeWishConfig(JSON.parse(draftRaw) as WishConfig);
          }
        } catch {
          // Ignore storage errors
        }
        setWish(loaded);
        const openAccess = !loaded.passwordEnabled || !loaded.password.trim() || autostart;
        setIsUnlocked(openAccess);
        setCurrentPage(openAccess ? 2 : 1);
        setLoadingWish(false);
      }
    }

    void loadWish();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChangeWish = (updater: (prev: WishConfig) => WishConfig) => {
    setWish((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(`${DRAFT_PREFIX}${next.id}`, JSON.stringify(next));
      } catch {
        // Ignore storage quota issues
      }
      return next;
    });
  };

  const handleSaveStylePreferences = (prefs: SavedUserStylePreferences) => {
    try {
      localStorage.setItem(STYLE_PREFS_STORAGE_KEY, JSON.stringify(prefs));
      setHasSavedStylePrefs(true);
      setSavedStyleNotice('Saved to user settings');
      setTimeout(() => setSavedStyleNotice(''), 2200);
    } catch {
      // Ignore storage errors
    }
  };

  const handleApplySavedStylePreferences = () => {
    const prefs = readSavedStylePrefs();
    if (!prefs) return;
    handleChangeWish((prev) => ({
      ...prev,
      themeId: prefs.themeId,
      colors: { ...prefs.colors },
      fontPairId: prefs.fontPairId,
      effects: { ...prefs.effects },
    }));
    setSavedStyleNotice('Applied saved style');
    setTimeout(() => setSavedStyleNotice(''), 2200);
  };

  const handleSelectMusicTrack = (trackId: string) => {
    handleChangeWish((prev) => ({
      ...prev,
      effects: { ...prev.effects, musicTrackId: trackId, sound: true },
    }));
    userMutedMusicRef.current = false;
    setMusicPlaying(true);
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
    setCurrentPage(2);
    setTimeout(() => {
      confettiRef.current?.launchConfetti(90);
    }, 180);
  };

  const handleSelectPage = (page: WishPageNumber) => {
    if (page > 1 && !isUnlocked && !isEditing) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplay = () => {
    setIsUnlocked(false);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCustomizeCopy = () => {
    setIsUnlocked(true);
    setIsEditing(true);
    setEditorTab('basics');
  };

  const saveAsNewCopy = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wish }),
      });
      if (!res.ok) {
        throw new Error('Could not save your wish right now.');
      }
      const data = (await res.json()) as { wish: WishConfig };
      const saved = sanitizeWishConfig(data.wish);
      setWish(saved);
      setLastSavedId(saved.id);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('wish', saved.id);
      window.history.replaceState({}, '', nextUrl.toString());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateExistingWish = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const targetId = lastSavedId || wish.id;
      const res = await fetch(`/api/wishes/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wish }),
      });
      if (!res.ok) {
        throw new Error('Could not update your wish.');
      }
      const data = (await res.json()) as { wish: WishConfig };
      const saved = sanitizeWishConfig(data.wish);
      setWish(saved);
      setLastSavedId(saved.id);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenShare = async () => {
    setShareOpen(true);
    if (!lastSavedId || lastSavedId === DEFAULT_WISH.id) {
      await saveAsNewCopy();
    } else {
      await updateExistingWish();
    }
  };

  const handleOpenQrShare = async () => {
    setShareOpen(false);
    setQrModalOpen(true);
    if (!lastSavedId || lastSavedId === DEFAULT_WISH.id) {
      await saveAsNewCopy();
    } else {
      await updateExistingWish();
    }
  };

  const handleResetDefault = () => {
    const reset = sanitizeWishConfig(DEFAULT_WISH);
    setWish(reset);
    setLastSavedId(null);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('wish');
    window.history.replaceState({}, '', nextUrl.toString());
  };

  const fontPair = getFontPair(wish.fontPairId);
  const rootStyle: CSSProperties = {
    backgroundColor: wish.colors.background,
    color: wish.colors.ink,
    fontFamily: fontPair.bodyFont,
    ['--wish-display-font' as string]: fontPair.displayFont,
    ['--wish-body-font' as string]: fontPair.bodyFont,
  };

  return (
    <div
      style={rootStyle}
      className="relative min-h-screen flex flex-col transition-colors duration-300"
    >
      <CelebrationBackdrop wish={wish} currentPage={currentPage} />

      <AmbientMusicPlayer
        soundEnabled={wish.effects.sound}
        musicPlaying={musicPlaying}
        trackId={wish.effects.musicTrackId}
        onAutoStarted={() => {
          if (!userMutedMusicRef.current && wish.effects.sound) {
            setMusicPlaying(true);
          }
        }}
      />

      <ConfettiCanvas
        ref={confettiRef}
        colors={[wish.colors.accent, wish.colors.secondary, wish.colors.surface, '#f5d08a']}
        enableConfetti={wish.effects.confetti}
        enableSound={wish.effects.sound}
      />

      <WishHeader
        wish={wish}
        currentPage={currentPage}
        isUnlocked={isUnlocked}
        isEditing={isEditing}
        onSelectPage={handleSelectPage}
        onToggleEditor={() => {
          setIsEditing((prev) => !prev);
          if (!isEditing) {
            setIsUnlocked(true);
          }
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row">
        {isEditing && (
          <EditorSidebar
            wish={wish}
            activeTab={editorTab}
            savedStyleNotice={savedStyleNotice}
            onTabChange={setEditorTab}
            onJumpPage={(page) => {
              setIsUnlocked(true);
              setCurrentPage(page);
            }}
            onChangeWish={handleChangeWish}
            onSaveStylePreferences={handleSaveStylePreferences}
            onApplySavedStylePreferences={handleApplySavedStylePreferences}
            hasSavedStylePreferences={hasSavedStylePrefs}
            onSelectMusicTrack={handleSelectMusicTrack}
            onOpenShare={() => void handleOpenShare()}
            onResetDefault={handleResetDefault}
            onClose={() => setIsEditing(false)}
          />
        )}

        <main className="flex-1 flex flex-col min-w-0">
          {loadingWish ? (
            <div className="flex-1 flex items-center justify-center p-12 text-sm opacity-70">
              Preparing your keepsake...
            </div>
          ) : (
            <div className="flex-1">
              {currentPage === 1 && (
                <Page1Gate wish={wish} isEditing={isEditing} onUnlock={handleUnlock} />
              )}
              {currentPage === 2 && (
                <Page2Hero
                  wish={wish}
                  onCelebrate={() => confettiRef.current?.launchCelebration()}
                  onNext={() => handleSelectPage(3)}
                />
              )}
              {currentPage === 3 && <Page3Message wish={wish} />}
              {currentPage === 4 && <Page4Memories wish={wish} />}
              {currentPage === 5 && (
                <Page5Cake
                  wish={wish}
                  onBlowCelebration={() => confettiRef.current?.launchFirecrackerCelebration()}
                  onReplay={handleReplay}
                  onCustomizeCopy={handleCustomizeCopy}
                />
              )}
            </div>
          )}

          <BottomPageNav
            wish={wish}
            currentPage={currentPage}
            isUnlocked={isUnlocked}
            isEditing={isEditing}
            musicPlaying={musicPlaying}
            onToggleMusic={() => {
              setMusicPlaying((prev) => {
                const next = !prev;
                userMutedMusicRef.current = !next;
                return next;
              });
            }}
            onSelectMusicTrack={handleSelectMusicTrack}
            onSelectPage={handleSelectPage}
          />
        </main>
      </div>

      {!shareOpen && !qrModalOpen && (
        <button
          type="button"
          onClick={() => void handleOpenQrShare()}
          aria-label="QR code sharing"
          className="fixed bottom-[76px] sm:bottom-20 right-4 sm:right-6 z-40 px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-lg border border-red-400/40 inline-flex items-center gap-1.5 cursor-pointer transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
        >
          <QrCode className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>QR code sharing</span>
        </button>
      )}

      <ShareModal
        wish={wish}
        isOpen={shareOpen}
        isSaving={isSaving}
        saveError={saveError}
        lastSavedId={lastSavedId}
        onSaveNewCopy={saveAsNewCopy}
        onUpdateExisting={updateExistingWish}
        onOpenQr={() => void handleOpenQrShare()}
        onClose={() => setShareOpen(false)}
      />

      <QrCodeModal
        wish={wish}
        isOpen={qrModalOpen}
        isSaving={isSaving}
        saveError={saveError}
        lastSavedId={lastSavedId}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
}
