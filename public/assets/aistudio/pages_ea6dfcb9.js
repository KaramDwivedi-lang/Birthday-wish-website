/* ============================================
   Birthday Wish — Interactions & Confetti
   ============================================ */

protectPage();

const canvas = document.getElementById("confetti");
let ctx = null;
let particles = [];
let animating = false;
let audioContext = null;
let masterGain = null;
let backgroundOscillators = [];
let fireworksAudio = null;

if (canvas) {
  ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}

const COLORS = ["#e8a849", "#e86f5c", "#1a5c5a", "#f5d08a", "#c94e3d", "#5cb8b5"];

function createParticle(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 8 + 4;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    shape: Math.random() > 0.5 ? "rect" : "circle",
    life: 1,
    decay: Math.random() * 0.012 + 0.008,
    gravity: 0.18,
  };
}

function launchConfetti(count = 120, originX, originY) {
  if (!canvas || !ctx) return;

  const x = originX ?? canvas.width / 2;
  const y = originY ?? canvas.height * 0.35;

  for (let i = 0; i < count; i++) {
    particles.push(createParticle(x + (Math.random() - 0.5) * 200, y));
  }

  if (!animating) {
    animating = true;
    requestAnimationFrame(tick);
  }
}

function launchSparkleBurst(count = 90, originX, originY) {
  if (!canvas || !ctx) return;

  const x = originX ?? canvas.width / 2;
  const y = originY ?? canvas.height * 0.4;

  for (let i = 0; i < count; i++) {
    const sparkle = createParticle(x + (Math.random() - 0.5) * 140, y);
    sparkle.size = Math.random() * 6 + 2;
    sparkle.life = 0.8 + Math.random() * 0.2;
    sparkle.decay = 0.012 + Math.random() * 0.008;
    sparkle.gravity = 0.04;
    sparkle.vx *= 1.2;
    sparkle.vy *= 0.7;
    sparkle.rotationSpeed = (Math.random() - 0.5) * 20;
    sparkle.shape = Math.random() > 0.5 ? "rect" : "circle";
    particles.push(sparkle);
  }

  if (!animating) {
    animating = true;
    requestAnimationFrame(tick);
  }
}

function launchFirecrackerBurst(originX, originY) {
  if (!canvas || !ctx) return;

  const bursts = [
    { x: originX, y: originY },
    { x: originX - 140, y: originY - 60 },
    { x: originX + 140, y: originY - 60 },
    { x: originX - 90, y: originY + 80 },
    { x: originX + 90, y: originY + 80 }
  ];

  bursts.forEach((burst) => {
    for (let i = 0; i < 25; i++) {
      const particle = createParticle(burst.x, burst.y);
      particle.size = Math.random() * 5 + 2;
      particle.life = 0.7 + Math.random() * 0.2;
      particle.decay = 0.015 + Math.random() * 0.008;
      particle.gravity = 0.015;
      particle.color = ["#ffd166", "#ff6b35", "#f4a261", "#ffffff"][Math.floor(Math.random() * 4)];
      particle.vx = (Math.random() - 0.5) * 14;
      particle.vy = (Math.random() - 0.6) * 12 - 2;
      particle.rotationSpeed = (Math.random() - 0.5) * 24;
      particles.push(particle);
    }
  });

  if (!animating) {
    animating = true;
    requestAnimationFrame(tick);
  }
}

function startBackgroundSound() {
  if (audioContext) {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audioContext = new AudioContextClass();
  masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  masterGain.connect(audioContext.destination);

  const notes = [261.63, 329.63, 392.0, 493.88];
  backgroundOscillators = notes.map((freq, index) => {
    const osc = audioContext.createOscillator();
    osc.type = index % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;

    const gain = audioContext.createGain();
    gain.gain.value = index === 0 ? 0.0002 : 0.00015;

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();

    return { osc, gain };
  });

  masterGain.gain.exponentialRampToValueAtTime(0.00045, audioContext.currentTime + 0.8);
}

function playCelebrationChime() {
  if (!audioContext || !masterGain) return;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const now = audioContext.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];

  notes.forEach((freq, index) => {
    const osc = audioContext.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + index * 0.08);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0002, now + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + index * 0.08 + 0.25);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.27);
  });
}

