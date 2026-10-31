/* Miracle Green: interactions. Vanilla JS, no dependencies. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const PHONE = '+12095132736';

  /* ---------- Split hero headline into words ---------- */
  const splitEl = $('[data-split]');
  if (splitEl) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.append(' '); return; }
            const outer = document.createElement('span');
            outer.className = 'split-w';
            const inner = document.createElement('span');
            inner.style.setProperty('--i', i++);
            inner.textContent = w;
            outer.append(inner);
            frag.append(outer);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    splitEl.setAttribute('aria-label', splitEl.textContent.trim().replace(/\s+/g, ' '));
    walk(splitEl);
    $$('.split-w', splitEl).forEach((s) => s.setAttribute('aria-hidden', 'true'));
    requestAnimationFrame(() => requestAnimationFrame(() => splitEl.classList.add('is-split')));
  }
  // hero reveal-up on load
  requestAnimationFrame(() => $$('.hero .reveal-up').forEach((el) => el.classList.add('is-in')));

  /* ---------- Reveal on scroll + counters ---------- */
  const countUp = (el) => {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- Nav: stuck / hide on scroll down, active link, mobile menu ---------- */
  const nav = $('.nav');
  const burger = $('.nav__burger');
  const mnav = $('#mnav');
  const dock = $('.dock');
  const bar = $('.progress span');
  let lastY = scrollY;

  const closeMenu = () => { burger.setAttribute('aria-expanded', 'false'); mnav.hidden = true; };
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    mnav.hidden = open;
  });
  $$('a', mnav).forEach((a) => a.addEventListener('click', closeMenu));

  const sections = $$('main section[id]');
  const links = $$('.nav__links a');
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => secIO.observe(s));

  /* ---------- Scroll-driven effects (single rAF loop) ---------- */
  const aboutImg = $('.about__img img');
  const stepsLine = $('.steps__line');
  const mow = $('.mow');
  const mowAfter = $('.mow__after');
  const mower = $('.mow__mower');
  const meter = $('.mow__meter');
  const meterTxt = meter && $('b', meter);
  const mowImg = $('.mow__before');
  const STRIPES = innerWidth < 700 ? 5 : 6;
  const stripes = [];

  if (mowAfter && mowImg) {
    for (let i = 0; i < STRIPES; i++) {
      const s = document.createElement('div');
      s.className = 'mow__stripe';
      s.style.top = (i * 100 / STRIPES) + '%';
      s.style.height = (100 / STRIPES + 0.05) + '%';
      const img = document.createElement('img');
      img.src = mowImg.currentSrc || mowImg.src;
      img.alt = '';
      img.loading = 'lazy';
      img.style.top = (-i * 100) + '%';
      img.style.height = (STRIPES * 100) + '%';
      s.append(img);
      mowAfter.append(s);
      stripes.push(s);
    }
  }

  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const vh = innerHeight;
    const docH = document.documentElement.scrollHeight - vh;
    bar.style.setProperty('--p', docH > 0 ? (y / docH).toFixed(4) : 0);

    nav.classList.toggle('is-stuck', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > 600 && mnav.hidden);
    if (dock) dock.classList.toggle('is-on', y > vh * 0.7);
    lastY = y;

    if (!reduce && aboutImg) {
      const r = aboutImg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        aboutImg.style.setProperty('--py', (p * -60 - 30).toFixed(1) + 'px');
      }
    }

    if (stepsLine) {
      const r = stepsLine.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)));
      stepsLine.style.setProperty('--draw', reduce ? 1 : p.toFixed(3));
    }

    if (mow && stripes.length) {
      const r = mow.getBoundingClientRect();
      const total = r.height - vh;
      let p = total > 0 ? -r.top / total : 0;
      p = Math.min(1, Math.max(0, p));
      const per = 1 / STRIPES;
      const stageH = vh;
      let mx = 0, my = 0, active = -1, flip = false;
      stripes.forEach((s, i) => {
        const local = Math.min(1, Math.max(0, (p - i * per) / per));
        const rem = ((1 - local) * 100).toFixed(2);
        const ltr = i % 2 === 0;
        s.style.clipPath = ltr ? `inset(0 ${rem}% 0 0)` : `inset(0 0 0 ${rem}%)`;
        if (local > 0 && local < 1) {
          active = i;
          mx = (ltr ? local : 1 - local) * innerWidth;
          my = (i + 0.5) * stageH / STRIPES;
          flip = !ltr;
        }
      });
      if (active >= 0) {
        mower.style.opacity = 1;
        mower.style.left = mx + 'px';
        mower.style.top = my + 'px';
        mower.classList.toggle('is-flip', flip);
      } else {
        mower.style.opacity = 0;
      }
      meter.style.setProperty('--m', p.toFixed(3));
      meterTxt.textContent = Math.round(p * 100) + '%';
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Hero grass canvas ---------- */
  const canvas = $('.grass');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, blades = [], running = false, raf = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999 };
    const palette = ['#0f2a18', '#143a1f', '#1c4d27', '#24602f', '#2f7a37', '#3d9440', '#58ad46'];

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(520, Math.floor(W / 3.2));
      blades = [];
      for (let i = 0; i < n; i++) {
        const depth = Math.random();
        blades.push({
          x: Math.random() * W,
          h: H * (0.35 + depth * 0.62),
          w: 2 + depth * 4,
          c: palette[Math.min(palette.length - 1, Math.floor(depth * palette.length))],
          ph: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 0.8,
          lean: (Math.random() - 0.5) * 0.35,
          depth,
          bend: 0,
        });
      }
      blades.sort((a, b) => a.depth - b.depth);
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      const time = t / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      for (const b of blades) {
        const wind = Math.sin(time * b.sp + b.ph + b.x * 0.004) * 0.12 + Math.sin(time * 0.35 + b.x * 0.001) * 0.08;
        const dx = b.x - pointer.x;
        const push = Math.abs(dx) < 140 ? (1 - Math.abs(dx) / 140) * Math.sign(dx || 1) * 0.9 : 0;
        b.bend += (push - b.bend) * 0.08;
        const ang = b.lean + wind + b.bend;
        const tipX = b.x + Math.sin(ang) * b.h;
        const tipY = H - Math.cos(ang) * b.h;
        const cX = b.x + Math.sin(ang * 0.5) * b.h * 0.55;
        const cY = H - b.h * 0.55;
        ctx.beginPath();
        ctx.moveTo(b.x - b.w, H + 1);
        ctx.quadraticCurveTo(cX - b.w * 0.5, cY, tipX, tipY);
        ctx.quadraticCurveTo(cX + b.w * 0.5, cY, b.x + b.w, H + 1);
        ctx.closePath();
        ctx.fillStyle = b.c;
        ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => { if (running || reduce) return; running = true; raf = requestAnimationFrame(draw); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    build();
    draw(0);
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(canvas);
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); draw(performance.now()); }, 150); });
    const hero = $('.hero');
    hero.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); pointer.tx = e.clientX - r.left; });
    hero.addEventListener('pointerleave', () => { pointer.tx = -9999; });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* ---------- Service card spotlight + filters ---------- */
  $$('.svc').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });
  const grid = $('.svc-grid');
  $$('.filters button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      $$('.filters button').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      grid.classList.toggle('is-filtered', f !== 'all');
      let k = 0;
      $$('.svc', grid).forEach((card) => {
        const cats = card.dataset.cat.split(' ');
        const show = f === 'all' || cats.includes(f) || cats.includes('all');
        card.classList.toggle('is-hidden', !show);
        card.classList.remove('is-entering');
        if (show) {
          void card.offsetWidth;
          card.style.setProperty('--k', k++);
          card.classList.add('is-entering');
        }
      });
    });
  });

  // Category cards jump to services with that filter applied
  $$('[data-go]').forEach((a) => a.addEventListener('click', () => {
    const btn = $(`.filters button[data-filter="${a.dataset.go}"]`);
    if (btn) btn.click();
  }));

  /* ---------- Magnetic buttons + review tilt (fine pointers only) ---------- */
  if (finePointer && !reduce) {
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (px * 10).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (py * -10).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  const tiles = $$('.tile');
  let idx = 0;
  const show = (i) => {
    idx = (i + tiles.length) % tiles.length;
    const img = $('img', lb);
    const src = tiles[idx].querySelector('img');
    img.src = tiles[idx].dataset.full;
    img.alt = src.alt;
    img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
  };
  tiles.forEach((t, i) => t.addEventListener('click', () => { show(i); lb.showModal(); }));
  $('.lightbox__close', lb).addEventListener('click', () => lb.close());
  $('.lightbox__prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lightbox__next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
  let sx = 0;
  lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1)); });

  /* ---------- Service-area map ---------- */
  const setCity = (c) => {
    $$('.pin').forEach((p) => p.classList.toggle('is-on', p.dataset.city === c));
    $$('.cities button').forEach((b) => b.classList.toggle('is-on', b.dataset.city === c));
  };
  $$('.cities button').forEach((b) => {
    b.addEventListener('mouseenter', () => setCity(b.dataset.city));
    b.addEventListener('focus', () => setCity(b.dataset.city));
    b.addEventListener('click', () => setCity(b.dataset.city));
  });
  $('.cities').addEventListener('mouseleave', () => setCity(null));

  /* ---------- Quote form → prefilled SMS ---------- */
  const form = $('#qform');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const nameField = form.name.closest('.field');
    if (!name) {
      nameField.classList.add('is-error');
      form.name.focus();
      $('.qform__note', form).textContent = 'Please add your name so we know who we are texting.';
      return;
    }
    nameField.classList.remove('is-error');
    const svcs = $$('input[name="svc"]:checked', form).map((i) => i.value);
    const lines = [
      `Hi Miracle Green! I'd like a free quote.`,
      `Name: ${name}`,
      form.address.value.trim() && `Location: ${form.address.value.trim()}`,
      svcs.length && `Services: ${svcs.join(', ')}`,
      form.msg.value.trim() && `Details: ${form.msg.value.trim()}`,
    ].filter(Boolean);
    const body = encodeURIComponent(lines.join('\n'));
    const sep = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
    location.href = `sms:${PHONE}${sep}body=${body}`;
    $('.qform__note', form).innerHTML = 'Your message app should be open. Nothing happened? Call or text <a href="tel:+12095132736">(209) 513-2736</a>.';
  });
  form.name.addEventListener('input', () => form.name.closest('.field').classList.remove('is-error'));

  /* ---------- Footer: year + open now ---------- */
  $('[data-year]').textContent = new Date().getFullYear();
  const openEl = $('[data-open]');
  if (openEl) {
    // Business hours are Pacific Time
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
    const wd = parts.find((p) => p.type === 'weekday').value;
    const hr = +parts.find((p) => p.type === 'hour').value % 24;
    const open = !['Sat', 'Sun'].includes(wd) && hr >= 9 && hr < 17;
    openEl.textContent = open ? 'Open now' : 'Closed now · text us anytime';
    openEl.style.setProperty('--c', open ? '#9be15d' : '#f2b33d');
  }
})();
