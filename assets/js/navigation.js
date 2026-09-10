/* Native links and a modal drawer; animation never owns navigation or scrolling. */
(function () {
  'use strict';
  var dialog = document.getElementById('site-menu');
  var toggle = document.querySelector('.menu-toggle');
  if (!dialog || !toggle || typeof dialog.showModal !== 'function') return;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;
  var closing = false, animations = [];
  var closeButton = dialog.querySelector('.drawer__close');
  var links = Array.from(dialog.querySelectorAll('.drawer__links a'));
  var fallback = document.querySelector('.menu-fallback');
  toggle.hidden = false;
  if (fallback) fallback.hidden = true;

  function announce() { document.dispatchEvent(new Event('portfolio:menu')); }
  function clearAnimations() {
    animations.forEach(function (animation) { animation.cancel(); });
    animations = [];
  }
  function animate(element, frames, options) {
    var animation = element.animate(frames, options);
    animations.push(animation);
    return animation;
  }
  function open() {
    if (dialog.open) return;
    clearAnimations();
    closing = false;
    dialog.classList.remove('is-closing');
    root.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    dialog.showModal();
    announce();
    if (reduced.matches) return;
    animate(dialog, [
      { transform: 'translateX(calc(100% + 140px))' },
      { transform: 'translateX(0)' }
    ], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
    links.forEach(function (link, index) {
      animate(link, [
        { opacity: 0, transform: 'translateX(48px)' },
        { opacity: 1, transform: 'translateX(0)' }
      ], { duration: 480, delay: 80 + index * 25, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    });
  }
  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    var current = getComputedStyle(dialog).transform;
    clearAnimations();
    if (reduced.matches) { dialog.close(); return; }
    dialog.classList.add('is-closing');
    animate(dialog, [
      { transform: current === 'none' ? 'translateX(0)' : current },
      { transform: 'translateX(calc(100% + 140px))' }
    ], { duration: 350, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' })
      .finished.then(function () { dialog.close(); }, function () {});
  }
  toggle.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  // Keep Tab inside the drawer even when the browser permits focus into its chrome.
  dialog.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var controls = Array.from(dialog.querySelectorAll('a[href], button:not([disabled])'))
      .filter(function (element) { return element.getClientRects().length > 0; });
    var first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  dialog.addEventListener('cancel', function (event) { event.preventDefault(); close(); });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
  dialog.addEventListener('close', function () {
    clearAnimations();
    closing = false;
    dialog.classList.remove('is-closing');
    root.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus({ preventScroll: true });
    announce();
  });
  reduced.addEventListener('change', function () {
    if (reduced.matches) animations.forEach(function (animation) { animation.finish(); });
  });
  // A return through browser history starts with the page visible, not an old modal.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted && dialog.open) dialog.close();
  });

  // Horizontal pointer following stays inside the row and never covers its arrow.
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var pending = null, frame = 0;
  function resetPreview() {
    cancelAnimationFrame(frame); frame = 0; pending = null;
    document.querySelectorAll('.index-row').forEach(function (row) {
      row.style.removeProperty('--peek-x');
    });
  }
  document.querySelectorAll('.index-row').forEach(function (row) {
    row.addEventListener('pointermove', function (event) {
      if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
      var rect = row.getBoundingClientRect();
      pending = { row: row, x: Math.max(54, Math.min(77, (event.clientX - rect.left) / rect.width * 100)) };
      if (!frame) frame = requestAnimationFrame(function () {
        frame = 0;
        if (pending) pending.row.style.setProperty('--peek-x', pending.x.toFixed(2) + '%');
        pending = null;
      });
    }, { passive: true });
    row.addEventListener('pointerleave', resetPreview);
    row.addEventListener('pointercancel', resetPreview);
  });
  window.addEventListener('blur', resetPreview);
  window.addEventListener('scroll', resetPreview, { passive: true });
  reduced.addEventListener('change', resetPreview);
  fine.addEventListener('change', resetPreview);
})();
