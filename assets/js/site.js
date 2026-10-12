(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  const label = document.querySelector('[data-motion-label]');
  const animations = new Set();
  const frames = new Set();
  let manualPause = false;
  let selected = 0;
  let transitionToken = 0;
  let scrollFrame = 0;
  const canMove = () => !reduce.matches && !manualPause && !document.hidden;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const request = callback => {
    const id = requestAnimationFrame(time => { frames.delete(id); callback(time); });
    frames.add(id);
    return id;
  };
  const animate = (element, keyframes, options = {}) => {
    if (!canMove() || !element.animate) return null;
    const animation = element.animate(keyframes, { duration: 800, easing: 'cubic-bezier(.22,.8,.2,1)', ...options });
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    return animation;
  };
  const cancelMotion = () => {
    animations.forEach(animation => animation.cancel());
    animations.clear();
    frames.forEach(id => cancelAnimationFrame(id));
    frames.clear();
    scrollFrame = 0;
  };

  const nav = document.querySelector('.service-nav');
  const tabs = [...document.querySelectorAll('[data-service]')];
  const panels = [...document.querySelectorAll('.service-panel')];
  const marker = document.querySelector('.nav-marker');
  const stage = document.querySelector('.service-stage');
  const wipe = document.querySelector('.service-wipe');
  const streamPaths = [...document.querySelectorAll('.service-art path')];
  const shapes = [
    [-80,350,120,80,160,460,320,250,480,40,500,430,760,110],
    [-80,340,110,340,140,100,300,110,510,120,420,480,760,350],
    [-80,200,190,570,460,440,380,225,290,-20,120,480,760,340],
    [-80,330,160,40,280,80,330,285,390,520,570,410,760,180],
    [-80,400,270,410,80,40,360,230,590,425,500,10,760,130],
    [-80,240,180,480,80,120,330,140,590,160,400,520,760,370],
    [-80,350,140,20,300,430,410,240,530,30,630,130,760,330]
  ];
  let curve = [...shapes[0]];
  const pathData = points => `M${points[0]} ${points[1]}C${points.slice(2,8).join(' ')}C${points.slice(8).join(' ')}`;
  const renderCurve = points => streamPaths.forEach(path => path.setAttribute('d', pathData(points)));
  const placeMarker = (motion = true) => {
    const tab = tabs[selected];
    const before = marker.getBoundingClientRect();
    marker.style.width = `${tab.offsetWidth}px`;
    marker.style.transform = `translateX(${tab.offsetLeft}px)`;
    if (motion && before.width && canMove()) {
      const after = marker.getBoundingClientRect();
      animate(marker, [
        { transform: `translateX(${tab.offsetLeft + before.left - after.left}px)`, width: `${before.width}px` },
        { transform: `translateX(${tab.offsetLeft}px)`, width: `${after.width}px` }
      ], { duration: 720 });
    }
  };
  const settle = () => {
    transitionToken++;
    panels.forEach((panel, index) => { panel.hidden = index !== selected; });
    curve = [...shapes[selected]];
    renderCurve(curve);
    placeMarker(false);
    wipe.style.transform = 'translateX(-105%)';
  };
  const select = (index, source = 'keyboard') => {
    index = (index + tabs.length) % tabs.length;
    if (selected === index) return;
    const direction = index > selected ? 1 : -1;
    const fromCurve = [...curve];
    cancelMotion();
    selected = index;
    const token = ++transitionToken;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === selected));
      tab.tabIndex = i === selected ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      panel.hidden = i !== selected;
      panel.setAttribute('aria-hidden', String(i !== selected));
    });
    placeMarker(true);
    const panel = panels[selected];
    if (canMove()) {
      const title = panel.querySelector('.service-left');
      const content = panel.querySelector('.service-right');
      animate(wipe, [
        { transform: `translateX(${-105 * direction}%)`, offset: 0 },
        { transform: 'translateX(0%)', offset: .38 },
        { transform: `translateX(${105 * direction}%)`, offset: 1 }
      ], { duration: 850, easing: 'cubic-bezier(.65,0,.25,1)' });
      animate(title, [
        { transform: `translateY(${75 * direction}px)`, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
        { transform: 'translateY(0)', opacity: 1, clipPath: 'inset(0% 0 0 0)' }
      ], { duration: 930, delay: 200, fill: 'backwards' });
      [...content.children].forEach((child, i) => animate(child, [
        { transform: `translateX(${55 * direction}px)`, opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ], { duration: 780, delay: 270 + i * 55, fill: 'backwards' }));
      const start = performance.now();
      const morph = time => {
        if (token !== transitionToken || !canMove()) return;
        const progress = clamp((time - start) / 1450);
        curve = fromCurve.map((value, i) => value + (shapes[selected][i] - value) * (.5 - Math.cos(progress * Math.PI) / 2));
        renderCurve(curve);
        if (progress < 1) request(morph);
      };
      request(morph);
    } else {
      curve = [...shapes[selected]];
      renderCurve(curve);
    }
    // The index remains a normal scrollable row, so touch never traps the page.
    const left = tabs[selected].offsetLeft;
    if (left < nav.scrollLeft || left + tabs[selected].offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollTo({ left: left - 12, behavior: canMove() ? 'smooth' : 'auto' });
    }
    if (source === 'pointer' && matchMedia('(max-width: 700px)').matches && stage.getBoundingClientRect().top > innerHeight * .48) {
      stage.scrollIntoView({ behavior: canMove() ? 'smooth' : 'auto', block: 'start' });
    }
  };
  root.classList.add('enhanced');
  nav.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.id = `range-tab-${index}`;
    tab.setAttribute('aria-controls', panels[index].id);
    tab.setAttribute('aria-selected', String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].setAttribute('aria-hidden', String(index !== 0));
    panels[index].tabIndex = 0;
    panels[index].hidden = index !== 0;
    tab.addEventListener('click', event => { event.preventDefault(); select(index, event.detail ? 'pointer' : 'keyboard'); });
    tab.addEventListener('keydown', event => {
      let next;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
      if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (event.key === ' ') { event.preventDefault(); select(index); }
      if (next !== undefined) { event.preventDefault(); select(next); tabs[next].focus({ preventScroll: true }); }
    });
  });
  document.querySelector('.service-arrows').hidden = false;
  document.querySelector('[data-previous]').addEventListener('click', () => select(selected - 1, 'pointer'));
  document.querySelector('[data-next]').addEventListener('click', () => select(selected + 1, 'pointer'));
  renderCurve(curve);
  placeMarker(false);

  const hero = document.querySelector('.hero');
  const heroLines = [...document.querySelectorAll('.hero-line')];
  const heroEm = document.querySelector('.hero h1 em');
  const heroPaths = [...document.querySelectorAll('.hero-art path')];
  const statement = document.querySelector('.statement');
  const ring = document.querySelector('.statement-ring');
  const statementEm = document.querySelector('.statement h2 em');
  const approach = document.querySelector('.approach');
  const processPath = document.querySelector('.process-current');
  const steps = [...document.querySelectorAll('.step')];
  const contact = document.querySelector('.contact');
  const contactEm = document.querySelector('.contact h2 em');
  const visible = (element, extra = 0) => {
    const rect = element.getBoundingClientRect();
    return rect.bottom > -extra && rect.top < innerHeight + extra;
  };
  const renderScenes = (staticMode = false) => {
    const viewport = innerHeight;
    if (visible(hero, 50) || staticMode) {
      const progress = staticMode ? 0 : clamp(-hero.getBoundingClientRect().top / hero.offsetHeight);
      heroLines.forEach((line, i) => { line.style.transform = `translateX(${progress * (i ? 90 : -55)}px)`; });
      heroEm.style.transform = `translateX(${-progress * 90}px) rotate(${-progress * 6}deg)`;
      const points = [-120, 500 - progress * 220, 210, 100 + progress * 400, 290, 830 - progress * 450, 630, 590 - progress * 180, 950, 350 + progress * 260, 1120, 440 - progress * 350, 1510, 890 - progress * 100];
      heroPaths.forEach(path => path.setAttribute('d', pathData(points)));
    }
    if (visible(statement, 60) || staticMode) {
      const progress = staticMode ? .5 : clamp((viewport - statement.getBoundingClientRect().top) / (viewport + statement.offsetHeight));
      ring.style.transform = `translateX(${(progress - .5) * -145}px) rotate(${-55 + progress * 55}deg) scale(${.85 + progress * .25})`;
      statementEm.style.transform = `translateX(${(progress - .5) * 80}px)`;
    }
    if (visible(approach, 50) || staticMode) {
      const rect = approach.getBoundingClientRect();
      const progress = staticMode ? 1 : clamp((viewport * .7 - rect.top) / (rect.height - viewport * .45));
      processPath.style.strokeDashoffset = String(1 - progress);
      steps.forEach(step => {
        const box = step.getBoundingClientRect();
        step.classList.toggle('is-current', staticMode || (box.top < viewport * .7 && box.bottom > viewport * .2));
      });
    }
    if (visible(contact, 50) || staticMode) {
      const progress = staticMode ? .5 : clamp((viewport - contact.getBoundingClientRect().top) / (viewport + contact.offsetHeight));
      contactEm.style.transform = `translateX(${(progress - .5) * -100}px)`;
    }
  };
  const onScroll = () => {
    if (!canMove() || scrollFrame) return;
    scrollFrame = request(() => { scrollFrame = 0; renderScenes(); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { placeMarker(false); if (canMove()) onScroll(); });
  const updateMotion = () => {
    cancelMotion();
    settle();
    const paused = reduce.matches || manualPause;
    root.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.disabled = reduce.matches;
    label.textContent = reduce.matches ? 'Motion reduced' : manualPause ? 'Resume motion' : 'Pause motion';
    renderScenes(paused);
  };
  toggle.hidden = false;
  toggle.addEventListener('click', () => { manualPause = !manualPause; updateMotion(); });
  reduce.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelMotion(); settle(); }
    else updateMotion();
  });
  // Finish the finite morph when its section leaves the viewport; no background loop.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.target === stage && !entry.isIntersecting) {
        transitionToken++;
        stage.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
        curve = [...shapes[selected]];
        renderCurve(curve);
      }
    }, { rootMargin: '80px' });
    observer.observe(stage);
  }
  updateMotion();
  if (canMove()) {
    heroLines.forEach((line, index) => animate(line, [
      { transform: `translateY(${120 + index * 25}px)`, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
      { transform: 'translateY(0)', opacity: 1, clipPath: 'inset(0% 0 0 0)' }
    ], { duration: 1250, delay: 100 + index * 90, fill: 'backwards' }));
    animate(heroEm, [{ transform: 'translate(80px,30px) rotate(-10deg)', opacity: 0 }, { transform: 'translate(0,0) rotate(0deg)', opacity: 1 }], { duration: 1400, delay: 280, fill: 'backwards' });
    animate(document.querySelector('.hero-art'), [{ transform: 'translateX(-160px) scale(1.15)', opacity: 0 }, { transform: 'translateX(0) scale(1)', opacity: 1 }], { duration: 1600, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  const copy = document.querySelector('[data-copy]');
  const status = document.querySelector('[data-copy-status]');
  copy.hidden = false;
  let copyTimer;
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('contact@groktech.xyz');
      copy.textContent = 'Copied';
      status.textContent = 'Email address copied.';
    } catch {
      copy.textContent = 'Use email link';
      status.textContent = 'Copy was unavailable. Use the email link to contact me.';
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copy.textContent = 'Copy address'; status.textContent = ''; }, 3000);
  });
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
})();
