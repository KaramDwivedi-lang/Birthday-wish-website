import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMailtoShareHref,
  buildShareUrl,
  buildWhatsAppShareHref,
  computeCountdownRemaining,
  formatWishDate,
  getBannerFont,
  getContrastTextColor,
  getMusicTrack,
  isHexColorDark,
  sanitizeWishConfig,
  slugifyWishId,
  verifyWishPassword,
} from './wishLogic';
import { DEFAULT_WISH, MUSIC_TRACKS } from '../data/presets';

test('verifyWishPassword matches case-insensitively and trims whitespace', () => {
  assert.equal(verifyWishPassword({ passwordEnabled: true, password: 'nehal' }, 'Nehal'), true);
  assert.equal(verifyWishPassword({ passwordEnabled: true, password: 'nehal' }, '  NEHAL  '), true);
  assert.equal(verifyWishPassword({ passwordEnabled: true, password: 'nehal' }, 'wrong'), false);
});

test('verifyWishPassword allows entry when passwordEnabled is false', () => {
  assert.equal(verifyWishPassword({ passwordEnabled: false, password: 'secret' }, ''), true);
});

test('formatWishDate supports full, month-day, short, and custom formats', () => {
  assert.equal(formatWishDate('2026-11-19', 'full'), 'November 19, 2026');
  assert.equal(formatWishDate('2026-11-19', 'month-day'), 'November 19');
  assert.equal(formatWishDate('2026-11-19', 'short'), 'Nov 19, 2026');
  assert.equal(formatWishDate('2026-11-19', 'custom', 'Golden Jubilee'), 'Golden Jubilee');
});

test('slugifyWishId generates URL-safe slugs', () => {
  assert.equal(slugifyWishId('Nehal Sharma!', 'Birthday', 'a1b2'), 'nehal-sharma-birthday-a1b2');
  assert.equal(slugifyWishId('   ', 'Anniversary'), 'friend-anniversary');
});

test('share link builders encode URLs, hints, and subjects properly', () => {
  const url = buildShareUrl('http://localhost:3000/', 'nehal-birthday');
  assert.equal(url, 'http://localhost:3000/?wish=nehal-birthday');

  const waHref = buildWhatsAppShareHref(DEFAULT_WISH, url);
  assert.ok(waHref.startsWith('https://wa.me/?text='));
  assert.ok(decodeURIComponent(waHref).includes('Nehal'));
  assert.ok(decodeURIComponent(waHref).includes('Your first name, lowercase'));

  const mailHref = buildMailtoShareHref(DEFAULT_WISH, url);
  assert.ok(mailHref.startsWith('mailto:?subject='));
  assert.ok(decodeURIComponent(mailHref).includes('Birthday Surprise for Nehal'));
});

test('contrast helpers distinguish light and dark hex surfaces', () => {
  assert.equal(isHexColorDark('#0f3d3c'), true);
  assert.equal(isHexColorDark('#faf6f0'), false);
  assert.equal(getContrastTextColor('#0f3d3c'), '#faf6f0');
  assert.equal(getContrastTextColor('#faf6f0'), '#0f0906');
  assert.equal(getContrastTextColor('#e06d85'), '#0f0906');
});

test('sanitizeWishConfig clamps candle count and preserves defaults on partial input', () => {
  const sanitized = sanitizeWishConfig({
    recipientName: 'Aarav',
    candleCount: 12,
  });
  assert.equal(sanitized.recipientName, 'Aarav');
  assert.equal(sanitized.candleCount, 5);
  assert.equal(sanitized.memories.length, DEFAULT_WISH.memories.length);
  assert.equal(sanitized.countdown.enabled, DEFAULT_WISH.countdown.enabled);
  assert.equal(sanitized.cakeBanner.text, DEFAULT_WISH.cakeBanner.text);
  assert.equal(sanitized.effects.musicTrackId, DEFAULT_WISH.effects.musicTrackId);
});

test('music tracks and banner fonts resolve cleanly with fallbacks', () => {
  assert.equal(MUSIC_TRACKS.length, 6);
  assert.equal(getMusicTrack('romantic-anniversary').title, 'Golden Anniversary Strings');
  assert.equal(getMusicTrack('unknown-id').id, MUSIC_TRACKS[0].id);
  assert.equal(getBannerFont('pacifico').name, 'Pacifico Script');
  assert.equal(getBannerFont('unknown-font').id, 'pacifico');
});

test('computeCountdownRemaining calculates future units, zero crossing, and invalid strings', () => {
  const target = '2026-11-20T00:00:00.000Z';
  const targetMs = new Date(target).getTime();

  const future = computeCountdownRemaining(
    target,
    targetMs - (2 * 86400 + 3 * 3600 + 15 * 60 + 42) * 1000
  );
  assert.equal(future.isValid, true);
  assert.equal(future.isReached, false);
  assert.equal(future.days, 2);
  assert.equal(future.hours, 3);
  assert.equal(future.minutes, 15);
  assert.equal(future.seconds, 42);

  const exactZero = computeCountdownRemaining(target, targetMs);
  assert.equal(exactZero.isValid, true);
  assert.equal(exactZero.isReached, true);
  assert.equal(exactZero.totalMs, 0);

  const invalid = computeCountdownRemaining('not-a-date', targetMs);
  assert.equal(invalid.isValid, false);
  assert.equal(invalid.isReached, false);
});
