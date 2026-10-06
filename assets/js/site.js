/* GrokTech
   Small progressive enhancements. The page reads fine without any of this. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Header picks up a backdrop once the page scrolls. */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Current year in the footer. */
  for (const el of document.querySelectorAll('[data-year]')) {
    el.textContent = String(new Date().getFullYear());
  }

  /* Copy the email address. */
  for (const btn of document.querySelectorAll('[data-copy]')) {
    const label = btn.querySelector('[data-copy-label]');
    const status = btn.parentElement.querySelector('[data-copy-status]');
    const original = label.textContent;
    let timer;

    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      let copied = false;
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.cssText = 'position:fixed;opacity:0';
        document.body.append(field);
        field.select();
        try { copied = document.execCommand('copy'); } catch { copied = false; }
        field.remove();
      }
      if (!copied) {
        // Clipboard blocked: highlight the address so it can be copied by hand.
        const address = btn.closest('.contact-card').querySelector('.contact-mail');
        const range = document.createRange();
        range.selectNodeContents(address);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        label.textContent = 'Address selected';
        return;
      }
      btn.classList.add('is-done');
      label.textContent = 'Copied';
      if (status) status.textContent = 'Email address copied';
      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.classList.remove('is-done');
        label.textContent = original;
        if (status) status.textContent = '';
      }, 2000);
    });
  }

  /* Range: hovering an area lights up its node and everything it connects to, and back. */
  const constellation = document.querySelector('.constellation');
  if (constellation) {
    const nodes = [...constellation.querySelectorAll('.c-node')];
    const edges = [...constellation.querySelectorAll('.c-edge')];
    const areas = [...document.querySelectorAll('.area[data-node]')];
    let pinned = null;
    let lastPointer = 'mouse';

    const show = (id) => {
      const near = new Set();
      for (const edge of edges) {
        const ends = edge.dataset.link.split(' ');
        const on = id !== null && ends.includes(id);
        edge.classList.toggle('is-on', on);
        if (on) ends.forEach((end) => near.add(end));
      }
      constellation.classList.toggle('has-active', id !== null);
      for (const node of nodes) {
        node.classList.toggle('is-on', node.dataset.node === id);
        node.classList.toggle('is-near', node.dataset.node !== id && near.has(node.dataset.node));
      }
      for (const area of areas) area.classList.toggle('is-on', area.dataset.node === id);
    };

    for (const el of [...areas, ...nodes]) {
      el.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; });
      el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(el.dataset.node); });
      el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') show(pinned); });
      el.addEventListener('click', () => {
        if (lastPointer === 'mouse') return;
        pinned = pinned === el.dataset.node ? null : el.dataset.node;
        show(pinned);
      });
    }
  }

  /* Hero globe: the wireframe from the original site, turning slowly, with
     signals travelling along arcs between points. */
  const canvas = document.querySelector('.globe canvas');
  if (canvas && canvas.getContext) globe(canvas);

  function globe(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const TAU = Math.PI * 2;
    const RAD = Math.PI / 180;
    const TILT = 0.36;   // lean the north pole toward the viewer
    const ROLL = -0.3;   // axial tilt
    const SPEED = 0.05;  // radians per second, a little over two minutes per turn
    const LIME = '189, 243, 71';
    const CYAN = '86, 217, 245';

    // Seeded so the points land in the same places on every visit.
    let seed = 1961;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const vec = (lat, lon) => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];

    const grid = [];
    for (let lat = -75; lat <= 75; lat += 15) {
      const line = [];
      for (let lon = 0; lon <= 360; lon += 4) line.push(vec(lat * RAD, lon * RAD));
      grid.push(line);
    }
    for (let lon = 0; lon < 360; lon += 15) {
      const line = [];
      for (let lat = -90; lat <= 90; lat += 4) line.push(vec(lat * RAD, lon * RAD));
      grid.push(line);
    }

    const nodes = [];
    for (let i = 0; i < 22; i++) {
      nodes.push({ p: vec(Math.asin(rand() * 1.6 - 0.8), rand() * TAU), color: null });
    }

    const arcs = [];
    for (let i = 0; i < nodes.length && arcs.length < 15; i++) {
      for (let j = i + 1; j < nodes.length && arcs.length < 15; j++) {
        const a = nodes[i].p;
        const b = nodes[j].p;
        const d = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
        if (d < 0.5 || d > 1.5 || rand() > 0.32) continue;
        const lift = 0.05 + d * 0.11;
        const pts = [];
        for (let k = 0; k <= 48; k++) {
          const t = k / 48;
          const s1 = Math.sin((1 - t) * d) / Math.sin(d);
          const s2 = Math.sin(t * d) / Math.sin(d);
          const h = 1 + lift * Math.sin(Math.PI * t);
          pts.push([(a[0] * s1 + b[0] * s2) * h, (a[1] * s1 + b[1] * s2) * h, (a[2] * s1 + b[2] * s2) * h]);
        }
        const color = rand() < 0.6 ? LIME : CYAN;
        nodes[i].color = nodes[i].color || color;
        nodes[j].color = nodes[j].color || color;
        arcs.push({ pts, color, speed: 0.11 + rand() * 0.07, phase: rand() * 4 });
      }
    }

    let W = 0, H = 0, R = 0, cx = 0, cy = 0;
    let cosS = 1, sinS = 0;
    const cosT = Math.cos(TILT), sinT = Math.sin(TILT);
    const cosR = Math.cos(ROLL), sinR = Math.sin(ROLL);
    const pt = [0, 0, 0, false];

    // Spin around the polar axis, then tilt and roll the whole globe. pt = [x, y, depth, visible]
    const project = (p) => {
      const x1 = p[0] * cosS + p[2] * sinS;
      const z1 = p[2] * cosS - p[0] * sinS;
      const y2 = p[1] * cosT - z1 * sinT;
      const z2 = p[1] * sinT + z1 * cosT;
      const x3 = x1 * cosR - y2 * sinR;
      const y3 = x1 * sinR + y2 * cosR;
      pt[0] = cx + x3 * R;
      pt[1] = cy - y3 * R;
      pt[2] = z2;
      pt[3] = z2 > 0 || x3 * x3 + y3 * y3 > 1; // in front, or lifted out past the edge
      return pt;
    };

    const trace = (pts, from, to) => {
      ctx.beginPath();
      let pen = false;
      for (let k = from; k <= to; k++) {
        project(pts[k]);
        if (pt[3]) {
          if (pen) ctx.lineTo(pt[0], pt[1]);
          else ctx.moveTo(pt[0], pt[1]);
          pen = true;
        } else {
          pen = false;
        }
      }
    };

    const BANDS = [0.06, 0.12, 0.2, 0.3]; // back half, then the front half from edge to center

    const draw = (spin, time) => {
      cosS = Math.cos(spin);
      sinS = Math.sin(spin);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const paths = BANDS.map(() => new Path2D());
      for (const line of grid) {
        let px = 0, py = 0, pz = 0, band = -1;
        for (let k = 0; k < line.length; k++) {
          project(line[k]);
          const x = pt[0], y = pt[1], z = pt[2];
          if (k > 0) {
            const mid = (z + pz) / 2;
            const b = mid <= 0 ? 0 : mid < 0.4 ? 1 : mid < 0.75 ? 2 : 3;
            if (b !== band) {
              paths[b].moveTo(px, py);
              band = b;
            }
            paths[b].lineTo(x, y);
          }
          px = x;
          py = y;
          pz = z;
        }
      }
      ctx.lineWidth = 0.85;
      BANDS.forEach((alpha, b) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.stroke(paths[b]);
      });

      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      const last = arcs[0] ? arcs[0].pts.length - 1 : 0;
      for (const arc of arcs) {
        trace(arc.pts, 0, last);
        ctx.strokeStyle = `rgba(${arc.color}, 0.32)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (time === null) continue;
        const head = (time * arc.speed + arc.phase) % 1.7; // past 1.25 the arc rests
        if (head > 1.25) continue;
        const SLICES = 4;
        const tail = head - 0.25;
        for (let s = 0; s < SLICES; s++) {
          const t0 = tail + (0.25 * s) / SLICES;
          const t1 = tail + (0.25 * (s + 1)) / SLICES;
          const i0 = Math.max(0, Math.floor(t0 * last));
          const i1 = Math.min(last, Math.ceil(t1 * last));
          if (i1 <= i0) continue;
          trace(arc.pts, i0, i1);
          ctx.strokeStyle = `rgba(${arc.color}, ${0.2 + (0.8 * (s + 1)) / SLICES})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        project(node.p);
        if (pt[2] <= 0) continue;
        const a = 0.25 + 0.75 * pt[2];
        if (node.color) {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 7, 0, TAU);
          ctx.fillStyle = `rgba(${node.color}, ${a * 0.16})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 2.6, 0, TAU);
          ctx.fillStyle = `rgba(${node.color}, ${a})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 1.6, 0, TAU);
          ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.7})`;
          ctx.fill();
        }
      }
    };

    let spin = 2.4;
    let then = 0;
    let raf = 0;
    let running = false;
    let onScreen = true;

    const still = () => draw(spin, reduceMotion.matches ? null : then / 1000);

    const tick = (now) => {
      spin += Math.min(0.05, (now - then) / 1000) * SPEED;
      then = now;
      draw(spin, now / 1000);
      raf = requestAnimationFrame(tick);
    };

    const update = () => {
      const run = onScreen && !document.hidden && !reduceMotion.matches;
      if (run && !running) {
        running = true;
        then = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!run && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
      if (reduceMotion.matches) still();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) / 2 - 2;
      cx = W / 2;
      cy = H / 2;
      if (!running) still();
      canvas.classList.add('is-ready');
    };

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        update();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', update);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', update);

    resize();
    update();
  }
})();
