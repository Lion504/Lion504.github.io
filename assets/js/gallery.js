/* Native full-size image viewer. Plain image links remain usable without JS. */
(function () {
  'use strict';
  var dialog = document.getElementById('media-viewer');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var image = document.getElementById('media-image');
  var caption = document.getElementById('media-caption');
  var zoom = document.getElementById('media-zoom');
  var opener;
  function reset() {
    dialog.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.setAttribute('data-i18n', 'media.zoom');
    var dict = window.I18N && window.I18N[document.documentElement.lang];
    zoom.textContent = dict ? dict['media.zoom'] : 'Original size';
  }
  document.querySelectorAll('.shot-preview').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var source = link.querySelector('img');
      if (!source) return;
      event.preventDefault();
      opener = link;
      image.src = source.src;
      image.alt = source.alt;
      image.width = source.naturalWidth;
      image.height = source.naturalHeight;
      caption.textContent = link.closest('figure').querySelector('figcaption').textContent;
      reset();
      dialog.showModal();
      document.documentElement.classList.add('viewer-open');
    });
  });
  document.getElementById('media-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('viewer-open');
    reset();
    if (opener) opener.focus({ preventScroll: true });
  });
  zoom.addEventListener('click', function () {
    var enlarged = dialog.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(enlarged));
    var key = enlarged ? 'media.fit' : 'media.zoom';
    zoom.setAttribute('data-i18n', key);
    zoom.textContent = window.I18N[document.documentElement.lang][key];
  });
})();
