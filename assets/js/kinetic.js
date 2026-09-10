/* Original process study: ideas gather, a structure forms, a signal moves outward. */
(function () {
  'use strict';
  var hero = document.querySelector('.kinetic');
  if (!hero) return;
  var canvas = hero.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var button = hero.querySelector('.kinetic__pause');
  var label = button.querySelector('.kinetic__pause-label');
  var icon = button.querySelector('.kinetic__pause-icon');
  var width = 0, height = 0, ratio = 1, frame = 0, last = 0, time = 0;
  var visible = false, paused = false, points = [], dust = [];
  var pointer = { x: -9999, y: -9999 };
  var ink, accent, atlas, glyphs = 'THINK/BUILD/SHIP:01<>[]{}+.';
  var phases = ['think', 'build', 'ship'];
  var steps = Array.from(hero.querySelectorAll('[data-process]'));
  var phase = -1, entrances = [];
  hero.classList.add('is-interactive');

  function phaseState() {
    var next = Math.floor(time / 4800) % 3;
    if (next !== phase) {
      phase = next; hero.dataset.phase = phases[phase];
      steps.forEach(function (step, i) { step.setAttribute('aria-pressed', String(i === phase)); });
    }
    hero.style.setProperty('--phase-progress', paused || reduced.matches ? '1' : String((time % 4800) / 4800));
  }
  steps.forEach(function (step, index) {
    step.disabled = false;
    step.addEventListener('click', function () {
      time = index * 4800 + 1000; paused = true; sync();
    });
  });
  var glyphWidth = 12, glyphHeight = 16, shades = 12;

  function makeAtlas() {
    var style = getComputedStyle(hero);
    ink = style.getPropertyValue('--ink-3').trim();
    accent = style.getPropertyValue('--signal').trim();
    atlas = document.createElement('canvas');
    atlas.width = Math.ceil(glyphs.length * glyphWidth * ratio);
    atlas.height = Math.ceil(shades * glyphHeight * ratio);
    var brush = atlas.getContext('2d');
    brush.scale(ratio, ratio);
    brush.font = '10px "JetBrains Mono", monospace';
    brush.textBaseline = 'top';
    for (var shade = 0; shade < shades; shade++) {
      brush.fillStyle = shade > 6 ? accent : ink;
      brush.globalAlpha = .12 + shade * .058;
      for (var i = 0; i < glyphs.length; i++) {
        brush.fillText(glyphs[i], i * glyphWidth, shade * glyphHeight);
      }
    }
  }

  function glyph(index, shade, x, y) {
    ctx.drawImage(atlas, index * glyphWidth * ratio, shade * glyphHeight * ratio,
      glyphWidth * ratio, glyphHeight * ratio, x, y, glyphWidth, glyphHeight);
  }

  function resize() {
    var nextWidth = hero.clientWidth, nextHeight = hero.clientHeight;
    var nextRatio = Math.min(devicePixelRatio || 1, 1.5);
    if (width === nextWidth && height === nextHeight && ratio === nextRatio) return;
    width = nextWidth; height = nextHeight; ratio = nextRatio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    makeAtlas();
    points = [];
    var count = width < 620 ? 650 : 1300;
    for (var i = 0; i < count; i++) {
      var a = i * Math.PI * (3 - Math.sqrt(5));
      var b = (i % 53) / 53 * Math.PI * 2;
      var ring = .67 + .27 * Math.cos(b);
      var cloud = { x: ring * Math.cos(a), y: .7 * ring * Math.sin(a), z: .27 * Math.sin(b) };
      var u = ((i * 37) % 101) / 100 * 1.5 - .75;
      var v = ((i * 61) % 103) / 102 * 1.5 - .75;
      var face = i % 6, sign = face % 2 ? 1 : -1;
      var cube = face < 2 ? { x: sign * .75, y: u, z: v } :
        face < 4 ? { x: u, y: sign * .75, z: v } : { x: u, y: v, z: sign * .75 };
      var lane = i % 7, along = (i % 97) / 96;
      var signal = { x: along * 2.3 - 1.15,
        y: Math.sin(along * Math.PI * 2 + lane * .22) * .33 + (lane - 3) * .1,
        z: Math.cos(along * Math.PI * 2 + lane * .4) * .35 };
      points.push({ forms: [cloud, cube, signal], char: i % glyphs.length });
    }
    dust = [];
    for (var j = 0; j < 80; j++) {
      dust.push({ x: ((j * 137.508) % 1000) / 1000,
        y: ((j * 317.13) % 1000) / 1000, char: j % glyphs.length });
    }
    draw();
  }

  function draw() {
    if (!width || !height || !atlas) return;
    ctx.clearRect(0, 0, width, height);
    phaseState();
    var mobile = width < 620;
    var radius = Math.min(width * (mobile ? .65 : .29), height * .33);
    var cx = width * (mobile ? .82 : .76), cy = height * (mobile ? .31 : .44);
    var angle = time * .000065;
    var cosine = Math.cos(angle), sine = Math.sin(angle);
    var tilt = -.24, ct = Math.cos(tilt), st = Math.sin(tilt);
    // A quiet ambient field gives the sphere somewhere to dissolve into.
    ctx.globalAlpha = .25;
    dust.forEach(function (p, index) {
      var x = p.x * width;
      var y = (p.y * height + time * .002 * (index % 2 ? 1 : -1) + height) % height;
      glyph(p.char, 0, x, y);
    });
    ctx.globalAlpha = mobile ? .34 : .42;
    var progress = paused || reduced.matches || time < 850 ? 1 : Math.min(1, (time % 4800) / 850);
    var blend = progress * progress * (3 - 2 * progress);
    points.forEach(function (point) {
      var from = point.forms[(phase + 2) % 3], to = point.forms[phase];
      var p = { x: from.x + (to.x - from.x) * blend,
        y: from.y + (to.y - from.y) * blend, z: from.z + (to.z - from.z) * blend, char: point.char };
      var x = p.x * cosine + p.z * sine;
      var z = p.z * cosine - p.x * sine;
      var y = p.y * ct - z * st;
      z = p.y * st + z * ct;
      if (z < -.15) return;
      // A travelling latitude wave makes the typography breathe, not flicker.
      var wave = Math.sin(p.y * 11 + time * .0006 + x * 3);
      var swell = 1 + .025 * wave;
      var px = cx + x * radius * swell;
      var py = cy + y * radius * swell;
      var dx = px - pointer.x, dy = py - pointer.y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      var influence = Math.max(0, 1 - distance / 165);
      if (distance > .01 && influence > 0) {
        px += dx / distance * influence * influence * 32;
        py += dy / distance * influence * influence * 32;
      }
      var light = Math.max(0, z * .63 + x * .18 + wave * .12);
      var shade = Math.min(shades - 1, Math.floor(light * 10 + influence * 5));
      glyph(p.char, shade, px, py);
    });
    ctx.globalAlpha = 1;
  }

  function tick(stamp) {
    frame = 0;
    if (!visible || paused || reduced.matches || document.hidden || document.documentElement.classList.contains('menu-open')) return;
    if (!last) last = stamp;
    var delta = stamp - last;
    if (delta >= 1000 / 30) {
      time += Math.min(delta, 80);
      last = stamp;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0; last = 0;
    var running = visible && !paused && !reduced.matches && !document.hidden && !document.documentElement.classList.contains('menu-open');
    hero.dataset.motion = running ? 'running' : 'paused';
    button.hidden = reduced.matches;
    button.setAttribute('aria-pressed', String(paused));
    var key = paused ? 'opening.resume' : 'opening.pause';
    label.setAttribute('data-i18n', key);
    var dictionary = window.I18N && window.I18N[document.documentElement.lang];
    label.textContent = dictionary && dictionary[key] || (paused ? 'Resume motion' : 'Pause motion');
    icon.textContent = paused ? '▷' : 'Ⅱ';
    entrances.forEach(function (animation) {
      if (animation.playState === 'finished') return;
      if (reduced.matches || paused) animation.finish();
      else if (running) animation.play();
      else animation.pause();
    });
    if (running) frame = requestAnimationFrame(tick);
    else draw();
  }

  button.addEventListener('click', function () { paused = !paused; sync(); });
  hero.addEventListener('pointermove', function (event) {
    if (!fine.matches || reduced.matches || paused || event.pointerType === 'touch') return;
    var bounds = hero.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
  }, { passive: true });
  function resetPointer() { pointer.x = pointer.y = -9999; }
  hero.addEventListener('pointerleave', resetPointer);
  hero.addEventListener('pointercancel', resetPointer);
  window.addEventListener('blur', resetPointer);
  window.addEventListener('scroll', resetPointer, { passive: true });
  document.addEventListener('visibilitychange', function () { resetPointer(); sync(); });
  document.addEventListener('portfolio:language', sync);
  document.addEventListener('portfolio:menu', sync);
  reduced.addEventListener('change', function () { resetPointer(); sync(); });
  fine.addEventListener('change', resetPointer);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting; sync();
    }, { threshold: 0 }).observe(hero);
  } else visible = true;
  resize();
  sync();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { makeAtlas(); draw(); });
  }
  if (!reduced.matches) {
    hero.querySelectorAll('.kinetic__word').forEach(function (word, index) {
      entrances.push(word.animate([
        { transform: 'translateY(112%) rotate(4deg)' },
        { transform: 'translateY(0) rotate(0)' }
      ], { duration: 1100, delay: index * 160, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
    });
    sync();
  }
})();
