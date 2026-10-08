/* LET Academy — /cupo placement funnel.
   Intro → 3 taps → groups that fit, shown in the family's own clock → WhatsApp.
   The answers and the chosen slot travel inside the WhatsApp message (first
   line of the chat in Kommo) and, once LEAD_URL is set, are POSTed there too. */
(function () {
  'use strict';

  /* ================= EDIT HERE: open groups =================
     time + days are on YOUR clock (TEACHER_TZ). days: 1 = lunes … 7 = domingo.
     ages (optional): [min, max], both included. Leave it out and any age fits.
     levels (optional): which answers to question 3 fit ('cero', 'basico',
       'avanzado'). Leave it out and any level fits.
     spots (optional): shows "Quedan N cupos" on the card.
     Every group is offered whatever the family's local hour is. */
  var TEACHER_TZ = 'Europe/Rome';
  var CLASS_MIN = 60;
  var GROUPS = [
    { days: [1, 3, 5], time: '23:00' },
    { days: [1, 3, 5], time: '04:00' }
  ];
  var WA_PHONE = '393792913474';
  var LEAD_URL = 'https://letjunior-hub.vercel.app/api/hooks/form/teumO-UI4q1W6baW9_A7te8fT5lZ0DsJ'; // empty = nothing is sent
  // Phone validation + country codes (lazy-loaded when the results screen shows).
  var PHONE_LIB = {
    src: 'https://cdn.jsdelivr.net/npm/libphonenumber-js@1.13.14/bundle/libphonenumber-mobile.js',
    integrity: 'sha384-fLAc0PFtqy25CzgKfiXfVyT/FzLWJW4GrwSfkpV69MGBJojd6Zz0/1qGuctYcrxg'
  };

  // [name, flag, region for date formatting, time zones: first one is the default]
  var COUNTRIES = [
    ['España', '🇪🇸', 'ES', ['Europe/Madrid', 'Atlantic/Canary']],
    ['Italia', '🇮🇹', 'IT', ['Europe/Rome']],
    ['Colombia', '🇨🇴', 'CO', ['America/Bogota']],
    ['Panamá', '🇵🇦', 'PA', ['America/Panama']],
    ['México', '🇲🇽', 'MX', ['America/Mexico_City', 'America/Monterrey', 'America/Merida', 'America/Cancun', 'America/Chihuahua', 'America/Mazatlan', 'America/Hermosillo', 'America/Tijuana']],
    ['Estados Unidos', '🇺🇸', 'US', ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles', 'America/Detroit', 'America/Indiana/Indianapolis', 'America/Boise', 'America/Anchorage', 'Pacific/Honolulu']]
  ];
  var SERVED = 'España, Italia, Colombia, Panamá, México y Estados Unidos';
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
    var hm = new Intl.DateTimeFormat(loc, { timeZone: place.tz, hour: 'numeric', minute: '2-digit' }).format;
    return {
      g: g,
      days: joinEs(dates.map(new Intl.DateTimeFormat(loc, { timeZone: place.tz, weekday: 'long' }).format)),
      time: hm(dates[0]) + ' – ' + hm(new Date(+dates[0] + CLASS_MIN * 60000)),
      mins: lp.hour * 60 + +lp.minute
    };
  }

  function match(age, level, place, now) {
    var fit = GROUPS.filter(function (g) { return !g.ages || (age >= g.ages[0] && age <= g.ages[1]); });
    var byLevel = fit.filter(function (g) { return !g.levels || g.levels.indexOf(level) >= 0; });
    if (byLevel.length) fit = byLevel;
    return fit.map(function (g) { return describe(g, place, now); })
      .sort(function (a, b) { return a.mins - b.mins; })
      .slice(0, 3);
  }

  if (typeof document === 'undefined') { module.exports = { nextSlot: nextSlot, match: match, GROUPS: GROUPS }; return; }

  /* ---------- State + screens ---------- */
  var card = document.getElementById('quiz');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var plan = new URLSearchParams(location.search).get('plan');
  var ORDER = ['intro', 'q1', 'q2', 'q3', 'seek', 'results', 'contact', 'thanks', 'nocupo'];
  var MIN_AGE = 7, MAX_AGE = 14; // outside this: kind exit, no WhatsApp, no Lead
  var WA_SHOWN = '+39 379 291 3474';
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
  function yrs(n) { return n + (n === 1 ? ' año' : ' años'); }
  function pressed(on) { return ' aria-pressed="' + !!on + '"'; }

  var PRICE = '<p class="recap"><span aria-hidden="true">💵</span> <b>50 USD/mes</b>, todo incluido · 3 clases en vivo por semana</p>';
  // Under the WhatsApp button: in-app browsers sometimes fail the wa.me hand-off.
  var WA_HELP = '<p class="fineprint center">¿No se abrió WhatsApp? Escríbenos al <b>' + WA_SHOWN + '</b> ' +
    '<button class="link-under" type="button" data-copy-wa>Copiar número</button><br>' +
    'Es nuestro número de Italia, donde está el equipo: escribir por WhatsApp es gratis desde cualquier país.</p>';

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
      var other = st.age != null && (st.age < 7 || st.age > 14); // an age typed in the "otra edad" box
      return '<div class="scr">' + hud(1) + '<h2 class="lesson-q">¿Cuántos años tiene tu peque?</h2><ul class="opts ages">' + h + '</ul>' +
        '<button class="opt age-other" type="button" data-other aria-expanded="' + other + '" aria-controls="age-form">Otra edad</button>' +
        '<form class="age-form" id="age-form" novalidate' + (other ? '' : ' hidden') + '><label for="age-in">Edad de tu peque</label>' +
          '<div class="age-row"><input id="age-in" type="text" inputmode="numeric" maxlength="2" autocomplete="off" placeholder="Ej. 5" value="' + (other ? st.age : '') + '" aria-describedby="age-err">' +
          '<button class="btn btn-primary" type="submit">Seguir <span class="arrow" aria-hidden="true">→</span></button></div>' +
          '<p class="fld-err" id="age-err" role="alert" hidden></p></form></div>';
    },
    nocupo: function () {
      var pais = st.out === 'pais';
      return '<div class="scr scr-center">' +
        '<p class="big-emoji" aria-hidden="true">🌱</p>' +
        '<h2>¡Gracias por pensar en nosotros!</h2>' +
        (pais
          ? '<p>Por ahora nuestros horarios de clase funcionan para familias en <b>' + SERVED + '</b>, así que todavía no tenemos un grupo para tu país.</p>'
          : '<p>Por ahora nuestros grupos con cupo son para peques de <b>' + MIN_AGE + ' a ' + MAX_AGE + ' años</b>, así que todavía no tenemos un lugar para peques de ' + yrs(st.age) + '.</p>' +
            '<p>Los grupos de otras edades están llenos.</p>') +
        '<p>Cuando abramos uno nuevo lo anunciaremos aquí en la web.</p>' +
        '<div class="end-actions">' +
          '<button class="btn btn-outline btn-lg btn-block" type="button" data-back>' + (pais ? 'Cambiar el país' : 'Cambiar la edad') + '</button>' +
          '<a class="btn btn-outline btn-lg btn-block" href="/">Volver al inicio</a></div></div>';
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
          '<li style="--i:0"><span class="ck"></span>Peques de ' + yrs(st.age) + '</li>' +
          '<li style="--i:1"><span class="ck"></span>Horario de ' + st.country.name + '</li>' +
          '<li style="--i:2"><span class="ck"></span>Nivel: ' + st.level[2].toLowerCase() + '</li></ul></div>';
    },
    results: function () {
      if (!slots.length) {
        return '<div class="scr scr-center">' +
          '<p class="big-emoji" aria-hidden="true">🗓️</p>' +
          '<h2>Estamos abriendo un grupo nuevo</h2>' +
          '<p>Ahora mismo no hay un grupo abierto para <b>' + yrs(st.age) + '</b> en un horario cómodo para ' + st.country.name + ', pero abrimos grupos nuevos cada mes.</p>' +
          PRICE +
          '<button class="btn btn-primary btn-lg btn-block" type="button" data-reserve="avisame">Avísame por WhatsApp <span class="arrow" aria-hidden="true">→</span></button></div>';
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
        '<ul class="opts slots">' + h + '</ul>' + PRICE +
        '<button class="btn btn-primary btn-lg btn-block" type="button" id="reserve" data-reserve="reservar"' + (st.slot ? '' : ' aria-disabled="true"') + '>Reservar mi cupo <span class="arrow" aria-hidden="true">→</span></button>' +
        '<p class="fineprint center">Te confirmamos el cupo por WhatsApp. <button class="link-under" type="button" data-reserve="otro_horario">¿Ninguno te va bien?</button></p></div>';
    },
    contact: function () {
      var c = ccOf(st.cc);
      var plain = !c; // phone library didn't load: one plain field, number typed with its "+"
      return '<form class="scr" novalidate>' +
        '<div class="lesson-hud q-hud"><button class="q-back" type="button" data-back aria-label="Volver">‹</button></div>' +
        '<span class="kicker k-grape">🙌 Último paso</span>' +
        '<h2>¡Ya casi estamos!</h2>' +
        '<p>Déjanos tu nombre y tu WhatsApp para confirmarte el cupo.</p>' +
        '<div class="fld"><label for="c-name">Tu nombre</label>' +
          '<input id="c-name" type="text" autocomplete="name" maxlength="80" placeholder="Nombre y apellido" value="' + esc(st.name || '') + '" aria-describedby="c-name-err">' +
          '<p class="fld-err" id="c-name-err" role="alert" hidden></p></div>' +
        '<div class="fld"><label for="c-tel">Tu WhatsApp</label>' +
          '<div class="tel">' + (plain ? '' :
            '<div class="cc"><button class="cc-btn" id="cc-btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Prefijo del país: ' + esc(c.name) + ' +' + c.code + '">' +
              '<span class="flag" aria-hidden="true">' + c.flag + '</span><b>+' + c.code + '</b><i aria-hidden="true">▾</i></button>' +
              '<div class="cc-pop" hidden><input class="cc-q" type="text" role="combobox" aria-expanded="true" aria-controls="cc-list" aria-autocomplete="list" aria-label="Buscar país o prefijo" placeholder="Buscar país o prefijo" autocomplete="off" autocapitalize="off" spellcheck="false">' +
              '<ul class="cc-list" id="cc-list" role="listbox" aria-label="Países"></ul></div></div>') +
            '<input id="c-tel" type="tel" inputmode="tel" autocomplete="' + (plain ? 'tel' : 'tel-national') + '" placeholder="' + (plain ? '+34 600 123 456' : 'Tu número') + '" value="' + esc(st.tel || '') + '" aria-describedby="c-tel-hint c-tel-err"></div>' +
          '<p class="fld-hint" id="c-tel-hint">Un móvil con WhatsApp: ahí te escribiremos.</p>' +
          '<p class="fld-err" id="c-tel-err" role="alert" hidden></p></div>' +
        '<button class="btn btn-primary btn-lg btn-block" type="submit" id="c-go">Enviar <span class="arrow" aria-hidden="true">→</span></button>' +
        '<p class="fineprint center">Solo usamos tus datos para confirmarte el cupo. <a class="link-under" href="privacidad" target="_blank" rel="noopener">Privacidad</a></p></form>';
    },
    thanks: function () {
      return '<div class="scr scr-center">' +
        '<p class="big-emoji party" aria-hidden="true">🥳</p>' +
        '<h2>¡Gracias, ' + esc(st.name) + '!</h2>' +
        '<p>Ya tenemos tus datos y te escribiremos por WhatsApp para confirmar el cupo. Si quieres, puedes escribirnos tú ahora.</p>' +
        (st.slot ? '<p class="recap"><span aria-hidden="true">🗓️</span> ' + st.slot.days + ' · ' + st.slot.time + '</p>' : '') +
        '<div class="end-actions">' +
          '<a class="btn btn-primary btn-lg btn-block" href="' + waLink(hello()) + '" target="_blank" rel="noopener">💬 Enviar un mensaje</a>' +
          '<a class="btn btn-outline btn-lg btn-block" href="/">Seguir explorando</a></div>' + WA_HELP + '</div>';
    }
  };

  /* ---------- Phone: country codes + validation (libphonenumber, loaded on demand) ---------- */
  var lib = null, libP, ccList = [];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function flag(cc) { return String.fromCodePoint.apply(null, cc.split('').map(function (c) { return 127397 + c.charCodeAt(0); })); }
  function loadLib() {
    return libP || (libP = new Promise(function (done) {
      var s = document.createElement('script');
      s.src = PHONE_LIB.src; s.integrity = PHONE_LIB.integrity; s.crossOrigin = 'anonymous';
      s.onload = function () {
        try {
          var l = window.libphonenumber, dn = new Intl.DisplayNames(['es'], { type: 'region' });
          ccList = l.getCountries().map(function (cc) {
            var n = dn.of(cc);
            return { cc: cc, name: n, code: l.getCountryCallingCode(cc), flag: flag(cc), key: norm(n + ' ' + cc) };
          }).sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
          lib = l;
        } catch (x) { ccList = []; } // old browser: falls back to the plain "+34…" field
        done();
      };
      s.onerror = function () { done(); };
      document.head.appendChild(s);
    }));
  }
  function ccOf(cc) { return ccList.filter(function (c) { return c.cc === cc; })[0]; }
  // Default prefix: the country picked in question 2, else the phone's own region, else Spain.
  function defaultCc() {
    var loc = ((navigator.language || '').split('-')[1] || '').toUpperCase();
    return [st.country.cc, loc, 'ES'].filter(function (cc) { return cc && ccOf(cc); })[0];
  }
  // The number box → { valid, e164, why }. Valid = right length AND the right shape for a mobile in that country.
  // (Can't prove the number is on WhatsApp: that needs a paid, unofficial service.)
  function readPhone(raw) {
    var flat = raw.replace(/[\s().-]/g, '');
    if (!lib) return { valid: /^\+\d{8,15}$/.test(flat), e164: flat };
    var p = lib.parsePhoneNumberFromString(raw, st.cc);
    // Argentines write mobiles as "11 2345 6789"; the international form needs a 9 after +54.
    if (st.cc === 'AR' && !(p && p.isValid())) p = lib.parsePhoneNumberFromString('+549' + raw.replace(/\D/g, '').replace(/^0+/, '')) || p;
    var t = p && p.getType();
    if (p && p.isValid() && (!t || t === 'MOBILE' || t === 'FIXED_LINE_OR_MOBILE')) return { valid: true, e164: p.number };
    var len = lib.validatePhoneNumberLength(raw, st.cc); // TOO_SHORT | TOO_LONG | INVALID_LENGTH | undefined (length ok)
    return { valid: false, why: len === 'TOO_SHORT' ? 'short' : len === 'TOO_LONG' ? 'long' : p && p.isValid() ? 'landline' : 'shape' };
  }

  /* ---------- WhatsApp message ---------- */
  function waLink(text) { return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text); }
  function hello() {
    var s = st.choice === 'reservar' && st.slot;
    return 'Hola Sofia, vengo de la web de LET Junior. Soy ' + st.name + '. Mi peque tiene ' + yrs(st.age) +
      ', estamos en ' + st.country.name + ' y su nivel de inglés es: ' + st.level[2].toLowerCase() + '.' +
      (s ? ' Me interesa el horario: ' + s.days.toLowerCase() + ', ' + s.time + '.' : '') + ' ¿Hay cupo?';
  }

  /* ---------- Navigation: every screen is a history entry, so the phone's back button steps back a question ---------- */
  function ready(s) {
    var need = { nocupo: 'out', q2: 'age', q3: 'country', seek: 'level', results: 'level', contact: 'choice', thanks: 'level' }[s];
    return !need || st[need] != null;
  }
  function go(s, push) {
    if (!ready(s)) s = 'intro';
    clearTimeout(seekTimer);
    var back = ORDER.indexOf(s) < ORDER.indexOf(current);
    current = s;
    if (push == null && s === 'intro' && card.querySelector('[data-static]')) return; // already in the HTML
    card.innerHTML = VIEWS[s]();
    if (back) card.firstElementChild.classList.add('back');
    if (push) history.pushState({ s: s }, '');
    if (push == null) return; // first paint: no scroll, no focus jump
    card.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    var h = card.querySelector('h1,h2');
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
    if (s === 'seek') seekTimer = setTimeout(function () { go('results', false); history.replaceState({ s: 'results' }, ''); }, reduce ? 300 : 1700);
    if (s === 'results') { track('QuizResults', { found: slots.length }); loadLib(); }
    if (s === 'nocupo') track('LeadNoCalifica', { motivo: st.out, edad: st.age, pais: st.country ? st.country.name : '' });
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
    if (d.go) { go(d.go, true); if (d.go === 'q1') track('QuizStart', { from: 'cupo' }); }
    else if ('copyWa' in d) copyWa(b);
    else if ('back' in d) history.back();
    else if (d.age) { st.out = null; step(1, 'edad', +d.age); pick(b, 'age', +d.age, 'q2'); }
    else if ('other' in d) {
      var f = document.getElementById('age-form'), open = f.hidden;
      f.hidden = !open; b.setAttribute('aria-expanded', open);
      card.querySelectorAll('.age').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      if (open) document.getElementById('age-in').focus();
    }
    else if (d.country) {
      var c = COUNTRIES[+d.country];
      st.cc = null;
      step(2, 'pais', c[0]);
      if (!c[2]) { st.country = null; st.out = 'pais'; return go('nocupo', true); }
      pick(b, 'country', { name: c[0], cc: c[2], tz: c[3].indexOf(HERE) >= 0 ? HERE : c[3][0] }, 'q3');
    }
    else if (d.level) {
      st.slot = null;
      step(3, 'nivel', LEVELS[+d.level][0]);
      pick(b, 'level', LEVELS[+d.level], 'seek');
      slots = match(st.age, st.level[0], st.country, new Date());
    }
    else if (d.slot) {
      st.slot = slots[+d.slot];
      card.querySelectorAll('.slot').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var r = document.getElementById('reserve');
      r.removeAttribute('aria-disabled');
      r.classList.add('pop');
      r.addEventListener('animationend', function () { r.classList.remove('pop'); }, { once: true });
    }
    else if ('reserve' in d) {
      if (b.getAttribute('aria-disabled')) { e.preventDefault(); card.querySelector('.slots').classList.add('shake'); setTimeout(function () { card.querySelector('.slots').classList.remove('shake'); }, 500); return; }
      st.choice = d.reserve;
      loadLib().then(function () { st.cc = st.cc || defaultCc(); go('contact', true); });
    }
    else if (b.id === 'cc-btn') toggleCc();
  });

  /* ---------- "Ya casi estamos": name + number → lead → thanks (they choose to message us) ---------- */
  function fail(id, text) {
    var e = document.getElementById(id + '-err'), i = document.getElementById(id);
    e.textContent = text; e.hidden = false; i.setAttribute('aria-invalid', 'true');
    var t = card.querySelector('.tel'); if (t && id === 'c-tel') t.classList.add('bad');
    i.focus();
  }
  function clearErr(id) {
    var e = document.getElementById(id + '-err'), i = document.getElementById(id);
    e.hidden = true; i.removeAttribute('aria-invalid');
    var t = card.querySelector('.tel'); if (t && id === 'c-tel') t.classList.remove('bad');
  }
  var PHONE_ERR = {
    short: 'Le faltan dígitos a ese número{c}. Revísalo.',
    long: 'Ese número tiene dígitos de más{c}. Revísalo.',
    landline: 'Ese parece un teléfono fijo{c}. Escribe un móvil con WhatsApp.',
    shape: 'Ese número no parece un móvil válido{c}. Revisa el prefijo y los dígitos.'
  };

  card.addEventListener('submit', function (e) {
    e.preventDefault();
    if (e.target.id === 'age-form') {
      var v = document.getElementById('age-in').value, n = +v;
      if (!/^\d{1,2}$/.test(v) || n < 1) {
        var er = document.getElementById('age-err');
        er.textContent = 'Escribe la edad con uno o dos números.'; er.hidden = false;
        return document.getElementById('age-in').focus();
      }
      st.age = n;
      step(1, 'edad', n);
      st.out = n < MIN_AGE || n > MAX_AGE ? 'edad' : null;
      return go(st.out ? 'nocupo' : 'q2', true);
    }
    var name = document.getElementById('c-name').value.trim(), tel = document.getElementById('c-tel').value.trim();
    if (name.length < 2) return fail('c-name', 'Escribe tu nombre para que sepamos con quién hablar.');
    var p = readPhone(tel), c = ccOf(st.cc);
    if (!tel) return fail('c-tel', 'Escribe tu número de WhatsApp.');
    if (!p.valid) return fail('c-tel', PHONE_ERR[p.why || 'shape'].replace('{c}', c ? ' para ' + c.name + ' (+' + c.code + ')' : ''));
    st.name = name; st.tel = tel; st.phone = p.e164;
    track('Lead', { edad: st.age, pais: st.country.name, nivel: st.level[0], accion: st.choice }, { eventID: EVENT_ID });
    sendLead(st.choice);
    go('thanks', true);
  });

  card.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'age-in') { t.value = t.value.replace(/\D/g, ''); document.getElementById('age-err').hidden = true; }
    else if (t.id === 'c-name') clearErr('c-name');
    else if (t.id === 'c-tel') {
      clearErr('c-tel');
      if (!lib) return;
      var v = t.value, atEnd = t.selectionStart === v.length;
      if (v.charAt(0) === '+') { // pasted "+34 600…": switch the prefix to match
        var p = lib.parsePhoneNumberFromString(v);
        if (p && p.country && p.country !== st.cc) { st.cc = p.country; setCc(); }
      }
      if (atEnd && v.charAt(0) !== '+') t.value = new lib.AsYouType(st.cc).input(v);
    }
    else if (t.classList.contains('cc-q')) renderCc(t.value);
  });

  /* Country-code picker: button + searchable listbox (name, ISO code or dial code). */
  var ccView = [], ccAct = 0;
  function ccPop() { return card.querySelector('.cc-pop'); }
  function setCc() {
    var c = ccOf(st.cc), b = document.getElementById('cc-btn');
    b.querySelector('.flag').textContent = c.flag;
    b.querySelector('b').textContent = '+' + c.code;
    b.setAttribute('aria-label', 'Prefijo del país: ' + c.name + ' +' + c.code);
    clearErr('c-tel');
  }
  function renderCc(q) {
    var n = norm(q).replace(/^\+/, ''), digits = /^\d+$/.test(n);
    ccView = ccList.filter(function (c) { return !n || (digits ? String(c.code).indexOf(n) === 0 : c.key.indexOf(n) >= 0); });
    if (!n) ccView = ccView.filter(function (c) { return c.cc === st.cc; }).concat(ccView.filter(function (c) { return c.cc !== st.cc; }));
    ccAct = 0;
    document.getElementById('cc-list').innerHTML = ccView.length ? ccView.map(function (c, k) {
      return '<li class="cc-opt' + (k ? '' : ' act') + '" role="option" id="cc-o-' + c.cc + '" data-cc="' + c.cc + '" aria-selected="' + (c.cc === st.cc) + '">' +
        '<span class="flag" aria-hidden="true">' + c.flag + '</span><span class="cc-n">' + esc(c.name) + '</span><b>+' + c.code + '</b></li>';
    }).join('') : '<li class="cc-none" role="presentation">No encontramos ese país</li>';
    card.querySelector('.cc-q').setAttribute('aria-activedescendant', ccView.length ? 'cc-o-' + ccView[0].cc : '');
  }
  function moveCc(to) {
    if (!ccView.length) return;
    var opts = card.querySelectorAll('.cc-opt');
    opts[ccAct].classList.remove('act');
    ccAct = (to + ccView.length) % ccView.length;
    opts[ccAct].classList.add('act');
    opts[ccAct].scrollIntoView({ block: 'nearest' });
    card.querySelector('.cc-q').setAttribute('aria-activedescendant', opts[ccAct].id);
  }
  function toggleCc(open) {
    var pop = ccPop(), btn = document.getElementById('cc-btn');
    open = open == null ? pop.hidden : open;
    pop.hidden = !open;
    btn.setAttribute('aria-expanded', open);
    if (open) { var q = pop.querySelector('.cc-q'); q.value = ''; renderCc(''); q.focus(); }
  }
  function pickCc(cc) {
    st.cc = cc; setCc(); toggleCc(false);
    var t = document.getElementById('c-tel');
    if (t.value && t.value.charAt(0) !== '+') t.value = new lib.AsYouType(cc).input(t.value.replace(/\D/g, ''));
    t.focus();
  }
  card.addEventListener('click', function (e) {
    var o = e.target.closest('.cc-opt');
    if (o) pickCc(o.dataset.cc);
  });
  card.addEventListener('keydown', function (e) {
    if (!e.target.classList.contains('cc-q')) return;
    var k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); moveCc(ccAct + (k === 'ArrowDown' ? 1 : -1)); }
    else if (k === 'Enter') { e.preventDefault(); if (ccView.length) pickCc(ccView[ccAct].cc); }
    else if (k === 'Escape') { e.preventDefault(); toggleCc(false); document.getElementById('cc-btn').focus(); }
    else if (k === 'Tab') toggleCc(false);
  });
  document.addEventListener('click', function (e) {
    var pop = ccPop();
    if (pop && !pop.hidden && !e.target.closest('.cc')) toggleCc(false);
  });

  /* ---------- Lead to our own endpoint (fire-and-forget; WhatsApp stays the source of truth) ---------- */
  function sendLead(choice) {
    if (!LEAD_URL) return;
    var s = choice === 'reservar' ? st.slot : null;
    fetch(LEAD_URL, {
      method: 'POST', mode: 'cors', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({              // flat, as the Hub expects
        _form: 'Reserva de cupo',
        _hp: document.getElementById('hp').value, // honeypot: real visitors leave it empty
        'Nombre': st.name,
        'Teléfono': st.phone,             // E.164, e.g. +34600123456
        'Acción': choice,                 // reservar | otro_horario | avisame
        'Edad': st.age,
        'País': st.country.name,
        'Zona horaria': st.country.tz,
        'Nivel': st.level[2],
        'Plan': plan || '',
        'Horario (su hora)': s ? s.days + ', ' + s.time : '',
        'Horario (Italia)': s ? s.g.days.map(function (x) { return DAY_ES[x]; }).join('/') + ' ' + s.g.time : '',
        'Página': location.href,
        'Event ID': EVENT_ID              // same id as the pixel Lead, for a future server-side (CAPI) send
      })
    }).catch(function () {});
  }

  /* ---------- Analytics: no-ops until GA4 / Meta Pixel are on the page ---------- */
  function track(name, params, opts) {
    if (typeof window.gtag === 'function') window.gtag('event', name === 'Lead' ? 'generate_lead' : name, params);
    if (typeof window.fbq === 'function') window.fbq(name === 'Lead' ? 'track' : 'trackCustom', name, params || {}, opts || {});
  }
  var EVENT_ID = 'lead-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  var lastStep = 0;
  function step(n, question, answer) { lastStep = n; track('QuizStep', { step: n, question: question, answer: answer }); }
  // Started but left before the end. Best-effort: some browsers drop it on close.
  addEventListener('pagehide', function () {
    if (lastStep && current !== 'thanks' && current !== 'nocupo') track('QuizAbandon', { last_step: lastStep, screen: current });
  });
  function copyWa(b) {
    var done = function () { b.textContent = '¡Copiado!'; };
    if (navigator.clipboard) navigator.clipboard.writeText(WA_SHOWN).then(done, function () {}); else done();
    track('WhatsAppFallback', { page: 'cupo' });
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

  // Home-page age picker sends ?edad=N: that tap already answered Q1.
  var edad = +new URLSearchParams(location.search).get('edad');
  if (edad >= 1 && edad <= 99) {
    st.age = edad;
    history.replaceState({ s: 'q1' }, '');
    st.out = edad < MIN_AGE || edad > MAX_AGE ? 'edad' : null;
    var first = st.out ? 'nocupo' : 'q2';
    go(first);
    history.pushState({ s: first }, '');
    track('QuizStart', { from: 'hero_age' });
    step(1, 'edad', edad);
    if (first === 'nocupo') track('LeadNoCalifica', { motivo: 'edad', edad: edad, pais: '' });
  } else go('intro');
})();
