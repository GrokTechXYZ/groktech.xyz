(() => {
  'use strict';

  const invitations = [...document.querySelectorAll('[data-chat-open]')];
  let returnTarget = null;
  const widget = () => document.getElementById('bubblegram-host');
  const focusComposer = panel => {
    const input = [...panel.querySelectorAll('input:not([type="file"]), textarea')].find(field => !field.disabled && field.getClientRects().length);
    (input || panel.querySelector('.panel-header-close'))?.focus({ preventScroll: true });
  };
  invitations.forEach(invitation => {
    const pointToChat = () => widget()?.toggleAttribute('data-chat-attention', invitation.matches(':focus') || (matchMedia('(hover: hover)').matches && invitation.matches(':hover')));
    invitation.addEventListener('pointerenter', pointToChat);
    invitation.addEventListener('pointerleave', pointToChat);
    invitation.addEventListener('focus', pointToChat);
    invitation.addEventListener('blur', () => widget()?.removeAttribute('data-chat-attention'));
    invitation.addEventListener('click', event => {
      // Real email links remain useful without JavaScript, a CDN, or a widget.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !widget() || typeof window.Bubblegram?.open !== 'function') return;
      event.preventDefault();
      returnTarget = invitation;
      widget().removeAttribute('data-chat-attention');
      window.Bubblegram.open();
      const panel = widget().shadowRoot?.querySelector('.panel');
      if (panel && !panel.hasAttribute('inert')) focusComposer(panel);
    });
  });

  // Optional polish for Bubblegram's native button. Its click handler, unread
  // badge, panel and messaging stay with the vendor. If required elements are
  // absent, leave the standard widget intact instead of adding another launcher.
  const enhance = () => {
    const host = document.getElementById('bubblegram-host');
    if (host && typeof window.Bubblegram?.open === 'function') {
      document.querySelectorAll('[data-chat-label]').forEach(label => { label.textContent = 'Chat with me now'; });
      document.querySelectorAll('[data-chat-corner]').forEach(note => { note.hidden = false; });
    }
    const shadow = host?.shadowRoot;
    const button = shadow?.querySelector('button.bubble');
    const logo = button?.querySelector('.bubble-icon--logo');
    const panel = shadow?.querySelector('.panel');
    const stylesheet = document.querySelector('[data-chat-style]');
    if (!button || !logo || !panel || !stylesheet) return false;

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = stylesheet.href;
    shadow.appendChild(style);
    logo.innerHTML = '<svg viewBox="0 0 56 56" fill="none" aria-hidden="true" focusable="false"><path d="M28 4C14.7 4 5 12.4 5 24.3c0 6.5 2.8 11.9 7.8 15.5L10.5 51l12-6.7c1.8.4 3.6.6 5.5.6 13.3 0 23-8.5 23-20.6S41.3 4 28 4Z" fill="#355f95"/><path d="M14.5 18c2.5-4.2 7.2-6.5 13.5-6.5" stroke="#a8bdd6" stroke-width="1.3" stroke-linecap="round"/><circle cx="21" cy="24" r="1.8" fill="#f7f6f1"/><circle cx="35" cy="24" r="1.8" fill="#f7f6f1"/><path d="M21 31c3.8 4 10.2 4 14 0" stroke="#f7f6f1" stroke-width="1.8" stroke-linecap="round"/></svg>';

    const label = document.createElement('span');
    label.className = 'grok-chat-label';
    label.textContent = 'Chat with me now';
    label.setAttribute('aria-hidden', 'true');
    button.appendChild(label);
    button.type = 'button';
    panel.id = 'grok-chat-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Chat with GrokTech');
    button.setAttribute('aria-controls', panel.id);
    button.addEventListener('click', () => {
      if (!button.classList.contains('is-open')) returnTarget = button;
    }, { capture: true });
    panel.querySelector('.email-row input')?.setAttribute('aria-label', 'Your email address');
    panel.querySelector('textarea')?.setAttribute('aria-label', 'Your message');
    panel.querySelector('.panel-header-title')?.replaceChildren('GrokTech');
    panel.querySelector('.messages-empty-title')?.replaceChildren('Start with one line.');
    panel.querySelector('.messages-empty-subtitle')?.replaceChildren('A question, a snag, a half-formed idea. Your message comes straight to me.');

    let wasOpen = false;
    const sync = () => {
      const open = button.classList.contains('is-open');
      const name = open ? 'Close chat' : 'Chat with me now';
      if (button.getAttribute('aria-label') !== name) button.setAttribute('aria-label', name);
      button.setAttribute('aria-expanded', String(open));
      // The vendor visually hides the panel; also remove closed controls from
      // keyboard navigation and the accessibility tree.
      panel.toggleAttribute('inert', !open);
      panel.setAttribute('aria-hidden', String(!open));
      if (!wasOpen && open) focusComposer(panel);
      if (wasOpen && !open) {
        const target = returnTarget?.isConnected ? returnTarget : button;
        target.focus({ preventScroll: true });
        returnTarget = null;
      }
      wasOpen = open;
    };
    new MutationObserver(sync).observe(button, { attributes: true, attributeFilter: ['class', 'aria-label'] });
    shadow.addEventListener('keydown', event => {
      if (event.key === 'Escape' && button.classList.contains('is-open') && !shadow.querySelector('.lightbox.open')) {
        event.preventDefault();
        window.Bubblegram?.close();
      }
    });
    sync();

    const syncMotion = () => host.toggleAttribute('data-motion-paused', document.documentElement.classList.contains('motion-paused'));
    new MutationObserver(syncMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    syncMotion();
    return true;
  };

  if (enhance()) return;
  const observer = new MutationObserver(() => {
    if (enhance()) observer.disconnect();
  });
  // The async CDN script appends its fully constructed host directly to body.
  observer.observe(document.body, { childList: true });
})();
