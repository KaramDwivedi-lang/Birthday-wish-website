import { BANNER_FONTS, DEFAULT_WISH, FONT_PAIRS, MUSIC_TRACKS, THEME_PRESETS } from '../data/presets';
import type { DateDisplayFormat, MemoryItem, WishConfig } from '../types/wish';

export function verifyWishPassword(wish: Pick<WishConfig, 'passwordEnabled' | 'password'>, attempt: string): boolean {
  if (!wish.passwordEnabled) {
    return true;
  }
  const expected = wish.password.trim().toLowerCase();
  if (!expected) {
    return true;
  }
  return attempt.trim().toLowerCase() === expected;
}

export function formatWishDate(
  isoDate: string,
  format: DateDisplayFormat,
  customLabel?: string
): string {
  if (format === 'custom' && customLabel?.trim()) {
    return customLabel.trim();
  }
  if (!isoDate) {
    return '';
  }
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return isoDate;
  }
  const [year, month, day] = parts;
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(dateObj.getTime())) {
    return isoDate;
  }

  if (format === 'month-day') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(dateObj);
  }
  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(dateObj);
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateObj);
}

export function slugifyWishId(recipientName: string, occasion: string, suffix?: string): string {
  const cleanRecipient = recipientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);
  const cleanOccasion = occasion
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 14);
  const base = [cleanRecipient || 'friend', cleanOccasion || 'wish'].join('-');
  if (suffix) {
    return `${base}-${suffix}`;
  }
  return base;
}

export function buildShareUrl(origin: string, wishId: string): string {
  const cleanOrigin = origin.replace(/\/+$/, '');
  return `${cleanOrigin}/?wish=${encodeURIComponent(wishId)}`;
}

