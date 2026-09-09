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
    if (dict._title) document.title = dict._title;

    $$('.lang__btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === next;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    try { localStorage.setItem('wy-lang', next); } catch (e) { /* private mode */ }
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

  /* ═══ Sticky nav ═══ */
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 24); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ═══ Mobile menu ═══ */
  var burger = $('.burger');
  var links  = $('.nav__links');
  function closeMenu() {
    links.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav__links a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* Tapping the blank area of the overlay closes it. The overlay fills the
     screen, so "outside the menu" is the overlay's own background — a tap that
     lands on the panel itself rather than on one of its links. */
  links.addEventListener('click', function (e) { if (e.target === links) closeMenu(); });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* Crossing back to the desktop layout with the menu open would otherwise
     leave the page scroll-locked with no visible way to release it. */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && links.classList.contains('is-open')) closeMenu();
  });

  /* ═══ Scroll reveal ═══ */
  var reveals = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el, i) {
      // stagger only within the first screen, so later sections land promptly
      var top = el.getBoundingClientRect().top;
      if (top < window.innerHeight) el.style.setProperty('--d', (i * 90) + 'ms');
      io.observe(el);
    });
  }

  /* ═══ Project video: play only while on screen ═══
     preload="none" in the markup, so the file is not fetched at all unless
     the row is actually reached. Honours prefers-reduced-motion, where the
     poster frame stays put. */
  (function projectVideo() {
    var vids = $$('.proj__shot video');
    if (!vids.length) return;

    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) return;

    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (v.preload === 'none') v.preload = 'auto';
          var p = v.play();
          if (p && p.catch) p.catch(function () { /* autoplay refused; poster stands */ });
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.35 });

    vids.forEach(function (v) { vo.observe(v); });
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

  form.addEventListener('submit', function (e) {
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

  /* ═══ Visit counter ═══
     A free, no-signup counter (abacus). Three deliberate constraints:

     - It fails invisibly. If the service is slow, down, or gone for good,
       the footer simply omits the line. A stuck 0 or a NaN in the footer
       would be worse than no counter at all.
     - It counts a visit, not a keypress. After the first hit of a session
       it reads with /get/ instead of /hit/, so reloading the page does not
       inflate the number.
     - It is skipped on localhost, so development never reaches the count. */
  (function visits() {
    var box = document.getElementById('hits');
    var out = document.getElementById('hitsN');
    if (!box || !out) return;

    var host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') return;

    var counted = null;
    try { counted = sessionStorage.getItem('wy-counted'); } catch (e) { /* private mode */ }

    var url = 'https://abacus.jasoncameron.dev/' +
              (counted ? 'get' : 'hit') + '/lion504-github-io/home';

    fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      if (typeof data.value !== 'number') throw new Error('unexpected payload');
      try { sessionStorage.setItem('wy-counted', '1'); } catch (e) { /* ignore */ }
      out.textContent = data.value.toLocaleString();
      box.hidden = false;
    }).catch(function () {
      /* counter unavailable — the footer stays as it was */
    });
  })();

  /* ═══ Footer year ═══ */
  $('#yr').textContent = String(new Date().getFullYear());
})();
