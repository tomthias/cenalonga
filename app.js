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
    // Eventbrite: incolla l'ID NUMERICO dell'evento (lo trovi nell'URL dell'evento
    // pubblicato: .../e/nome-evento-tickets-123456789 -> eventId = '123456789').
    // Se compilato, il checkout si apre in un pop-up sul sito. Se vuoto, si usa il link sotto.
    eventbriteEventId: '1992082521447',
    eventbriteUrl: 'https://www.eventbrite.it/e/biglietti-cenalonga-2026-1992082521447'  // link di riserva all'evento
  };

  // booking state can be forced for preview via the Tweaks panel:
  // window.__cenaOverride = 'auto' | 'before' | 'open' | 'closed'
  // Per anteprima si puo' forzare lo stato: 'open' mostra la prenotazione
  // attiva. 'auto' = comportamento reale (timer fino al 20 giugno, poi apre).
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
      headlineEl.innerHTML = 'Apriamo le prenotazioni<br><span class="script gold">tra poco</span>';
      subEl.innerHTML = 'I posti sono pochi. Apriamo le prenotazioni <b>sabato 20 giugno</b> e chiudiamo il <b>2 luglio</b>: online su Eventbrite, oppure di persona all’<b>Ufficio Turistico di Amandola</b>, senza commissioni. Torna qui o segnati la data.';
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
      subEl.innerHTML = 'Le prenotazioni sono <b>aperte</b> e chiudono il <b>2 luglio</b>. I posti sono pochi, meglio non aspettare. Prenoti online su Eventbrite, oppure di persona all’<b>Ufficio Turistico di Amandola</b>, senza commissioni.';
      cdCapEl.textContent = 'Alla chiusura delle prenotazioni';
      cdEl.style.display = '';
      renderCountdown(cdEl, CFG.closeAt);
      ctaEl.innerHTML = 'Prenota il tuo posto <span aria-hidden="true">\u2192</span>';
      ctaEl.removeAttribute('aria-disabled');
      ctaEl.removeAttribute('target');
      ctaEl.removeAttribute('rel');
      ctaEl.setAttribute('href', '#prenota');
      ctaEl.classList.remove('btn-ghost'); ctaEl.classList.add('btn-primary');
      noteEl.innerHTML = 'Adulti 30€ · Bambini 15€. Paghi su Eventbrite o all’Ufficio Turistico di Amandola, senza commissioni.';
    } else {
      bookingEl.classList.add('is-closed');
      statusTextEl.textContent = 'Prenotazioni chiuse';
      headlineEl.innerHTML = 'Ci vediamo<br><span class="script gold">sul corso</span>';
      subEl.innerHTML = 'Le prenotazioni online sono chiuse. Per un posto dell\u2019ultimo minuto scrivici: ci trovi in <b>Via Indipendenza</b>, ad Amandola.';
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
    headerCta.textContent = 'Prenota';
    headerCta.setAttribute('href', '#prenota');
    headerCta.removeAttribute('target'); headerCta.removeAttribute('rel');
    headerCta.style.display = '';
  }

  // ---- tick -----------------------------------------------------------------
  function tick() { renderHeroPill(); if (bookingEl) { var s = resolveState(); var tgt = s === 'before' ? CFG.openAt : (s === 'open' ? CFG.closeAt : CFG.eventAt); if (cdEl && cdEl.style.display !== 'none') renderCountdown(cdEl, tgt); } }

  renderBooking();
  renderHeaderCta();
  renderHeroPill();
  setInterval(tick, 1000);

  // expose for tweaks
  window.__cenaRefresh = function () { renderBooking(); renderHeaderCta(); renderHeroPill(); };

  // ---- Booking modal / bottom sheet + Eventbrite embed ----------------------
  var bookModal = (function () {
    var modal = document.getElementById('book-modal');
    if (!modal) return { open: function () {}, close: function () {} };
    var closeBtn = modal.querySelector('.book-modal-close');
    var widgetLoaded = false;
    var lastFocus = null;

    // Carica la pagina evento Eventbrite (info + "Ricordamelo" prima della
    // vendita, biglietti dal 20 giugno) in un iframe, solo alla prima apertura.
    function loadWidget() {
      if (widgetLoaded) return;
      widgetLoaded = true;
      var host = document.getElementById('eb-inline');
      var fallback = document.getElementById('eb-fallback');
      var fallbackLink = document.getElementById('eb-fallback-link');
      if (CFG.eventbriteUrl && fallbackLink) fallbackLink.href = CFG.eventbriteUrl;
      if (!host || !CFG.eventbriteUrl) return; // niente URL: resta il messaggio di riserva
      var iframe = document.createElement('iframe');
      iframe.src = CFG.eventbriteUrl;
      iframe.title = 'Prenotazione CenaLonga su Eventbrite';
      iframe.className = 'eb-frame';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'payment');
      host.appendChild(iframe);
      if (fallback) fallback.style.display = 'none';
    }

    function open() {
      lastFocus = document.activeElement;
      loadWidget();
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      // forza un reflow prima di animare l'entrata
      void modal.offsetWidth;
      modal.classList.add('is-open');
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      var hide = function () { modal.hidden = true; modal.removeEventListener('transitionend', onEnd); };
      var onEnd = function (e) { if (e.target === modal || e.propertyName === 'opacity') hide(); };
      modal.addEventListener('transitionend', onEnd);
      setTimeout(hide, 360); // fallback se transitionend non scatta
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    modal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-book-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });

    return { open: open, close: close };
  })();

  // Tutti i pulsanti "Prenota" aprono la modale quando le prenotazioni sono aperte.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.js-book') : null;
    if (!btn) return;
    if (resolveState() !== 'open') return; // chiuse/non ancora aperte: lascia il comportamento di default
    e.preventDefault();
    bookModal.open();
  });

  // ---- header scrolled + scroll progress -----------------------------------
  var header = document.querySelector('.site-header');
  var progressEl = document.getElementById('scroll-progress');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) { if (y > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
    if (progressEl) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
      progressEl.style.transform = 'scaleX(' + p + ')';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // ---- mobile nav -----------------------------------------------------------
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');
  function closeNav() {
    if (!header) return;
    header.classList.remove('nav-open');
    if (navToggle) { navToggle.setAttribute('aria-expanded', 'false'); navToggle.setAttribute('aria-label', 'Apri il menu'); }
    document.body.style.overflow = '';
  }
  if (navToggle && header) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    if (navLinks) {
      Array.prototype.forEach.call(navLinks.querySelectorAll('a'), function (a) {
        a.addEventListener('click', closeNav);
      });
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 920) closeNav(); });
  }

  // ---- reveal on scroll (with optional stagger) -----------------------------
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (e.target.hasAttribute('data-stagger')) {
        Array.prototype.forEach.call(e.target.children, function (c, i) {
          c.style.transitionDelay = (i * 80) + 'ms';
        });
      }
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // ---- scrollspy: highlight active nav link ---------------------------------
  if (navLinks) {
    var anchors = Array.prototype.slice.call(navLinks.querySelectorAll('a'));
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        anchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    anchors.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#' && href.length > 1) {
        var sec = document.querySelector(href);
        if (sec) spy.observe(sec);
      }
    });
  }

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
