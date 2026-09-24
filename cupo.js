/* LET Academy — /cupo placement funnel.
   Intro → 3 taps → groups that fit, shown in the family's own clock → WhatsApp.
   No backend on purpose: the answers and the chosen slot travel inside the
   WhatsApp message, so they arrive in Kommo as the first line of the chat. */
(function () {
  'use strict';

  /* ================= EDIT HERE: open groups =================
     time + days are on YOUR clock (TEACHER_TZ). days: 1 = lunes … 7 = domingo.
     ages: [min, max], both included.
     levels (optional): which answers to question 3 fit ('cero', 'basico',
       'avanzado'). Leave it out and any level fits.
     spots (optional): shows "Quedan N cupos" on the card.
     Groups that land before 7:00 or after 21:00 for the family are hidden. */
  var TEACHER_TZ = 'Europe/Rome';
  var GROUPS = [                  // TODO: placeholder — replace with the real schedule
    { ages: [7, 8],   days: [1, 3], time: '22:00', spots: 3 },
    { ages: [7, 8],   days: [6],    time: '17:00' },
    { ages: [8, 10],  days: [2, 4], time: '22:00', spots: 2 },
    { ages: [9, 11],  days: [6],    time: '18:00' },
    { ages: [11, 14], days: [2, 4], time: '23:00', spots: 4 },
    { ages: [11, 14], days: [1, 3], time: '18:30' },
    { ages: [12, 14], days: [5],    time: '22:30', levels: ['basico', 'avanzado'] }
  ];
  var WA_PHONE = '393792913474';

  // [name, flag, region for date formatting, time zones: first one is the default]
  var COUNTRIES = [
    ['España', '🇪🇸', 'ES', ['Europe/Madrid', 'Atlantic/Canary']],
    ['México', '🇲🇽', 'MX', ['America/Mexico_City', 'America/Monterrey', 'America/Merida', 'America/Cancun', 'America/Chihuahua', 'America/Mazatlan', 'America/Hermosillo', 'America/Tijuana']],
    ['Colombia', '🇨🇴', 'CO', ['America/Bogota']],
    ['Argentina', '🇦🇷', 'AR', ['America/Argentina/Buenos_Aires', 'America/Buenos_Aires', 'America/Argentina/Cordoba', 'America/Argentina/Mendoza']],
    ['Chile', '🇨🇱', 'CL', ['America/Santiago', 'America/Punta_Arenas']],
    ['Perú', '🇵🇪', 'PE', ['America/Lima']],
    ['Estados Unidos', '🇺🇸', 'US', ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles', 'America/Detroit', 'America/Indiana/Indianapolis', 'America/Boise', 'America/Anchorage', 'Pacific/Honolulu']],
    ['Ecuador', '🇪🇨', 'EC', ['America/Guayaquil']],
    ['Venezuela', '🇻🇪', 'VE', ['America/Caracas']],
    ['Guatemala', '🇬🇹', 'GT', ['America/Guatemala']],
    ['Bolivia', '🇧🇴', 'BO', ['America/La_Paz']],
    ['Rep. Dominicana', '🇩🇴', 'DO', ['America/Santo_Domingo']],
    ['Costa Rica', '🇨🇷', 'CR', ['America/Costa_Rica']],
    ['Panamá', '🇵🇦', 'PA', ['America/Panama']],
    ['Uruguay', '🇺🇾', 'UY', ['America/Montevideo']],
    ['Paraguay', '🇵🇾', 'PY', ['America/Asuncion']],
    ['Honduras', '🇭🇳', 'HN', ['America/Tegucigalpa']],
    ['El Salvador', '🇸🇻', 'SV', ['America/El_Salvador']],
    ['Nicaragua', '🇳🇮', 'NI', ['America/Managua']],
    ['Puerto Rico', '🇵🇷', 'PR', ['America/Puerto_Rico']]
  ];
  var HERE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  COUNTRIES.push(['Otro país', '🌍', '', [HERE]]);

  var LEVELS = [
    ['cero', '🌱', 'Está empezando', 'Sabe poquito o nada'],
    ['basico', '🌿', 'Se defiende un poco', 'Entiende palabras y frases sueltas'],
    ['avanzado', '🌳', 'Ya conversa', 'Mantiene una charla sencilla']
  ];

  /* ---------- Time zones, with nothing but Intl ---------- */
  var DOW = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  function wall(tz, d) {
    var p = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', weekday: 'short',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'
    }).formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return p;
  }
  function wallMs(p) { return Date.UTC(+p.year, p.month - 1, +p.day, +p.hour, +p.minute); }

  // The next real moment when the teacher's clock reads `day` at `hhmm`.
  // Built from this week's date, so summer/winter time is whatever applies now.
  function nextSlot(day, hhmm, now) {
    var p = wall(TEACHER_TZ, now), hm = hhmm.split(':');
    var target = Date.UTC(+p.year, p.month - 1, +p.day + (day - DOW[p.weekday] + 7) % 7, +hm[0], +hm[1]);
    var t = target;
    for (var k = 0; k < 2; k++) t -= wallMs(wall(TEACHER_TZ, new Date(t))) - target;
    return new Date(t);
  }

  function joinEs(a) {
    var t = a.length > 1 ? a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1] : a[0];
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  var DAY_ES = ['', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

  function describe(g, place, now) {
    var loc = place.cc ? 'es-' + place.cc : 'es';
    var dates = g.days.map(function (d) { return nextSlot(d, g.time, now); });
    var lp = wall(place.tz, dates[0]);
    return {
      g: g,
      days: joinEs(dates.map(new Intl.DateTimeFormat(loc, { timeZone: place.tz, weekday: 'long' }).format)),
      time: new Intl.DateTimeFormat(loc, { timeZone: place.tz, hour: 'numeric', minute: '2-digit' }).format(dates[0]),
      mins: lp.hour * 60 + +lp.minute
    };
  }

  function match(age, level, place, now) {
    var fit = GROUPS.filter(function (g) { return age >= g.ages[0] && age <= g.ages[1]; });
    var byLevel = fit.filter(function (g) { return !g.levels || g.levels.indexOf(level) >= 0; });
    if (byLevel.length) fit = byLevel;
    return fit.map(function (g) { return describe(g, place, now); })
      .filter(function (s) { return s.mins >= 7 * 60 && s.mins <= 21 * 60; })
      .sort(function (a, b) { return a.mins - b.mins; })
      .slice(0, 3);
  }

  if (typeof document === 'undefined') { module.exports = { nextSlot: nextSlot, match: match, GROUPS: GROUPS }; return; }

  /* ---------- State + screens ---------- */
  var card = document.getElementById('quiz');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var plan = new URLSearchParams(location.search).get('plan');
  var ORDER = ['intro', 'q1', 'q2', 'q3', 'seek', 'results', 'thanks'];
  var st = {}, slots = [], current = 'intro', seekTimer;

  // Put the country this phone is in first, so most parents answer Q2 with one tap.
  var hereIdx = -1;
  COUNTRIES.forEach(function (c, k) { if (hereIdx < 0 && k < COUNTRIES.length - 1 && c[3].indexOf(HERE) >= 0) hereIdx = k; });
  if (hereIdx > 0) COUNTRIES.unshift(COUNTRIES.splice(hereIdx, 1)[0]);

  function hud(n) {
    return '<div class="lesson-hud q-hud">' +
      '<button class="q-back" type="button" data-back aria-label="Pregunta anterior">‹</button>' +
      '<span class="hud-bar" role="progressbar" aria-valuemin="0" aria-valuemax="3" aria-valuenow="' + (n - 1) + '"><i style="transform:scaleX(' + Math.max((n - 1) / 3, 0.04) + ')"></i></span>' +
      '<span class="q-count">' + n + '/3</span></div>' +
      '<p class="lesson-step">Pregunta ' + n + ' de 3</p>';
  }
  function pressed(on) { return ' aria-pressed="' + !!on + '"'; }

  var VIEWS = {
    intro: function () {
      return '<div class="scr scr-center">' +
        '<p class="big-emoji" aria-hidden="true">🎒</p>' +
        '<span class="kicker k-grape">⏱️ 30 segundos</span>' +
        '<h1>¿Hay un cupo para tu peque?</h1>' +
        '<p>Responde estas <b>3 preguntas</b> para saber si tenemos un cupo disponible para tu peque.</p>' +
        '<ul class="q-preview" aria-label="Te preguntaremos">' +
          '<li style="--i:0"><span aria-hidden="true">🎂</span>Edad</li>' +
          '<li style="--i:1"><span aria-hidden="true">🌎</span>País</li>' +
          '<li style="--i:2"><span aria-hidden="true">📚</span>Nivel</li></ul>' +
        '<button class="btn btn-primary btn-lg btn-block breathe" type="button" data-go="q1">¡Empezar! <span class="arrow" aria-hidden="true">→</span></button>' +
        '<p class="fineprint">Sin compromiso · Sin pedirte datos personales</p></div>';
    },
    q1: function () {
      var h = '';
      for (var a = 7; a <= 14; a++) h += '<li><button class="opt age" type="button" style="--i:' + (a - 7) + '" data-age="' + a + '"' + pressed(st.age === a) + '><b>' + a + '</b><small>años</small></button></li>';
      return '<div class="scr">' + hud(1) + '<h2 class="lesson-q">¿Cuántos años tiene tu peque?</h2><ul class="opts ages">' + h + '</ul></div>';
    },
    q2: function () {
      var h = COUNTRIES.map(function (c, k) {
        return '<li><button class="opt country" type="button" style="--i:' + Math.min(k, 10) + '" data-country="' + k + '"' + pressed(st.country && st.country.name === c[0]) + '>' +
          '<span class="flag" aria-hidden="true">' + c[1] + '</span>' + c[0] +
          (k === 0 && hereIdx >= 0 ? '<span class="here">📍</span>' : '') + '</button></li>';
      }).join('');
      return '<div class="scr">' + hud(2) + '<h2 class="lesson-q">¿Desde dónde se conectan?</h2>' +
        '<p class="q-hint">Así te mostramos los horarios en tu hora local.</p><ul class="opts countries">' + h + '</ul></div>';
    },
    q3: function () {
      var h = LEVELS.map(function (l, k) {
        return '<li><button class="opt level" type="button" style="--i:' + k + '" data-level="' + k + '"' + pressed(st.level && st.level[0] === l[0]) + '>' +
          '<span class="lvl-emoji" aria-hidden="true">' + l[1] + '</span><span><b>' + l[2] + '</b><small>' + l[3] + '</small></span></button></li>';
      }).join('');
      return '<div class="scr">' + hud(3) + '<h2 class="lesson-q">¿Qué tal va su inglés?</h2>' +
        '<p class="q-hint">Tranqui, no hay respuesta mala: agrupamos por nivel.</p><ul class="opts">' + h + '</ul></div>';
    },
    seek: function () {
      return '<div class="scr scr-center" role="status">' +
        '<p class="big-emoji seek" aria-hidden="true">🔍</p>' +
        '<h2>Buscando grupos…</h2><ul class="checks">' +
          '<li style="--i:0"><span class="ck"></span>Peques de ' + st.age + ' años</li>' +
          '<li style="--i:1"><span class="ck"></span>Horario de ' + st.country.name + '</li>' +
          '<li style="--i:2"><span class="ck"></span>Nivel: ' + st.level[2].toLowerCase() + '</li></ul></div>';
    },
    results: function () {
      if (!slots.length) {
        return '<div class="scr scr-center">' +
          '<p class="big-emoji" aria-hidden="true">🗓️</p>' +
          '<h2>Estamos abriendo un grupo nuevo</h2>' +
          '<p>Ahora mismo no hay un grupo abierto para <b>' + st.age + ' años</b> en un horario cómodo para ' + st.country.name + ', pero abrimos grupos nuevos cada mes.</p>' +
          '<a class="btn btn-primary btn-lg btn-block" data-reserve href="' + waLink(msg('Me gustaría que me aviséis cuando abra un grupo.')) + '" target="_blank" rel="noopener">Avísame por WhatsApp <span class="arrow" aria-hidden="true">→</span></a></div>';
      }
      var h = slots.map(function (s, k) {
        return '<li><button class="opt slot" type="button" style="--i:' + k + '" data-slot="' + k + '"' + pressed(st.slot === s) + '>' +
          '<span class="slot-radio" aria-hidden="true"><span class="ck"></span></span>' +
          '<span class="slot-main"><span class="slot-days">' + s.days + '</span><span class="slot-time">' + s.time + '</span></span>' +
          (s.g.spots ? '<span class="slot-tag">Quedan ' + s.g.spots + ' cupos</span>' : '') + '</button></li>';
      }).join('');
      return '<div class="scr">' +
        '<span class="kicker k-grass">🎉 ¡Hay cupo!</span>' +
        '<h2>Encontramos un grupo disponible para tu peque</h2>' +
        '<p>' + (slots.length > 1 ? 'Elige el que más te guste.' : 'Tócalo para apartar el cupo.') + ' <span class="tz-note">Horarios en hora de ' + st.country.name + '.</span></p>' +
        '<ul class="opts slots">' + h + '</ul>' +
        '<a class="btn btn-primary btn-lg btn-block" id="reserve" data-reserve target="_blank" rel="noopener" aria-disabled="true">Reservar por WhatsApp <span class="arrow" aria-hidden="true">→</span></a>' +
        '<p class="fineprint center">Te confirmamos el cupo por WhatsApp. <a class="link-under" data-reserve href="' + waLink(msg('Ninguno de estos horarios me viene bien, ¿hay otras opciones?')) + '" target="_blank" rel="noopener">¿Ninguno te va bien?</a></p></div>';
    },
    thanks: function () {
      return '<div class="scr scr-center">' +
        '<p class="big-emoji party" aria-hidden="true">🥳</p>' +
        '<h2>¡Gracias! Ya casi está</h2>' +
        '<p>Envía el mensaje que te dejamos escrito en WhatsApp y te respondemos enseguida para confirmar el cupo.</p>' +
        (st.slot ? '<p class="recap"><span aria-hidden="true">🗓️</span> ' + st.slot.days + ' · ' + st.slot.time + '</p>' : '') +
        '<div class="end-actions">' +
          '<a class="btn btn-primary btn-lg btn-block" href="' + waLink('¡Hola! Tengo una pregunta sobre LET Academy.') + '" target="_blank" rel="noopener">💬 Contáctanos</a>' +
          '<a class="btn btn-outline btn-lg btn-block" href="/">Seguir explorando</a></div>' +
        (st.sent ? '<p class="fineprint">¿No se abrió WhatsApp? <a class="link-under" href="' + st.sent + '" target="_blank" rel="noopener">Tócalo aquí</a></p>' : '') + '</div>';
    }
  };

  /* ---------- WhatsApp message ---------- */
  function msg(tail) {
    return '¡Hola! 👋 Acabo de hacer el test de cupo en la web.\n\n' +
      '🎂 Edad: ' + st.age + ' años\n' +
      '🌎 País: ' + st.country.name + '\n' +
      '📚 Nivel: ' + st.level[2] +
      (plan === 'completo' ? '\n⭐ Me interesa el Plan Completo' : '') +
      '\n\n' + tail;
  }
  function waLink(text) { return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text); }
  function slotMsg(s) {
    return msg('Quiero reservar este horario: ' + s.days.toLowerCase() + ' a las ' + s.time + ' (hora de ' + st.country.name + ').\n' +
      '(Ref. LET: ' + s.g.days.map(function (d) { return DAY_ES[d]; }).join('/') + ' ' + s.g.time + ', ' + TEACHER_TZ + ')');
  }

  /* ---------- Navigation: every screen is a history entry, so the phone's back button steps back a question ---------- */
  function ready(s) {
    var need = { q2: 'age', q3: 'country', seek: 'level', results: 'level', thanks: 'level' }[s];
    return !need || st[need] != null;
  }
  function go(s, push) {
    if (!ready(s)) s = 'intro';
    clearTimeout(seekTimer);
    var back = ORDER.indexOf(s) < ORDER.indexOf(current);
    current = s;
    card.innerHTML = VIEWS[s]();
    if (back) card.firstElementChild.classList.add('back');
    if (push) history.pushState({ s: s }, '');
    if (push == null) return; // first paint: no scroll, no focus jump
    card.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    var h = card.querySelector('h1,h2');
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
    if (s === 'seek') seekTimer = setTimeout(function () { go('results', false); history.replaceState({ s: 'results' }, ''); }, reduce ? 300 : 1700);
    if (s === 'results') track('cupo_results', { found: slots.length });
    if (s === 'thanks') burstFrom(card.querySelector('.big-emoji'));
  }
  history.replaceState({ s: 'intro' }, '');
  addEventListener('popstate', function (e) {
    var s = (e.state && e.state.s) || 'intro';
    go(s === 'seek' ? 'q3' : s, false);
  });

  function pick(btn, key, value, next) {
    st[key] = value;
    card.querySelectorAll('[aria-pressed]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
    btn.classList.add('pop');
    // Fill the bar for the step just answered before the next screen arrives.
    var bar = card.querySelector('.hud-bar i');
    if (bar) bar.style.transform = 'scaleX(' + Math.min(ORDER.indexOf(next) - 1, 3) / 3 + ')';
    setTimeout(function () { go(next, true); }, reduce ? 0 : 320);
  }

  card.addEventListener('click', function (e) {
    var b = e.target.closest('button,a');
    if (!b) return;
    var d = b.dataset;
    if (d.go) { go(d.go, true); if (d.go === 'q1') track('cupo_start'); }
    else if ('back' in d) history.back();
    else if (d.age) pick(b, 'age', +d.age, 'q2');
    else if (d.country) {
      var c = COUNTRIES[+d.country];
      pick(b, 'country', { name: c[0], cc: c[2], tz: c[3].indexOf(HERE) >= 0 ? HERE : c[3][0] }, 'q3');
    }
    else if (d.level) {
      st.slot = null;
      pick(b, 'level', LEVELS[+d.level], 'seek');
      slots = match(st.age, st.level[0], st.country, new Date());
    }
    else if (d.slot) {
      st.slot = slots[+d.slot];
      card.querySelectorAll('.slot').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var r = document.getElementById('reserve');
      r.href = waLink(slotMsg(st.slot));
      r.removeAttribute('aria-disabled');
      r.classList.add('pop');
      r.addEventListener('animationend', function () { r.classList.remove('pop'); }, { once: true });
    }
    else if ('reserve' in d) {
      if (b.getAttribute('aria-disabled')) { e.preventDefault(); card.querySelector('.slots').classList.add('shake'); setTimeout(function () { card.querySelector('.slots').classList.remove('shake'); }, 500); return; }
      st.sent = b.href;
      track('Lead');
      setTimeout(function () { go('thanks', true); }, 200);
    }
  });

  /* ---------- Analytics: no-ops until GA4 / Meta Pixel are on the page ---------- */
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name === 'Lead' ? 'generate_lead' : name, params);
    if (typeof window.fbq === 'function') window.fbq(name === 'Lead' ? 'track' : 'trackCustom', name, params);
  }

  /* ---------- Confetti (same look as the home page) ---------- */
  var COLORS = ['#FF4D8D', '#FF7A3D', '#FFC93D', '#6CCB4F', '#4AA8FF', '#7B61FF'];
  function burstFrom(el) {
    if (reduce || !el || !Element.prototype.animate) return;
    var r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    for (var k = 0; k < 30; k++) {
      var s = document.createElement('span');
      s.className = 'confetti';
      s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;background:' + COLORS[k % COLORS.length];
      document.body.appendChild(s);
      var ang = Math.random() * Math.PI * 2, v = 50 + Math.random() * 180;
      var dx = Math.cos(ang) * v, dy = Math.sin(ang) * v - 70, rot = Math.random() * 720 - 360;
      s.animate([
        { transform: 'translate(-50%,-50%)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) rotate(' + rot / 2 + 'deg)', opacity: 1, offset: 0.45 },
        { transform: 'translate(calc(-50% + ' + dx * 1.2 + 'px),calc(-50% + ' + (dy + 180) + 'px)) rotate(' + rot + 'deg)', opacity: 0 }
      ], { duration: 1000 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = s.remove.bind(s);
    }
  }

  go('intro');
})();
