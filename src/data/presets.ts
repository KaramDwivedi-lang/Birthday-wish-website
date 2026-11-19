import type { FontPair, MusicTrackInfo, ThemePreset, WishConfig } from '../types/wish';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'golden-celebration',
    name: 'Warm Golden Celebration',
    description: 'Signature cream paper, deep forest teal, warm coral, and sunlit gold',
    isDark: false,
    colors: {
      background: '#faf6f0',
      surface: '#0f3d3c',
      ink: '#0f3d3c',
      accent: '#c44736',
      secondary: '#e8a849',
    },
  },
  {
    id: 'midnight-starlight',
    name: 'Midnight Starlight',
    description: 'Deep obsidian navy, champagne gold, and soft rose highlights',
    isDark: true,
    colors: {
      background: '#0b1020',
      surface: '#141b33',
      ink: '#f8f5ef',
      accent: '#e06d85',
      secondary: '#f2c97d',
    },
  },
  {
    id: 'botanical-sage',
    name: 'Botanical Sage',
    description: 'Soft linen canvas, deep woodland green, and terracotta warmth',
    isDark: false,
    colors: {
      background: '#f5f7f2',
      surface: '#1f3a2e',
      ink: '#1a2e25',
      accent: '#c75d43',
      secondary: '#d4a373',
    },
  },
  {
    id: 'editorial-monochrome',
    name: 'Editorial Paper',
    description: 'Crisp gallery white, ink charcoal, and vivid cinnabar accent',
    isDark: false,
    colors: {
      background: '#fafafa',
      surface: '#141414',
      ink: '#141414',
      accent: '#d9381e',
      secondary: '#a89f91',
    },
  },
  {
    id: 'rosewater-blush',
    name: 'Rosewater Keepsake',
    description: 'Porcelain blush, deep plum velvet, and warm champagne',
    isDark: false,
    colors: {
      background: '#fdf7f8',
      surface: '#4a1936',
      ink: '#3a142a',
      accent: '#d9536f',
      secondary: '#e5b976',
    },
  },
];

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'fraunces-outfit',
    name: 'Fraunces & Outfit',
    description: 'Warm expressive serif with clean geometric sans',
    displayFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Outfit", system-ui, sans-serif',
  },
  {
    id: 'playfair-jakarta',
    name: 'Playfair & Jakarta',
    description: 'Classic luxury editorial serif paired with crisp modern sans',
    displayFont: '"Playfair Display", Georgia, serif',
    bodyFont: '"Plus Jakarta Sans", system-ui, sans-serif',
  },
  {
    id: 'cormorant-dm',
    name: 'Cormorant & DM Sans',
    description: 'Poetic letterpress display with refined body prose',
    displayFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: '"DM Sans", system-ui, sans-serif',
  },
  {
    id: 'bricolage-manrope',
    name: 'Bricolage & Manrope',
    description: 'Contemporary playful grotesque with friendly readability',
    displayFont: '"Bricolage Grotesque", system-ui, sans-serif',
    bodyFont: '"Manrope", system-ui, sans-serif',
  },
  {
    id: 'bodoni-lora',
    name: 'Bodoni & Lora',
    description: 'High-contrast literary keepsake typography',
    displayFont: '"Bodoni Moda", Georgia, serif',
    bodyFont: '"Lora", Georgia, serif',
  },
];

export interface BannerFontOption {
  id: string;
  name: string;
  fontFamily: string;
}

export const BANNER_FONTS: BannerFontOption[] = [
  {
    id: 'pacifico',
    name: 'Pacifico Script',
    fontFamily: '"Pacifico", Georgia, cursive',
  },
  {
    id: 'fraunces',
    name: 'Fraunces Serif',
    fontFamily: '"Fraunces", Georgia, serif',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    fontFamily: '"Playfair Display", Georgia, serif',
  },
  {
    id: 'bricolage',
    name: 'Bricolage Bold',
    fontFamily: '"Bricolage Grotesque", system-ui, sans-serif',
  },
  {
    id: 'bodoni',
    name: 'Bodoni Editorial',
    fontFamily: '"Bodoni Moda", Georgia, serif',
  },
];

export const BANNER_SUGGESTIONS = [
  "It's your birthday!",
  'Happy birthday!',
  'Happy anniversary!',
  "It's your anniversary!",
  'Congratulations!',
  'Cheers to you!',
];

