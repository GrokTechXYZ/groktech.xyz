(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.querySelector('.motion-toggle');
  const label = document.querySelector('[data-motion-label]');
  let paused = false;
  try { paused = localStorage.getItem('perspective-motion') === 'paused'; } catch {}
  const animations = new Set();
  const canMove = () => !paused && !reduced.matches && !document.hidden;
  const animate = (el, frames, options) => {
    if (!el?.animate || !canMove()) return;
    const a = el.animate(frames, { duration: 1000, easing: 'cubic-bezier(.22,.75,.2,1)', ...options });
    animations.add(a);
    a.finished.catch(() => {}).finally(() => animations.delete(a));
  };
  const updateMotion = () => {
    const off = paused || reduced.matches;
    root.classList.toggle('motion-paused', off);
    if (off) { animations.forEach(a => a.cancel()); animations.clear(); }
    if (motion) {
      motion.hidden = false;
      motion.setAttribute('aria-pressed', String(off));
      motion.disabled = reduced.matches;
      label.textContent = reduced.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
    }
  };
  motion?.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('perspective-motion', paused ? 'paused' : 'playing'); } catch {}
    updateMotion();
  });
  reduced.addEventListener?.('change', updateMotion);
  updateMotion();
  document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));
  const status = document.querySelector('[data-copy-status]');
  document.querySelectorAll('[data-copy-email]').forEach(button => {
    if (!navigator.clipboard?.writeText) return;
    const emailLink = button.closest('.email-options').querySelector('a');
    const address = emailLink.getAttribute('href').slice(7);
    button.hidden = false;
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await navigator.clipboard.writeText(address);
        status.textContent = 'Email copied: ' + address;
        button.setAttribute('aria-label', 'Email copied');
      } catch {
        const range = document.createRange(); range.selectNodeContents(emailLink);
        const selection = getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
        status.textContent = 'The email address is selected. Copy it or use the email link.';
      } finally {
        button.disabled = false;
        setTimeout(() => button.setAttribute('aria-label', 'Copy email address'), 3000);
      }
    });
  });
  const sections = [...document.querySelectorAll('section[data-scene]')];
  const sceneLinks = [...document.querySelectorAll('.scene-nav a')];
  const header = document.querySelector('.site-header');
  let frame = 0;
  const updateScene = () => {
    frame = 0;
    header?.classList.toggle('is-scrolled', scrollY > 50);
    let active = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= innerHeight * .46) active = index;
    });
    const name = sections[active]?.dataset.scene || 'arrival';
    if (root.dataset.scene !== name) root.dataset.scene = name;
    sceneLinks.forEach((link, i) => {
      if (i === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const requestScene = () => { if (!frame) frame = requestAnimationFrame(updateScene); };
  addEventListener('scroll', requestScene, { passive: true });
  addEventListener('resize', requestScene);
  updateScene();
  const openHash = () => {
    if (!location.hash.startsWith('#service-')) return;
    const row = document.getElementById(location.hash.slice(1));
    if (row?.matches('details')) row.open = true;
  };
  openHash(); addEventListener('hashchange', openHash);
  document.querySelectorAll('.index-row').forEach(row => {
    row.addEventListener('toggle', () => {
      if (row.open) animate(row.querySelector('.row-body'), [{ opacity: .2, transform: 'translateY(-7px)' }, { opacity: 1, transform: 'none' }], { duration: 500 });
      requestScene();
      window.grokExperience?.refresh?.();
    });
  });
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      observer.unobserve(el);
      if (el.matches('.project-preview')) {
        animate(el, [{ clipPath: 'inset(0 0 18% 0)', transform: 'translateY(32px)', opacity: .35 }, { clipPath: 'inset(0)', transform: 'none', opacity: 1 }], { duration: 1250 });
      } else {
        animate(el, [{ opacity: .18, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 1000 });
      }
    }), { threshold: .12 });
    document.querySelectorAll('.perception-copy,.practice-intro,.work-heading,.project-preview,.project-meta,.contact-content').forEach(el => observer.observe(el));
  }
  if (!location.hash) document.querySelectorAll('h1>span').forEach((el, index) => animate(el, [{ opacity: 0, transform: 'translateY(25px)' }, { opacity: 1, transform: 'none' }], { duration: 1200, delay: index * 140, fill: 'backwards' }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { animations.forEach(a => a.cancel()); animations.clear(); }
    else requestScene();
  });
})();
