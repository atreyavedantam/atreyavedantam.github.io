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

  function svg(d) { return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; }
  var ICONS = {
    Page: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
    Topic: svg('<path d="M4 6h16M4 12h10M4 18h6"/>'),
    Publication: svg('<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 8h6"/>'),
    News: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
    Honors: svg('<circle cx="12" cy="9" r="5"/><path d="m8.5 13-1.5 8 5-3 5 3-1.5-8"/>'),
    Teaching: svg('<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>'),
    Experience: svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>'),
    Blog: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    Link: svg('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>')
  };
  var LABELS = { Page: 'Pages', Topic: 'Research topics', Publication: 'Publications', News: 'News', Honors: 'Honors', Teaching: 'Teaching', Experience: 'Experience', Blog: 'Blog posts', Link: 'Links' };

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
    /* Group by kind, keeping the best-scoring group first. */
    var order = [], groups = {};
    results.forEach(function (it) {
      if (!groups[it.kind]) { groups[it.kind] = []; order.push(it.kind); }
      groups[it.kind].push(it);
    });
    results = [];
    var html = '';
    order.forEach(function (kind) {
      html += '<li class="search__group" role="presentation">' + escapeHtml(LABELS[kind] || kind) + '</li>';
      groups[kind].forEach(function (it) {
        var i = results.length;
        results.push(it);
        html += '<li role="option" id="sr-' + i + '" aria-selected="' + (i === 0) + '" class="search__item' + (i === 0 ? ' is-active' : '') + '">' +
          '<a href="' + escapeHtml(it.url) + '">' +
          '<span class="search__icon" aria-hidden="true">' + (ICONS[it.kind] || ICONS.Page) + '</span>' +
          '<span class="search__body"><span class="search__title">' + mark(it.title || '', terms) + '</span>' +
          (terms.length && it.text ? '<span class="search__snippet">' + mark(snippet(it.text, terms), terms) + '</span>' : '') +
          '</span><span class="search__enter" aria-hidden="true">↵</span></a></li>';
      });
    });
    list.innerHTML = html;
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
    void dialog.offsetWidth; dialog.classList.add('is-open');
    document.documentElement.classList.add('search-open');
    input.value = '';
    input.focus();
    load().then(function () { render(input.value); });
  }
  function close() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    dialog.classList.remove('is-open');
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
    var idx = Array.prototype.indexOf.call(list.querySelectorAll('.search__item'), li);
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
