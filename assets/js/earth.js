/* A local, progressively enhanced atlas. Natural Earth data; D3 projection only. */
(function () {
  'use strict';
  var earth = document.querySelector('.earth');
  if (!earth) return;
  earth.classList.add('is-enhanced');
  var canvas = earth.querySelector('canvas');
  var map = earth.querySelector('.earth__map');
  var pause = earth.querySelector('.earth__pause');
  var cards = Array.from(earth.querySelectorAll('[data-city]'));
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var cities = [
    { id: 'shanghai', point: [121.4737, 31.2304], country: '156' },
    { id: 'bangkok', point: [100.5018, 13.7563], country: '764' },
    { id: 'helsinki', point: [24.9384, 60.1699], country: '246' }
  ];
  cities.forEach(function (city) {
    city.pin = earth.querySelector('[data-pin="' + city.id + '"]');
    city.card = earth.querySelector('[data-city="' + city.id + '"]');
    city.pinWidth = 100;
  });
  var ctx, projection, path, land, borders, grid, colours;
  var lon = 75, lat = 35, size = 0, radius = 0, ratio = 1;
  var ready = false, loading = false, visible = false, mapVisible = false, paused = false;
  var frame = 0, last = 0, clock = 0, tween = null, drag = null, selected = null;
  var timeFormats = new Map();

  function active() {
    return visible && !document.hidden && !document.documentElement.classList.contains('menu-open');
  }
  function drifting() {
    return !paused && !selected && !drag && !reduced.matches &&
      !canvas.matches(':focus') && !cities.some(function (city) { return city.pin.matches(':focus'); });
  }
  function normalise(value) { return ((value + 180) % 360 + 360) % 360 - 180; }
  function coordinates(point) {
    earth.querySelector('[data-earth-lat]').textContent = Math.abs(point[1]).toFixed(3) + '° ' + (point[1] < 0 ? 'S' : 'N');
    earth.querySelector('[data-earth-lon]').textContent = Math.abs(point[0]).toFixed(3) + '° ' + (point[0] < 0 ? 'W' : 'E');
  }
  function syncPins() {
    cities.forEach(function (city) {
      var show = window.d3.geoDistance([lon, lat], city.point) < Math.PI / 2 - .025;
      // A focused pin stays in the tab order until focus moves elsewhere.
      if (!show && document.activeElement === city.pin) canvas.focus({ preventScroll: true });
      city.pin.hidden = !show;
      city.pin.setAttribute('aria-expanded', String(selected === city));
      if (!show) return;
      var point = projection(city.point);
      var left = point[0] + city.pinWidth - 19.5 > size - 4;
      city.pin.classList.toggle('is-left', left);
      // 16px padding + half of the 7px marker aligns the dot to its coordinates.
      city.pin.style.left = (point[0] - (left ? city.pinWidth - 19.5 : 19.5)) + 'px';
      city.pin.style.top = (point[1] - 22) + 'px';
    });
  }
  function paint() {
    if (!ready || !size) return;
    projection.rotate([-lon, -lat]);
    ctx.clearRect(0, 0, size, size);
    var c = size / 2;
    var glow = ctx.createRadialGradient(c, c, radius * .96, c, c, radius * 1.1);
    glow.addColorStop(0, colours.atmosphere); glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, size, size);
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = colours.ocean; ctx.fill();
    ctx.beginPath(); path(land); ctx.fillStyle = colours.land; ctx.fill();
    cities.forEach(function (city) {
      if (!city.feature) return;
      ctx.beginPath(); path(city.feature);
      ctx.fillStyle = selected === city ? colours.selected : colours.country; ctx.fill();
    });
    ctx.beginPath(); path(grid); ctx.strokeStyle = colours.grid; ctx.lineWidth = .6; ctx.stroke();
    ctx.beginPath(); path(borders); ctx.strokeStyle = colours.border; ctx.lineWidth = .55; ctx.stroke();
    ctx.save(); ctx.beginPath(); path({ type: 'Sphere' }); ctx.clip();
    var shade = ctx.createRadialGradient(c - radius * .35, c - radius * .4, radius * .3, c, c, radius * 1.07);
    shade.addColorStop(0, 'transparent'); shade.addColorStop(.7, 'transparent'); shade.addColorStop(1, colours.shade);
    ctx.fillStyle = shade; ctx.fillRect(0, 0, size, size); ctx.restore();
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.strokeStyle = colours.grid; ctx.lineWidth = 1; ctx.stroke();
    syncPins();
    earth.dataset.longitude = lon.toFixed(3); earth.dataset.latitude = lat.toFixed(3);
    if (!drag) coordinates([lon, lat]);
  }
  function resize() {
    if (!ready) return;
    size = map.clientWidth; radius = size * .445;
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(size * ratio); canvas.height = Math.round(size * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    projection.translate([size / 2, size / 2]).scale(radius);
    cities.forEach(function (city) {
      city.pin.hidden = false;
      city.pinWidth = city.pin.offsetWidth;
    });
    paint();
  }
  function clockTick() {
    var now = new Date();
    earth.querySelectorAll('[data-world-time]').forEach(function (element) {
      var zone = element.dataset.worldTime;
      if (!timeFormats.has(zone)) timeFormats.set(zone, {
        time: new Intl.DateTimeFormat(document.documentElement.lang === 'fi' ? 'fi' : 'en-GB', {
          timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
        }),
        offset: new Intl.DateTimeFormat('en-GB', { timeZone: zone, timeZoneName: 'shortOffset' })
      });
      var format = timeFormats.get(zone);
      element.textContent = format.time.format(now); element.dateTime = now.toISOString();
      var offset = format.offset.formatToParts(now).find(function (part) { return part.type === 'timeZoneName'; });
      earth.querySelectorAll('[data-world-zone="' + zone + '"]').forEach(function (label) {
        label.textContent = offset ? offset.value.replace('GMT', 'UTC') : zone;
      });
    });
  }
  function run(stamp) {
    frame = 0;
    if (!active() || !mapVisible || !ready) return;
    if (!last) last = stamp;
    var delta = stamp - last;
    if (delta >= 1000 / 30) {
      delta = Math.min(delta, 80); last = stamp;
      if (tween) {
        tween.elapsed += delta;
        var progress = Math.min(1, tween.elapsed / 900);
        var eased = 1 - Math.pow(1 - progress, 3);
        lon = normalise(tween.lon + tween.dx * eased);
        lat = tween.lat + tween.dy * eased;
        if (progress === 1) tween = null;
      } else if (drifting()) {
        lon = normalise(lon + delta * .0006);
      }
      paint();
    }
    if (tween || drifting()) frame = requestAnimationFrame(run);
    else sync();
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    clearInterval(clock); clock = 0;
    pause.hidden = reduced.matches;
    pause.setAttribute('aria-pressed', String(paused));
    var key = paused ? 'earth.resume' : 'earth.pause';
    pause.dataset.i18n = key;
    var dictionary = window.I18N && window.I18N[document.documentElement.lang];
    pause.textContent = dictionary && dictionary[key] || (paused ? 'Resume rotation' : 'Pause rotation');
    earth.querySelector('.earth__pins').setAttribute('aria-label', dictionary && dictionary['earth.locations'] || 'Locations');
    earth.querySelector('.earth__fallback').alt = dictionary && dictionary['earth.fallbacklabel'] || 'World globe showing Shanghai, Bangkok and Helsinki';
    var running = ready && mapVisible && active() && (tween || drifting());
    earth.dataset.motion = running ? 'running' : 'paused';
    if (running) frame = requestAnimationFrame(run);
    if (active()) { clockTick(); clock = setInterval(clockTick, 1000); }
  }
  function moveTo(point) {
    tween = null;
    if (reduced.matches || !active() || !mapVisible) { lon = point[0]; lat = point[1]; paint(); }
    else tween = { lon: lon, lat: lat, dx: normalise(point[0] - lon), dy: point[1] - lat, elapsed: 0 };
    sync();
  }
  function closeCards() {
    cards.forEach(function (card) { card.open = false; });
    selected = null;
  }
  function select(city) {
    if (selected === city) return;
    cards.forEach(function (card) { if (card !== city.card) card.open = false; });
    selected = city; earth.dataset.city = city.id;
    if (ready) { paint(); moveTo(city.point); }
    else sync();
    requestAnimationFrame(function () {
      if (city.card.open) city.card.querySelector('.earth__place-card').scrollIntoView({ block: 'nearest', behavior: reduced.matches ? 'instant' : 'smooth' });
    });
  }
  cities.forEach(function (city) {
    var close = city.card.querySelector('.earth__place-close');
    close.hidden = false;
    city.card.addEventListener('toggle', function () {
      if (city.card.open) select(city);
      else if (selected === city) {
        selected = null; delete earth.dataset.city; tween = null; paint(); sync();
      }
    });
    city.pin.addEventListener('click', function () {
      city.card.open = true; select(city);
      close.focus({ preventScroll: true });
    });
    close.addEventListener('click', function () {
      city.card.open = false;
      city.card.querySelector('summary').focus({ preventScroll: true });
    });
  });
  earth.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && selected) {
      var summary = selected.card.querySelector('summary');
      closeCards(); delete earth.dataset.city; tween = null; paint(); sync();
      summary.focus({ preventScroll: true });
    }
  });
  earth.addEventListener('focusin', sync);
  earth.addEventListener('focusout', function () { requestAnimationFrame(sync); });
  pause.addEventListener('click', function () { paused = !paused; tween = null; sync(); });
  function turn(dx, dy) {
    closeCards(); delete earth.dataset.city; tween = null; paused = true;
    lon = normalise(lon + dx); lat = Math.max(-80, Math.min(80, lat + dy));
    paint(); sync();
  }
  earth.querySelectorAll('[data-earth-turn]').forEach(function (button) {
    button.addEventListener('click', function () { turn(Number(button.dataset.earthTurn) * 15, 0); });
  });
  earth.querySelector('.earth__reset').addEventListener('click', function () {
    closeCards(); delete earth.dataset.city; paused = false; moveTo([75, 35]);
  });
  canvas.addEventListener('keydown', function (event) {
    var direction = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] }[event.key];
    if (!direction) return;
    event.preventDefault(); turn(direction[0], direction[1]);
  });
  canvas.addEventListener('pointerdown', function (event) {
    if (!ready || event.button !== 0 || drag) return;
    var bounds = canvas.getBoundingClientRect();
    if (Math.hypot(event.clientX - bounds.left - size / 2, event.clientY - bounds.top - size / 2) > radius) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, lon: lon, lat: lat, moved: false };
    tween = null;
    if (event.pointerType !== 'touch') canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(event.pointerId);
    earth.classList.add('is-dragging'); sync();
  });
  canvas.addEventListener('pointermove', function (event) {
    if (!ready) return;
    if (drag && event.pointerId === drag.id) {
      var dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      // Vertical touch gestures remain native page scrolling (touch-action: pan-y).
      if (!drag.moved && event.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) return;
      if (!drag.moved) { closeCards(); delete earth.dataset.city; paused = true; drag.moved = true; }
      lon = normalise(drag.lon - dx * 110 / size);
      lat = Math.max(-80, Math.min(80, drag.lat + dy * 110 / size));
      coordinates([lon, lat]);
      if (!frame) frame = requestAnimationFrame(function () { frame = 0; paint(); });
    } else if (event.pointerType !== 'touch') {
      var bounds = canvas.getBoundingClientRect();
      var point = [event.clientX - bounds.left, event.clientY - bounds.top];
      if (Math.hypot(point[0] - size / 2, point[1] - size / 2) <= radius) coordinates(projection.invert(point));
    }
  }, { passive: true });
  function endDrag() {
    if (!drag) return;
    var id = drag.id; drag = null;
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    earth.classList.remove('is-dragging'); paint(); sync();
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);
  canvas.addEventListener('pointerleave', function () { if (!drag) coordinates([lon, lat]); });
  window.addEventListener('blur', endDrag);
  document.addEventListener('portfolio:language', function () { timeFormats.clear(); resize(); sync(); });
  document.addEventListener('portfolio:menu', function () { endDrag(); sync(); });
  document.addEventListener('visibilitychange', function () { endDrag(); sync(); });
  reduced.addEventListener('change', function () {
    if (tween) { lon = normalise(tween.lon + tween.dx); lat = tween.lat + tween.dy; tween = null; }
    paint(); sync();
  });

  async function load() {
    if (ready || loading) return;
    loading = true; earth.dataset.state = 'loading';
    var abort = new AbortController();
    var timeout = setTimeout(function () { abort.abort(); }, 12000);
    try {
      if (!window.d3 || !window.topojson) throw new Error('Map helpers unavailable');
      ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      var response = await fetch('assets/data/world-110m.json', { signal: abort.signal });
      if (!response.ok) throw new Error('Map data unavailable');
      var topology = await response.json();
      land = window.topojson.feature(topology, topology.objects.countries);
      borders = window.topojson.mesh(topology, topology.objects.countries);
      cities.forEach(function (city) { city.feature = land.features.find(function (feature) { return feature.id === city.country; }); });
      projection = window.d3.geoOrthographic().precision(.3);
      path = window.d3.geoPath(projection, ctx); grid = window.d3.geoGraticule10();
      var style = getComputedStyle(earth); colours = {};
      ['ocean', 'land', 'country', 'border', 'grid', 'selected', 'atmosphere', 'shade'].forEach(function (key) {
        colours[key] = style.getPropertyValue('--earth-' + key).trim();
      });
      ready = true; resize(); canvas.tabIndex = 0;
      canvas.hidden = false;
      earth.querySelector('#earth-map-label').hidden = false;
      var instructions = earth.querySelector('#earth-instructions');
      instructions.dataset.i18n = 'earth.instructions';
      var dictionary = window.I18N && window.I18N[document.documentElement.lang];
      instructions.textContent = dictionary && dictionary['earth.instructions'] || 'Drag to explore. Select a city.';
      earth.classList.add('is-ready'); earth.dataset.state = 'ready';
      earth.querySelector('.earth__fallback').setAttribute('aria-hidden', 'true');
      earth.querySelector('.earth__controls').hidden = false;
      if (selected) moveTo(selected.point);
      sync();
    } catch (error) {
      earth.dataset.state = 'fallback';
      earth.querySelector('.earth__error').hidden = false;
      canvas.hidden = true;
    } finally { clearTimeout(timeout); }
  }
  clockTick();
  earth.querySelectorAll('.earth__clock,.earth__place-time').forEach(function (element) { element.hidden = false; });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(map);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    var preload = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { load(); preload.disconnect(); }
    }, { rootMargin: '400px' });
    preload.observe(earth);
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (!visible) endDrag(); sync(); }).observe(earth);
    new IntersectionObserver(function (entries) { mapVisible = entries[0].isIntersecting; sync(); }).observe(map);
  } else { visible = true; mapVisible = true; load(); sync(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
})();