export const MUSIC_TRACKS: MusicTrackInfo[] = [
  {
    id: 'joyful-birthday-chime',
    title: 'Birthday Sparkle Chime',
    occasion: 'Birthday & Parties',
    description: 'Bright, joyful major arpeggios with celebratory chimes',
    tempoMs: 420,
    wave: 'triangle',
    notes: [
      523.25, 523.25, 587.33, 523.25, 698.46, 659.25,
      523.25, 523.25, 587.33, 523.25, 783.99, 698.46,
      523.25, 1046.5, 880.0, 698.46, 659.25, 587.33,
      932.33, 932.33, 880.0, 698.46, 783.99, 698.46,
    ],
    bassRoots: {
      0: 130.81,
      6: 174.61,
      12: 130.81,
      18: 196.0,
    },
  },
  {
    id: 'upbeat-party-spark',
    title: 'Upbeat Party Bounce',
    occasion: 'Festive & Enthusiastic',
    description: 'Energetic upbeat rhythm that fills every room with cheer',
    tempoMs: 340,
    wave: 'triangle',
    notes: [
      523.25, 659.25, 783.99, 1046.5, 783.99, 659.25,
      587.33, 739.99, 880.0, 1174.66, 880.0, 739.99,
      659.25, 783.99, 987.77, 1318.51, 987.77, 783.99,
      698.46, 880.0, 1046.5, 1396.91, 1046.5, 880.0,
    ],
    bassRoots: {
      0: 130.81,
      3: 196.0,
      6: 146.83,
      9: 220.0,
      12: 164.81,
      15: 246.94,
      18: 174.61,
      21: 196.0,
    },
  },
  {
    id: 'romantic-anniversary',
    title: 'Golden Anniversary Strings',
    occasion: 'Anniversary & Wedding',
    description: 'Lush romantic waltz harmonies with warm golden chords',
    tempoMs: 520,
    wave: 'sine',
    notes: [
      440.0, 554.37, 659.25, 880.0, 659.25, 554.37,
      392.0, 493.88, 587.33, 783.99, 587.33, 493.88,
      349.23, 440.0, 523.25, 698.46, 523.25, 440.0,
      329.63, 440.0, 554.37, 659.25, 783.99, 880.0,
    ],
    bassRoots: {
      0: 110.0,
      6: 98.0,
      12: 87.31,
      18: 164.81,
    },
  },
  {
    id: 'starlight-music-box',
    title: 'Starlight Music Box',
    occasion: 'Dreamy & Keepsake',
    description: 'Crystalline celesta bell notes floating over soft chords',
    tempoMs: 480,
    wave: 'sine',
    notes: [
      659.25, 783.99, 987.77, 1318.51, 987.77, 783.99,
      587.33, 739.99, 880.0, 1174.66, 880.0, 739.99,
      523.25, 659.25, 783.99, 1046.5, 783.99, 659.25,
      493.88, 659.25, 783.99, 987.77, 783.99, 659.25,
    ],
    bassRoots: {
      0: 164.81,
      6: 146.83,
      12: 130.81,
      18: 123.47,
    },
  },
  {
    id: 'sunny-friendship',
    title: 'Sunny Friendship Groove',
    occasion: 'Friendship & Thank You',
    description: 'Feel-good sunlit melody full of warmth and gratitude',
    tempoMs: 390,
    wave: 'triangle',
    notes: [
      392.0, 493.88, 587.33, 783.99, 659.25, 587.33,
      440.0, 523.25, 659.25, 880.0, 783.99, 659.25,
      349.23, 440.0, 523.25, 698.46, 659.25, 523.25,
      392.0, 587.33, 783.99, 987.77, 783.99, 587.33,
    ],
    bassRoots: {
      0: 98.0,
      6: 110.0,
      12: 87.31,
      18: 98.0,
    },
  },
  {
    id: 'grand-toast-fanfare',
    title: 'Grand Toast Fanfare',
    occasion: 'Milestones & Graduation',
    description: 'Triumphant ceremonial chords crafted for big moments',
    tempoMs: 440,
    wave: 'sawtooth',
    notes: [
      523.25, 659.25, 783.99, 1046.5, 1046.5, 987.77,
      880.0, 783.99, 698.46, 880.0, 1046.5, 1174.66,
      1046.5, 987.77, 880.0, 783.99, 659.25, 783.99,
      698.46, 659.25, 587.33, 783.99, 880.0, 1046.5,
    ],
    bassRoots: {
      0: 130.81,
      6: 174.61,
      12: 164.81,
      18: 196.0,
    },
  },
];

