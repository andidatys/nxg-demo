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

  /* A dropdown in the nav (Glut 4.2.5, briefing M5).

     With a mouse it is hover and nothing else: pointing opens it, leaving
     closes it. A click on the button does NOT latch it open — that was
     confusing, because the menu was already open under the cursor and the
     click looked like it had done nothing, or worse, left the menu standing
     after the mouse had gone.

     Where there is no hover — a touch screen — the click has to open it,
     otherwise the menu is unreachable. And a keyboard must always be able
     to open it: Enter and Space fire a click with no pointer before it,
     which is how the two are told apart. Escape closes, a click outside
     closes. Nothing here if the nav has no dropdown. */
  var hoverable = !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var dds = [].slice.call(nav.querySelectorAll('.site__dd'));
  dds.forEach(function (dd) {
    var btn = dd.querySelector('.site__ddbtn');
    if (!btn) return;
    function set(open) {
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    var byPointer = false;
    btn.addEventListener('pointerdown', function () { byPointer = true; });

    /* The CSS holds the menu open on :focus-within, which is right for a
       keyboard and wrong for a mouse: a click parks the focus on the button,
       and the menu then stands there until something else is clicked. A
       mouse must not focus this button at all, so the default of mousedown
       is refused. Tab still focuses it, and the menu still opens for a
       keyboard. */
    btn.addEventListener('mousedown', function (e) { if (hoverable) e.preventDefault(); });
    btn.addEventListener('click', function () {
      var pointer = byPointer;
      byPointer = false;
      if (hoverable && pointer) return;      /* hover is in charge here */
      set(!dd.classList.contains('is-open'));
    });
    dd.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });

    /* Since a mouse can no longer focus the button, focus here means a
       keyboard: arriving opens the menu, leaving it closes. This replaces
       the CSS :focus-within, which could not be talked out of staying open
       when Escape was pressed — the focus is still on the button then, and
       the menu stood there anyway. */
    dd.addEventListener('focusin', function () { set(true); });
    dd.addEventListener('focusout', function (e) {
      if (!dd.contains(e.relatedTarget)) set(false);
    });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) set(false); });

    /* The pointer travels diagonally from the button to the row it wants, and
       on the way it leaves the menu for a moment. Closing on that first exit
       makes the menu feel like it is running away, so a leave is given a
       grace period and a re-entry cancels it. (NXG briefing, section 2.) */
    var closing = 0;
    dd.addEventListener('mouseleave', function () {
      clearTimeout(closing);
      closing = setTimeout(function () { set(false); }, 300);
    });
    dd.addEventListener('mouseenter', function () {
      clearTimeout(closing);
      /* the CSS opens it on hover anyway; opening it here as well keeps
         aria-expanded honest, so a screen reader is told the same thing
         the eye is shown */
      if (hoverable) set(true);
    });
  });

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
