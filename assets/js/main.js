(function () {
  'use strict';

  /* ── Contact form endpoint ─────────────────────────────────────────
     Formspree receives the submission and forwards it to EMAIL. Cleared
     to '' the form still works, falling back to opening the visitor's own
     mail client with the message pre-filled. Nothing breaks either way. */
  var FORM_ENDPOINT = 'https://formspree.io/f/xvkovqld';
  var EMAIL = 'lehtonen6677@gmail.com';

  /* ── Analytics ──────────────────────────────────────────────────────
     Self-hosted Umami. Both values come from your own instance, so the
     site still makes no third-party request on load — the script is
     served from your server, not someone else's.

       ANALYTICS_HOST = 'https://analytics.example.com'   (no trailing /)
       ANALYTICS_ID   = the website ID Umami shows in Settings

     Leave either empty and no script is injected at all. See README. */
  var ANALYTICS_HOST = 'https://timoserver.tailca12c6.ts.net:8443';
  var ANALYTICS_ID   = 'ccf081bf-63d7-406e-93f5-9820f7a96d48';

  /* Only this host is counted (Umami's data-domains), so a copy of the site
     or a preview deployment never adds to the numbers. */
  var ANALYTICS_DOMAIN = 'lion504.github.io';

  /* Custom Umami event. Calls made before the tracker has loaded wait for it;
     with analytics off they are dropped. Never carries personal data. */
  var pendingEvents = [];
  function track(name, data) {
    if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data);
    else if (pendingEvents) pendingEvents.push([name, data]);
  }

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ═══ i18n ═══
     Each page exists in English and, under /fi/, in Finnish with the strings
     already in the markup (tools/build_pages.py). The served language and its
     title are what search engines index, so they are kept as authored. */
  var lang = 'en';
  var pageLang = document.documentElement.lang === 'fi' ? 'fi' : 'en';
  var pageTitle = document.title;

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
    var titleKey = document.body.getAttribute('data-title-key');
    if (next === pageLang) document.title = pageTitle;
    else if (titleKey && dict[titleKey]) document.title = dict[titleKey] + ' — Wang Yongzhi';
    else if (dict._title) document.title = dict._title;

    $$('.lang__btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === next;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    try { localStorage.setItem('wy-lang', next); } catch (e) { /* private mode */ }
    document.dispatchEvent(new Event('portfolio:language'));
  }

  /* The toggle opens the other language's page when there is one; the path
     is taken from the hreflang link so it also works in a local preview. */
  $$('.lang__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = b.getAttribute('data-lang');
      var alt = document.querySelector('link[rel="alternate"][hreflang="' + next + '"]');
      var path = alt ? new URL(alt.href).pathname : '';
      if (next !== lang) track('language-switch', { from: lang, to: next });
      if (next !== pageLang && path && path !== location.pathname) {
        try { localStorage.setItem('wy-lang', next); } catch (e) { /* private mode */ }
        location.href = path + location.hash;
        return;
      }
      applyLang(next);
    });
  });

  (function initLang() {
    if (pageLang === 'fi') { applyLang('fi'); return; }
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

  /* Copy is an enhancement; the mail link remains usable without JavaScript. */
  (function copyEmail() {
    var button = $('#copy-email'), output = $('#copy-status');
    if (!button || !output) return;
    var resultKey = '';
    button.hidden = false;
    document.addEventListener('portfolio:language', function () {
      output.textContent = resultKey ? t(resultKey) : '';
    });
    button.addEventListener('click', async function () {
      button.disabled = true;
      try {
        await navigator.clipboard.writeText(EMAIL);
        resultKey = 'contact.copied';
        track('contact', { method: 'copy-email' });
      } catch (error) {
        resultKey = 'contact.copyFailed';
      } finally {
        output.textContent = t(resultKey);
        button.disabled = false;
      }
    });
  })();

  /* Print all archive entries, then restore the reader's disclosure state. */
  (function printDetails() {
    var closed = [];
    window.addEventListener('beforeprint', function () {
      $$('details:not([open])').forEach(function (detail) {
        closed.push(detail);
        detail.open = true;
      });
    });
    window.addEventListener('afterprint', function () {
      closed.forEach(function (detail) { detail.open = false; });
      closed = [];
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
      track('contact', { method: 'form-mail-client' });
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
      track('contact', { method: 'form' });
    }).catch(function () {
      sayFailed(t('form.err'));
      track('contact-form-error');
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
    if (ANALYTICS_DOMAIN) s.setAttribute('data-domains', ANALYTICS_DOMAIN);
    // the tag splits every report by page language in the Umami dashboard
    s.setAttribute('data-tag', pageLang);
    s.onload = function () {
      var queued = pendingEvents;
      pendingEvents = null;
      if (window.umami) queued.forEach(function (ev) { window.umami.track(ev[0], ev[1]); });
    };
    s.onerror = function () { pendingEvents = null; };
    document.head.appendChild(s);
  })();

  /* What visitors do, not who they are: one listener sorts every link click
     into CV download, contact, project or other outbound. Only the link's
     destination is sent. */
  (function clickEvents() {
    var CONTACT = { 'wa.me': 'whatsapp', 'linkedin.com': 'linkedin' };

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var url;
      try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }

      if (url.protocol === 'mailto:') { track('contact', { method: 'email' }); return; }
      if (url.protocol === 'tel:') { track('contact', { method: 'phone' }); return; }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

      var file = url.pathname.split('/').pop();
      if (a.hasAttribute('download') || /\.pdf$/i.test(file)) {
        track('cv-download', { file: file, page: location.pathname });
        return;
      }

      var host = url.hostname.replace(/^www\./, '');
      var parts = url.pathname.split('/').filter(Boolean);
      // lion504.github.io/<Repo>/ is another project's site; the rest is this one
      var otherSite = host === ANALYTICS_DOMAIN && parts.length > 0 &&
        parts[0].indexOf('.') < 0 && parts[0] !== 'fi' && parts[0] !== 'assets';
      if ((host === location.hostname || host === ANALYTICS_DOMAIN) && !otherSite) return;

      if (CONTACT[host]) { track('contact', { method: CONTACT[host] }); return; }

      // a GitHub repository, or a live demo hosted outside this site
      var project = host === 'github.com' && parts.length >= 2 ? parts[0] + '/' + parts[1]
        : otherSite ? parts[0]
        : /\.(web\.app|firebaseapp\.com|vercel\.app|netlify\.app)$/.test(host) ? host
        : '';
      if (project) {
        track('project-link', { project: project, kind: host === 'github.com' ? 'repo' : 'demo', page: location.pathname });
        return;
      }
      track('outbound', { host: host, url: url.origin + url.pathname, page: location.pathname });
    });
  })();

  /* GitHub Pages serves 404.html at the missing address, so the path and the
     page that linked to it are what is worth knowing. */
  if (document.body.getAttribute('data-title-key') === 'notfound.title') {
    track('404', { path: location.pathname, referrer: document.referrer || '(direct)' });
  }

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
