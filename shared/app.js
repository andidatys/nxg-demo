/* NXG prototype — Richtung 01 "Nachtaufnahme"
   No animation library. Everything below is progressive enhancement:
   the page is complete and readable before this file runs, and stays
   complete if it never does. Roughly 2 KB against GSAP's ~118 KB. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;

  /* ---- scroll reveal -------------------------------------------------
     The hiding rule lives behind .js-motion, which only exists once we
     add it here. No JS, no reduced motion → no hidden content, ever. */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length || !('IntersectionObserver' in window)) return;

    root.classList.add('js-motion');

    /* The observer gives the reveal its precision. It is NOT what guarantees
       the content shows up — an observer that fires once and then goes quiet
       would leave whole sections blank on screen, which is the exact failure
       the reference site has. The sweep below is the guarantee; the observer
       is the polish. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    items.forEach(function (el) { io.observe(el); });

    /* Synchronous safety net: anything inside the viewport gets revealed,
       observer or no observer. Runs now, on scroll, and on resize, then
       unhooks itself once every element has been dealt with. */
    function sweep() {
      var pending = document.querySelectorAll('[data-reveal]:not(.is-in)');
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        return;
      }
      var vh = window.innerHeight;
      Array.prototype.forEach.call(pending, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add('is-in');
      });
    }

    var last = 0;
    function onScroll() {
      var now = Date.now();
      if (now - last < 120) return;   // plain timestamp throttle: rAF can be inert
      last = now;
      sweep();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    /* Deliberate: this first sweep runs in the same task that adds .js-motion,
       so above-the-fold content is never painted hidden and never transitions.
       The hero headline is the LCP element — fading it in from zero would delay
       the very measurement the brief puts a number on. Motion starts below the
       fold, where it costs nothing. */
    sweep();
    setTimeout(sweep, 1200);          // catches late layout shifts (fonts, images)
  }

  /* ---- count-up ------------------------------------------------------
     The final number is already in the HTML. This only replays it. */
  function initCounts() {
    var els = document.querySelectorAll('.count');
    if (!els.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });

    els.forEach(function (el) { io.observe(el); });

    function run(el) {
      var to = parseInt(el.getAttribute('data-to'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(to)) return;
      var dur = 900, t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        p = 1 - Math.pow(1 - p, 3);                    // ease-out cubic
        el.textContent = Math.round(to * p) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = '0' + suffix;
      requestAnimationFrame(step);
    }
  }

  /* ---- sticky header state ------------------------------------------
     This used to hang a zero-height sentinel at the top of the body and watch
     it with an IntersectionObserver. Measured at four scroll positions down a
     4822px page, .is-stuck never once applied: the observer does not reliably
     deliver here, which is the same reason the reveal system above carries a
     synchronous sweep instead of trusting one.

     It mattered little while the bar retracted on the way down. It matters now
     that the bar is pinned for the whole page: without .is-stuck the header
     keeps its resting background (.86 alpha) instead of the seated one (.96),
     so text scrolls under a bar that is more transparent than it was drawn to
     be, for the entire document.

     Scroll position answers this question directly, so ask it directly. */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var stuck = null, last = 0;
    function check() {
      var now = window.scrollY > 4;
      if (now === stuck) return;
      stuck = now;
      header.classList.toggle('is-stuck', now);
    }
    function onScroll() {
      var t = Date.now();
      if (t - last < 80) return;      /* timestamp throttle: rAF can be inert */
      last = t;
      check();
    }

    check();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- mobile menu --------------------------------------------------- */
  function initBurger() {
    var header = document.getElementById('site-header');
    var btn = header && header.querySelector('.site__burger');
    var nav = document.getElementById('site-nav-m');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      nav.hidden = !open;
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      header.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      nav.hidden = true;
    });
  }

  /* ---- contact tabs: applicants vs companies ------------------------- */
  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.classList.toggle('is-active', on);
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (next === null) return;
        e.preventDefault();
        var t = tabs[(next + tabs.length) % tabs.length];
        select(t); t.focus();
      });
    });
  }

  /* ---- prototype-only guards ----------------------------------------- */
  function initForms() {
    document.querySelectorAll('form').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Prototyp: Im fertigen Stand geht diese Anfrage per E-Mail an info@nxg-group.de. Es wird nichts gespeichert.');
      });
    });
  }

  function initVideo() {
    var play = document.querySelector('.vid__play');
    if (!play) return;
    play.addEventListener('click', function () {
      alert('Prototyp: Hier läuft später das von NXG gelieferte Video — selbst gehostet, ohne YouTube und ohne Cookie-Banner.');
    });
  }

  /* ---- marquee ---------------------------------------------------------
     The CSS animates the track to -50%, which is only seamless if the track
     is exactly two identical halves AND one half already spans the container.
     Author one copy in the markup; this works out how many are needed and
     lays down twice that many, so the strip is full at every width instead
     of running out and leaving a hole at the end of each loop. */
  function initMarquee() {
    document.querySelectorAll('.marquee__track, .band__track').forEach(function (track) {
      var box = track.parentElement;
      var unit = track.scrollWidth;
      if (!unit) return;
      var span = Math.max(box.clientWidth, 2400);          // cover wide screens too
      var copies = Math.max(2, Math.ceil(span / unit) + 1);
      var html = track.innerHTML;
      var out = '';
      for (var i = 0; i < copies * 2; i++) out += html;    // two matching halves
      track.innerHTML = out;
      track.setAttribute('aria-hidden', 'true');           // decorative once repeated
    });
  }

  function start() {
    initMarquee();
    initHeader();
    initBurger();
    initTabs();
    initForms();
    initVideo();
    if (reduce.matches) return;   // motion is the only thing we skip
    initReveal();
    initCounts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
