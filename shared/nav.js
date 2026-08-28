/* Header behaviour: a pill that follows the section you are reading.

   Two numbers only — where the active link starts and how wide it is —
   written to CSS custom properties on the nav. The stylesheet draws the
   pill and animates it. If this file never runs, the links still work
   and the pill simply never appears; nothing here is load-bearing for
   navigation. */
(function () {
  'use strict';

  var nav = document.querySelector('.site__nav');
  if (!nav) return;

  var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));

  /* Vorwärts is a multi-page site now, so its nav holds page links rather than
     in-page anchors and there is no scroll position to follow. The indicator
     still belongs somewhere: on the link marked aria-current="page". Park it
     there once and leave the scroll machinery switched off. */
  if (!links.length) {
    var here = nav.querySelector('[aria-current="page"]');
    if (here) {
      var park = function () {
        nav.style.setProperty('--nx', here.offsetLeft + 'px');
        nav.style.setProperty('--nw', here.offsetWidth + 'px');
        nav.style.setProperty('--no', '1');
        here.classList.add('is-here');
      };
      park();
      window.addEventListener('resize', park, { passive: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(park);
      setTimeout(park, 600);
    }
    return;
  }

  /* Clock-based throttle, never requestAnimationFrame: rAF exists in a
     throttled tab but does not fire, and a handler waiting on it stays
     stuck for good. */
  function throttle(fn, ms) {
    var last = 0, timer = null;
    return function () {
      var now = Date.now();
      if (now - last >= ms) { last = now; fn(); return; }
      if (timer) return;
      timer = setTimeout(function () { timer = null; last = Date.now(); fn(); }, ms);
    };
  }

  var targets = links
    .map(function (a) {
      var el = document.querySelector(a.getAttribute('href'));
      return el ? { a: a, el: el } : null;
    })
    .filter(Boolean);

  function place(a) {
    if (!a) { nav.style.setProperty('--no', '0'); return; }
    nav.style.setProperty('--nx', a.offsetLeft + 'px');
    nav.style.setProperty('--nw', a.offsetWidth + 'px');
    nav.style.setProperty('--no', '1');
  }

  var current = null;

  var update = throttle(function () {
    /* The link whose section owns the middle of the screen. Reading
       position, not the top edge — a heading that has just scrolled out
       of sight is not what the reader is looking at. */
    var mid = window.scrollY + window.innerHeight * 0.4;
    var found = null;
    for (var i = 0; i < targets.length; i++) {
      var r = targets[i].el.getBoundingClientRect();
      var top = r.top + window.scrollY;
      if (mid >= top && mid < top + r.height) found = targets[i].a;
    }
    if (found === current) return;
    current = found;
    links.forEach(function (a) { a.classList.toggle('is-here', a === found); });
    place(found);
  }, 100);

  /* Hover takes over while the pointer is on the nav, then hands back. */
  links.forEach(function (a) {
    a.addEventListener('mouseenter', function () { place(a); });
  });
  nav.addEventListener('mouseleave', function () { place(current); });

  /* ---- header state ----------------------------------------------------
     The reading-progress hairline is unconditional: it belongs to any header
     that is pinned, and it used to live inside the retract branch, so turning
     retracting off would have silently killed it too. Retracting itself is
     opt-in with data-retract and is currently NOT enabled on this page — the
     bar is meant to stay visible the whole way down. */
  var header = document.getElementById('site-header');
  if (header) {
    var retracts = header.hasAttribute('data-retract');
    var lastY = window.scrollY, away = false;

    var onScroll = throttle(function () {
      var y = window.scrollY;

      if (retracts && Math.abs(y - lastY) > 6) {
        /* never over the first screen, and only on a real gesture, so a
           trackpad twitch cannot flicker the bar */
        var hide = y > lastY && y > window.innerHeight * 0.6;
        if (hide !== away) { away = hide; header.classList.toggle('is-away', hide); }
        lastY = y;
      }

      var h = document.documentElement.scrollHeight - window.innerHeight;
      header.style.setProperty('--read', h > 0 ? Math.min(y / h, 1).toFixed(4) : '0');
    }, 80);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });  // progress is height-dependent

    if (retracts) {
      /* a keyboard user tabbing into the nav must never chase a hidden bar */
      header.addEventListener('focusin', function () {
        away = false; header.classList.remove('is-away');
      });
    }
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', throttle(function () {
    place(current);   // the pill has to move when the nav reflows
  }, 150), { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { place(current); });
  }
  setTimeout(function () { update(); place(current); }, 1200);
})();
