(function () {
  'use strict';

  /* ── Contact form endpoint ─────────────────────────────────────────
     Formspree receives the submission and forwards it to EMAIL. Cleared
     to '' the form still works, falling back to opening the visitor's own
     mail client with the message pre-filled. Nothing breaks either way. */
  var FORM_ENDPOINT = 'https://formspree.io/f/xvkovqld';
  var EMAIL = 'Lehtonen6677@gmail.com';

  /* ── Analytics ──────────────────────────────────────────────────────
     Self-hosted Umami. Both values come from your own instance, so the
     site still makes no third-party request on load — the script is
     served from your server, not someone else's.

       ANALYTICS_HOST = 'https://analytics.example.com'   (no trailing /)
       ANALYTICS_ID   = the website ID Umami shows in Settings

     Leave either empty and no script is injected at all. See README. */
  var ANALYTICS_HOST = '';
  var ANALYTICS_ID   = '';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ═══ i18n ═══ */
  var lang = 'en';

  function applyLang(next) {
    var dict = window.I18N && window.I18N[next];
    if (!dict) return;
    lang = next;

    $$('[data-i18n]').forEach(function (el) {
      var val = dict[el.getAttribute('data-i18n')];
      if (typeof val !== 'string') return;
      // every string here is authored in i18n.js, never user input
      el.innerHTML = val;
    });

    document.documentElement.lang = next;
    var pageTitle = document.body.getAttribute('data-title-key');
    if (pageTitle && dict[pageTitle]) document.title = dict[pageTitle] + ' — Wang Yongzhi';
    else if (dict._title) document.title = dict._title;

    $$('.lang__btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === next;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    try { localStorage.setItem('wy-lang', next); } catch (e) { /* private mode */ }
    document.dispatchEvent(new Event('portfolio:language'));
  }

  $$('.lang__btn').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
  });

  (function initLang() {
    var saved = null;
    try { saved = localStorage.getItem('wy-lang'); } catch (e) { /* ignore */ }
    if (saved === 'fi' || saved === 'en') { applyLang(saved); return; }
    if ((navigator.language || '').toLowerCase().indexOf('fi') === 0) applyLang('fi');
  })();

  /* ═══ Project video: play only while on screen ═══
     preload="none" in the markup, so the file is not fetched at all unless
     the row is actually reached. Honours prefers-reduced-motion, where the
     poster frame stays put. */
  (function projectVideo() {
    var vids = $$('.proj__shot video');
    if (!vids.length) return;

    var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!('IntersectionObserver' in window)) return;

    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (v.hasAttribute('data-user-playback')) {
          if (!en.isIntersecting) v.pause();
          return;
        }
        if (en.isIntersecting && !preference.matches) {
          if (v.preload === 'none') v.preload = 'auto';
          var p = v.play();
          if (p && p.catch) p.catch(function () { /* autoplay refused; poster stands */ });
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.35 });

    vids.forEach(function (v) { vo.observe(v); });
    preference.addEventListener('change', function () {
      vids.forEach(function (v) {
        v.pause();
        vo.unobserve(v);
        vo.observe(v);
      });
    });
  })();

  /* ═══ Contact form ═══ */
  var form   = $('#contactForm');
  var status = $('#formStatus');

  function t(key) {
    var d = window.I18N && window.I18N[lang];
    return (d && d[key]) || '';
  }
  function say(msg, kind) {
    status.textContent = msg;
    status.className = 'form__status' + (kind ? ' is-' + kind : '');
  }

  /* A failed send must not be a dead end. Telling someone to "email me
     directly" without the address costs the message; this hands them the
     address as something they can tap. */
  function sayFailed(msg) {
    say(msg, 'err');
    status.appendChild(document.createTextNode(' '));
    var a = document.createElement('a');
    a.className = 'form__mail';
    a.href = 'mailto:' + EMAIL;
    a.textContent = EMAIL;
    status.appendChild(a);
  }

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) { say(t('form.invalid'), 'err'); return; }

    var data = {
      name:    $('#cf-name').value.trim(),
      email:   $('#cf-email').value.trim(),
      message: $('#cf-msg').value.trim()
    };

    if (!FORM_ENDPOINT) {
      // Fallback: hand off to the visitor's own mail client.
      var subject = 'Portfolio enquiry — ' + data.name;
      var body    = data.message + '\n\n— ' + data.name + ' (' + data.email + ')';
      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body='    + encodeURIComponent(body);
      say(t('form.ok'), 'ok');
      return;
    }

    say(t('form.sending'));
    fetch(FORM_ENDPOINT, {
      method:  'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      say(t('form.ok'), 'ok');
    }).catch(function () {
      sayFailed(t('form.err'));
    });
  });

  /* ═══ Analytics ═══
     Injected rather than written into the markup, so an unconfigured site
     loads nothing and a local preview is never counted. Umami reads its
     own data attributes off the script tag, so this is equivalent to a
     hard-coded tag — minus shipping a placeholder. */
  (function analytics() {
    if (!ANALYTICS_HOST || !ANALYTICS_ID) return;

    var host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') return;

    var s = document.createElement('script');
    s.defer = true;
    s.src = ANALYTICS_HOST.replace(/\/+$/, '') + '/script.js';
    s.setAttribute('data-website-id', ANALYTICS_ID);
    document.head.appendChild(s);
  })();

  /* Read the existing total in local previews; count once per session on the live site.
     This service measures sessions, not verified unique people. */
  (function visits() {
    var box = $('#hits'), out = $('#hitsN'), note = $('#hitsNote');
    if (!box || !out) return;
    var host = location.hostname;
    var preview = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '';
    var state = 'loading', total = null;
    function render() {
      out.textContent = total === null ? t('counter.' + state) : total.toLocaleString(lang);
      if (note) note.textContent = preview ? t('counter.preview') : t('counter.sessions');
    }
    document.addEventListener('portfolio:language', render);
    render();
    var counted = null;
    try { counted = sessionStorage.getItem('wy-counted'); } catch (e) { /* private mode */ }
    var url = 'https://abacus.jasoncameron.dev/' +
      ((preview || counted) ? 'get' : 'hit') + '/lion504-github-io/home';
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 6000);
    fetch(url, { signal: controller.signal }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      if (!Number.isSafeInteger(data.value) || data.value < 0) throw new Error('unexpected payload');
      if (!preview) {
        try { sessionStorage.setItem('wy-counted', '1'); } catch (e) { /* private mode */ }
      }
      total = data.value;
      state = 'ready';
    }).catch(function () {
      state = 'unavailable';
    }).finally(function () { clearTimeout(timeout); render(); });
  })();

  /* ═══ Footer year ═══ */
  if ($('#yr')) $('#yr').textContent = String(new Date().getFullYear());
})();
