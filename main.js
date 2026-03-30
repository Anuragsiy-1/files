/* ═══════════════════════════════════════════════════════
   main.js — Anurag Yadav Portfolio
   Author: Anurag Yadav
═══════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════
   1. B-2 SPIRIT INTRO
═══════════════════════════════════════════════ */
(function initIntro() {
  const intro    = document.getElementById('intro');
  const canvas   = document.getElementById('intro-canvas');
  const ctx      = canvas.getContext('2d');
  const bar      = document.getElementById('intro-bar');
  const hudSys   = document.getElementById('hud-sys');
  const hudPct   = document.getElementById('hud-pct');

  let W, H, progress = 0, startTime = null;
  const DURATION = 3800; // ms total
  const LAUNCH_DELAY = 400; // plane enters after this

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Draw B-2 silhouette with canvas path ── */
  function drawB2(x, y, scale, alpha, glow) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    // Glow effect
    if (glow) {
      ctx.shadowColor = '#00ffe5';
      ctx.shadowBlur = 24 * scale;
    }

    // B-2 Spirit top-down silhouette — flying wing shape
    ctx.beginPath();
    // Wing shape — wide, flat, bat-like
    ctx.moveTo(0, -8);         // nose
    ctx.lineTo(-8, -6);
    ctx.lineTo(-40, 2);        // left inner wing
    ctx.lineTo(-90, 14);       // left outer wing tip
    ctx.lineTo(-80, 18);
    ctx.lineTo(-36, 8);
    ctx.lineTo(-14, 12);       // left tail notch
    ctx.lineTo(-8, 10);
    ctx.lineTo(0, 12);         // tail center
    ctx.lineTo(8, 10);
    ctx.lineTo(14, 12);        // right tail notch
    ctx.lineTo(36, 8);
    ctx.lineTo(80, 18);
    ctx.lineTo(90, 14);        // right wing tip
    ctx.lineTo(40, 2);
    ctx.lineTo(8, -6);
    ctx.closePath();

    ctx.fillStyle = '#00ffe5';
    ctx.fill();

    // Engine nacelles (subtle bumps on top)
    ctx.fillStyle = 'rgba(0,255,229,0.6)';
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.ellipse(i * 22, 2, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cockpit outline
    ctx.beginPath();
    ctx.ellipse(0, -4, 6, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,255,229,0.3)';
    ctx.fill();

    ctx.restore();
  }

  /* ── Exhaust particles ── */
  const exhaustParticles = [];
  function spawnExhaust(x, y) {
    for (let i = 0; i < 3; i++) {
      exhaustParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + Math.random() * 8 + 10,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 1.5 + 0.5,
        alpha: 0.7,
        size: Math.random() * 4 + 2
      });
    }
  }
  function updateExhaust() {
    for (let i = exhaustParticles.length - 1; i >= 0; i--) {
      const p = exhaustParticles[i];
      p.x += p.vx; p.y += p.vy;
      p.alpha -= 0.028;
      p.size  *= 0.97;
      if (p.alpha <= 0) exhaustParticles.splice(i, 1);
    }
  }
  function drawExhaust() {
    exhaustParticles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = '#00ffe5';
      ctx.shadowColor = '#00ffe5';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    });
  }

  /* ── Grid lines (HUD effect) ── */
  function drawGrid(alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.12;
    ctx.strokeStyle = '#00ffe5';
    ctx.lineWidth = 0.5;
    const step = 60;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();
  }

  /* ── Radar circle ── */
  function drawRadar(cx, cy, r, t) {
    ctx.save();
    // concentric rings
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * i / 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,255,229,${0.12 - i * 0.03})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    // sweep line
    const angle = t * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.strokeStyle = 'rgba(0,255,229,0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // fade arc
    const grad = ctx.createConicalGradient
      ? null
      : null; // fallback
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle - 0.8, angle, false);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,255,229,0.06)';
    ctx.fill();
    ctx.restore();
  }

  /* ── Target reticle ── */
  function drawReticle(x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#00ffe5';
    ctx.lineWidth = 1;
    const s = size;
    // cross
    ctx.beginPath();
    ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
    ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
    ctx.stroke();
    // circle
    ctx.beginPath();
    ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    // corners
    const c = s * 0.35;
    const corners = [[-s,-s],[s,-s],[s,s],[-s,s]];
    corners.forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy + (dy > 0 ? -c : c));
      ctx.lineTo(x + dx, y + dy);
      ctx.lineTo(x + dx + (dx > 0 ? -c : c), y + dy);
      ctx.stroke();
    });
    ctx.restore();
  }

  /* ── Stars in background ── */
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.2 + 0.2,
    a: Math.random() * 0.6 + 0.2
  }));
  function drawStars() {
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.fill();
    });
  }

  /* ── Planes ── */
  const planes = [];
  const planeCount = 3;
  let planesLaunched = false;

  function launchPlanes() {
    for (let i = 0; i < planeCount; i++) {
      const yPos = H * (0.28 + i * 0.22);
      const delay = i * 380;
      const scale = 1.4 - i * 0.25;
      planes.push({
        x: -140,
        y: yPos,
        targetY: yPos + (Math.random() - 0.5) * 60,
        speed: 7.5 + i * 1.2,
        scale: scale,
        alpha: 0,
        delay: delay,
        elapsed: 0,
        active: false,
        done: false,
        afterburner: Math.random() > 0.5
      });
    }
  }

  const hudMessages = [
    'STEALTH MODE ACTIVE',
    'RADAR LOCK: ACQUIRED',
    'MISSION: ONLINE',
    'TARGET: ACQUIRED',
    'SYSTEMS: NOMINAL',
  ];
  let msgIdx = 0;
  let lastMsgTime = 0;

  /* ── Main render loop ── */
  function render(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const t = Math.min(elapsed / DURATION, 1);

    // bg
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000007';
    ctx.fillRect(0, 0, W, H);

    // stars fade in
    ctx.globalAlpha = Math.min(t * 3, 1);
    drawStars();
    ctx.globalAlpha = 1;

    // grid
    drawGrid(Math.min(t * 2, 1));

    // radar bottom right
    if (t > 0.1) {
      drawRadar(W - 120, H - 120, 90, elapsed * 0.001);
    }

    // reticles
    if (t > 0.2) {
      drawReticle(W * 0.35, H * 0.42, 28, Math.min((t - 0.2) * 5, 0.7));
      drawReticle(W * 0.65, H * 0.3, 18, Math.min((t - 0.3) * 4, 0.5));
    }

    // launch planes
    if (!planesLaunched && elapsed > LAUNCH_DELAY) {
      launchPlanes();
      planesLaunched = true;
    }

    // update & draw planes
    planes.forEach(plane => {
      plane.elapsed += 16.67;
      if (plane.elapsed < plane.delay) return;

      if (!plane.active) plane.active = true;

      // fade in
      if (plane.alpha < 1) plane.alpha = Math.min(plane.alpha + 0.06, 1);

      // ease Y toward target
      plane.y += (plane.targetY - plane.y) * 0.04;

      // move X
      plane.x += plane.speed;

      // exhaust
      if (plane.afterburner && plane.x < W + 50) {
        spawnExhaust(plane.x, plane.y);
      }

      // draw if on screen
      if (plane.x < W + 200) {
        drawB2(plane.x, plane.y, plane.scale, plane.alpha, true);

        // afterburner glow trail
        ctx.save();
        for (let j = 1; j <= 6; j++) {
          ctx.globalAlpha = (plane.alpha * 0.25) / j;
          ctx.beginPath();
          ctx.arc(plane.x - j * 18, plane.y + 8, 3 + j * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#00ffe5';
          ctx.fill();
        }
        ctx.restore();
      }
    });

    drawExhaust();
    updateExhaust();

    // progress bar
    progress = Math.min(t * 100, 100);
    bar.style.width = progress + '%';
    hudPct.textContent = Math.floor(progress) + '%';

    // HUD sys message cycling
    if (elapsed - lastMsgTime > 600) {
      lastMsgTime = elapsed;
      hudSys.textContent = hudMessages[msgIdx % hudMessages.length];
      msgIdx++;
    }

    if (t < 1) {
      requestAnimationFrame(render);
    } else {
      // Outro
      bar.style.width = '100%';
      hudPct.textContent = '100%';
      setTimeout(() => {
        intro.classList.add('hidden');
        document.body.style.overflow = '';
      }, 400);
    }
  }

  document.body.style.overflow = 'hidden';
  requestAnimationFrame(render);
})();


