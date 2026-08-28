/* Hero video, attached as an upgrade and never as a dependency.

   The still behind it is the real hero: it is the poster, the no-JS state,
   the reduced-motion state, the narrow-screen state and the offline state.
   This file only ever adds a clip on top of a hero that already works — the
   same rule the rest of this build follows for motion.

   Why it is gated rather than just dropped in <video autoplay>:
     - an autoplaying hero clip is one of the few things that can genuinely
       cost the mobile Lighthouse budget the brief puts a number on, so it
       does not load below 900px at all
     - a coarse pointer usually means a phone on a metered connection
     - reduced motion means no clip, not a shorter one
     - the source is only assigned once the element is in view, so the bytes
       are never spent on a reader who bounced above the fold
     - it pauses when scrolled away, because decoding frames nobody can see
       is pure battery
*/
(function () {
  'use strict';

  var video = document.querySelector('.hero__video');
  if (!video) return;

  var src = video.getAttribute('data-src');
  if (!src) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 899px)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  /* Honour the browser's own data-saver signal where it exists. */
  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ''))) return;

  var started = false;

  function play() {
    if (started) return;
    started = true;
    video.src = src;
    var p = video.play();
    /* Autoplay can still be refused. If it is, leave the still in place and
       say nothing — the hero is complete without this. */
    if (p && typeof p.catch === 'function') {
      p.catch(function () { video.classList.remove('is-on'); });
    }
    video.addEventListener('playing', function () {
      video.classList.add('is-on');
    }, { once: true });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { play(); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px 200px 0px' });
    io.observe(video);
    /* Same failsafe as everywhere else: the observer is the optimisation,
       not the mechanism. If it never reports, start anyway. */
    setTimeout(function () { if (!started) play(); }, 2000);
  } else {
    play();
  }

  /* Stop decoding once the hero has left the screen. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!started) return;
        if (e.isIntersecting) { video.play().catch(function () {}); }
        else video.pause();
      });
    }, { threshold: 0 }).observe(video);
  }

  document.addEventListener('visibilitychange', function () {
    if (!started) return;
    if (document.hidden) video.pause();
    else video.play().catch(function () {});
  });
})();
