(() => {
  'use strict';
  const canvas = document.getElementById('experience-canvas');
  const context = canvas?.getContext?.('2d', { alpha: true });
  if (!context) return;
  const root = document.documentElement;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)') || { matches: false };
  const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)') || { matches: false };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const canMove = () => !document.hidden && !reduced.matches && !root.classList.contains('motion-paused');
  const palette = [[172, 137, 82], [113, 137, 151], [52, 100, 161]];
  const names = ['arrival', 'perception', 'practice', 'work', 'contact'];
  const poses = [
    { x: .755, y: .51, size: .405, rx: .32, ry: -.44, rz: -.30, twist: .78, spread: 0, curl: .18, opacity: 1, warmth: .15, unfurl: 0, copyFade: 1 },
    { x: .715, y: .53, size: .275, rx: -.16, ry: .28, rz: .16, twist: 1.12, spread: .03, curl: .05, opacity: 1, warmth: .08, unfurl: 0, copyFade: 1 },
    { x: .22, y: .53, size: .31, rx: .20, ry: -.12, rz: -.18, twist: .30, spread: .75, curl: -.28, opacity: .52, warmth: .28, unfurl: 1, copyFade: .1 },
    { x: .83, y: .49, size: .44, rx: -.25, ry: .6, rz: .4, twist: .62, spread: .3, curl: -.1, opacity: .085, warmth: .05, unfurl: .75, copyFade: .8 },
    { x: .755, y: .50, size: .34, rx: .14, ry: -.2, rz: -.1, twist: .9, spread: -.05, curl: .16, opacity: .86, warmth: .6, unfurl: 0, copyFade: 1 }
  ];
  let width = innerWidth, height = innerHeight, mobile = width < 760;
  let anchors = [];
  let current = { ...poses[0] }, target = { ...poses[0] };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let frame = 0, lastTime = 0, introStart = null;
  let intro = canMove() && !location.hash && scrollY < height / 2 ? 0 : 1;
  let dirty = true;
  let ready = false;
  const color = (rgb, alpha) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;

  function scenePose(index) {
    const pose = { ...poses[index] };
    if (mobile) {
      const mobilePositions = [[.78, .34, .35, .48], [.52, .70, .145, 1], [.64, .42, .35, .16], [.78, .44, .34, .035], [.76, .49, .30, .5]];
      [pose.x, pose.y, pose.size, pose.opacity] = mobilePositions[index];
      if (index === 1) { pose.rx = .10; pose.ry = -.15; pose.rz = -.08; pose.copyFade = 0; }
      else pose.copyFade *= .35;
    }
    return pose;
  }
  function readAnchors() {
    anchors = names.map(name => {
      const section = document.querySelector(`section[data-scene="${name}"]`);
      if (!section) return 0;
      return Math.max(0, section.getBoundingClientRect().top + scrollY + Math.min(section.offsetHeight, height) * .45 - height * .45);
    });
  }
  function readTarget() {
    let i = 0;
    while (i < anchors.length - 2 && scrollY >= anchors[i + 1]) i++;
    const amount = clamp((scrollY - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]));
    const a = scenePose(i), b = scenePose(Math.min(i + 1, poses.length - 1));
    const t = ease(amount);
    for (const key of Object.keys(a)) target[key] = mix(a[key], b[key], t);
  }
  function point(u, v, band, pose) {
    const angle = -.13 * Math.PI + u * (1.86 + intro * .14) * Math.PI;
    const phase = band * Math.PI * 2 / 3;
    const roll = angle + pose.twist + .22 * Math.sin(angle * 2);
    const radial = 1 + .12 * Math.sin(angle - .6) + .08 * Math.cos(angle * 2);
    const weave = Math.sin(angle * 2 + phase) * .055;
    const lane = (band - 1) * .25 + v * .28;
    const offset = lane * Math.cos(roll) + weave;
    let x = Math.cos(angle) * (radial + offset) * .89;
    let y = Math.sin(angle) * (radial + offset) * 1.22;
    let z = .24 * Math.sin(angle * 2 - .5) + lane * Math.sin(roll) * 1.8 + Math.cos(angle * 2 + phase) * .065;
    x += pose.curl * Math.sin(angle) * Math.sin(angle);
    y += pose.spread * (band - 1) * .23;
    z += pose.spread * (band - 1) * .23;
    if (pose.unfurl > 0) {
      const planeX = (u - .5) * 1.80;
      const planeY = (band - 1) * .45 + Math.sin(u * Math.PI * 2 - .4) * .16 + v * .17;
      const planeZ = Math.sin(u * Math.PI) * .26 + v * .20 + (band - 1) * .06;
      x = mix(x, planeX, pose.unfurl); y = mix(y, planeY, pose.unfurl); z = mix(z, planeZ, pose.unfurl);
    }
    const ax = pose.rx + pointer.y * .017, ay = pose.ry + pointer.x * .017, az = pose.rz + (1 - intro) * -.11;
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax), cz = Math.cos(az), sz = Math.sin(az);
    [x, z] = [x * cy + z * sy, z * cy - x * sy];
    [y, z] = [y * cx - z * sx, z * cx + y * sx];
    [x, y] = [x * cz - y * sz, y * cz + x * sz];
    const perspective = 3.9 / (3.9 - z);
    const size = Math.min(height * pose.size, width * (mobile ? .78 : .40));
    return { x: width * pose.x + x * size * perspective + pointer.x * 5, y: height * pose.y + y * size * perspective + pointer.y * 4, z, light: clamp(.55 + z * .32 + Math.cos(angle - 1) * .22) };
  }
  function path(points, close = false) {
    context.beginPath();
    points.forEach((p, i) => i ? context.lineTo(p.x, p.y) : context.moveTo(p.x, p.y));
    if (close) context.closePath();
  }
  function paint() {
    context.clearRect(0, 0, width, height);
    const lineCount = mobile ? 21 : 31;
    const steps = mobile ? 96 : 120;
    const pieces = 24;
    const perPiece = steps / pieces;
    const packets = [];
    for (let band = 0; band < 3; band++) {
      const lines = Array.from({ length: lineCount }, (_, i) => Array.from({ length: steps + 1 }, (_, j) => point(j / steps, i / (lineCount - 1) * 2 - 1, band, current)));
      for (let piece = 0; piece < pieces; piece++) {
        const start = piece * perPiece, end = (piece + 1) * perPiece + 1;
        const section = lines.map(line => line.slice(start, end));
        const middle = section[Math.floor(lineCount / 2)];
        packets.push({ band, piece, lines: section, depth: middle.reduce((sum, p) => sum + p.z, 0) / middle.length, light: middle.reduce((sum, p) => sum + p.light, 0) / middle.length });
      }
    }
    packets.sort((a, b) => a.depth - b.depth);
    context.lineJoin = 'round';
    context.lineCap = 'round';
    const opacity = current.opacity * (.48 + intro * .52);
    for (const packet of packets) {
      const source = palette[packet.band];
      const tint = source.map((channel, i) => Math.round(mix(channel, palette[0][i], current.warmth)));
      const edge = [...packet.lines[0], ...packet.lines.at(-1).slice().reverse()];
      context.globalCompositeOperation = 'source-over';
      path(edge, true);
      context.fillStyle = `rgba(247,246,241,${opacity * .40})`;
      context.fill();
      const center = packet.lines[Math.floor(packet.lines.length / 2)];
      const start = center[0], end = center.at(-1);
      const skin = context.createLinearGradient(start.x, start.y, end.x, end.y);
      const skinAlpha = p => opacity * (.032 + p.light * .055 + Math.pow(clamp((p.z + .16) / 1.0), 4) * .25);
      skin.addColorStop(0, color(tint, skinAlpha(start)));
      skin.addColorStop(1, color(tint, skinAlpha(end)));
      context.fillStyle = skin;
      context.fill();
      context.globalCompositeOperation = 'multiply';
      packet.lines.forEach((line, index) => {
        const rim = index === 0 || index === lineCount - 1;
        const strand = Math.sin(index * 1.81 + packet.band * 2) * .13 + .84;
        const alpha = opacity * (rim ? .92 : .48) * (.18 + packet.light * .82) * strand;
        path(line);
        context.strokeStyle = color(tint, alpha);
        context.lineWidth = rim ? (mobile ? .85 : 1.03) : (mobile ? .58 : .65);
        context.stroke();
      });
      if (packet.depth > .10 && packet.light > .72) {
        path(packet.lines[0]);
        context.strokeStyle = color(tint, opacity * .09);
        context.lineWidth = mobile ? 3.5 : 5;
        context.stroke();
      }
    }
    const lit = packets.filter(packet => packet.depth > .32).sort((a, b) => b.depth - a.depth).slice(0, 8);
    context.globalCompositeOperation = 'source-over';
    for (const packet of lit) {
      const light = [255, 253, 247];
      const strength = opacity * Math.pow(clamp((packet.depth + .1) / 1.05), 2);
      const rim = packet.lines[packet.band === 2 ? packet.lines.length - 1 : 0];
      path(rim); context.strokeStyle = color(light, strength * .025); context.lineWidth = 15; context.stroke();
      path(rim); context.strokeStyle = color(light, strength * .07); context.lineWidth = 5; context.stroke();
      path(rim); context.strokeStyle = color(light, strength * .72); context.lineWidth = 1.1; context.stroke();
    }
    if (current.copyFade > 0) {
      const mask = context.createLinearGradient(0, 0, width * (mobile ? .65 : .48), 0);
      mask.addColorStop(0, `rgba(0,0,0,${current.copyFade * .98})`);
      mask.addColorStop(.65, `rgba(0,0,0,${current.copyFade * .86})`);
      mask.addColorStop(1, 'rgba(0,0,0,0)');
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = mask; context.fillRect(0, 0, width, height);
    }
    context.globalCompositeOperation = 'source-over';
    if (!ready) { ready = true; root.classList.add('experience-ready'); }
    dirty = false;
  }
  function settle() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; lastTime = 0;
    current = { ...target };
    intro = 1;
    pointer.x = pointer.y = pointer.tx = pointer.ty = 0;
    if (!document.hidden) paint();
  }
  function tick(time) {
    frame = 0;
    if (!canMove()) { settle(); return; }
    const dt = lastTime ? Math.min(50, time - lastTime) : 16;
    lastTime = time;
    const amount = 1 - Math.exp(-dt / 125);
    let moving = false;
    for (const key of Object.keys(current)) {
      const delta = target[key] - current[key];
      if (Math.abs(delta) > .00025) { current[key] += delta * amount; moving = true; }
      else current[key] = target[key];
    }
    for (const key of ['x', 'y']) {
      const goal = pointer[key === 'x' ? 'tx' : 'ty'];
      const delta = goal - pointer[key];
      if (Math.abs(delta) > .002) { pointer[key] += delta * amount; moving = true; }
      else pointer[key] = goal;
    }
    if (intro < 1) {
      if (introStart === null) introStart = time;
      intro = ease(clamp((time - introStart) / 1550));
      moving ||= intro < 1;
    }
    paint();
    if (moving) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }
  function request() {
    if (document.hidden) return;
    if (!canMove()) { if (dirty) settle(); return; }
    if (!frame) frame = requestAnimationFrame(tick);
  }
  function onScroll() {
    readTarget();
    if (!canMove()) return;
    dirty = true;
    request();
  }
  function resize() {
    width = innerWidth; height = innerHeight; mobile = width < 760;
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.75 : 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    readAnchors(); readTarget();
    current = { ...target }; dirty = true;
    paint(); request();
  }
  function onMotion() {
    dirty = true;
    if (canMove()) { readTarget(); request(); }
    else settle();
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', event => {
    if (!fine.matches || !canMove() || event.pointerType === 'touch') return;
    pointer.tx = (event.clientX / width - .5) * 2;
    pointer.ty = (event.clientY / height - .5) * 2;
    dirty = true; request();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.tx = pointer.ty = 0; dirty = true; request(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); else { readTarget(); dirty = true; request(); } });
  if (reduced.addEventListener) reduced.addEventListener('change', onMotion);
  else reduced.addListener?.(onMotion);
  if (typeof MutationObserver === 'function') new MutationObserver(records => {
    if (records.some(record => record.attributeName === 'class')) onMotion();
  }).observe(root, { attributes: true, attributeFilter: ['class'] });
  window.grokExperience = { refresh: resize };
  resize();
  document.fonts?.ready.then(() => { readAnchors(); readTarget(); dirty = true; request(); });
})();
