/* LaLa-World deck player — no dependencies, works from file://
   Click / → / Space: next build, ← : back, Shift+→/←: whole slides, p: presenter window (the script lives there),
   l: slide list, o: overview, f: fullscreen, b: black, r: restart video, t: reset timer, ?: help.  URL: #slide-id/click
   Moving the mouse to the bottom edge shows the navigation bar (previous / next slide, position, slides left, list). */
(function () {
  'use strict';
  var Q = new URLSearchParams(location.search);
  var PRESENTER = Q.has('presenter');
  var PRINT = Q.has('print');
  var stage = document.getElementById('stage');
  var viewport = document.getElementById('viewport');
  var slides = Array.prototype.slice.call(stage.querySelectorAll(':scope > .slide'));
  var $ = function (id) { return document.getElementById(id); };

  /* ------------------------------------------------------------ slide metadata */
  var plan = 0;
  var meta = slides.map(function (el, i) {
    var max = 0;
    el.querySelectorAll('[data-in],[data-out],[data-pulse]').forEach(function (e) {
      ['in', 'out', 'pulse'].forEach(function (a) { var v = e.dataset[a]; if (v != null) max = Math.max(max, +v); });
    });
    var n = el.querySelector('aside.notes');
    var ext = window.DECK_NOTES && window.DECK_NOTES[el.id];   // notes.js overrides the built-in script
    var m = { el: el, i: i, id: el.id, steps: max, dur: +el.dataset.dur || 0, label: el.dataset.label || el.id, sec: el.dataset.sec || '',
              notes: ext != null ? String(ext).replace(/^\n+|\n+$/g, '') : (n ? n.textContent : ''), start: plan };
    plan += m.dur;
    var pn = el.querySelector('.pnum');
    if (pn) pn.textContent = (el.id === 'title' || el.id === 'thanks') ? '' : String(i + 1).padStart(2, '0');
    return m;
  });
  var TOTAL_PLAN = plan;

  /* ------------------------------------------------------------ build state */
  function applyStep(el, s, animate) {
    for (var k = 1; k <= 9; k++) el.classList.toggle('at' + k, s >= k);
    el.dataset.step = s;
    el.querySelectorAll('[data-in],[data-out]').forEach(function (e) {
      var i = e.dataset.in != null ? +e.dataset.in : -Infinity;
      var o = e.dataset.out != null ? +e.dataset.out : Infinity;
      e.classList.toggle('on', s >= i && s < o);
    });
    el.querySelectorAll('[data-pulse]').forEach(function (e) {
      var p = +e.dataset.pulse;
      if (s === p && animate) { e.classList.remove('pulsing'); void e.offsetWidth; e.classList.add('pulsing'); }
      else if (s !== p) e.classList.remove('pulsing');
    });
  }
  function setInstant(el, fn) {
    el.classList.add('instant'); fn(); void el.offsetWidth;
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove('instant'); }); });
  }

  /* ------------------------------------------------------------ videos */
  function videos(el) { return el.querySelectorAll('video'); }
  document.querySelectorAll('video[data-rate]').forEach(function (v) {
    var r = parseFloat(v.dataset.rate) || 1;
    v.addEventListener('loadedmetadata', function () { v.defaultPlaybackRate = r; v.playbackRate = r; });
  });
  function syncVideos(m, restart) {
    videos(m.el).forEach(function (v) {
      var vis = m.el.classList.contains('current') && (v.dataset.in == null || v.classList.contains('on'));
      if (vis) {
        var rate = parseFloat(v.dataset.rate) || 1;
        v.defaultPlaybackRate = rate; v.playbackRate = rate;
        if (restart) { try { v.currentTime = 0; } catch (e) {} }
        if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
      } else if (!v.paused) v.pause();
    });
  }

  /* ------------------------------------------------------------ navigation (audience window) */
  var cur = null;
  function show(i, s, how) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var m = meta[i];
    s = Math.max(0, Math.min(m.steps, s));
    var entering = !cur || cur.i !== i;
    if (entering) {
      if (cur) { var old = meta[cur.i]; old.el.classList.remove('current'); videos(old.el).forEach(function (v) { v.pause(); }); }
      m.el.classList.add('current');
      if (how === 'next' && s === 0) {
        setInstant(m.el, function () { applyStep(m.el, -1, false); });
        m.el.classList.remove('instant');
        applyStep(m.el, 0, true);
      } else {
        setInstant(m.el, function () { applyStep(m.el, s, false); });
      }
      syncVideos(m, true);
    } else if (how === 'jump') {
      setInstant(m.el, function () { applyStep(m.el, s, false); });
      syncVideos(m, false);
    } else {
      applyStep(m.el, s, true);
      syncVideos(m, false);
    }
    cur = { i: i, s: s };
    try { history.replaceState(null, '', '#' + m.id + (s ? '/' + s : '')); } catch (e) {}
    updateNav();
    sendState();
  }
  function next() {
    if (!timer.t0) timer.t0 = Date.now();
    var m = meta[cur.i];
    if (cur.s < m.steps) show(cur.i, cur.s + 1, 'step');
    else if (cur.i < slides.length - 1) show(cur.i + 1, 0, 'next');
  }
  function prev() {
    if (cur.s > 0) show(cur.i, cur.s - 1, 'step');
    else if (cur.i > 0) show(cur.i - 1, meta[cur.i - 1].steps, 'prev');
  }
  function nextSlide() { if (!timer.t0) timer.t0 = Date.now(); if (cur.i < slides.length - 1) show(cur.i + 1, 0, 'next'); }
  function prevSlide() { if (cur.i > 0) show(cur.i - 1, 0, 'jump'); }
  function parseHash() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!h) return { i: 0, s: 0 };
    var parts = h.split('/');
    var i = meta.findIndex(function (m) { return m.id === parts[0]; });
    if (i < 0) { var n = parseInt(parts[0], 10); i = n >= 1 && n <= slides.length ? n - 1 : 0; }
    return { i: i, s: parseInt(parts[1] || '0', 10) || 0 };
  }

  /* ------------------------------------------------------------ scaling */
  function fit() {
    var W = window.innerWidth, Hh = window.innerHeight, k = Math.min(W / 1920, Hh / 1080);
    stage.style.transform = 'translate(' + (W - 1920 * k) / 2 + 'px,' + (Hh - 1080 * k) / 2 + 'px) scale(' + k + ')';
  }

  /* ------------------------------------------------------------ script (presenter window only) */
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function notesHTML(m, s) {
    var segs = m.notes.split('[click]');
    return segs.map(function (seg, k) {
      var lines = seg.replace(/^\s+|\s+$/g, '').split('\n').map(function (l) {
        return /^※/.test(l) ? '<span class="note-cue">' + esc(l) + '</span>' : esc(l);
      });
      var cls = k === s ? 'now' : (k === s + 1 ? 'next' : '');
      return '<p class="note-seg ' + cls + '">' + (k > 0 ? '<span class="ck">CLICK ' + k + '</span>' : '') + lines.join('<br>') + '</p>';
    }).join('');
  }
  function fmtTime(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  function leftText(i) { var n = slides.length - 1 - i; return n === 0 ? 'last slide' : n + (n === 1 ? ' slide left' : ' slides left'); }

  /* ------------------------------------------------------------ slide list (grouped by section) */
  function buildList(box, onPick) {
    var html = '<div class="sl-head"><b>Slides</b><span>' + slides.length + ' slides · ' + fmtTime(TOTAL_PLAN) + '</span></div><div class="sl-body">';
    var last = null;
    meta.forEach(function (m, i) {
      var grp = m.sec || (i === 0 ? 'Opening' : 'Closing');
      if (grp !== last) { html += (last !== null ? '</ol>' : '') + '<div class="sl-sec">' + esc(grp) + '</div><ol>'; last = grp; }
      html += '<li data-i="' + i + '"><span class="sl-n">' + String(i + 1).padStart(2, '0') + '</span><span class="sl-t">' + esc(m.label) +
        '</span>' + (m.steps ? '<span class="sl-c">' + m.steps + '</span>' : '') + '</li>';
    });
    box.innerHTML = html + '</ol></div>';
    box.querySelectorAll('li').forEach(function (li) {
      li.addEventListener('click', function (ev) { ev.stopPropagation(); onPick(+li.dataset.i); });
    });
  }
  function markList(box, i) {
    if (!box) return;
    box.querySelectorAll('li').forEach(function (li) { li.classList.toggle('cur', +li.dataset.i === i); });
  }

  /* ------------------------------------------------------------ mini renders (presenter / overview) */
  function miniClone(i, s) {
    var src = slides[i];
    var c = src.cloneNode(true);
    c.removeAttribute('id');
    c.classList.add('instant'); c.classList.remove('current');
    c.style.display = 'block';
    c.querySelectorAll('video').forEach(function (v) {
      var img = document.createElement('img');
      img.className = v.className; img.setAttribute('style', v.getAttribute('style') || ''); img.src = v.getAttribute('poster') || '';
      ['data-in', 'data-out'].forEach(function (a) { if (v.hasAttribute(a)) img.setAttribute(a, v.getAttribute(a)); });
      v.parentNode.replaceChild(img, v);
    });
    var n = c.querySelector('aside.notes'); if (n) n.remove();
    applyStep(c, s, false);
    var wrap = document.createElement('div');
    wrap.className = 'mini';
    wrap.appendChild(c);
    return wrap;
  }
  function putMini(frame, i, s) {
    frame.innerHTML = '';
    if (i == null) return;
    var w = miniClone(i, s);
    frame.appendChild(w);
    var k = frame.clientWidth / 1920;
    w.style.transform = 'scale(' + k + ')';
  }

  /* ------------------------------------------------------------ overview */
  var overviewBuilt = false;
  function toggleOverview(force) {
    var ov = $('overview');
    var on = force != null ? force : !ov.classList.contains('show');
    ov.classList.toggle('show', on);
    if (!on) return;
    toggleList(false);
    var grid = ov.querySelector('.grid');
    if (!overviewBuilt) {
      meta.forEach(function (m, i) {
        var cell = document.createElement('div');
        var th = document.createElement('div'); th.className = 'thumb'; th.dataset.i = i;
        var cap = document.createElement('div'); cap.className = 'cap'; cap.textContent = (i + 1) + '. ' + m.label + (m.steps ? '  (' + m.steps + ' clicks)' : '');
        cell.appendChild(th); cell.appendChild(cap); grid.appendChild(cell);
        th.addEventListener('click', function (ev) { ev.stopPropagation(); toggleOverview(false); show(i, 0, 'next'); });
      });
      overviewBuilt = true;
      requestAnimationFrame(function () {
        grid.querySelectorAll('.thumb').forEach(function (th) { putMini(th, +th.dataset.i, meta[+th.dataset.i].steps); });
      });
    }
    grid.querySelectorAll('.thumb').forEach(function (th) { th.classList.toggle('cur', +th.dataset.i === cur.i); });
  }

  /* ------------------------------------------------------------ bottom navigation bar + slide list (audience window) */
  var nav = null, navList = null, navTimer = null;
  function buildNav() {
    nav = document.createElement('div');
    nav.id = 'navbar'; nav.className = 'hud';
    nav.innerHTML =
      '<button class="nb-btn" data-a="prevSlide" title="Previous slide (Shift+←)"><svg viewBox="0 0 20 20"><path d="M12.5 4 L6.5 10 L12.5 16"/></svg></button>' +
      '<div class="nb-pos"><b class="nb-cur"></b><span class="nb-tot"></span></div>' +
      '<div class="nb-steps" title="clicks on this slide"></div>' +
      '<div class="nb-left"></div>' +
      '<button class="nb-btn" data-a="nextSlide" title="Next slide (Shift+→)"><svg viewBox="0 0 20 20"><path d="M7.5 4 L13.5 10 L7.5 16"/></svg></button>' +
      '<i class="nb-div"></i>' +
      '<button class="nb-btn nb-list" data-a="list" title="Slide list (l)"><svg viewBox="0 0 20 20"><path d="M4 5.5 H16 M4 10 H16 M4 14.5 H16"/></svg><span>Slides</span></button>';
    document.body.appendChild(nav);
    navList = document.createElement('div');
    navList.id = 'slidelist'; navList.className = 'hud';
    document.body.appendChild(navList);
    buildList(navList, function (i) { toggleList(false); show(i, 0, 'next'); });
    nav.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var a = b.dataset.a;
        if (a === 'prevSlide') prevSlide(); else if (a === 'nextSlide') nextSlide(); else if (a === 'list') toggleList();
        b.blur();
      });
    });
    nav.addEventListener('mouseenter', function () { revealNav(true); });
    nav.addEventListener('mouseleave', function () { revealNav(false); });
    navList.addEventListener('click', function (ev) { ev.stopPropagation(); });
  }
  function revealNav(stay) {
    if (!nav) return;
    nav.classList.add('show');
    clearTimeout(navTimer);
    if (!stay) navTimer = setTimeout(function () { if (!navList.classList.contains('show') && !nav.matches(':hover')) nav.classList.remove('show'); }, 1800);
  }
  function toggleList(force) {
    if (!navList) return;
    var on = force != null ? force : !navList.classList.contains('show');
    navList.classList.toggle('show', on);
    nav.classList.toggle('listing', on);
    if (on) {
      revealNav(true);
      markList(navList, cur.i);
      var c = navList.querySelector('li.cur'); if (c) c.scrollIntoView({ block: 'center' });
    } else revealNav(false);
  }
  function updateNav() {
    if (!nav || !cur) return;
    var m = meta[cur.i];
    nav.querySelector('.nb-cur').textContent = cur.i + 1;
    nav.querySelector('.nb-tot').textContent = '/ ' + slides.length;
    nav.querySelector('.nb-left').textContent = leftText(cur.i);
    var dots = '';
    for (var k = 1; k <= m.steps; k++) dots += '<i class="' + (k <= cur.s ? 'on' : '') + '"></i>';
    nav.querySelector('.nb-steps').innerHTML = dots;
    nav.querySelector('.nb-steps').style.display = m.steps ? '' : 'none';
    markList(navList, cur.i);
  }

  /* ------------------------------------------------------------ timer + presenter link */
  var timer = { t0: 0 };
  var presenterWin = null;
  function sendState() {
    if (presenterWin && !presenterWin.closed && cur) presenterWin.postMessage({ type: 'state', i: cur.i, s: cur.s, t0: timer.t0 }, '*');
  }
  function openPresenter() {
    var url = location.href.split('#')[0].split('?')[0] + '?presenter' + location.hash;
    presenterWin = window.open(url, 'lala-presenter', 'width=1440,height=900');
    setTimeout(sendState, 600);
  }
  function handleCmd(d) {
    if (d.action === 'next') next();
    else if (d.action === 'prev') prev();
    else if (d.action === 'nextSlide') nextSlide();
    else if (d.action === 'prevSlide') prevSlide();
    else if (d.action === 'go') show(d.i, d.s || 0, d.how || 'jump');
    else if (d.action === 'timer') { timer.t0 = Date.now(); sendState(); }
    else if (d.action === 'black') $('black').classList.toggle('show');
    else if (d.action === 'restart') syncVideos(meta[cur.i], true);
    else if (d.action === 'hello') sendState();
  }

  /* ------------------------------------------------------------ keyboard */
  var numBuf = '';
  function onKey(e, send) {
    var k = e.key;
    var act = null;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'ArrowDown' || (k === 'Enter' && !numBuf)) act = e.shiftKey ? 'nextSlide' : 'next';
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace' || k === 'ArrowUp') act = e.shiftKey ? 'prevSlide' : 'prev';
    else if (k === 'Enter' && numBuf) { var n = parseInt(numBuf, 10); numBuf = ''; send({ action: 'go', i: n - 1, s: 0 }); e.preventDefault(); return; }
    else if (/^[0-9]$/.test(k)) { numBuf += k; return; }
    else if (k === 'Home') { send({ action: 'go', i: 0, s: 0 }); e.preventDefault(); return; }
    else if (k === 'End') { send({ action: 'go', i: slides.length - 1, s: 0 }); e.preventDefault(); return; }
    else if (k === 'b' || k === 'B' || k === '.') act = 'black';
    else if (k === 'r' || k === 'R') act = 'restart';
    else if (k === 't' || k === 'T') act = 'timer';
    else if (send.presenter) {
      if (k === 'l' || k === 'L') { send.toggleList(); return; }
      if (k === 'Escape') { send.toggleList(false); return; }
      return;
    } else {
      if (k === 'p' || k === 'P') { openPresenter(); return; }
      if (k === 'l' || k === 'L') { toggleList(); return; }
      if (k === 'o' || k === 'O') { toggleOverview(); return; }
      if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); return; }
      if (k === '?' || k === '/') { $('help').classList.toggle('show'); return; }
      if (k === 'Escape') { $('help').classList.remove('show'); toggleOverview(false); toggleList(false); $('black').classList.remove('show'); return; }
      return;
    }
    numBuf = '';
    e.preventDefault();
    send({ action: act });
  }

  /* ============================================================ print mode */
  if (PRINT) {
    document.body.classList.add('print');
    slides.forEach(function (el, i) {
      el.classList.add('current', 'instant');
      applyStep(el, meta[i].steps, false);
      el.querySelectorAll('video').forEach(function (v) { v.removeAttribute('autoplay'); v.preload = 'none'; });
    });
    var fitPrint = function () { stage.style.transform = 'scale(' + (window.innerWidth / 1920) + ')'; };
    fitPrint(); window.addEventListener('resize', fitPrint);
    return;
  }

  /* ============================================================ presenter window */
  if (PRESENTER) {
    document.body.classList.add('presenter');
    var root = document.createElement('div');
    root.id = 'presenter';
    root.innerHTML =
      '<div class="bar"><span class="pos"></span><span class="left-n"></span><span class="clock">0:00</span><span class="plan"></span><span class="delta"></span></div>' +
      '<div class="left"><div class="frame cur-frame"></div></div>' +
      '<div class="right"><div class="next-label">Next</div><div class="frame next-frame"></div>' +
      '<div class="notes"></div>' +
      '<div class="controls"><button data-a="prev">◀ back</button><button data-a="next">next ▶</button>' +
      '<button data-a="list">☰ slides</button><button data-a="timer">reset timer</button><button data-a="black">black</button></div></div>' +
      '<div id="p-list"></div>';
    document.body.appendChild(root);
    var st = { i: 0, s: 0, t0: 0 };
    var plist = root.querySelector('#p-list');
    var send = function (cmd) { if (window.opener && !window.opener.closed) window.opener.postMessage(Object.assign({ type: 'cmd' }, cmd), '*'); };
    send.presenter = true;
    send.toggleList = function (force) {
      var on = force != null ? force : !plist.classList.contains('show');
      plist.classList.toggle('show', on);
      if (on) { markList(plist, st.i); var c = plist.querySelector('li.cur'); if (c) c.scrollIntoView({ block: 'center' }); }
    };
    buildList(plist, function (i) { send.toggleList(false); send({ action: 'go', i: i, s: 0, how: 'next' }); });
    root.querySelectorAll('.controls button').forEach(function (b) {
      b.addEventListener('click', function () { if (b.dataset.a === 'list') send.toggleList(); else send({ action: b.dataset.a }); b.blur(); });
    });
    var draw = function () {
      var m = meta[st.i];
      root.querySelector('.pos').textContent = (st.i + 1) + ' / ' + slides.length + '  ·  ' + m.label + '  ·  click ' + st.s + ' / ' + m.steps;
      root.querySelector('.left-n').textContent = leftText(st.i);
      putMini(root.querySelector('.cur-frame'), st.i, st.s);
      var ni = st.i, ns = st.s + 1;
      if (ns > m.steps) { ni = st.i + 1; ns = 0; }
      if (ni < slides.length) putMini(root.querySelector('.next-frame'), ni, ns); else root.querySelector('.next-frame').innerHTML = '';
      root.querySelector('.notes').innerHTML = notesHTML(m, st.s) + '<p class="note-meta">plan: this slide starts at ' + fmtTime(m.start) + ' · ' + m.dur + ' s · talk total ' + fmtTime(TOTAL_PLAN) + '</p>';
      var nowEl = root.querySelector('.note-seg.now'); if (nowEl) nowEl.scrollIntoView({ block: 'nearest' });
      markList(plist, st.i);
    };
    var tick = function () {
      var el = st.t0 ? (Date.now() - st.t0) / 1000 : 0;
      root.querySelector('.clock').textContent = fmtTime(el);
      var m = meta[st.i];
      root.querySelector('.plan').textContent = 'plan ' + fmtTime(m.start);
      var dl = root.querySelector('.delta');
      if (st.t0) { var d = el - m.start; dl.textContent = (d > 0 ? '+' : '−') + fmtTime(Math.abs(d)) + (d > 0 ? ' behind' : ' ahead'); dl.className = 'delta ' + (d > 15 ? 'behind' : 'ahead'); }
      else dl.textContent = 'timer starts at the first click';
    };
    window.addEventListener('message', function (e) {
      var d = e.data || {};
      if (d.type === 'state') { st = d; draw(); tick(); }
    });
    window.addEventListener('keydown', function (e) { onKey(e, send); });
    window.addEventListener('resize', draw);
    setInterval(tick, 500);
    send({ action: 'hello' });
    draw();
    return;
  }

  /* ============================================================ audience window */
  buildNav();
  window.addEventListener('message', function (e) { var d = e.data || {}; if (d.type === 'cmd') handleCmd(d); });
  window.addEventListener('keydown', function (e) { onKey(e, handleCmd); });
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function () { var h = parseHash(); if (!cur || h.i !== cur.i || h.s !== cur.s) show(h.i, h.s, 'jump'); });
  viewport.addEventListener('click', function (e) { if (e.button !== 0) return; if (navList.classList.contains('show')) { toggleList(false); return; } next(); });
  $('black').addEventListener('click', function () { $('black').classList.remove('show'); });
  $('help').addEventListener('click', function () { $('help').classList.remove('show'); });
  var idle;
  document.addEventListener('mousemove', function (e) {
    document.body.style.cursor = ''; clearTimeout(idle);
    idle = setTimeout(function () { if (!nav.classList.contains('show')) document.body.style.cursor = 'none'; }, 2200);
    if (e.clientY > window.innerHeight - 110) revealNav(false);           // the bar lives at the bottom edge
  });
  fit();
  var h0 = parseHash();
  show(h0.i, h0.s, h0.s ? 'jump' : 'next');
  revealNav(false);                                                         // show it once at start so it can be found
  window.LALA = { show: show, next: next, prev: prev, meta: meta, state: function () { return cur; } };
})();
