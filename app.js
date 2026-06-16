/* ═══════════════════════════════════════════
   SP TECH RPG PORTFOLIO — app.js
═══════════════════════════════════════════ */

/* ── Particle System ── */
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const COLORS = [
  'rgba(0,255,136,',
  'rgba(0,194,255,',
  'rgba(255,215,0,',
];

class Particle {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x     = Math.random() * W;
    this.y     = init ? Math.random() * H : H + 10;
    this.size  = Math.random() * 1.6 + 0.2;
    this.speed = Math.random() * 0.45 + 0.08;
    this.vx    = (Math.random() - 0.5) * 0.25;
    this.alpha = Math.random() * 0.35 + 0.04;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    // occasional bright "data" particles
    if (Math.random() < 0.04) {
      this.size  = Math.random() * 3 + 1;
      this.alpha = 0.6;
    }
  }
  update() {
    this.x += this.vx;
    this.y -= this.speed;
    if (this.y < -10) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
  }
}

// Occasional horizontal "data line" streaks
class DataLine {
  constructor() { this.reset(); }
  reset() {
    this.x   = Math.random() * W;
    this.y   = Math.random() * H;
    this.len = Math.random() * 60 + 20;
    this.spd = Math.random() * 2 + 1;
    this.a   = Math.random() * 0.25 + 0.05;
    this.color = COLORS[0];
  }
  update() { this.x += this.spd; if (this.x > W + 80) this.reset(); }
  draw() {
    const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.len, this.y);
    grad.addColorStop(0, this.color + '0)');
    grad.addColorStop(0.5, this.color + this.a + ')');
    grad.addColorStop(1, this.color + '0)');
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.len, this.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

const particles = Array.from({ length: 160 }, () => new Particle());
const dataLines = Array.from({ length: 8 },   () => new DataLine());

function loop() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  dataLines.forEach(l => { l.update(); l.draw(); });
  requestAnimationFrame(loop);
}
loop();

/* ── Navbar ── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu= document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mob-a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ── Smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ── XP Bar animation ── */
function animateXP() {
  const fill   = document.getElementById('xpFill');
  const dot    = document.getElementById('xpDot');
  const valEl  = document.getElementById('xpVal');
  const pctEl  = document.getElementById('xpPct');

  const target = 8750;
  const max    = 10000;
  const pct    = Math.round((target / max) * 100);

  setTimeout(() => {
    fill.style.width = pct + '%';
    dot.style.left   = pct + '%';

    const dur  = 2600;
    const t0   = performance.now();
    const tick = now => {
      const p    = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur  = Math.floor(ease * target);
      valEl.textContent = cur.toLocaleString() + ' / 10,000';
      pctEl.textContent = Math.round(ease * pct) + '%';
      if (p < 1) requestAnimationFrame(tick);
      else {
        valEl.textContent = '8,750 / 10,000';
        pctEl.textContent = pct + '%';
        showToast('⚡ +500 XP GAINED');
      }
    };
    requestAnimationFrame(tick);
  }, 700);
}

/* ── Counter animations ── */
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const dur    = 1800;
  const t0     = performance.now();
  const tick   = now => {
    const p    = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

/* ── XP Toast ── */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('xpToast');
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ── Intersection Observers ── */

// Hero card — triggers XP + counters
const heroObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    animateXP();
    document.querySelectorAll('.hc-n').forEach(animateCount);
    heroObs.unobserve(e.target);
  });
}, { threshold: 0.3 });
const charCard = document.getElementById('charCard');
if (charCard) heroObs.observe(charCard);

// Skill bars (active only)
const skillsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.sk-bar:not(.locked-bar)').forEach(bar => {
      bar.style.width = bar.dataset.w + '%';
    });
    skillsObs.unobserve(e.target);
  });
}, { threshold: 0.15 });
const skillsWrap = document.querySelector('.skill-paths');
if (skillsWrap) skillsObs.observe(skillsWrap);

// Boss HP bar
const bossObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const hp = e.target.querySelector('.bp-hp-fill');
    if (hp) hp.style.width = '90%';
    bossObs.unobserve(e.target);
  });
}, { threshold: 0.3 });
const bossProfile = document.querySelector('.boss-profile');
if (bossProfile) bossObs.observe(bossProfile);

