/* ═══════════════════════════════════════════════════════
   main.js — Anurag Yadav Portfolio
   Author: Anurag Yadav
═══════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════
   1. PROFESSIONAL INTRO ANIMATION
═══════════════════════════════════════════════ */
(function initProfIntro() {
  const intro = document.getElementById('prof-intro');
  const progress = document.getElementById('prof-progress');
  if (!intro || !progress) return;

  document.body.style.overflow = 'hidden';
  let w = 0;
  
  // Progress bar animation
  const interval = setInterval(() => {
    // Easing effect as it gets closer to 100
    const step = w > 80 ? Math.random() * 2 + 1 : Math.random() * 10 + 5;
    w += step;
    
    if (w >= 100) {
      w = 100;
      clearInterval(interval);
      setTimeout(() => {
        intro.classList.add('hidden');
        document.body.style.overflow = '';
      }, 500); // Wait shortly after hitting 100%
    }
    progress.style.width = w + '%';
  }, 90);

  // Fallback cleanup
  setTimeout(() => {
    if (!intro.classList.contains('hidden')) {
      intro.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }, 3500);
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
          nx.strokeStyle = 'rgba(124,140,248,0.07)';
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
      nx.fillStyle = `rgba(124,140,248,${0.9 - s.t * 0.8})`;
      nx.shadowColor = '#7c8cf8';
      nx.shadowBlur = 8;
      nx.fill();
      nx.shadowBlur = 0;
    }

    // nodes
    nodes.forEach(layer => {
      layer.forEach(n => {
        nx.beginPath(); nx.arc(n.x, n.y, 5.5, 0, Math.PI * 2);
        nx.fillStyle = 'rgba(124,140,248,0.13)'; nx.fill();
        nx.beginPath(); nx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        nx.fillStyle = 'rgba(124,140,248,0.5)'; nx.fill();
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
   8. ACTIVE NAV LINK HIGHLIGHT
═══════════════════════════════════════════════ */
(function initNavHighlight() {
  const links = document.querySelectorAll('.nav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.38 });
  document.querySelectorAll('section[id], #wrap > section[id]').forEach(s => obs.observe(s));
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