export const MEMORY_GRADIENTS = [
  'linear-gradient(135deg, #f5d08a 0%, #e8a849 48%, #e86f5c 100%)',
  'linear-gradient(135deg, #1a5c5a 0%, #0f3d3c 55%, #e8a849 100%)',
  'linear-gradient(135deg, #e86f5c 0%, #f5a898 50%, #f5d08a 100%)',
  'linear-gradient(135deg, #0f3d3c 0%, #266b68 50%, #f5d08a 100%)',
];

export const DEFAULT_WISH: WishConfig = {
  id: 'nehal-birthday',
  occasion: 'Birthday',
  recipientName: 'Nehal',
  senderName: 'Brother',
  celebrationDate: '2026-11-19',
  dateDisplayFormat: 'full',
  customDateLabel: '',
  passwordEnabled: true,
  password: 'nehal',
  passwordHint: 'Your first name, lowercase',
  gateTitle: 'A special surprise awaits',
  gateSubtitle: 'Enter the secret word to unlock your personal keepsake.',
  heroEyebrow: 'A day worth celebrating',
  heroTagline: 'Another year of laughter, kindness, and unforgettable moments.',
  heroPhotoUrl: '',
  messageTitle: 'A note from your friend',
  messageGreeting: 'Dear Nehal,',
  messageParagraphs: [
    'On your special day, I wanted to create something just for you — a little corner of the internet that celebrates everything that makes you Lovely.',
    "From the way you light up every room you walk into, to the late-night conversations and inside jokes only we understand — you've made life brighter, funnier, and infinitely more meaningful.",
    "Here's to another year of adventures, dreams coming true, and memories we'll laugh about for years. You deserve all the happiness in the world.",
  ],
  messageSignOff: 'Your Dear,',
  memoriesTitle: 'Moments I treasure',
  memoriesSubtitle: 'Little snapshots of our bond',
  memories: [
    {
      id: 'mem-1',
      title: 'The First photo',
      date: 'The Beginning',
      caption:
        'First time we built our bond and trust by sharing a pic with me — and trusting me, a trust that is never going to break.',
      imageUrl: '/src/assets/images/memory_first_photo_1795099193291.jpg',
      gradientIndex: 0,
    },
    {
      id: 'mem-2',
      title: 'Late night talks',
      date: 'Midnight Hours',
      caption: 'Hours that felt like minutes — sharing dreams, fears, and everything in between.',
      imageUrl: '/src/assets/images/memory_late_night_1795099194043.jpg',
      gradientIndex: 1,
    },
    {
      id: 'mem-3',
      title: 'Your birthday last year',
      date: 'Last Year',
      caption: 'The surprise, the cake fight, and you pretending to be mad while smiling the whole time.',
      imageUrl: '/src/assets/images/memory_cake_celebration_1795099193617.jpg',
      gradientIndex: 2,
    },
    {
      id: 'mem-4',
      title: 'Every ordinary day',
      date: 'Always',
      caption: "Because friendship isn't just the big moments — it's showing up, always.",
      imageUrl: '',
      gradientIndex: 3,
    },
  ],
  wishTitle: 'Make a wish',
  wishSubtitle: 'Tap the candles, then blow them out',
  wishResultText: 'Your wish is on its way to the stars. Happy Birthday, Nehal!',
  candleCount: 3,
  cakeBanner: {
    enabled: true,
    text: "It's your birthday!",
    fontId: 'pacifico',
    textColor: '#faf6f0',
    backgroundColor: '#c44736',
  },
  footerText: 'Made with love for birthday · 2026',
  themeId: 'golden-celebration',
  colors: {
    background: '#faf6f0',
    surface: '#0f3d3c',
    ink: '#0f3d3c',
    accent: '#c44736',
    secondary: '#e8a849',
  },
  fontPairId: 'fraunces-outfit',
  effects: {
    confetti: true,
    sound: true,
    animations: true,
    musicTrackId: 'joyful-birthday-chime',
  },
  countdown: {
    enabled: true,
    targetDateTime: '2026-11-20T00:00',
    label: 'Counting down to the midnight toast',
    reachedText: 'The celebration moment has arrived!',
  },
  updatedAt: '2026-11-19T06:00:00.000Z',
};
