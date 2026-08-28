/* Scroll-linked motion, shared by every direction.

   This is the piece the first pass was missing. A fade-in tells you an
   element arrived; scroll-linked motion makes the page feel like it is
   moving under your hand. The reference studies got that from GSAP
   ScrollTrigger's scrub — but scrub is only "map scroll position to a
   number between 0 and 1". That is nine lines. What follows costs about
   1.5 KB against ScrollTrigger's 44 KB.

   The contract: this file writes numbers into CSS custom properties and
   nothing else. Every visual decision stays in the stylesheet, and a
   page that never runs this script is still complete — the properties
   simply keep their fallback values. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  var root = document.documentElement;

  /* Clock-based throttle. requestAnimationFrame exists in a throttled or
     backgrounded tab but never fires, so a flag waiting on it jams and
     the page freezes mid-scroll with no way back. */
  function throttle(fn, ms) {
    var last = 0, timer = null;
    return function () {
      var now = Date.now();
      if (now - last >= ms) { last = now; fn(); return; }
      if (timer) return;
      timer = setTimeout(function () { timer = null; last = Date.now(); fn(); }, ms);
    };
  }

  /* ---- scrub -----------------------------------------------------------
     Every [data-scrub] element gets --p: how far it has travelled across
     the viewport, 0 as it enters from below, 1 as it leaves at the top.
     data-scrub="cover" measures the element's own scroll span instead,
     which is what a tall pinned block wants. */
  var scrubbed = [].slice.call(document.querySelectorAll('[data-scrub]'));

  function scrub() {
    var vh = window.innerHeight;
    for (var i = 0; i < scrubbed.length; i++) {
      var el = scrubbed[i], r = el.getBoundingClientRect(), p;
      if (el.getAttribute('data-scrub') === 'cover') {
        var span = r.height - vh;
        p = span > 0 ? -r.top / span : 0;
      } else {
        p = (vh - r.top) / (vh + r.height);
      }
      el.style.setProperty('--p', Math.min(Math.max(p, 0), 1).toFixed(4));
    }
  }

  /* ---- masked line reveal ---------------------------------------------
     The single most expensive-looking effect in the reference studies,
     and it is pure CSS: a clipping wrapper plus an inner span that rises
     into place. The wrapper only clips once .js-motion exists, so without
     this script the words simply sit there, fully visible. */
  var lines = [].slice.call(document.querySelectorAll('.ln'));

  function reveal() {
    var vh = window.innerHeight;
    var pending = 0;
    for (var i = 0; i < lines.length; i++) {
      var el = lines[i];
      if (el.classList.contains('is-in')) continue;
      pending++;
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('is-in');
    }
    if (!pending) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }

  var onScroll = throttle(function () { scrub(); reveal(); }, 16);

  function start() {
    if (scrubbed.length || lines.length) root.classList.add('js-scroll');
    scrub();
    reveal();                       // first screen, before any scrolling
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onScroll);
    setTimeout(onScroll, 1200);     // late layout shifts settle the numbers

    /* Same failsafe as everywhere else in this build: if the lines are
       still clipped and unrevealed while sitting on screen, the handler
       is not working — drop the clipping rather than hide the words. */
    setTimeout(function () {
      var stuck = lines.some(function (el) {
        var r = el.getBoundingClientRect();
        /* The SAME threshold reveal() uses, not the whole viewport. A line
           sitting between .92vh and 1vh has not been revealed because it is
           not meant to be yet — counting it as stuck made the failsafe fire on
           any page where a headline happened to land in that 8% band, which
           switched the line animation off site-wide for no reason. */
        return r.top < window.innerHeight * 0.92 && r.bottom > 0 &&
               !el.classList.contains('is-in');
      });
      if (stuck) root.classList.remove('js-scroll');
    }, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
