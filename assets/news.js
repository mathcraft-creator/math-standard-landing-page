// Keeps event listings current between rebuilds: D-day labels, and ended events leave the
// main strip and the middle page list and move to "지난 소식" on /news/.
(function () {
  var now = Date.now();
  var DAY = 864e5;
  function kstDay(t) { return Math.floor((t + 9 * 3600e3) / DAY); }
  function ended(el) { return Date.parse(el.getAttribute('data-ends')) <= now; }
  function dday(el) {
    var label = el.querySelector('[data-dday]');
    var starts = Date.parse(el.getAttribute('data-starts'));
    if (!label || isNaN(starts)) return;
    var d = kstDay(starts) - kstDay(now);
    label.textContent = d > 0 ? 'D-' + d : d === 0 ? '오늘' : '';
  }

  var strip = document.querySelector('[data-news-strip]');
  if (strip) {
    strip.querySelectorAll('[data-ends]').forEach(function (el) { if (ended(el)) el.remove(); else dday(el); });
    if (!strip.querySelector('[data-ends]')) strip.remove();
  }

  document.querySelectorAll('.posts [data-ends]').forEach(function (el) { if (ended(el)) el.remove(); });

  var upcoming = document.querySelector('[data-upcoming]');
  var past = document.querySelector('[data-past]');
  if (upcoming && past) {
    upcoming.querySelectorAll('[data-ends]').forEach(function (el) {
      if (ended(el)) { past.insertBefore(el, past.firstChild); }
    });
    upcoming.querySelectorAll('[data-ends]').forEach(dday);
    if (!upcoming.children.length) document.querySelector('[data-empty]').hidden = false;
    if (past.children.length) document.querySelector('[data-past-wrap]').hidden = false;
  }

  var detail = document.querySelector('article.detail[data-ends]');
  if (detail) {
    if (ended(detail)) {
      detail.querySelector('[data-ended]').hidden = false;
      var apply = detail.querySelector('[data-apply]');
      if (apply) apply.hidden = true;
    } else dday(detail);
  }
})();
