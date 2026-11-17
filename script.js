(() => {
  'use strict';
  const CONSENT_KEY = 'alpenwerk-consent-v1';
  const banner = document.getElementById('cookie-banner');
  const dialog = document.getElementById('cookie-dialog');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const externalToggle = document.getElementById('consent-external');
  const analyticsToggle = document.getElementById('consent-analytics');
  const mapAction = document.getElementById('map-action');
  const mapFrame = document.getElementById('map-frame');
  let consent = readConsent();

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
      if (saved && saved.essential === true) return { essential: true, analytics: saved.analytics === true, external: saved.external === true };
    } catch (_) { /* Storage may be unavailable; use the in-memory choice. */ }
    return null;
  }
  function storeConsent(value) {
    consent = { essential: true, analytics: !!value.analytics, external: !!value.external, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch (_) { /* Consent still applies for this visit. */ }
    if (banner) banner.hidden = true;
    if (consent.external) loadMap();
  }
  function loadMap() {
    if (!mapFrame || mapFrame.querySelector('iframe')) return;
    const frame = document.createElement('iframe');
    frame.title = 'Google Maps – Standort Alpenwerk Energie in München';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.allowFullscreen = true;
    frame.src = 'https://www.google.com/maps?q=Marienplatz%2C%20Munich%2C%20Germany&output=embed';
    mapFrame.appendChild(frame);
    if (mapAction) mapAction.hidden = true;
  }
  function openSettings() {
    if (!dialog) return;
    if (externalToggle) externalToggle.checked = !!(consent && consent.external);
    if (analyticsToggle) analyticsToggle.checked = !!(consent && consent.analytics);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  function closeSettings() {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  document.querySelectorAll('[data-consent-all]').forEach(button => button.addEventListener('click', () => storeConsent({ analytics: true, external: true })));
  document.querySelectorAll('[data-consent-essential]').forEach(button => button.addEventListener('click', () => storeConsent({ analytics: false, external: false })));
  document.querySelectorAll('[data-open-cookie-settings]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); openSettings(); }));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', closeSettings));
  const saveButton = document.querySelector('[data-save-settings]');
  if (saveButton) saveButton.addEventListener('click', () => { storeConsent({ analytics: analyticsToggle && analyticsToggle.checked, external: externalToggle && externalToggle.checked }); closeSettings(); });
  if (dialog) dialog.addEventListener('click', event => { if (event.target === dialog) closeSettings(); });
  const loadMapButton = document.getElementById('load-map');
  if (loadMapButton) loadMapButton.addEventListener('click', loadMap);
  if (!consent && banner) banner.hidden = false;
  if (consent && consent.external) loadMap();

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menuToggle.setAttribute('aria-label', open ? 'Menü öffnen' : 'Menü schließen');
      nav.classList.toggle('is-open', !open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Menü öffnen');
      nav.classList.remove('is-open');
    }));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  const form = document.getElementById('contact-form');
  if (form) {
    const status = document.getElementById('form-status');
    const fields = [
      { input: document.getElementById('name'), error: document.getElementById('name-error'), message: 'Bitte geben Sie Ihren Namen ein.' },
      { input: document.getElementById('email'), error: document.getElementById('email-error'), message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.', validate: input => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) },
      { input: document.getElementById('message'), error: document.getElementById('message-error'), message: 'Bitte schreiben Sie eine kurze Nachricht.' },
      { input: document.getElementById('privacy'), error: document.getElementById('privacy-error'), message: 'Bitte bestätigen Sie die Datenschutzhinweise.' }
    ];
    fields.forEach(item => item.input && item.input.addEventListener('input', () => { item.error.textContent = ''; item.input.removeAttribute('aria-invalid'); }));
    form.addEventListener('submit', event => {
      event.preventDefault();
      let firstInvalid = null;
      fields.forEach(item => {
        const valid = item.input.type === 'checkbox' ? item.input.checked : (item.validate ? item.validate(item.input) : item.input.value.trim().length > 0);
        item.error.textContent = valid ? '' : item.message;
        if (!valid) { item.input.setAttribute('aria-invalid', 'true'); if (!firstInvalid) firstInvalid = item.input; }
      });
      if (firstInvalid) { firstInvalid.focus(); if (status) status.textContent = 'Bitte prüfen Sie die markierten Felder.'; return; }
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const topic = document.getElementById('topic').value;
      const message = document.getElementById('message').value.trim();
      const subject = encodeURIComponent(`Anfrage von ${name}${topic ? ` – ${topic}` : ''}`);
      const body = encodeURIComponent(`Name: ${name}\nE-Mail: ${email}\nThema: ${topic || 'Nicht angegeben'}\n\n${message}`);
      if (status) status.textContent = 'Ihr E-Mail-Programm wird mit Ihrer Anfrage geöffnet.';
      window.location.href = `mailto:hallo@alpenwerk-energie.de?subject=${subject}&body=${body}`;
    });
  }
})();
