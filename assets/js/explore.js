/* Enhance the linked workflow with keyboard-accessible tabs. Without JS,
   every stage remains visible and the links still work as section anchors. */
(function () {
  'use strict';
  var explorer = document.querySelector('.system-explorer');
  if (!explorer) return;
  var list = explorer.querySelector('.system-steps');
  var tabs = Array.from(list.querySelectorAll('a'));
  var panels = Array.from(explorer.querySelectorAll('.system-panel'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var activeAnimation;
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'JobAI');
  tabs.forEach(function (tab, index) {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
  });
  function select(index, focus, motion) {
    if (activeAnimation) activeAnimation.cancel();
    tabs.forEach(function (tab, i) {
      var selected = index === i;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) tabs[index].focus();
    if (motion && !reduced.matches && panels[index].animate) {
      activeAnimation = panels[index].animate([
        { opacity: .3, translate: '0 8px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 280, easing: 'ease-out' });
    }
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(index, false, true);
    });
    tab.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(next, true, true);
    });
  });
  function fromHash() {
    var index = panels.findIndex(function (panel) { return '#' + panel.id === location.hash; });
    if (index >= 0) select(index, false, false);
  }
  reduced.addEventListener('change', function () {
    if (reduced.matches && activeAnimation) activeAnimation.cancel();
  });
  window.addEventListener('hashchange', fromHash);
  select(0, false, false);
  fromHash();
})();

/* A real, deterministic baseline calculation on explicitly illustrative data. */
(function () {
  'use strict';
  var sandbox = document.querySelector('.baseline-sandbox');
  if (!sandbox) return;
  var values = [80, 92, 105, 90, 88, 99, 112, 96, 93, 104, 117, 101];
  var cutoff = document.getElementById('baseline-cutoff');
  var method = document.getElementById('baseline-method');
  var bars = document.getElementById('sandbox-bars');
  var ns = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs) {
    var node = document.createElementNS(ns, tag);
    Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    bars.appendChild(node);
    return node;
  }
  function update() {
    var n = Number(cutoff.value);
    // Index n is held out. Neither method sees any value at or beyond n.
    var forecast = method.value === 'seasonal' ? values[n - 4] : values[n - 1];
    var actual = values[n];
    document.getElementById('cutoff-value').value = n;
    document.getElementById('baseline-forecast').textContent = forecast;
    document.getElementById('baseline-actual').textContent = actual;
    document.getElementById('baseline-error').textContent = Math.abs(forecast - actual);
    bars.replaceChildren();
    values.forEach(function (value, i) {
      svg('rect', { x: 14 + i * 48, y: 128 - value * .8, width: 28, height: value * .8,
        rx: 2, class: i < n ? 'chart-training' : 'chart-heldout' });
      svg('text', { x: 28 + i * 48, y: 146, 'text-anchor': 'middle', class: 'chart-tick' }).textContent = i + 1;
    });
    svg('line', { x1: 7 + n * 48, x2: 7 + n * 48, y1: 8, y2: 130, class: 'chart-cutoff' });
    svg('rect', { x: 20 + n * 48, y: 128 - forecast * .8, width: 16, height: forecast * .8,
      rx: 2, class: 'chart-forecast' });
  }
  cutoff.addEventListener('input', update);
  method.addEventListener('change', update);
  update();
  sandbox.hidden = false;
})();
