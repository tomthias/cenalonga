/* ============================================================
   CenaLonga — interactions
   ============================================================ */
(function () {
  'use strict';

  // ---- Event configuration -------------------------------------------------
  var CFG = {
    openAt:  new Date('2026-06-20T00:00:00'), // prenotazioni aprono
    closeAt: new Date('2026-07-02T23:59:59'), // prenotazioni chiudono
    eventAt: new Date('2026-07-03T20:30:00'), // la cena
    eventbriteUrl: 'https://www.eventbrite.it/'  // PLACEHOLDER — sostituire con il link reale
  };

  // booking state can be forced for preview via the Tweaks panel:
  // window.__cenaOverride = 'auto' | 'before' | 'open' | 'closed'
  window.__cenaOverride = window.__cenaOverride || 'auto';

  function now() { return new Date(); }

  function resolveState() {
    var o = window.__cenaOverride;
    if (o && o !== 'auto') return o;
    var t = now().getTime();
    if (t < CFG.openAt.getTime())  return 'before';
    if (t <= CFG.closeAt.getTime()) return 'open';
    return 'closed';
  }

  // ---- Countdown math -------------------------------------------------------
  function diffParts(target) {
    var ms = Math.max(0, target.getTime() - now().getTime());
    var d = Math.floor(ms / 86400000);
    var h = Math.floor((ms % 86400000) / 3600000);
    var m = Math.floor((ms % 3600000) / 60000);
    var s = Math.floor((ms % 60000) / 1000);
    return { d: d, h: h, m: m, s: s, ms: ms };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // ---- Render booking module ------------------------------------------------
  var bookingEl = document.querySelector('.booking');
  var statusTextEl = document.getElementById('b-status-text');
  var headlineEl = document.getElementById('b-headline');
  var subEl = document.getElementById('b-sub');
  var cdEl = document.getElementById('b-countdown');
  var cdCapEl = document.getElementById('b-countdown-cap');
  var ctaEl = document.getElementById('b-cta');
  var noteEl = document.getElementById('b-note');

  function renderCountdown(el, target) {
    var p = diffParts(target);
    el.innerHTML =
      unit(p.d, 'giorni') + sep() +
      unit(pad(p.h), 'ore') + sep() +
      unit(pad(p.m), 'min') + sep() +
      unit(pad(p.s), 'sec');
    function unit(v, l) {
      return '<div class="cd-unit"><span class="num">' + v + '</span><span class="lab">' + l + '</span></div>';
    }
    function sep() { return '<span class="cd-sep">:</span>'; }
  }

  function fmtDate(dt) {
    var giorni = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
    var mesi = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
    return giorni[dt.getDay()] + ' ' + dt.getDate() + ' ' + mesi[dt.getMonth()];
  }

  function renderBooking() {
    if (!bookingEl) return;
    var state = resolveState();
    bookingEl.classList.remove('is-before', 'is-open', 'is-closed');

    if (state === 'before') {
      bookingEl.classList.add('is-before');
      statusTextEl.textContent = 'Prenotazioni · aprono il 20 giugno';
      headlineEl.innerHTML = 'Le prenotazioni aprono<br><span class="script gold">tra poco</span>';
      subEl.innerHTML = 'I posti sono limitati. Le prenotazioni apriranno <b>sabato 20 giugno</b> e si chiuderanno il <b>2 luglio</b>: online su Eventbrite oppure di persona all’<b>Ufficio Turistico di Amandola</b>, senza costi di commissione. Torna qui o segnati la data.';
      cdCapEl.textContent = 'All\u2019apertura delle prenotazioni';
      cdEl.style.display = '';
      renderCountdown(cdEl, CFG.openAt);
      ctaEl.textContent = 'Prenotazioni dal 20 giugno';
      ctaEl.setAttribute('aria-disabled', 'true');
      ctaEl.removeAttribute('href');
      ctaEl.classList.remove('btn-primary'); ctaEl.classList.add('btn-ghost');
      noteEl.innerHTML = 'Online su Eventbrite, tramite <a href="https://cenalongamandola.com">cenalongamandola.com</a>, oppure all’Ufficio Turistico di Amandola, senza commissioni.';
    } else if (state === 'open') {
      bookingEl.classList.add('is-open');
      statusTextEl.textContent = 'Prenotazioni aperte';
      headlineEl.innerHTML = 'Prenota il tuo posto<br><span class="script gold">alla tavolata</span>';
      subEl.innerHTML = 'Le prenotazioni sono <b>aperte</b> e si chiudono il <b>2 luglio</b>. Posti limitati: meglio non aspettare. Prenoti online su Eventbrite oppure di persona all’<b>Ufficio Turistico di Amandola</b>, senza costi di commissione.';
      cdCapEl.textContent = 'Alla chiusura delle prenotazioni';
      cdEl.style.display = '';
      renderCountdown(cdEl, CFG.closeAt);
      ctaEl.innerHTML = 'Prenota su Eventbrite <span aria-hidden="true">\u2192</span>';
      ctaEl.removeAttribute('aria-disabled');
      ctaEl.setAttribute('href', CFG.eventbriteUrl);
      ctaEl.setAttribute('target', '_blank');
      ctaEl.setAttribute('rel', 'noopener');
      ctaEl.classList.remove('btn-ghost'); ctaEl.classList.add('btn-primary');
      noteEl.innerHTML = 'Adulti 30€ · Bambini 15€ — su Eventbrite o all’Ufficio Turistico di Amandola, senza commissioni.';
    } else {
      bookingEl.classList.add('is-closed');
      statusTextEl.textContent = 'Prenotazioni chiuse';
      headlineEl.innerHTML = 'Ci vediamo<br><span class="script gold">sul corso</span>';
      subEl.innerHTML = 'Le prenotazioni online sono chiuse. Per disponibilità dell\u2019ultimo minuto scrivici: ci troviamo in <b>Via Indipendenza</b>, ad Amandola.';
      cdCapEl.textContent = 'Alla cena';
      cdEl.style.display = '';
      renderCountdown(cdEl, CFG.eventAt);
      ctaEl.textContent = 'Prenotazioni chiuse';
      ctaEl.setAttribute('aria-disabled', 'true');
      ctaEl.removeAttribute('href');
      ctaEl.classList.remove('btn-primary'); ctaEl.classList.add('btn-ghost');
      noteEl.innerHTML = 'Scrivici su <a href="https://cenalongamandola.com">cenalongamandola.com</a>.';
    }
  }

  // ---- Hero pill (days to the dinner) --------------------------------------
  var heroPill = document.getElementById('hero-count');
  function renderHeroPill() {
    if (!heroPill) return;
    var p = diffParts(CFG.eventAt);
    if (p.ms <= 0) { heroPill.innerHTML = '<b>È stasera!</b> &middot; ci vediamo sul corso'; return; }
    heroPill.innerHTML = 'Mancano <b>' + p.d + '</b> giorni &middot; <b>' + pad(p.h) + ':' + pad(p.m) + ':' + pad(p.s) + '</b> alla cena';
  }

  // ---- header CTA mirror booking state -------------------------------------
  var headerCta = document.getElementById('header-cta');
  function renderHeaderCta() {
    if (!headerCta) return;
    var state = resolveState();
    if (state === 'open') {
      headerCta.textContent = 'Prenota';
      headerCta.setAttribute('href', CFG.eventbriteUrl);
      headerCta.setAttribute('target', '_blank'); headerCta.setAttribute('rel','noopener');
      headerCta.style.display = '';
    } else {
      headerCta.textContent = 'Prenota';
      headerCta.setAttribute('href', '#prenota');
      headerCta.removeAttribute('target');
      headerCta.style.display = '';
    }
  }

  // ---- tick -----------------------------------------------------------------
  function tick() { renderHeroPill(); if (bookingEl) { var s = resolveState(); var tgt = s === 'before' ? CFG.openAt : (s === 'open' ? CFG.closeAt : CFG.eventAt); if (cdEl && cdEl.style.display !== 'none') renderCountdown(cdEl, tgt); } }

  renderBooking();
  renderHeaderCta();
  renderHeroPill();
  setInterval(tick, 1000);

  // expose for tweaks
  window.__cenaRefresh = function () { renderBooking(); renderHeaderCta(); renderHeroPill(); };

  // ---- header scrolled ------------------------------------------------------
  var header = document.querySelector('.site-header');
  function onScroll() { if (window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- reveal on scroll -----------------------------------------------------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // ---- FAQ accordion --------------------------------------------------------
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var ans = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('open');
      if (isOpen) { item.classList.remove('open'); ans.style.maxHeight = '0px'; }
      else { item.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
    });
  });
  window.addEventListener('resize', function () {
    document.querySelectorAll('.faq-item.open .faq-a').forEach(function (a) { a.style.maxHeight = a.scrollHeight + 'px'; });
  });
})();