function playFireworkSound() {
  if (!audioContext || !masterGain) return;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const now = audioContext.currentTime;
  const burst = audioContext.createOscillator();
  const burst2 = audioContext.createOscillator();
  burst.type = "sine";
  burst2.type = "triangle";
  burst.frequency.setValueAtTime(880, now);
  burst.frequency.exponentialRampToValueAtTime(120, now + 0.35);
  burst2.frequency.setValueAtTime(660, now);
  burst2.frequency.exponentialRampToValueAtTime(180, now + 0.4);

  const burstGain = audioContext.createGain();
  const burstGain2 = audioContext.createGain();
  burstGain.gain.setValueAtTime(0.00022, now);
  burstGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.35);
  burstGain2.gain.setValueAtTime(0.00016, now);
  burstGain2.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);

  burst.connect(burstGain);
  burst2.connect(burstGain2);
  burstGain.connect(masterGain);
  burstGain2.connect(masterGain);

  burst.start(now);
  burst2.start(now + 0.02);
  burst.stop(now + 0.35);
  burst2.stop(now + 0.4);

  fireworksAudio = { burst, burst2, burstGain, burstGain2 };
}

function tick() {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter((p) => p.life > 0);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.99;
    p.rotation += p.rotationSpeed;
    p.life -= p.decay;

    ctx.save();
    ctx.globalAlpha = Math.max(p.life, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;

    if (p.shape === "rect") {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  if (particles.length > 0) {
    requestAnimationFrame(tick);
  } else {
    animating = false;
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".message__card, .memory").forEach((el) => observer.observe(el));

const celebrateBtn = document.getElementById("celebrateBtn");
if (celebrateBtn) {
  celebrateBtn.addEventListener("click", () => {
    launchConfetti(150);
    setTimeout(() => launchConfetti(80, canvas.width * 0.3, canvas.height * 0.4), 200);
    setTimeout(() => launchConfetti(80, canvas.width * 0.7, canvas.height * 0.4), 400);
  });

  window.addEventListener("load", () => {
    setTimeout(() => launchConfetti(60), 800);
  });
}

const candles = document.querySelectorAll(".candle");
const blowBtn = document.getElementById("blowBtn");
const wishResult = document.getElementById("wishResult");
const cake = document.getElementById("cake");

window.addEventListener("pointerdown", startBackgroundSound, { once: true });
window.addEventListener("keydown", startBackgroundSound, { once: true });

function updateBlowButton() {
  if (!blowBtn) return;
  const allLit = [...candles].every((c) => c.dataset.lit === "true");
  blowBtn.disabled = !allLit;
}

candles.forEach((candle) => {
  candle.addEventListener("click", () => {
    candle.dataset.lit = candle.dataset.lit === "true" ? "false" : "true";
    updateBlowButton();
  });
});

if (blowBtn) {
  blowBtn.addEventListener("click", () => {
    candles.forEach((c) => (c.dataset.lit = "false"));
    blowBtn.disabled = true;
    wishResult.hidden = false;
    startBackgroundSound();
    playCelebrationChime();
    playFireworkSound();

    if (cake) {
      cake.classList.remove("is-celebrating");
      void cake.offsetWidth;
      cake.classList.add("is-celebrating");
      setTimeout(() => cake.classList.remove("is-celebrating"), 1400);
    }

    launchConfetti(150);
    setTimeout(() => launchConfetti(80, canvas.width * 0.3, canvas.height * 0.4), 200);
    setTimeout(() => launchConfetti(80, canvas.width * 0.7, canvas.height * 0.4), 400);
    setTimeout(() => {
      launchSparkleBurst(120, canvas.width * 0.5, canvas.height * 0.35);
      launchFirecrackerBurst(canvas.width * 0.5, canvas.height * 0.35);
    }, 500);
  });
}

const replayBtn = document.getElementById("replayBtn");
if (replayBtn) {
  replayBtn.addEventListener("click", () => {
    sessionStorage.removeItem("birthday_unlocked");
    window.location.href = "index.html";
  });
}
