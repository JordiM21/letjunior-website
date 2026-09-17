/* LET Academy — landing interactions.
   Everything here is progressive enhancement: with JS off the page is
   complete and readable. Only transform/opacity is ever animated. */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal (fires once) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // Stagger siblings within a group, capped at 5 (300ms).
    var seen = new Map();
    reveals.forEach(function (el) {
      if (el.dataset.d !== undefined) {
        el.style.setProperty('--d', el.dataset.d + 'ms');
        return;
      }
      var n = seen.get(el.parentNode) || 0;
      seen.set(el.parentNode, n + 1);
      el.style.setProperty('--d', Math.min(n, 4) * 60 + 'ms');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Header state + sticky CTA + CTA breathing ---------- */
  var hdr = document.getElementById('hdr');
  var hdrCta = document.getElementById('hdrCta');
  var sticky = document.getElementById('stickyCta');
  var heroCta = document.getElementById('heroCta');
  var ftr = document.getElementById('ftr');
  var lessonCard = document.getElementById('lesson');
  var calmed = false;
  var ticking = false;

  // Each brand-colour wash (Method, Reviews and friends — see styles.css)
  // drifts its radial-gradient centre from `from` to `to` as its own section
  // crosses the viewport, so the page's colour feels tied to how far you've
  // read rather than looping on a timer. Off entirely under reduced motion,
  // which leaves each section at the static centre already in the CSS.
  var washes = [
    { sel: '.proof',    from: [85, 20], to: [70, 35] },
    { sel: '.method',   from: [90, 8],  to: [72, 22] },
    { sel: '.demo',     from: [12, 85], to: [30, 65] },
    { sel: '.teachers', from: [90, 75], to: [70, 55] },
    { sel: '.reviews',  from: [4, 4],   to: [22, 20] },
    { sel: '.plans',    from: [8, 15],  to: [26, 32] },
    { sel: '.faq',      from: [88, 10], to: [68, 26] },
    { sel: '.final',    from: [50, 0],  to: [50, 24] },
    { sel: '.ftr',      from: [20, 0],  to: [40, 18] }
  ].map(function (w) {
    w.el = document.querySelector(w.sel);
    return w;
  }).filter(function (w) { return w.el; });
  var heroSection = document.querySelector('.hero');
  var blobsEl = document.querySelector('.blobs');

  function onScroll() {
    // Every measurement first, every class change after. Toggling a class and
    // then calling getBoundingClientRect() forces a synchronous layout on each
    // scroll frame; split this way the browser lays out once, at paint time.
    var y = window.scrollY;
    var vh = window.innerHeight;

    // Sticky bar: after the hero CTA leaves, until 100px before the footer.
    // Also stand down over the demo lesson — the site's CTA must never sit
    // on top of the lesson's own Comprobar button.
    var heroGone = heroCta.getBoundingClientRect().bottom < 0;
    var footerNear = ftr.getBoundingClientRect().top < vh + 100;
    var overLesson = false;
    if (lessonCard) {
      var lb = lessonCard.getBoundingClientRect();
      overLesson = lb.top < vh - 80 && lb.bottom > 80;
    }

    // Background wash drift: read every section's rect first, then write.
    var writes = null;
    if (!reduce) {
      writes = washes.map(function (w) {
        var r = w.el.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
        return {
          el: w.el,
          x: w.from[0] + (w.to[0] - w.from[0]) * p,
          y: w.from[1] + (w.to[1] - w.from[1]) * p
        };
      });
      if (blobsEl && heroSection) {
        var hr = heroSection.getBoundingClientRect();
        var hp = Math.max(0, Math.min(1, (vh - hr.top) / (vh + hr.height)));
        writes.push({ el: blobsEl, by: hp * 24 });
      }
    }

    hdr.classList.toggle('is-stuck', y > 80);
    hdrCta.classList.toggle('is-in', y > 400);
    sticky.classList.toggle('is-in', heroGone && !footerNear && !overLesson);

    // The hero button breathes until the visitor engages, then stops for good.
    if (!calmed && y > 40) { heroCta.classList.add('is-calm'); calmed = true; }

    if (writes) {
      writes.forEach(function (w) {
        if (w.by !== undefined) { w.el.style.setProperty('--by', w.by + 'px'); return; }
        w.el.style.setProperty('--wx', w.x + '%');
        w.el.style.setProperty('--wy', w.y + '%');
      });
    }
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  /* ---------- Header nav: which section you are actually in ----------
     One observer over the sections the nav points at. The band is the middle
     of the viewport, so the mark moves when a section takes the screen, not
     when its first pixel appears. */
  var navLinks = [].slice.call(document.querySelectorAll('.hdr-nav a[href^="#"]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    var watched = [];
    navLinks.forEach(function (a) {
      var sec = document.getElementById(a.hash.slice(1));
      if (!sec) return;
      byId[sec.id] = a;
      watched.push(sec);
    });

    var visible = Object.create(null);
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible[e.target.id] = e.intersectionRatio;
        else delete visible[e.target.id];
      });
      var best = null, bestRatio = 0;
      for (var id in visible) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; best = id; }
      }
      navLinks.forEach(function (a) { a.classList.remove('is-current'); });
      if (best && byId[best]) byId[best].classList.add('is-current');
    }, { threshold: [0, 0.25, 0.5, 0.75], rootMargin: '-45% 0px -45% 0px' });

    watched.forEach(function (sec) { navIo.observe(sec); });
  }

  /* ---------- Carousel dots ---------- */
  document.querySelectorAll('.dots').forEach(function (dots) {
    var rail = document.getElementById(dots.dataset.rail);
    if (!rail) return;
    var cards = rail.children;

    for (var i = 0; i < cards.length; i++) dots.appendChild(document.createElement('i'));

    function sync() {
      var mid = rail.scrollLeft + rail.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      for (var j = 0; j < dots.children.length; j++) {
        dots.children[j].classList.toggle('on', j === best);
      }
    }
    rail.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true });
    sync();
  });

  /* ---------- Video testimonials: facade -> real player on demand ----------
     Each card is a plain link to YouTube, so with JS off it still works. With
     JS the player opens inside the card instead, which keeps the parent on the
     page — and nothing is requested from YouTube until they actually press
     play. */
  document.querySelectorAll('.vid-shot[data-yt]').forEach(function (shot) {
    shot.addEventListener('click', function (e) {
      e.preventDefault();
      var id = shot.dataset.yt;

      var f = document.createElement('iframe');
      // nocookie: no YouTube tracking cookie unless the video is actually played.
      f.src = 'https://www.youtube-nocookie.com/embed/' + id +
              '?autoplay=1&rel=0&modestbranding=1&playsinline=1&hl=es';
      f.title = 'Testimonio de ' + (shot.dataset.who || 'una familia');
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;

      shot.replaceChildren(f);
      shot.classList.add('is-playing');
      shot.removeAttribute('href');      // it is a player now, not a link
      shot.removeAttribute('aria-label');

      if (typeof window.gtag === 'function') window.gtag('event', 'testimonial_play', { video_id: id });
      if (typeof window.fbq === 'function') window.fbq('trackCustom', 'testimonial_play');
    }, { once: true });
  });

  /* ---------- FAQ: animate the close as well as the open ---------- */
  document.querySelectorAll('.acc details').forEach(function (d) {
    d.querySelector('summary').addEventListener('click', function (e) {
      if (!d.open || reduce) return; // opening (or reduced motion) needs no help
      e.preventDefault();
      d.classList.add('is-closing');
      setTimeout(function () {
        d.classList.remove('is-closing');
        d.open = false;
      }, 200); // --t-exit
    });
  });

  /* ---------- Hero blob parallax (desktop only) ---------- */
  if (!reduce && matchMedia('(min-width: 900px)').matches) {
    var blobs = document.querySelectorAll('.blob');
    var pTicking = false;
    addEventListener('scroll', function () {
      if (pTicking) return;
      pTicking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        blobs.forEach(function (b, i) {
          var depth = [0.045, -0.03, 0.02][i] || 0;
          b.style.transform = 'translate3d(0,' + Math.max(-40, Math.min(40, y * depth)) + 'px,0)';
        });
        pTicking = false;
      });
    }, { passive: true });
  }

  /* =========================================================
     Interactive demo lesson
     Three questions: choice, typed answer, word bank. All checking
     happens here in the browser — no backend, no network.
     ========================================================= */
  var LESSON = [
    {
      type: 'choice',
      q: '¿Cómo le dices a tu profe que tienes <b>9 años</b>?',
      options: ['I have 9 years old', 'I am 9 years old', 'I have 9 years'],
      correct: 1,
      why: 'En inglés la edad se dice con <b>am / is / are</b>, nunca con “have”. Es el fallo número uno de los hispanohablantes.'
    },
    {
      type: 'type',
      q: 'Escribe en inglés: <b>«Tengo dos perros»</b>',
      accept: ['i have two dogs', 'i have got two dogs', 'ive got two dogs', 'i have 2 dogs'],
      show: 'I have two dogs',   // accept[] is normalised; this is what we display
      keywords: ['have', 'two', 'dogs'],
      why: 'Aquí “tengo” sí es <b>I have</b>. Y “perros” va en plural: <b>dogs</b>.'
    },
    {
      type: 'bank',
      q: 'Ordena la frase: <b>«Mi dragón es verde»</b>',
      tiles: ['is', 'My', 'green', 'are', 'dragon', 'the'],
      answer: ['My', 'dragon', 'is', 'green'],
      why: 'El color va <em>detrás</em> del verbo <b>is</b>, al revés que en español.'
    }
  ];

  /* ---------- Sound: synthesised, so there is nothing to download ----------
     The AudioContext is built on the first click (Comprobar), which satisfies
     every browser's autoplay gesture requirement. Muting is remembered. */
  var actx = null, muted = false;
  try { muted = localStorage.getItem('let-sound') === 'off'; } catch (e) {}

  function ctx() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === 'suspended') actx.resume();
    return actx;
  }

  // One note with a soft attack and exponential decay — no clicks or pops.
  function note(freq, startAt, dur, type, peak) {
    var c = ctx();
    if (!c) return;
    var osc = c.createOscillator();
    var gain = c.createGain();
    var t = c.currentTime + startAt;
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak || 0.11, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  var sfx = {
    right: function () { note(880, 0, 0.13); note(1318.5, 0.085, 0.22); },
    wrong: function () { note(196, 0, 0.16, 'sawtooth', 0.07); note(146.8, 0.09, 0.26, 'sawtooth', 0.07); },
    win:   function () { note(659.3, 0, 0.12); note(880, 0.1, 0.12); note(1318.5, 0.2, 0.32); },
    lose:  function () { note(330, 0, 0.18, 'sawtooth', 0.07); note(220, 0.14, 0.34, 'sawtooth', 0.07); }
  };

  function play(name) { if (!muted && sfx[name]) sfx[name](); }

  // Restart an animation even if the class is already there.
  function flash(node, cls) {
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    node.addEventListener('animationend', function h() {
      node.classList.remove(cls);
      node.removeEventListener('animationend', h);
    });
  }

  if (document.getElementById('lesson')) setupLesson();

  function setupLesson() {
    var L = document.getElementById('lesson');
    var el = {
      bar: document.getElementById('lsnBar'),
      hearts: document.getElementById('lsnHearts'),
      body: document.getElementById('lsnBody'),
      step: document.getElementById('lsnStep'),
      q: document.getElementById('lsnQ'),
      opts: document.getElementById('lsnOpts'),
      typed: document.getElementById('lsnTyped'),
      input: document.getElementById('lsnInput'),
      words: document.getElementById('lsnWords'),
      bank: document.getElementById('lsnBank'),
      line: document.getElementById('lsnLine'),
      tiles: document.getElementById('lsnTiles'),
      feed: document.getElementById('lsnFeed'),
      fbTitle: document.getElementById('lsnFbTitle'),
      fbWhy: document.getElementById('lsnFbWhy'),
      check: document.getElementById('lsnCheck'),
      xp: document.getElementById('lsnXp'),
      foot: L.querySelector('.lesson-foot'),
      hud: L.querySelector('.lesson-hud'),
      end: document.getElementById('lsnEnd'),
      endTitle: document.getElementById('lsnEndTitle'),
      endText: document.getElementById('lsnEndText'),
      retry: document.getElementById('lsnRetry')
    };

    var i, hearts, xp, picked, answered, built, breaking;

    function norm(s) {
      return s.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip accents
        .replace(/[^a-z0-9\s]/g, ' ')                      // strip punctuation
        .replace(/\s+/g, ' ').trim();
    }

    // Levenshtein — lets a near-miss count as a typo instead of a failure.
    function dist(a, b) {
      var prev = [], cur = [], j, k;
      for (j = 0; j <= b.length; j++) prev[j] = j;
      for (j = 1; j <= a.length; j++) {
        cur[0] = j;
        for (k = 1; k <= b.length; k++) {
          cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + (a[j - 1] === b[k - 1] ? 0 : 1));
        }
        prev = cur.slice();
      }
      return prev[b.length];
    }

    function drawHearts() {
      var s = '';
      // `breaking` marks the heart just lost, so it animates out instead of
      // silently switching colour.
      for (var h = 0; h < 3; h++) {
        if (h < hearts) s += '♥';
        else if (breaking && h === hearts) s += '<span class="off lost">♥</span>';
        else s += '<span class="off">♥</span>';
      }
      el.hearts.innerHTML = s;
      el.hearts.setAttribute('aria-label', 'Vidas restantes: ' + hearts);
      breaking = false;
    }

    function render() {
      var q = LESSON[i];
      picked = null; answered = false; built = [];

      el.bar.style.transform = 'scaleX(' + (i / LESSON.length) + ')';
      drawHearts();
      el.step.textContent = 'Pregunta ' + (i + 1) + ' de ' + LESSON.length;
      el.q.innerHTML = q.q;
      el.feed.hidden = true;
      el.feed.className = 'feedback';
      el.check.textContent = 'Comprobar';
      el.check.disabled = true;

      el.opts.hidden = true; el.typed.hidden = true; el.bank.hidden = true;
      el.typed.className = 'typed'; el.bank.className = 'bank';

      if (q.type === 'choice') {
        el.opts.hidden = false;
        el.opts.innerHTML = '';
        q.options.forEach(function (text, n) {
          var li = document.createElement('li');
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'opt';
          b.setAttribute('aria-pressed', 'false');
          b.innerHTML = '<span class="key" aria-hidden="true">' + 'ABC'[n] + '</span><span>' + text + '</span>';
          b.addEventListener('click', function () {
            if (answered) return;
            picked = n;
            el.opts.querySelectorAll('.opt').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
            b.setAttribute('aria-pressed', 'true');
            el.check.disabled = false;
          });
          li.appendChild(b);
          el.opts.appendChild(li);
        });
      }

      if (q.type === 'type') {
        el.typed.hidden = false;
        el.input.value = '';
        el.input.disabled = false;
        el.words.innerHTML = '<span class="hint">Te vamos marcando las palabras según escribes.</span>';
      }

      if (q.type === 'bank') {
        el.bank.hidden = false;
        el.line.innerHTML = '';
        el.tiles.innerHTML = '';
        q.tiles.forEach(function (word, n) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'tile-btn';
          b.textContent = word;
          b.addEventListener('click', function () { if (!answered) addTile(b, word, n); });
          el.tiles.appendChild(b);
        });
      }
    }

    // Tap to place, tap again to take back. No dragging: on a phone,
    // drag-and-drop fights the page scroll and breaks for screen readers.
    function addTile(src, word, n) {
      src.classList.add('used');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tile-btn';
      b.textContent = word;
      b.addEventListener('click', function () {
        if (answered) return;
        b.remove();
        src.classList.remove('used');
        built = built.filter(function (x) { return x.n !== n; });
        el.check.disabled = built.length === 0;
      });
      el.line.appendChild(b);
      built.push({ n: n, word: word });
      el.check.disabled = false;
    }

    /* Live word marking while typing — real-time, but it never hands over
       the answer: it only confirms words that do belong in it. */
    el.input.addEventListener('input', function () {
      var q = LESSON[i];
      if (q.type !== 'type') return;
      var raw = el.input.value;
      el.check.disabled = norm(raw).length === 0;

      var pool = norm(q.accept[0]).split(' ');
      var typed = norm(raw).split(' ').filter(Boolean);
      var endsOpen = !/\s$/.test(raw); // last word may still be half-written
      if (!typed.length) {
        el.words.innerHTML = '<span class="hint">Te vamos marcando las palabras según escribes.</span>';
        return;
      }
      el.words.innerHTML = typed.map(function (w, n) {
        var partial = endsOpen && n === typed.length - 1;
        var ok = partial
          ? pool.some(function (p) { return p.indexOf(w) === 0; })
          : pool.indexOf(w) > -1;
        return '<span class="w' + (ok ? ' ok' : '') + '">' + w + '</span>';
      }).join('');
    });

    el.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !el.check.disabled) { e.preventDefault(); el.check.click(); }
    });

    function judge() {
      var q = LESSON[i];

      if (q.type === 'choice') {
        el.opts.querySelectorAll('.opt').forEach(function (b, n) {
          b.disabled = true;
          if (n === q.correct) b.classList.add('right');
          else if (n === picked) b.classList.add('wrong');
        });
        return picked === q.correct ? { ok: true } : { ok: false };
      }

      if (q.type === 'type') {
        var a = norm(el.input.value);
        el.input.disabled = true;
        if (q.accept.some(function (x) { return norm(x) === a; })) {
          el.typed.classList.add('right');
          return { ok: true };
        }
        var best = Math.min.apply(null, q.accept.map(function (x) { return dist(a, norm(x)); }));
        if (best <= 2) {
          el.typed.classList.add('right');
          return { ok: true, note: 'Casi perfecto — solo una errata. Se escribe <b>' + (q.show || q.accept[0]) + '</b>.' };
        }
        el.typed.classList.add('wrong');
        var words = a.split(' ');
        var missing = q.keywords.filter(function (k) { return words.indexOf(k) === -1; });
        var note = (missing.length && missing.length < q.keywords.length)
          ? 'Te falta <b>' + missing.join('</b>, <b>') + '</b>. '
          : '';
        return { ok: false, note: note + 'La respuesta era <b>' + (q.show || q.accept[0]) + '</b>.' };
      }

      var made = built.map(function (x) { return x.word; }).join(' ');
      var good = norm(made) === norm(q.answer.join(' '));
      el.bank.classList.add(good ? 'right' : 'wrong');
      el.tiles.querySelectorAll('.tile-btn').forEach(function (b) { b.disabled = true; });
      return good ? { ok: true } : { ok: false, note: 'La frase era <b>' + q.answer.join(' ') + '</b>.' };
    }

    el.check.addEventListener('click', function () {
      if (answered) { next(); return; }
      answered = true;

      var q = LESSON[i];
      var res = judge();

      // The answer area itself reacts: pop when right, shake when wrong.
      var target = q.type === 'choice'
        ? (el.opts.querySelectorAll('.opt')[picked] || el.opts)
        : (q.type === 'type' ? el.typed : el.line);

      if (res.ok) {
        xp += 10;
        el.xp.textContent = xp;
        flash(target, 'pop');
        flash(el.xp.parentNode, 'pop');
        play('right');
      } else {
        hearts--;
        breaking = true;
        drawHearts();
        flash(target, 'shake');
        play('wrong');
      }

      el.feed.hidden = false;
      el.feed.className = 'feedback ' + (res.ok ? 'ok' : 'no');
      el.fbTitle.textContent = res.ok ? '¡Correcto! +10 XP' : 'No exactamente';
      el.fbWhy.innerHTML = (res.note ? res.note + ' ' : '') + q.why;
      // Next frame, so the panel slides in rather than snapping into place.
      requestAnimationFrame(function () { el.feed.classList.add('show'); });

      el.check.textContent = (i === LESSON.length - 1 || hearts <= 0) ? 'Terminar' : 'Continuar';
      el.check.disabled = false;
      el.check.focus();
    });

    function next() {
      if (hearts <= 0) return finish(false);
      i++;
      if (i >= LESSON.length) return finish(true);
      render();
    }

    function finish(won) {
      play(won ? 'win' : 'lose');
      el.bar.style.transform = 'scaleX(1)';
      el.body.hidden = true; el.foot.hidden = true; el.hud.hidden = true;
      el.end.hidden = false;
      el.end.querySelector('.end-emoji').textContent = won ? '🎉' : '💔';
      el.endTitle.textContent = won ? '¡Lección completada!' : 'Te quedaste sin vidas';
      el.endText.innerHTML = won
        ? 'Has ganado <b>' + xp + ' XP</b>. Tu peque hace esto dos veces por semana — pero con una profe al otro lado animándole.'
        : 'Justo por esto las clases son en vivo: cuando algo falla, la profe lo explica al momento. Llevabas <b>' + xp + ' XP</b>.';
    }

    function start() {
      i = 0; hearts = 3; xp = 0;
      el.end.hidden = true;
      el.body.hidden = false; el.foot.hidden = false; el.hud.hidden = false;
      el.xp.textContent = '0';
      render();
    }

    var mute = document.getElementById('lsnMute');
    function paintMute() {
      mute.setAttribute('aria-pressed', String(muted));
      mute.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar sonido');
    }
    mute.addEventListener('click', function () {
      muted = !muted;
      try { localStorage.setItem('let-sound', muted ? 'off' : 'on'); } catch (e) {}
      paintMute();
      if (!muted) play('right'); // confirm it's back on
    });
    paintMute();

    el.retry.addEventListener('click', start);
    start();
  }

  /* ---------- WhatsApp: the single place the number lives ----------
     The whole business runs through WhatsApp, so every buy-intent control on
     the page lands in the same inbox with the message already written.

     data-wa="" uses the general text; data-wa="inicial" / "completo" say which
     plan the parent was looking at when they tapped. That context arrives in
     Kommo as the first line of the conversation, so the reply can pick up
     where the page left off instead of starting from "¿en qué te ayudo?". */
  var WA_PHONE = '393792913474';
  var WA_TEXT = {
    '':         '¡Hola! Acabo de ver la página y me gustaría obtener más información por favor',
    inicial:    '¡Hola! Acabo de ver la página y quiero empezar el Plan Inicial de $15 para mi hijo/a',
    completo:   '¡Hola! Acabo de ver la página y quiero información sobre el Plan Completo'
  };

  document.querySelectorAll('[data-wa]').forEach(function (a) {
    var text = WA_TEXT[a.dataset.wa] || WA_TEXT[''];
    a.href = 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Quick-contact flow ----------
     Every WhatsApp CTA opens this first instead of leaving the page right
     away: three taps, no typing, then WhatsApp opens with the plan context
     (WA_TEXT above) plus what the parent just answered already written in.
     Falls back to the plain WhatsApp link (already set above) wherever
     <dialog> isn't supported. */
  var intake = document.getElementById('intake');
  if (intake && typeof intake.showModal === 'function') {
    var STEPS = [
      { q: '¿Cómo prefieres que te contactemos?', opts: ['💬 WhatsApp', '📞 Llamada', '✍️ Mensaje de texto'] },
      { q: '¿Cuándo te viene mejor?', opts: ['🌅 Mañana', '☀️ Tarde', '🌙 Noche', '🤷 Cuando sea'] },
      { q: '¿Qué edad tiene tu peque?', opts: ['7–8 años', '9–10 años', '11–12 años', '13–14 años'] }
    ];
    var bar = document.getElementById('intakeBar');
    var stepEl = document.getElementById('intakeStep');
    var qEl = document.getElementById('intakeQ');
    var optsEl = document.getElementById('intakeOpts');
    var bodyEl = document.getElementById('intakeBody');
    var endEl = document.getElementById('intakeEnd');
    var sendBtn = document.getElementById('intakeSend');
    var step, answers, waKey;

    function renderStep() {
      var s = STEPS[step];
      stepEl.textContent = 'Pregunta ' + (step + 1) + ' de ' + STEPS.length;
      qEl.textContent = s.q;
      optsEl.innerHTML = '';
      s.opts.forEach(function (label) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.className = 'opt';
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', function () { pick(label); });
        li.appendChild(b);
        optsEl.appendChild(li);
      });
      bar.style.transform = 'scaleX(' + (step / STEPS.length) + ')';
    }

    function pick(label) {
      answers.push(label);
      step++;
      if (step < STEPS.length) { renderStep(); return; }
      bar.style.transform = 'scaleX(1)';
      bodyEl.hidden = true;
      endEl.hidden = false;
      var text = (WA_TEXT[waKey] || WA_TEXT['']) +
        '\n\nContacto: ' + answers[0] + ' · ' + answers[1] +
        '\nEdad: ' + answers[2];
      sendBtn.href = 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text);
    }

    document.getElementById('intakeClose').addEventListener('click', function () { intake.close(); });
    intake.addEventListener('click', function (e) { if (e.target === intake) intake.close(); });
    sendBtn.addEventListener('click', function () { setTimeout(function () { intake.close(); }, 150); });

    document.querySelectorAll('[data-wa]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        waKey = a.dataset.wa;
        step = 0;
        answers = [];
        bodyEl.hidden = false;
        endEl.hidden = true;
        renderStep();
        intake.showModal();
      });
    });
  }

  /* ---------- Funnel instrumentation ----------
     Each CTA reports separately — on mobile the sticky bar usually wins,
     and you cannot see that if they share one event.
     TODO: wire to the real analytics stack (GA4 / Meta Pixel). */
  var ctas = [
    ['#heroCta', 'cta_hero'],
    ['#hdrCta', 'cta_header'],
    ['#stickyCta .btn', 'cta_sticky'],
    ['#reservar .btn', 'cta_final']
  ];
  ctas.forEach(function (pair) {
    var el = document.querySelector(pair[0]);
    if (!el) return;
    el.addEventListener('click', function () {
      if (typeof window.gtag === 'function') window.gtag('event', pair[1]);
      if (typeof window.fbq === 'function') window.fbq('trackCustom', pair[1]);
    });
  });
})();
