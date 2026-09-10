/* Progressive motion: native scrolling, visible content, no animation dependency. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var running = new Set();
  var seen = new WeakSet();
  var root = document.documentElement;
  var navLinks = Array.from(document.querySelectorAll('.nav__links a'));
  var sections = Array.from(document.querySelectorAll('.content > section'));
  var currentSection = '';
  var scrollFrame = 0;
  var pointerFrame = 0;
  var pendingPointers = new Map();
  var activeSurfaces = new Set();
  var ease = 'cubic-bezier(.16,1,.3,1)';

  function animate(element, frames, options) {
    if (reduced.matches || !element || typeof element.animate !== 'function') return;
    var animation = element.animate(frames, Object.assign({
      duration: 760, easing: ease, fill: 'backwards'
    }, options));
    running.add(animation);
    function release() { running.delete(animation); }
    animation.finished.then(release, release);
    return animation;
  }

  function reveal(element, delay) {
    if (seen.has(element)) return;
    seen.add(element);
    element.setAttribute('data-motion-entered', '');
    animate(element, [
      { opacity: 0, translate: '0 28px' },
      { opacity: 1, translate: '0 0' }
    ], { delay: delay });

    if (element.matches('.skill')) {
      Array.from(element.querySelectorAll('.chips li')).forEach(function (chip, i) {
        animate(chip, [
          { opacity: 0, translate: '0 10px' },
          { opacity: 1, translate: '0 0' }
        ], { duration: 500, delay: Math.min(delay + i * 35, 360) });
      });
    }
    if (element.matches('.proof__item')) {
      animate(element.querySelector('b'), [
        { opacity: 0, scale: '.9' },
        { opacity: 1, scale: '1' }
      ], { duration: 900, delay: delay });
    }
  }

  // Observe first, animate on arrival. Nothing is hidden by a CSS/JS gate,
  // so missing APIs, script failures, anchor jumps and no-JS still show content.
  if ('IntersectionObserver' in window) {
    var entrances = new IntersectionObserver(function (entries) {
      var entering = entries.filter(function (entry) { return entry.isIntersecting; });
      entering.forEach(function (entry, index) {
        reveal(entry.target, Math.min(index * 70, 280));
        entrances.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -36px 0px' });
    document.querySelectorAll('.reveal:not(.edu__col), .sec__head, .proof__item, .entry').forEach(function (el) {
      entrances.observe(el);
    });
    // A keyboard jump must not focus an invisible element mid-reveal.
    document.addEventListener('focusin', function (event) {
      running.forEach(function (animation) {
        var target = animation.effect && animation.effect.target;
        if (target && target.contains(event.target)) animation.finish();
      });
    });
  }

  function readingProgress() {
    scrollFrame = 0;
    var max = root.scrollHeight - window.innerHeight;
    var progress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    root.style.setProperty('--read-progress', progress.toFixed(4));
    var active = '';
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= window.innerHeight * .38) active = section.id;
    });
    if (progress > .995 && sections.length) active = sections[sections.length - 1].id;
    if (active === currentSection) return;
    currentSection = active;
    navLinks.forEach(function (link) {
      if (link.getAttribute('href') === '#' + active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function queueProgress() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(readingProgress);
  }

  function resetSurface(surface) {
    pendingPointers.delete(surface);
    activeSurfaces.delete(surface);
    surface.rect = null;
    ['--tilt-x', '--tilt-y', '--magnet-x', '--magnet-y', '--pointer-x', '--pointer-y'].forEach(function (key) {
      surface.element.style.removeProperty(key);
    });
  }

  function resetPointers() {
    activeSurfaces.forEach(resetSurface);
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    pendingPointers.clear();
  }

  function renderPointers() {
    pointerFrame = 0;
    pendingPointers.forEach(function (position, surface) {
      var style = surface.element.style;
      var x = position.x, y = position.y;
      if (surface.button) {
        style.setProperty('--magnet-x', ((x - .5) * 8).toFixed(2) + 'px');
        style.setProperty('--magnet-y', ((y - .5) * 8).toFixed(2) + 'px');
      } else {
        var range = surface.element.matches('.proj') ? .8 : 3;
        style.setProperty('--tilt-x', ((.5 - y) * range).toFixed(2) + 'deg');
        style.setProperty('--tilt-y', ((x - .5) * range).toFixed(2) + 'deg');
        style.setProperty('--pointer-x', (x * 100).toFixed(2) + '%');
        style.setProperty('--pointer-y', (y * 100).toFixed(2) + '%');
      }
    });
    pendingPointers.clear();
  }

  // Cache geometry on entry; transforms never feed back into their own maths.
  // A single frame flush services all surfaces under the pointer, then stops.
  document.querySelectorAll('.proj, .proj__shot .card, .profile__portrait, .btn').forEach(function (element) {
    var surface = { element: element, button: element.matches('.btn'), rect: null };
    element.addEventListener('pointermove', function (event) {
      if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      if (!surface.rect) surface.rect = element.getBoundingClientRect();
      var rect = surface.rect;
      if (!rect.width || !rect.height) return;
      activeSurfaces.add(surface);
      pendingPointers.set(surface, {
        x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
      });
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(renderPointers);
    }, { passive: true });
    element.addEventListener('pointerleave', function () { resetSurface(surface); });
    element.addEventListener('pointercancel', function () { resetSurface(surface); });
  });

  window.addEventListener('scroll', function () {
    resetPointers();
    queueProgress();
  }, { passive: true });
  window.addEventListener('resize', function () {
    resetPointers();
    queueProgress();
  }, { passive: true });
  window.addEventListener('blur', resetPointers);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) resetPointers();
  });
  finePointer.addEventListener('change', resetPointers);
  reduced.addEventListener('change', function () {
    resetPointers();
    if (reduced.matches) {
      running.forEach(function (animation) { animation.cancel(); });
      running.clear();
    }
  });

  document.addEventListener('portfolio:language', function () {
    resetPointers();
    queueProgress();
    var headline = document.querySelector('.profile__name');
    if (!headline) return;
    var rect = headline.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      animate(headline, [{ opacity: .25, translate: '0 8px' }, { opacity: 1, translate: '0 0' }], { duration: 500 });
    }
  });
  if ('ResizeObserver' in window) new ResizeObserver(queueProgress).observe(document.body);
  readingProgress();
})();
