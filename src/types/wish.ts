export type DateDisplayFormat = 'full' | 'month-day' | 'short' | 'custom';

export type WishPageNumber = 1 | 2 | 3 | 4 | 5;

export interface MemoryItem {
  id: string;
  title: string;
  date: string;
  caption: string;
  imageUrl: string;
  gradientIndex: number;
}

export interface WishColors {
  background: string;
  surface: string;
  ink: string;
  accent: string;
  secondary: string;
}

export interface WishEffects {
  confetti: boolean;
  sound: boolean;
  animations: boolean;
  musicTrackId: string;
}

export interface CakeBannerConfig {
  enabled: boolean;
  text: string;
  fontId: string;
  textColor: string;
  backgroundColor: string;
}

export interface MusicTrackInfo {
  id: string;
  title: string;
  occasion: string;
  description: string;
  tempoMs: number;
  wave: 'triangle' | 'sine' | 'sawtooth';
  notes: number[];
  bassRoots: Record<number, number>;
}

export interface WishCountdown {
  enabled: boolean;
  targetDateTime: string;
  label: string;
  reachedText: string;
}

export interface WishConfig {
  id: string;
  occasion: string;
  recipientName: string;
  senderName: string;
  celebrationDate: string;
  dateDisplayFormat: DateDisplayFormat;
  customDateLabel: string;
  passwordEnabled: boolean;
  password: string;
  passwordHint: string;
  gateTitle: string;
  gateSubtitle: string;
  heroEyebrow: string;
  heroTagline: string;
  heroPhotoUrl: string;
  messageTitle: string;
  messageGreeting: string;
  messageParagraphs: string[];
  messageSignOff: string;
  memoriesTitle: string;
  memoriesSubtitle: string;
  memories: MemoryItem[];
  wishTitle: string;
  wishSubtitle: string;
  wishResultText: string;
  candleCount: number;
  cakeBanner: CakeBannerConfig;
  footerText: string;
  themeId: string;
  colors: WishColors;
  fontPairId: string;
  effects: WishEffects;
  countdown: WishCountdown;
  updatedAt: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  colors: WishColors;
}

export interface FontPair {
  id: string;
  name: string;
  description: string;
  displayFont: string;
  bodyFont: string;
}
