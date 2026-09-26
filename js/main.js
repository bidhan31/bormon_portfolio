(function () {
  'use strict';

  /* ---------- footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById('burger');
  var navlinks = document.getElementById('navlinks');

  function closeNav() {
    document.body.classList.remove('nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && navlinks) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navlinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.navlinks a'));

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- scroll reveal ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealables.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('in'); });
    } else {
      var ro = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
      revealables.forEach(function (el) { ro.observe(el); });
    }
  }

  /* ---------- card spotlight follows cursor ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- testimonial carousel ---------- */
  var track = document.getElementById('tstTrack');
  var dotsWrap = document.getElementById('tstDots');

  if (track && dotsWrap) {
    var slides = track.children.length;
    var idx = 0;
    var timer = null;

    var dots = [];
    var panels = Array.prototype.slice.call(track.querySelectorAll('[role="tabpanel"]'));
    for (var i = 0; i < slides; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      b.setAttribute('aria-controls', panels[i] ? panels[i].id : 'tstPanel' + (i + 1));
      b.id = 'tstTab' + (i + 1);
      b.dataset.i = String(i);
      b.addEventListener('click', function () { go(parseInt(this.dataset.i, 10)); restart(); });
      dotsWrap.appendChild(b);
      dots.push(b);
    }

    function go(n) {
      idx = (n + slides) % slides;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === idx ? 'true' : 'false'); });
      /* Off-screen slides stay in the DOM, so hide them from assistive tech —
         otherwise a screen reader announces all three quotes at once. */
      panels.forEach(function (p, k) {
        if (!p) return;
        if (k === idx) { p.removeAttribute('aria-hidden'); p.removeAttribute('inert'); }
        else { p.setAttribute('aria-hidden', 'true'); p.setAttribute('inert', ''); }
      });
    }
    function next() { go(idx + 1); }
    function start() { if (!reduce) timer = setInterval(next, 6000); }
    function restart() { clearInterval(timer); start(); }

    go(0);
    start();
    dotsWrap.addEventListener('mouseenter', function () { clearInterval(timer); });
    dotsWrap.addEventListener('mouseleave', start);
    /* Keep the carousel still while a keyboard user is on the controls, so the
       quote they are reading cannot slide away underneath them. */
    dotsWrap.addEventListener('focusin', function () { clearInterval(timer); });
    dotsWrap.addEventListener('focusout', function (e) {
      if (!dotsWrap.contains(e.relatedTarget)) start();
    });

    /* Arrow keys move between tabs, as expected of a tablist. */
    dotsWrap.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k !== 'ArrowRight' && k !== 'ArrowLeft' && k !== 'Home' && k !== 'End') return;
      e.preventDefault();
      var target = k === 'Home' ? 0
        : k === 'End' ? slides - 1
        : idx + (k === 'ArrowRight' ? 1 : -1);
      go(target);
      restart();
      if (dots[idx]) dots[idx].focus();
    });

    /* touch swipe */
    var x0 = null;
    track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
      x0 = null;
    });
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById('contactForm');
  var msg = document.getElementById('formMsg');
  var btn = document.getElementById('submitBtn');

  if (form && msg && btn) {
    /* Where to send a visitor who submits with JavaScript disabled. Derived from
       the live page URL so it stays correct on localhost and on any host. */
    var nextEl = form.querySelector('input[name="_next"]');
    if (nextEl) nextEl.value = location.origin + location.pathname + '#contact';

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var subject = form.elements.subject.value.trim();
      var message = form.elements.message.value.trim();

      if (!name || !email || !message) {
        msg.className = 'form-msg err';
        msg.textContent = 'Please fill in your name, email and message.';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.className = 'form-msg err';
        msg.textContent = 'That email address does not look right — mind checking it?';
        return;
      }

      /*
       * Delivers through FormSubmit: a hosted form backend that needs no account
       * and emails straight to the address in the URL. Falls back to the
       * visitor's mail client only if the request itself fails.
       */
      var ENDPOINT = 'https://formsubmit.co/ajax/bidhanbormon08@gmail.com';
      var payload = {
        name: name,
        email: email,
        subject: subject || ('Portfolio enquiry from ' + name),
        message: message,
        _subject: 'Portfolio enquiry from ' + name,
        _template: 'table'
      };

      function mailtoFallback() {
        return 'mailto:bidhanbormon08@gmail.com'
          + '?subject=' + encodeURIComponent(payload.subject)
          + '&body=' + encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      }

      /* The reliable escape hatch: no mail client needed. */
      function copyFallback() {
        var body = message + '\n\n— ' + name + ' (' + email + ')';
        var done = function () {
          btn.textContent = 'Copied ✓';
          msg.className = 'form-msg ok';
          msg.textContent = 'Message copied to your clipboard — just paste it into an email to bidhanbormon08@gmail.com';
          setTimeout(function () { btn.textContent = 'Send Message'; }, 2500);
        };

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(body).then(done, function () { openMailto(); });
        } else {
          openMailto();
        }
      }

      function openMailto() {
        window.location.href = mailtoFallback();
      }

      btn.disabled = true;
      btn.textContent = 'Sending…';
      msg.className = 'form-msg busy';
      msg.textContent = 'Sending your message…';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().then(function (d) { return { ok: r.ok, data: d }; });
        })
        .then(function (res) {
          if (!res.ok || !res.data || res.data.success !== 'true') {
            var why = (res.data && res.data.message) || 'the server rejected the request';
            throw new Error(why);
          }
          form.reset();
          msg.className = 'form-msg ok';
          msg.textContent = 'Thanks ' + name + '! Your message is on its way to my inbox — I usually reply within a day.';
          btn.textContent = 'Send Message';
          btn.disabled = false;
        })
        .catch(function (err) {
          /* Never surface raw server text to visitors — it leaks internal
             service state and reads as broken. Log it, show something human. */
          console.error('[contact form]', err.message);

          var notActivated = /activat/i.test(err.message);
          msg.className = 'form-msg err';
          msg.textContent = notActivated
            ? 'The form is being set up. Please email me directly at '
            : 'Something went wrong sending that. Please email me directly at ';

          var addr = document.createElement('a');
          addr.href = mailtoFallback();
          addr.textContent = 'bidhanbormon08@gmail.com';
          msg.appendChild(addr);

          /* A second way out that needs no mail client at all. */
          msg.appendChild(document.createTextNode(' — or '));
          var copy = document.createElement('a');
          copy.href = '#';
          copy.textContent = 'copy your message';
          copy.addEventListener('click', function (ev) {
            ev.preventDefault();
            copyFallback();
          });
          msg.appendChild(copy);

          btn.textContent = 'Send Message';
          btn.disabled = false;
        });
    });
  }
})();