// Generic reveal (section headers, cards, etc.)
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    revealObs.unobserve(e.target);
  });
}, { threshold: 0.1 });

// Auto-add reveal to section headers
document.querySelectorAll('.sec-title, .sec-tag, .sec-sub').forEach(el => {
  el.classList.add('reveal');
  revealObs.observe(el);
});

// Quest cards — staggered
const questGrid = document.querySelector('.quests-grid');
if (questGrid) {
  const qObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.qc').forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('reveal');
          setTimeout(() => card.classList.add('visible'), 50);
        }, i * 110);
      });
      qObs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  qObs.observe(questGrid);
}

// Timeline items
document.querySelectorAll('.tl-item').forEach(el => {
  const tlObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      tlObs.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  tlObs.observe(el);
});

// Achievement cards — staggered unlock
const achGrid = document.querySelector('.ach-grid');
if (achGrid) {
  const achObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.ach-card').forEach(card => {
        const delay = (parseInt(card.dataset.delay) || 0) * 130;
        setTimeout(() => {
          card.classList.add('visible');
          if (delay === 0) showToast('🏆 ACHIEVEMENT UNLOCKED!');
          if (delay > 400) showToast('🏆 ACHIEVEMENT UNLOCKED!');
        }, delay);
      });
      achObs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  achObs.observe(achGrid);
}

// Inventory slots — staggered
const invGrid = document.querySelector('.inv-grid');
if (invGrid) {
  const invObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.inv-slot').forEach((slot, i) => {
        slot.classList.add('reveal');
        setTimeout(() => slot.classList.add('visible'), i * 80);
      });
      invObs.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  invObs.observe(invGrid);
}

// Skill rows stagger
const skillListObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.skill-row:not(.locked-row)').forEach((row, i) => {
      row.classList.add('reveal');
      setTimeout(() => row.classList.add('visible'), i * 100);
    });
    // locked rows just fade in together
    e.target.querySelectorAll('.locked-row').forEach((row, i) => {
      row.classList.add('reveal');
      setTimeout(() => row.classList.add('visible'), 200 + i * 60);
    });
    skillListObs.unobserve(e.target);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.skills-list').forEach(list => skillListObs.observe(list));

/* ── Skill hover toast ── */
let skillToastTimer;
document.querySelectorAll('.skill-row:not(.locked-row)').forEach(row => {
  row.addEventListener('mouseenter', () => {
    clearTimeout(skillToastTimer);
    const pts = row.dataset.pts;
    if (pts) skillToastTimer = setTimeout(() => showToast('⚡ +' + pts + ' STAT POINTS'), 280);
  });
});

/* ── Locked skill click feedback ── */
document.querySelectorAll('.locked-row').forEach(row => {
  row.addEventListener('click', () => showToast('🔒 LOCKED — Coming in future update'));
});

/* ── Quest Modal ── */
const startBtn   = document.getElementById('startQuestBtn');
const overlay    = document.getElementById('questOverlay');
const closeBtn   = document.getElementById('qmClose');

if (startBtn) {
  startBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    showToast('⚔ QUEST ACCEPTED!');
  });
}
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  });
}
if (overlay) {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ── Active nav highlight ── */
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-a');

new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    navAs.forEach(a => {
      const isActive = a.getAttribute('href') === '#' + id;
      a.style.color       = isActive ? 'var(--green)'     : '';
      a.style.borderColor = isActive ? 'var(--border-g)'  : '';
      a.style.textShadow  = isActive ? '0 0 8px var(--green)' : '';
    });
  });
}, { threshold: 0.45 }).observe && sections.forEach(s => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      navAs.forEach(a => {
        const isActive = a.getAttribute('href') === '#' + id;
        if (!a.classList.contains('boss-link')) {
          a.style.color      = isActive ? 'var(--green)'      : '';
          a.style.textShadow = isActive ? '0 0 8px var(--green)' : '';
        }
      });
    });
  }, { threshold: 0.45 }).observe(s);
});
