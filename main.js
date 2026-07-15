/* Spacegraph - premium motion: smooth scroll, kinetic reveals, marquee, parallax, counters, magnetic, cursor.
   Inspired by landonorris.com / mira-dev / sidewave (Lenis + scroll-reveal + kinetic type + marquee). */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
  var lenis = null;

  /* ---------- preloader: reveal the page once loaded ---------- */
  var pre = document.querySelector('.preloader');
  if (pre) {
    var hidePre = function () { pre.classList.add('done'); };
    if (document.readyState === 'complete') setTimeout(hidePre, 400);
    else window.addEventListener('load', function () { setTimeout(hidePre, 400); });
    setTimeout(hidePre, 4000); // safety: never trap the user if load stalls
  }

  /* ---------- Lenis momentum smooth scroll (loaded from CDN) ---------- */
  function initLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })();
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1) { var t = document.querySelector(id); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); } }
      });
    });
    if (parallaxEls.length) lenis.on('scroll', parallax);
  }
  if (!reduce) {
    var ls = document.createElement('script');
    ls.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js';
    ls.onload = initLenis; ls.onerror = function () {};
    document.head.appendChild(ls);
  }

  /* ---------- kinetic mask-rise headings ---------- */
  document.querySelectorAll('.hero h1, .page-head h1, .sec-head h2, .cta-band h2').forEach(function (h) {
    if (reduce) return;
    var inner = document.createElement('span');
    inner.className = 'ki';
    while (h.firstChild) inner.appendChild(h.firstChild);
    h.appendChild(inner);
    h.classList.add('kinetic');
    h.classList.remove('fade');
    h.style.animation = 'none'; h.style.opacity = '1';
  });

  /* ---------- IntersectionObserver helper ---------- */
  function onView(els, cb, opts) {
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { cb(x.target); io.unobserve(x.target); } });
    }, opts || { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
  var arr = function (n) { return Array.prototype.slice.call(n); };

  /* choreograph reveals: give repeated groups a staggered cascade if not already set */
  ['.grid', '.caps', '.values', '.team'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (group) {
      var i = 0;
      group.querySelectorAll(':scope > .fade').forEach(function (el) {
        if (el.getAttribute('data-delay') == null) el.setAttribute('data-delay', String(i * 85));
        i++;
      });
    });
  });

  onView(arr(document.querySelectorAll('.fade')), function (el) {
    var d = el.getAttribute('data-delay'); if (d) el.style.animationDelay = d + 'ms'; el.classList.add('in');
  });
  onView(arr(document.querySelectorAll('.kinetic')), function (el) { el.classList.add('in'); });

  /* ---------- count-up stats ---------- */
  onView(arr(document.querySelectorAll('.count')), function (el) {
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = to + suffix; return; }
    var dur = 1500, t0 = null;
    (function step(ts) {
      if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  });

  /* ---------- parallax (hero background) ---------- */
  var parallaxEls = arr(document.querySelectorAll('[data-parallax]'));
  function parallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var sp = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var off = (r.top + r.height / 2 - vh / 2) * -sp;
      var extra = el.classList.contains('hero-video') ? ' scale(1.12)' : '';
      el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)' + extra;
    });
  }
  if (!reduce && parallaxEls.length) {
    window.addEventListener('scroll', parallax, { passive: true });
    window.addEventListener('resize', parallax, { passive: true });
    parallax();
  }

  /* ---------- magnetic primary buttons ---------- */
  if (!reduce && fine) {
    document.querySelectorAll('.btn-accent, .btn-solid').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.32) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- cursor-follow spotlight on cards ---------- */
  if (!reduce && fine) {
    document.querySelectorAll('.card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- sticky nav: solid state on scroll ---------- */
  var head = document.querySelector('.site-head');
  if (head) {
    var onScrollHead = function () { head.classList.toggle('scrolled', (window.scrollY || window.pageYOffset) > 8); };
    window.addEventListener('scroll', onScrollHead, { passive: true });
    onScrollHead();
  }

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.burger'), menu = document.querySelector('.mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () { var o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    /* keyboard support: the burger is a div[role=button], so Enter/Space must activate it */
    burger.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); burger.click(); } });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  /* ---------- contact form: compose a prefilled email (no backend required) ---------- */
  var cform = document.getElementById('contactForm');
  if (cform && !cform.getAttribute('action')) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = cform.querySelector('.form-status');
      var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var name = val('name'), email = val('email'), company = val('company'), message = val('message');
      if (!name || !email || !message) {
        if (status) { status.textContent = 'Please add your name, email and a message.'; status.className = 'form-status err'; }
        return;
      }
      var subject = 'Website enquiry from ' + name + (company ? ' (' + company + ')' : '');
      var body = 'Name: ' + name + '\nEmail: ' + email + '\nCompany: ' + company + '\n\n' + message;
      window.location.href = 'mailto:info@spacegraph.in?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (status) { status.textContent = 'Opening your email app to send. If it does not open, write to info@spacegraph.in.'; status.className = 'form-status ok'; }
    });
  }
})();