export function buildWhatsAppShareHref(wish: Pick<WishConfig, 'recipientName' | 'occasion' | 'passwordEnabled' | 'passwordHint'>, shareUrl: string): string {
  const lines = [
    `I made a special ${wish.occasion.toLowerCase()} keepsake for ${wish.recipientName}!`,
    `Open it here: ${shareUrl}`,
  ];
  if (wish.passwordEnabled && wish.passwordHint.trim()) {
    lines.push(`Password hint: ${wish.passwordHint.trim()}`);
  }
  lines.push('Tip: After opening, you can also click Customize to edit or reuse it!');
  return `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildMailtoShareHref(wish: Pick<WishConfig, 'recipientName' | 'senderName' | 'occasion' | 'passwordEnabled' | 'passwordHint'>, shareUrl: string): string {
  const subject = `A ${wish.occasion} Surprise for ${wish.recipientName}`;
  const bodyLines = [
    `Hi ${wish.recipientName},`,
    '',
    `I put together a personalized ${wish.occasion.toLowerCase()} website just for you.`,
    `Open your wish here: ${shareUrl}`,
    '',
  ];
  if (wish.passwordEnabled && wish.passwordHint.trim()) {
    bodyLines.push(`Password hint: ${wish.passwordHint.trim()}`);
    bodyLines.push('');
  }
  bodyLines.push('You can also customize it or make your own copy right inside the page.');
  bodyLines.push('');
  bodyLines.push(`With warm wishes,`);
  bodyLines.push(wish.senderName || 'Your Friend');

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
}

export function isHexColorDark(hex: string): boolean {
  const normalized = hex.replace('#', '').trim();
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return false;
  }
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance < 0.179;
}

export function getContrastTextColor(bgHex: string): string {
  return isHexColorDark(bgHex) ? '#faf6f0' : '#0f0906';
}

export function getFontPair(fontPairId: string) {
  return FONT_PAIRS.find((pair) => pair.id === fontPairId) ?? FONT_PAIRS[0];
}

export function getThemePreset(themeId: string) {
  return THEME_PRESETS.find((preset) => preset.id === themeId) ?? THEME_PRESETS[0];
}

export function getMusicTrack(trackId: string) {
  return MUSIC_TRACKS.find((track) => track.id === trackId) ?? MUSIC_TRACKS[0];
}

export function getBannerFont(fontId: string) {
  return BANNER_FONTS.find((font) => font.id === fontId) ?? BANNER_FONTS[0];
}

export interface CountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isReached: boolean;
  isValid: boolean;
}

export function computeCountdownRemaining(
  targetDateTime: string,
  nowMs: number = Date.now()
): CountdownParts {
  if (!targetDateTime || !targetDateTime.trim()) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isReached: false, isValid: false };
  }
  const targetMs = new Date(targetDateTime).getTime();
  if (Number.isNaN(targetMs)) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isReached: false, isValid: false };
  }

  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isReached: true, isValid: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
    isReached: false,
    isValid: true,
  };
}

export function sanitizeWishConfig(input: Partial<WishConfig> | null | undefined): WishConfig {
  const base = structuredClone(DEFAULT_WISH);
  if (!input || typeof input !== 'object') {
    return base;
  }

  const memories: MemoryItem[] = Array.isArray(input.memories)
    ? input.memories
        .filter((m): m is MemoryItem => Boolean(m && typeof m === 'object'))
        .map((m, idx) => ({
          id: typeof m.id === 'string' && m.id.trim() ? m.id : `mem-${idx + 1}`,
          title: typeof m.title === 'string' ? m.title : 'Special Memory',
          date: typeof m.date === 'string' ? m.date : '',
          caption: typeof m.caption === 'string' ? m.caption : '',
          imageUrl: typeof m.imageUrl === 'string' ? m.imageUrl : '',
          gradientIndex: typeof m.gradientIndex === 'number' ? Math.abs(m.gradientIndex) % 4 : idx % 4,
        }))
    : base.memories;

  const paragraphs = Array.isArray(input.messageParagraphs)
    ? input.messageParagraphs.filter((p): p is string => typeof p === 'string')
    : base.messageParagraphs;

  const candleCount =
    typeof input.candleCount === 'number'
      ? Math.min(5, Math.max(1, Math.round(input.candleCount)))
      : base.candleCount;

  return {
    ...base,
    ...input,
    id: typeof input.id === 'string' && input.id.trim() ? input.id.trim() : base.id,
    occasion: typeof input.occasion === 'string' && input.occasion.trim() ? input.occasion : base.occasion,
    recipientName:
      typeof input.recipientName === 'string' && input.recipientName.trim()
        ? input.recipientName
        : base.recipientName,
    senderName: typeof input.senderName === 'string' ? input.senderName : base.senderName,
    celebrationDate:
      typeof input.celebrationDate === 'string' ? input.celebrationDate : base.celebrationDate,
    dateDisplayFormat:
      input.dateDisplayFormat === 'full' ||
      input.dateDisplayFormat === 'month-day' ||
      input.dateDisplayFormat === 'short' ||
      input.dateDisplayFormat === 'custom'
        ? input.dateDisplayFormat
        : base.dateDisplayFormat,
    customDateLabel: typeof input.customDateLabel === 'string' ? input.customDateLabel : '',
    passwordEnabled:
      typeof input.passwordEnabled === 'boolean' ? input.passwordEnabled : base.passwordEnabled,
    password: typeof input.password === 'string' ? input.password : base.password,
    passwordHint: typeof input.passwordHint === 'string' ? input.passwordHint : base.passwordHint,
    messageParagraphs: paragraphs.length > 0 ? paragraphs : [''],
    memories,
    candleCount,
    cakeBanner: {
      enabled: input.cakeBanner?.enabled ?? base.cakeBanner.enabled,
      text:
        typeof input.cakeBanner?.text === 'string' && input.cakeBanner.text.trim()
          ? input.cakeBanner.text
          : base.cakeBanner.text,
      fontId:
        typeof input.cakeBanner?.fontId === 'string' && input.cakeBanner.fontId.trim()
          ? input.cakeBanner.fontId
          : base.cakeBanner.fontId,
      textColor: input.cakeBanner?.textColor || base.cakeBanner.textColor,
      backgroundColor: input.cakeBanner?.backgroundColor || base.cakeBanner.backgroundColor,
    },
    colors: {
      background: input.colors?.background || base.colors.background,
      surface: input.colors?.surface || base.colors.surface,
      ink: input.colors?.ink || base.colors.ink,
      accent: input.colors?.accent || base.colors.accent,
      secondary: input.colors?.secondary || base.colors.secondary,
    },
    effects: {
      confetti: input.effects?.confetti ?? base.effects.confetti,
      sound: input.effects?.sound ?? base.effects.sound,
      animations: input.effects?.animations ?? base.effects.animations,
      musicTrackId:
        typeof input.effects?.musicTrackId === 'string' && input.effects.musicTrackId.trim()
          ? input.effects.musicTrackId
          : base.effects.musicTrackId,
    },
    countdown: {
      enabled: input.countdown?.enabled ?? base.countdown.enabled,
      targetDateTime:
        typeof input.countdown?.targetDateTime === 'string'
          ? input.countdown.targetDateTime
          : base.countdown.targetDateTime,
      label:
        typeof input.countdown?.label === 'string'
          ? input.countdown.label
          : base.countdown.label,
      reachedText:
        typeof input.countdown?.reachedText === 'string'
          ? input.countdown.reachedText
          : base.countdown.reachedText,
    },
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : new Date().toISOString(),
  };
}
