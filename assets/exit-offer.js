(function () {
  'use strict';
  var dialog = document.getElementById('exitOfferDialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  var started = Date.now();
  var shown = false;
  var consulting = false;
  var pauseUntil = 0;
  var lastScroll = window.scrollY;
  var deepestScroll = lastScroll;
  var upwardDistance = 0;
  var previousFocus = null;

  function showOffer() {
    if (shown || consulting || Date.now() - started < 8000 || Date.now() < pauseUntil) return;
    if (document.visibilityState === 'hidden' || document.querySelector('dialog[open]')) return;
    var active = document.activeElement;
    if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) return;
    previousFocus = active;
    shown = true;
    dialog.showModal();
  }

  document.addEventListener('mouseout', function (event) {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        event.relatedTarget === null && event.clientY <= 8) showOffer();
  });

  // Touch browsers do not expose a cancellable tab-close event. Use a return
  // scroll after meaningful reading instead; never add or intercept history.
  window.addEventListener('scroll', function () {
    var current = Math.max(0, window.scrollY);
    deepestScroll = Math.max(deepestScroll, current);
    upwardDistance = current < lastScroll ? upwardDistance + lastScroll - current : 0;
    lastScroll = current;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches &&
        deepestScroll >= 600 && upwardDistance >= 240) showOffer();
  }, { passive: true });

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    pauseUntil = Date.now() + 1500;
    var href = link.getAttribute('href');
    if (href === '#apply' || href.indexOf('tel:') === 0 || href.indexOf('pf.kakao.com/') !== -1) consulting = true;
  }, true);

  var form = document.getElementById('consultForm');
  if (form) form.addEventListener('submit', function () { consulting = true; });

  dialog.querySelectorAll('[data-exit-close]').forEach(function (button) {
    button.addEventListener('click', function () { dialog.close(); });
  });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', function () {
    if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
  });
  dialog.querySelectorAll('[data-exit-consult]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      consulting = true;
      previousFocus = null;
      dialog.close();
      window.location.hash = '#apply';
      var field = document.querySelector('#consultForm [name="student"]');
      if (field) field.focus({ preventScroll: true });
    });
  });
  dialog.querySelectorAll('[data-exit-chat]').forEach(function (link) {
    link.addEventListener('click', function () { consulting = true; dialog.close(); });
  });
})();
