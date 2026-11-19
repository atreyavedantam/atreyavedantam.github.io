/* =====================================================================
   Site search (Ctrl+K / Cmd+K, or "/"). Loads /search.json the first time
   it opens and searches every page, topic, paper, news item and entry.
   You never need to edit this file.
   ===================================================================== */
(function () {
  var dialog = document.getElementById('search');
  if (!dialog) return;
  var input = dialog.querySelector('.search__input');
  var list = dialog.querySelector('.search__results');
  var empty = dialog.querySelector('.search__empty');
  var indexUrl = dialog.getAttribute('data-index');
  var index = null, loading = null, results = [], active = 0, lastFocus = null;

  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) {
      loading = fetch(indexUrl).then(function (r) { return r.json(); }).then(function (d) {
        var ta = document.createElement('textarea');
        function decode(x) { ta.innerHTML = x || ''; return ta.value; }
        index = d.map(function (it) {
          it.title = decode(it.title);
          it.text = decode(it.text);
          it._title = (it.title || '').toLowerCase();
          it._text = (it.text || '').toLowerCase();
          return it;
        });
        return index;
      }).catch(function () { loading = null; index = null; return []; });
    }
    return loading;
  }

  function score(it, terms) {
    var s = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i], ti = it._title.indexOf(t), xi = it._text.indexOf(t);
      if (ti < 0 && xi < 0) return 0;
      if (ti >= 0) s += ti === 0 ? 12 : (/\W/.test(it._title.charAt(ti - 1)) ? 8 : 5);
      if (xi >= 0) s += 1;
    }
    if (it.kind === 'Page' || it.kind === 'Topic') s += 1;
    return s;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mark(s, terms) {
    var out = escapeHtml(s);
    terms.forEach(function (t) {
      if (t.length < 2) return;
      var re = new RegExp('(' + escapeHtml(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }
  function snippet(text, terms) {
    if (!text) return '';
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) at = low.indexOf(terms[i]);
    var start = Math.max(0, at - 50);
    var s = text.slice(start, start + 150);
    return (start > 0 ? '… ' : '') + s + (start + 150 < text.length ? ' …' : '');
  }

  function render(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!index) { list.innerHTML = ''; return; }
    if (!terms.length) {
      results = index.filter(function (it) { return it.kind === 'Page' || it.kind === 'Link'; });
    } else {
      results = index.map(function (it) { return { it: it, s: score(it, terms) }; })
        .filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 12)
        .map(function (r) { return r.it; });
    }
    active = 0;
    empty.hidden = results.length > 0 || !terms.length;
    list.innerHTML = results.map(function (it, i) {
      return '<li role="option" id="sr-' + i + '" aria-selected="' + (i === 0) + '" class="search__item' + (i === 0 ? ' is-active' : '') + '">' +
        '<a href="' + escapeHtml(it.url) + '">' +
        '<span class="search__kind">' + escapeHtml(it.kind) + '</span>' +
        '<span class="search__title">' + mark(it.title || '', terms) + '</span>' +
        (terms.length && it.text ? '<span class="search__snippet">' + mark(snippet(it.text, terms), terms) + '</span>' : '') +
        '</a></li>';
    }).join('');
    input.setAttribute('aria-activedescendant', results.length ? 'sr-0' : '');
  }

  function setActive(i) {
    var items = list.querySelectorAll('.search__item');
    if (!items.length) return;
    active = (i + items.length) % items.length;
    items.forEach(function (el, j) {
      el.classList.toggle('is-active', j === active);
      el.setAttribute('aria-selected', j === active ? 'true' : 'false');
    });
    items[active].scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', 'sr-' + active);
  }

  function open() {
    if (!dialog.hidden) return;
    lastFocus = document.activeElement;
    dialog.hidden = false;
    document.documentElement.classList.add('search-open');
    input.value = '';
    input.focus();
    load().then(function () { render(input.value); });
  }
  function close() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    document.documentElement.classList.remove('search-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function go(i) {
    var a = list.querySelectorAll('.search__item a')[i];
    if (!a) return;
    close();
    a.click();
  }

  input.addEventListener('input', function () { render(input.value); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); go(active); }
  });
  list.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  list.addEventListener('mousemove', function (e) {
    var li = e.target.closest('.search__item');
    if (!li) return;
    var idx = Array.prototype.indexOf.call(list.children, li);
    if (idx !== active) setActive(idx);
  });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
  document.querySelectorAll('[data-search-open]').forEach(function (b) {
    b.addEventListener('click', open);
  });

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'k') { e.preventDefault(); dialog.hidden ? open() : close(); return; }
    if (e.key === 'Escape') { close(); return; }
    var t = e.target, typing = t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));
    if (e.key === '/' && !typing && dialog.hidden) { e.preventDefault(); open(); }
  });

  /* Show the right shortcut on the button: ⌘K on Mac, Ctrl K elsewhere. */
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll('.search-btn__kbd').forEach(function (k) { k.textContent = isMac ? '⌘K' : 'Ctrl K'; });
})();