/* ═══════════════════════════════════════════════
   2. CURSOR SYSTEM
═══════════════════════════════════════════════ */
(function initCursor() {
  const dot   = document.getElementById('cur-dot');
  const ring  = document.getElementById('cur-ring');
  const label = document.getElementById('cur-label');

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx, ry = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    label.style.left = mx + 'px';
    label.style.top  = my + 'px';
    spawnTrail(mx, my);
  });

  // Lerp ring follow
  (function lerpRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerpRing);
  })();

  // Hover interactive elements
  const hoverSel = 'a, button, .sk-tab, .skcard, .expcard, .certcard, .clink, .hcard, .astat, .acard, .proj-card, .social-pill, .btn';
  document.querySelectorAll(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering');
      label.textContent = el.dataset.label || 'VIEW';
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering');
    });
  });

  // Click ripple
  document.addEventListener('click', e => {
    const r = document.createElement('div');
    r.className = 'click-ring';
    r.style.left = e.clientX + 'px';
    r.style.top  = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 650);
  });
})();


/* ═══════════════════════════════════════════════
   3. CURSOR TRAIL
═══════════════════════════════════════════════ */
(function initTrail() {
  const COLORS = ['#00ffe5', '#ff3cac', '#ffe600'];
  let ci = 0, lastTime = 0;

  function spawnTrail(x, y) {
    const now = Date.now();
    if (now - lastTime < 36) return;
    lastTime = now;
    const t = document.createElement('div');
    t.className = 'trail';
    const s = 3 + Math.random() * 7;
    t.style.cssText = `width:${s}px;height:${s}px;left:${x}px;top:${y}px;background:${COLORS[ci++ % COLORS.length]}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 700);
  }

  // Expose globally for cursor system
  window.spawnTrail = spawnTrail;
})();

// Patch cursor to use global spawnTrail
document.addEventListener('mousemove', e => {
  if (window.spawnTrail) window.spawnTrail(e.clientX, e.clientY);
});


/* ═══════════════════════════════════════════════
   4. PARTICLE BACKGROUND CANVAS
═══════════════════════════════════════════════ */
(function initParticles() {
  const bgC = document.getElementById('bg-canvas');
  const bgX = bgC.getContext('2d');
  let W, H, mx = window.innerWidth / 2, my = window.innerHeight / 2;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function resize() {
    W = bgC.width  = window.innerWidth;
    H = bgC.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Dot {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.24;
      this.vy = (Math.random() - 0.5) * 0.24;
      this.r  = Math.random() * 1.2 + 0.35;
      this.a  = Math.random() * 0.36 + 0.07;
      const r = Math.random();
      this.col = r > 0.7 ? '0,255,229' : r > 0.4 ? '255,60,172' : '180,180,255';
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      const dx = mx - this.x, dy = my - this.y;
      const d = Math.hypot(dx, dy);
      if (d < 200) { this.vx += dx / d * 0.011; this.vy += dy / d * 0.011; }
      this.vx *= 0.993; this.vy *= 0.993;
      if (this.x < -6 || this.x > W + 6 || this.y < -6 || this.y > H + 6) this.init();
    }
    draw() {
      bgX.beginPath();
      bgX.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      bgX.fillStyle = `rgba(${this.col},${this.a})`;
      bgX.fill();
    }
  }

  const dots = Array.from({ length: 180 }, () => new Dot());

  function drawConnections() {
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (d < 108) {
          bgX.beginPath();
          bgX.moveTo(dots[i].x, dots[i].y);
          bgX.lineTo(dots[j].x, dots[j].y);
          bgX.strokeStyle = `rgba(0,255,229,${(1 - d / 108) * 0.1})`;
          bgX.lineWidth = 0.35;
          bgX.stroke();
        }
      }
    }
  }

  (function bgLoop() {
    bgX.clearRect(0, 0, W, H);
    dots.forEach(d => { d.step(); d.draw(); });
    drawConnections();
    bgX.globalAlpha = 1;
    requestAnimationFrame(bgLoop);
  })();
})();


/* ═══════════════════════════════════════════════
   5. NEURAL NETWORK CANVAS (Project Preview)
═══════════════════════════════════════════════ */
(function initNeural() {
  const nc = document.getElementById('neural-canvas');
  if (!nc) return;
  const nx = nc.getContext('2d');
  const LAYERS = [4, 6, 6, 4, 3];
  const signals = [];

  function sizeNc() {
    nc.width  = nc.offsetWidth;
    nc.height = nc.offsetHeight;
  }
  sizeNc();
  window.addEventListener('resize', sizeNc);

  function drawNeural() {
    if (!nc.width || !nc.height) { requestAnimationFrame(drawNeural); return; }
    nx.clearRect(0, 0, nc.width, nc.height);
    const NW = nc.width, NH = nc.height;
    const layerX = LAYERS.map((_, i) => 36 + i * (NW - 72) / (LAYERS.length - 1));

    const nodes = LAYERS.map((n, li) =>
      Array.from({ length: n }, (_, ni) => ({
        x: layerX[li],
        y: (NH / (n + 1)) * (ni + 1)
      }))
    );

    // connections
    for (let li = 0; li < nodes.length - 1; li++) {
      for (let a = 0; a < nodes[li].length; a++) {
        for (let b = 0; b < nodes[li + 1].length; b++) {
          nx.beginPath();
          nx.moveTo(nodes[li][a].x, nodes[li][a].y);
          nx.lineTo(nodes[li + 1][b].x, nodes[li + 1][b].y);
          nx.strokeStyle = 'rgba(0,255,229,0.07)';
          nx.lineWidth = 0.6;
          nx.stroke();
        }
      }
    }

    // signal pulses
    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i];
      s.t += 0.016;
      if (s.t > 1) { signals.splice(i, 1); continue; }
      const n1 = nodes[s.li]?.[s.ai], n2 = nodes[s.li + 1]?.[s.bi];
      if (!n1 || !n2) { signals.splice(i, 1); continue; }
      const px = n1.x + (n2.x - n1.x) * s.t;
      const py = n1.y + (n2.y - n1.y) * s.t;
      nx.beginPath();
      nx.arc(px, py, 3, 0, Math.PI * 2);
      nx.fillStyle = `rgba(0,255,229,${0.9 - s.t * 0.8})`;
      nx.shadowColor = '#00ffe5';
      nx.shadowBlur = 8;
      nx.fill();
      nx.shadowBlur = 0;
    }

    // nodes
    nodes.forEach(layer => {
      layer.forEach(n => {
        nx.beginPath(); nx.arc(n.x, n.y, 5.5, 0, Math.PI * 2);
        nx.fillStyle = 'rgba(0,255,229,0.13)'; nx.fill();
        nx.beginPath(); nx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        nx.fillStyle = 'rgba(0,255,229,0.5)'; nx.fill();
      });
    });

    requestAnimationFrame(drawNeural);
  }
  drawNeural();

  setInterval(() => {
    const li = Math.floor(Math.random() * (LAYERS.length - 1));
    signals.push({
      li,
      ai: Math.floor(Math.random() * LAYERS[li]),
      bi: Math.floor(Math.random() * LAYERS[li + 1]),
      t: 0
    });
  }, 110);
})();


/* ═══════════════════════════════════════════════
   6. SKILL TABS
═══════════════════════════════════════════════ */
(function initSkillTabs() {
  document.querySelectorAll('.sk-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sk-tab').forEach(t => t.classList.remove('on'));
      document.querySelectorAll('.skill-panel').forEach(p => p.classList.remove('on'));
      tab.classList.add('on');
      const panel = document.getElementById('panel-' + tab.dataset.panel);
      if (panel) panel.classList.add('on');
    });
  });

  // Skill card spotlight glow on hover
  document.querySelectorAll('.skcard').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
    });
  });
})();


/* ═══════════════════════════════════════════════
   7. SCROLL REVEAL
═══════════════════════════════════════════════ */
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();


/* ═══════════════════════════════════════════════
   8. ACTIVE SIDE NAV LINK
═══════════════════════════════════════════════ */
(function initNavHighlight() {
  const links = document.querySelectorAll('.sn-link[data-sec]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.sn-link[data-sec="${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.38 });
  document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
})();


/* ═══════════════════════════════════════════════
   9. PARALLAX HERO NAME ON MOUSE MOVE
═══════════════════════════════════════════════ */
(function initParallax() {
  const hero = document.getElementById('hero');
  const name = document.querySelector('.hero-name');
  if (!hero || !name) return;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width  - 0.5;
    const cy = (e.clientY - r.top)  / r.height - 0.5;
    name.style.transform = `translate(${cx * 10}px, ${cy * 6}px)`;
  });
  hero.addEventListener('mouseleave', () => {
    name.style.transform = 'translate(0,0)';
  });
})();


/* ═══════════════════════════════════════════════
   10. MAGNETIC BUTTONS
═══════════════════════════════════════════════ */
(function initMagneticBtns() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const cx = e.clientX - r.left - r.width / 2;
      const cy = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${cx * 0.22}px, ${cy * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });
})();


/* ═══════════════════════════════════════════════
   11. CONTACT LINK HOVER ACCENT
═══════════════════════════════════════════════ */
(function initContactLinks() {
  const colors = ['#00ffe5', '#5544ff', '#ff3cac', '#00ffe5', '#00c8ff'];
  document.querySelectorAll('.clink').forEach((link, i) => {
    link.addEventListener('mouseenter', () => {
      link.style.setProperty('--accent', colors[i % colors.length]);
    });
    link.addEventListener('mouseleave', () => {
      link.style.removeProperty('--accent');
    });
  });
})();
