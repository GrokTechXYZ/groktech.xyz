(() => {
  'use strict';

  const button = document.querySelector('[data-sound-toggle]');
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!button || typeof AudioContext !== 'function') return;

  const root = document.documentElement;
  const chords = {
    arrival: [146.832, 220, 329.628],
    perception: [146.832, 184.997, 246.942],
    practice: [138.591, 184.997, 220],
    work: [146.832, 195.998, 246.942],
    contact: [146.832, 184.997, 220]
  };
  const peak = .018;
  const attack = .8;
  const hold = .45;
  const decay = 1.8;
  const duration = attack + hold + decay;
  const settleDelay = 200;
  const readScene = () => Object.prototype.hasOwnProperty.call(chords, root.dataset.scene) ? root.dataset.scene : 'arrival';
  let enabled = false;
  let context = null;
  let voices = [];
  let envelope = null;
  let generation = 0;
  let request = 0;
  let scene = readScene();
  let lastPlayed = null;
  let pendingScene = null;
  let settleTimer = 0;
  let endTimer = 0;

  const updateButton = () => {
    button.textContent = enabled ? 'Sound on' : 'Sound off';
    button.setAttribute('aria-pressed', String(enabled));
    button.title = enabled ? 'Turn scene sound off' : 'Turn on quiet scene chords';
  };
  const clearPending = () => {
    clearTimeout(settleTimer);
    settleTimer = 0;
    pendingScene = null;
    request += 1;
  };
  const silence = () => {
    clearTimeout(endTimer);
    endTimer = 0;
    const now = context?.currentTime || 0;
    voices.forEach(({ oscillator, gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        oscillator.stop();
      } catch {}
      try { oscillator.disconnect(); } catch {}
      try { gain.disconnect(); } catch {}
    });
    voices = [];
    envelope = null;
  };
  const disable = (failed = false) => {
    enabled = false;
    generation += 1;
    clearPending();
    silence();
    const previous = context;
    context = null;
    try { Promise.resolve(previous?.close()).catch(() => {}); } catch {}
    updateButton();
    if (failed) button.title = 'Sound could not start. You can try again.';
  };
  const levelAt = now => {
    if (!envelope) return 0;
    const elapsed = Math.max(0, now - envelope.start);
    if (elapsed < attack) return envelope.from + (peak - envelope.from) * elapsed / attack;
    if (elapsed < attack + hold) return peak;
    return Math.max(0, peak * (1 - (elapsed - attack - hold) / decay));
  };
  const frequencyAt = (voice, now) => {
    const progress = Math.min(1, Math.max(0, (now - voice.start) / attack));
    return voice.from + (voice.to - voice.from) * progress;
  };
  const play = name => {
    if (!enabled || document.hidden || context?.state !== 'running') return;
    const now = context.currentTime;
    const frequencies = chords[name];
    const from = levelAt(now);
    clearTimeout(endTimer);

    if (!voices.length) {
      frequencies.forEach(frequency => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const voice = { oscillator, gain, from: frequency, to: frequency, start: now };
        voices.push(voice);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0, now);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
      });
    }

    // Retune the same three voices, so a quick scene change cannot stack chords.
    voices.forEach((voice, index) => {
      const frequency = frequencyAt(voice, now);
      voice.oscillator.frequency.cancelScheduledValues(now);
      voice.oscillator.frequency.setValueAtTime(frequency, now);
      voice.oscillator.frequency.linearRampToValueAtTime(frequencies[index], now + attack);
      voice.from = frequency;
      voice.to = frequencies[index];
      voice.start = now;
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(from, now);
      voice.gain.gain.linearRampToValueAtTime(peak, now + attack);
      voice.gain.gain.setValueAtTime(peak, now + attack + hold);
      voice.gain.gain.linearRampToValueAtTime(0, now + duration);
    });
    envelope = { start: now, from };
    lastPlayed = name;
    // The audio envelope reaches zero independently of timer throttling.
    endTimer = setTimeout(silence, duration * 1000 + 80);
  };
  const playPending = async () => {
    const next = pendingScene;
    pendingScene = null;
    settleTimer = 0;
    if (!enabled || document.hidden || !next || next === lastPlayed) return;
    const token = generation;
    const attempt = ++request;
    const audio = context;
    try {
      if (audio?.state !== 'running') await audio?.resume();
      if (document.hidden) {
        try { await audio?.suspend(); } catch {}
        return;
      }
      if (!enabled || token !== generation || attempt !== request || next !== scene) return;
      if (audio?.state !== 'running') throw new Error('Audio did not resume');
      play(next);
    } catch {
      if (enabled && token === generation && attempt === request) disable(true);
    }
  };
  const schedule = () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(playPending, settleDelay);
  };
  const observeScene = () => {
    const next = readScene();
    if (next === scene) return;
    scene = next;
    clearPending();
    if (!enabled || document.hidden || next === lastPlayed) return;
    pendingScene = next;
    schedule();
  };

  button.hidden = false;
  updateButton();
  button.addEventListener('click', async () => {
    if (enabled) { disable(); return; }
    enabled = true;
    const token = ++generation;
    clearPending();
    const attempt = request;
    scene = readScene();
    lastPlayed = null;
    updateButton();
    try {
      // Context creation and resume happen only after the visitor's click.
      const audio = new AudioContext();
      context = audio;
      if (audio.state !== 'running') await audio.resume();
      if (document.hidden) {
        try { await audio.suspend(); } catch {}
        return;
      }
      if (!enabled || token !== generation || attempt !== request) return;
      if (audio.state !== 'running') throw new Error('Audio did not resume');
      clearPending();
      scene = readScene();
      play(scene);
    } catch {
      if (enabled && token === generation) disable(true);
    }
  });

  if (typeof MutationObserver === 'function') {
    new MutationObserver(observeScene).observe(root, { attributes: true, attributeFilter: ['data-scene'] });
  }
  window.addEventListener('scroll', () => {
    observeScene();
    if (enabled && pendingScene) schedule();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    clearPending();
    scene = readScene();
    lastPlayed = scene;
    if (!document.hidden) return;
    silence();
    try { Promise.resolve(context?.suspend()).catch(() => {}); } catch {}
  });
  window.addEventListener('pagehide', () => disable());
})();
