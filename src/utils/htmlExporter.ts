import { MEMORY_GRADIENTS } from '../data/presets';
import type { WishConfig } from '../types/wish';
import { formatWishDate, getBannerFont, getContrastTextColor, getFontPair } from './wishLogic';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateStandaloneWishHtml(wish: WishConfig): string {
  const fontPair = getFontPair(wish.fontPairId);
  const bannerFont = getBannerFont(wish.cakeBanner.fontId);
  const formattedDate = formatWishDate(
    wish.celebrationDate,
    wish.dateDisplayFormat,
    wish.customDateLabel
  );
  const surfaceText = getContrastTextColor(wish.colors.surface);
  const accentText = getContrastTextColor(wish.colors.accent);

  const memoriesHtml = wish.memories
    .map((m, idx) => {
      const grad = MEMORY_GRADIENTS[m.gradientIndex % MEMORY_GRADIENTS.length];
      const visual = m.imageUrl
        ? `<img src="${escapeHtml(m.imageUrl)}" alt="${escapeHtml(m.title)}" style="width:100%;height:200px;object-fit:cover;border-radius:6px;display:block;" />`
        : `<div style="width:100%;height:200px;border-radius:6px;background:${grad};"></div>`;

      return `
        <article class="memory-card">
          ${visual}
          <div style="margin-top:14px;">
            ${m.date ? `<p class="muted" style="font-size:12px;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:4px;">${escapeHtml(m.date)}</p>` : ''}
            <h3 style="font-family:var(--font-display);font-size:1.25rem;margin-bottom:6px;">${escapeHtml(m.title)}</h3>
            <p class="muted" style="font-size:0.95rem;line-height:1.6;">${escapeHtml(m.caption)}</p>
          </div>
        </article>`;
    })
    .join('\n');

  const paragraphsHtml = wish.messageParagraphs
    .map((p) => `<p style="margin-bottom:1.1rem;line-height:1.8;">${escapeHtml(p)}</p>`)
    .join('\n');

  const candlesHtml = Array.from({ length: wish.candleCount }, (_, i) => {
    return `
      <button type="button" class="candle" data-lit="true" aria-label="Candle ${i + 1}">
        <span class="flame"></span>
      </button>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(wish.occasion)} Wish for ${escapeHtml(wish.recipientName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,700;6..96,900&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&family=Lora:wght@400;500;600&family=Manrope:wght@400;500;600&family=Outfit:wght@300;400;500;600&family=Pacifico&family=Playfair+Display:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: ${escapeHtml(wish.colors.background)};
      --surface: ${escapeHtml(wish.colors.surface)};
      --surface-text: ${escapeHtml(surfaceText)};
      --ink: ${escapeHtml(wish.colors.ink)};
      --accent: ${escapeHtml(wish.colors.accent)};
      --accent-text: ${escapeHtml(accentText)};
      --secondary: ${escapeHtml(wish.colors.secondary)};
      --font-display: ${fontPair.displayFont};
      --font-body: ${fontPair.bodyFont};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--ink);
      min-height: 100vh;
      overflow-x: hidden;
    }
    canvas#confetti {
      position: fixed; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 999;
    }
    header {
      position: sticky; top: 0; z-index: 50;
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.5rem;
      background: color-mix(in srgb, var(--bg) 90%, transparent);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
    }
    .brand { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; }
    .nav-pills { display: flex; gap: 0.75rem; align-items: center; }
    .nav-btn {
      background: transparent; border: none; color: var(--ink); opacity: 0.65;
      font-family: var(--font-body); font-size: 0.875rem; font-weight: 500;
      cursor: pointer; padding: 0.35rem 0.5rem;
    }
    .nav-btn.active { opacity: 1; text-decoration: underline; text-underline-offset: 6px; color: var(--accent); }
    .page { display: none; min-height: calc(100vh - 120px); padding: 3rem 1.5rem; max-width: 1040px; margin: 0 auto; }
    .page.active { display: flex; flex-direction: column; justify-content: center; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 0.85rem 1.75rem; border-radius: 6px; font-weight: 600;
      font-family: var(--font-body); font-size: 0.95rem; cursor: pointer;
      border: 1.5px solid transparent; transition: transform 0.2s ease, opacity 0.2s ease;
    }
    .btn:hover:not(:disabled) { transform: translateY(-1px); }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-primary { background: var(--accent); color: var(--accent-text); }
    .btn-ghost { background: transparent; border-color: color-mix(in srgb, var(--ink) 25%, transparent); color: var(--ink); }
    .muted { opacity: 0.75; }
    .card-surface {
      background: var(--surface); color: var(--surface-text);
      padding: 2.5rem; border-radius: 10px;
      border: 1px solid color-mix(in srgb, var(--secondary) 30%, transparent);
      max-width: 680px; margin: 0 auto; width: 100%;
    }
    .memories-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1.75rem; margin-top: 2rem;
    }
    .cake-wrap { margin: 2rem auto; display: inline-flex; flex-direction: column; align-items: center; }
    .candles { display: flex; gap: 1.4rem; margin-bottom: 6px; }
    .candle {
      position: relative; width: 12px; height: 38px; border: none; border-radius: 3px 3px 0 0;
      background: linear-gradient(to right, var(--secondary), #f5d08a); cursor: pointer;
    }
    .flame {
      position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
      width: 14px; height: 22px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      background: radial-gradient(ellipse at 50% 80%, #ff6b35 0%, #ffd166 55%, transparent 80%);
    }
    .candle[data-lit="false"] .flame { opacity: 0; transform: translateX(-50%) scale(0); }
    .cake-body { width: 220px; display: flex; flex-direction: column; align-items: center; }
    .frosting { height: 28px; width: 100%; background: var(--accent); border-radius: 10px 10px 0 0; }
    .layer-1 { width: 100%; height: 48px; background: #f5ebe0; }
    .layer-2 { width: 92%; height: 44px; background: var(--secondary); }
    .layer-3 { width: 84%; height: 40px; background: var(--surface); border-radius: 0 0 8px 8px; }
    footer.bottom-nav {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem 1.5rem; max-width: 1040px; margin: 0 auto;
      border-top: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
    }
    input.pw-input {
      width: 100%; padding: 0.85rem 1rem; border-radius: 6px;
      border: 1px solid color-mix(in srgb, var(--ink) 25%, transparent);
      background: transparent; color: var(--ink); font-size: 1rem;
      margin-bottom: 1rem; font-family: var(--font-body);
    }
  </style>
</head>
<body>
  <canvas id="confetti" aria-hidden="true"></canvas>
  <header>
    <span class="brand">For ${escapeHtml(wish.recipientName)}</span>
    <nav class="nav-pills" id="topNav">
      <button type="button" class="nav-btn active" data-page="1">1. Gate</button>
      <button type="button" class="nav-btn" data-page="2">2. Welcome</button>
      <button type="button" class="nav-btn" data-page="3">3. Letter</button>
      <button type="button" class="nav-btn" data-page="4">4. Memories</button>
      <button type="button" class="nav-btn" data-page="5">5. Wish</button>
    </nav>
    <span class="muted" style="font-size:0.85rem;">${escapeHtml(formattedDate)}</span>
  </header>

  <main>
    <section class="page active" data-page="1" style="text-align:center;max-width:460px;">
      <p class="muted" style="font-size:0.8rem;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:0.75rem;">${escapeHtml(wish.occasion)}</p>
      <h1 style="font-family:var(--font-display);font-size:2.5rem;margin-bottom:0.75rem;">${escapeHtml(wish.gateTitle)}</h1>
      <p class="muted" style="margin-bottom:1.75rem;">${escapeHtml(wish.gateSubtitle)}</p>
      <form id="gateForm">
        <input id="pwInput" class="pw-input" type="password" placeholder="Enter secret word" autocomplete="off" />
        <button type="submit" class="btn btn-primary" style="width:100%;">Unlock Keepsake</button>
      </form>
      <p id="pwError" style="color:var(--accent);margin-top:0.75rem;display:none;">That doesn't match yet — check the hint below.</p>
      ${wish.passwordHint ? `<p class="muted" style="margin-top:1rem;font-size:0.875rem;">Hint: ${escapeHtml(wish.passwordHint)}</p>` : ''}
    </section>

    <section class="page" data-page="2" style="text-align:center;">
      <p style="color:var(--secondary);font-size:0.875rem;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:1rem;">${escapeHtml(formattedDate)}${wish.heroEyebrow ? ` · ${escapeHtml(wish.heroEyebrow)}` : ''}</p>
      <h1 style="font-family:var(--font-display);font-size:clamp(3.5rem,11vw,7rem);line-height:0.95;margin-bottom:1.25rem;">${escapeHtml(wish.recipientName)}</h1>
      <p class="muted" style="max-width:34rem;margin:0 auto 1.5rem;font-size:1.15rem;">${escapeHtml(wish.heroTagline)}</p>
      ${wish.heroPhotoUrl ? `<img src="${escapeHtml(wish.heroPhotoUrl)}" alt="${escapeHtml(wish.recipientName)}" style="width:220px;height:220px;object-fit:cover;border-radius:12px;margin:0 auto 1.5rem;" />` : ''}
      ${
        wish.countdown.enabled
          ? `<div id="countdownBox" style="max-width:460px;margin:0 auto 2rem;padding:1rem 1.25rem;border-radius:12px;border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);"><p id="countdownLabel" style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--secondary);margin-bottom:0.5rem;">${escapeHtml(wish.countdown.label)}</p><div id="countdownDigits" style="font-family:var(--font-display);font-size:1.75rem;font-weight:700;font-variant-numeric:tabular-nums;">--d : --h : --m : --s</div></div>`
          : ''
      }
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <button type="button" id="celebrateBtn" class="btn btn-primary">Celebrate!</button>
        <button type="button" class="btn btn-ghost" onclick="goToPage(3)">Read my message</button>
      </div>
    </section>

    <section class="page" data-page="3">
      <h2 style="font-family:var(--font-display);font-size:2.25rem;text-align:center;margin-bottom:2rem;">${escapeHtml(wish.messageTitle)}</h2>
      <div class="card-surface">
        <p style="font-family:var(--font-display);font-size:1.4rem;color:var(--secondary);margin-bottom:1.25rem;">${escapeHtml(wish.messageGreeting)}</p>
        ${paragraphsHtml}
        <p style="margin-top:1.75rem;opacity:0.85;">${escapeHtml(wish.messageSignOff)}<br /><strong style="color:var(--secondary);font-size:1.1rem;">${escapeHtml(wish.senderName)}</strong></p>
      </div>
    </section>

    <section class="page" data-page="4">
      <div style="text-align:center;">
        <h2 style="font-family:var(--font-display);font-size:2.25rem;margin-bottom:0.5rem;">${escapeHtml(wish.memoriesTitle)}</h2>
        <p class="muted">${escapeHtml(wish.memoriesSubtitle)}</p>
      </div>
      <div class="memories-grid">${memoriesHtml}</div>
    </section>

    <section class="page" data-page="5" style="text-align:center;">
      <h2 style="font-family:var(--font-display);font-size:2.25rem;margin-bottom:0.5rem;">${escapeHtml(wish.wishTitle)}</h2>
      <p class="muted">${escapeHtml(wish.wishSubtitle)}</p>
      ${
        wish.cakeBanner.enabled
          ? `<div style="max-width:560px;width:100%;margin:1.75rem auto 0.5rem;padding:1.25rem 2rem;border-radius:14px;background:${escapeHtml(wish.cakeBanner.backgroundColor)};color:${escapeHtml(wish.cakeBanner.textColor)};border:2px solid var(--secondary);box-shadow:0 16px 30px -10px rgba(0,0,0,0.35);font-family:${bannerFont.fontFamily};font-size:clamp(1.5rem,4vw,2.3rem);font-weight:700;">${escapeHtml(wish.cakeBanner.text)}</div>`
          : ''
      }
      <div class="cake-wrap">
        <div class="candles">${candlesHtml}</div>
        <div class="cake-body">
          <div class="frosting"></div>
          <div class="layer-1"></div>
          <div class="layer-2"></div>
          <div class="layer-3"></div>
        </div>
      </div>
      <div>
        <button type="button" id="blowBtn" class="btn btn-primary">Blow out the candles</button>
      </div>
      <p id="wishResult" style="display:none;margin-top:1.5rem;font-family:var(--font-display);font-size:1.3rem;color:var(--accent);">${escapeHtml(wish.wishResultText)}</p>
      <p class="muted" style="margin-top:2.5rem;font-size:0.85rem;">${escapeHtml(wish.footerText)}</p>
    </section>
  </main>

  <footer class="bottom-nav">
    <button type="button" id="prevBtn" class="btn btn-ghost">← Back</button>
    <div style="text-align:center;">
      <span id="pageLabel" class="muted" style="font-size:0.875rem;display:block;">Page 1 of 5</span>
      <span class="muted" style="font-size:0.7rem;letter-spacing:0.06em;opacity:0.75;">✦ Made by Karam Dwivedi</span>
    </div>
    <button type="button" id="nextBtn" class="btn btn-ghost">Next →</button>
  </footer>

  <script>
    const PASSWORD_ENABLED = ${JSON.stringify(wish.passwordEnabled)};
    const EXPECTED_PASSWORD = ${JSON.stringify(wish.password.trim().toLowerCase())};
    const CONFETTI_ENABLED = ${JSON.stringify(wish.effects.confetti)};
    const COUNTDOWN = ${JSON.stringify(wish.countdown)};
    let countdownCelebrated = false;
    let unlocked = !PASSWORD_ENABLED || !EXPECTED_PASSWORD;
    let currentPage = unlocked ? 2 : 1;

    function goToPage(n) {
      if (n > 1 && !unlocked) return;
      currentPage = Math.max(1, Math.min(5, n));
      document.querySelectorAll('.page').forEach(el => {
        el.classList.toggle('active', Number(el.dataset.page) === currentPage);
      });
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.page) === currentPage);
      });
      document.getElementById('pageLabel').textContent = 'Page ' + currentPage + ' of 5';
      document.getElementById('prevBtn').disabled = currentPage <= (unlocked ? 2 : 1);
      document.getElementById('nextBtn').disabled = currentPage >= 5 || !unlocked;
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => goToPage(Number(btn.dataset.page)));
    });
    document.getElementById('prevBtn').addEventListener('click', () => goToPage(currentPage - 1));
    document.getElementById('nextBtn').addEventListener('click', () => goToPage(currentPage + 1));

    document.getElementById('gateForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('pwInput').value.trim().toLowerCase();
      if (!PASSWORD_ENABLED || !EXPECTED_PASSWORD || val === EXPECTED_PASSWORD) {
        unlocked = true;
        document.getElementById('pwError').style.display = 'none';
        goToPage(2);
        if (CONFETTI_ENABLED) launchConfetti(90);
      } else {
        document.getElementById('pwError').style.display = 'block';
      }
    });

    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let running = false;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const colors = [${JSON.stringify(wish.colors.accent)}, ${JSON.stringify(wish.colors.secondary)}, ${JSON.stringify(wish.colors.surface)}, '#ffffff'];
    function launchConfetti(count) {
      if (!CONFETTI_ENABLED) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        particles.push({
          x: canvas.width / 2, y: canvas.height * 0.35,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4,
          color: colors[i % colors.length], size: Math.random() * 7 + 4,
          life: 1, decay: 0.01 + Math.random() * 0.01
        });
      }
      if (!running) { running = true; requestAnimationFrame(tick); }
    }
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
      }
      if (particles.length) requestAnimationFrame(tick); else running = false;
    }

    document.getElementById('celebrateBtn').addEventListener('click', () => launchConfetti(140));
    const candles = document.querySelectorAll('.candle');
    const blowBtn = document.getElementById('blowBtn');
    candles.forEach(c => c.addEventListener('click', () => {
      c.dataset.lit = c.dataset.lit === 'true' ? 'false' : 'true';
      blowBtn.disabled = ![...candles].every(x => x.dataset.lit === 'true');
    }));
    function playFirecrackers() {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ac = new Ctx();
        const now = ac.currentTime;
        const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.12), ac.sampleRate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.025));
        [0.05, 0.12, 0.18, 0.26, 0.35, 0.44, 0.56, 0.7].forEach((off) => {
          const s = ac.createBufferSource(); s.buffer = buf;
          const g = ac.createGain(); g.gain.setValueAtTime(0.6, now + off); g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.11);
          s.connect(g); g.connect(ac.destination); s.start(now + off); s.stop(now + off + 0.12);
        });
      } catch (e) {}
    }
    blowBtn.addEventListener('click', () => {
      candles.forEach(c => c.dataset.lit = 'false');
      blowBtn.disabled = true;
      document.getElementById('wishResult').style.display = 'block';
      playFirecrackers();
      launchConfetti(180);
    });

    if (COUNTDOWN.enabled && COUNTDOWN.targetDateTime) {
      const updateCountdown = () => {
        const box = document.getElementById('countdownBox');
        const digits = document.getElementById('countdownDigits');
        const label = document.getElementById('countdownLabel');
        if (!box || !digits) return;
        const targetMs = new Date(COUNTDOWN.targetDateTime).getTime();
        if (isNaN(targetMs)) { box.style.display = 'none'; return; }
        const diff = targetMs - Date.now();
        if (diff <= 0) {
          if (label) label.style.display = 'none';
          digits.textContent = COUNTDOWN.reachedText || 'The celebration moment has arrived!';
          digits.style.fontSize = '1.15rem';
          box.style.borderColor = 'var(--accent)';
          if (!countdownCelebrated && currentPage === 2) {
            countdownCelebrated = true;
            launchConfetti(150);
          }
          return;
        }
        const s = Math.floor(diff / 1000);
        const d = String(Math.floor(s / 86400)).padStart(2, '0');
        const h = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const sec = String(s % 60).padStart(2, '0');
        digits.textContent = d + 'd : ' + h + 'h : ' + m + 'm : ' + sec + 's';
      };
      updateCountdown();
      setInterval(updateCountdown, 500);
    }

    goToPage(currentPage);
  </script>
</body>
</html>`;
}
