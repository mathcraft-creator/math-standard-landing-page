// /blog/: topic filter, and a refresh from /api/blog so posts published after the last
// build appear without a redeploy. The built list stays if the request fails.
(function () {
  var list = document.querySelector('[data-posts]');
  var bar = document.querySelector('[data-filters]');
  if (!list || !bar) return;
  var current = '';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function apply() {
    list.querySelectorAll('[data-cat]').forEach(function (li) { li.hidden = !!current && li.getAttribute('data-cat') !== current; });
    bar.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === current)); });
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    current = b.getAttribute('data-cat');
    apply();
  });

  function card(p) {
    var img = p.thumb ? '<img src="' + esc(p.thumb) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<span class="noimg" aria-hidden="true">수학의 기준</span>';
    return '<li class="pcard" data-cat="' + esc(p.category) + '"><a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + img +
      '<span class="pbody"><span class="chip">' + esc(p.category) + '</span><b>' + esc(p.title) + '</b><span class="psum">' + esc(p.summary) +
      '</span><time datetime="' + esc(p.date) + '">' + esc(p.date.replace(/-/g, '. ')) + '.</time></span></a></li>';
  }

  if (location.protocol === 'file:' || !window.fetch) return;
  fetch('/api/blog').then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
    var posts = data && data.posts;
    if (!posts || !posts.length) return;
    var safe = posts.filter(function (p) { return /^https:\/\/blog\.naver\.com\//.test(p.url) && (!p.thumb || /^https:\/\/[a-z0-9-]+\.pstatic\.net\//.test(p.thumb)); });
    if (!safe.length) return;
    list.innerHTML = safe.map(card).join('');
    var known = {};
    bar.querySelectorAll('button').forEach(function (b) { known[b.getAttribute('data-cat')] = 1; });
    safe.forEach(function (p) {
      if (known[p.category]) return;
      known[p.category] = 1;
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('data-cat', p.category); b.setAttribute('aria-pressed', 'false'); b.textContent = p.category;
      bar.appendChild(b);
    });
    apply();
  }).catch(function () {});
})();
