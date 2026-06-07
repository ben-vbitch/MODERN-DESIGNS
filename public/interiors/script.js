'use strict';

/* ── helpers ── */
const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════
     CURSOR — disabled on touch
  ══════════════════════════════════════════ */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (cursor && follower && !isTouchDevice()) {
    let mx = 0, my = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    (function followLoop() {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(followLoop);
    })();

    const interactives = document.querySelectorAll(
      'a, button, .villa-card, .pillar, .step, .team-card, input, textarea'
    );
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width  = '18px';
        cursor.style.height = '18px';
        follower.style.width   = '60px';
        follower.style.height  = '60px';
        follower.style.opacity = '.6';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width  = '8px';
        cursor.style.height = '8px';
        follower.style.width   = '36px';
        follower.style.height  = '36px';
        follower.style.opacity = '1';
      });
    });
  } else if (cursor && follower) {
    /* touch — hide both elements, restore default cursor */
    cursor.style.display   = 'none';
    follower.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  /* ══════════════════════════════════════════
     NAV SCROLL GLASS
  ══════════════════════════════════════════ */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ══════════════════════════════════════════
     MOBILE BURGER MENU
  ══════════════════════════════════════════ */
  const burger     = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mmLinks    = document.querySelectorAll('.mm-link');
  let menuOpen = false;

  function toggleMenu(open) {
    menuOpen = open;
    if (!mobileMenu || !burger) return;
    mobileMenu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    const spans = burger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(6px) rotate(45deg)';
      spans[1].style.transform = 'translateY(-1px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    }
  }

  burger?.addEventListener('click', () => toggleMenu(!menuOpen));
  mmLinks.forEach((l) => l.addEventListener('click', () => toggleMenu(false)));

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) toggleMenu(false);
  });

  /* Close if resized back to desktop */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && menuOpen) toggleMenu(false);
  }, { passive: true });

  /* ══════════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════════ */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ══════════════════════════════════════════
     SMOOTH SCROLL — uses live nav height
  ══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');
      const target = href && href !== '#' ? document.querySelector(href) : null;
      if (!target) return;
      e.preventDefault();
      const offset = nav ? nav.offsetHeight + 16 : 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ══════════════════════════════════════════
     ACTIVE NAV LINK SPY
  ══════════════════════════════════════════ */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ══════════════════════════════════════════
     HERO PARALLAX — desktop only
  ══════════════════════════════════════════ */
  const heroImg = document.querySelector('.hero-img');
  if (heroImg && !isTouchDevice()) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroImg.style.transform = `translateY(${y * 0.28}px)`;
      }
    }, { passive: true });
  }

  /* ══════════════════════════════════════════
     VILLA CARD 3D TILT — desktop only
  ══════════════════════════════════════════ */
  if (!isTouchDevice()) {
    document.querySelectorAll('.villa-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `
          perspective(900px)
          rotateY(${x * 5}deg)
          rotateX(${-y * 4}deg)
          translateY(-6px)
        `;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ══════════════════════════════════════════
     STAT COUNTERS
  ══════════════════════════════════════════ */
  const statNums = document.querySelectorAll('.stat-n');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const raw = el.textContent.trim();
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        const sfx = raw.replace(/[0-9.]/g, '');
        if (isNaN(num) || num === 0) return;
        const dur     = 1600;
        const startTs = performance.now();
        function tick(now) {
          const elapsed  = now - startTs;
          const progress = Math.min(elapsed / dur, 1);
          const ease     = 1 - Math.pow(1 - progress, 3);
          const current  = Math.round(ease * num * 10) / 10;
          el.textContent = (Number.isInteger(num) ? Math.round(current) : current) + sfx;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.8 }
  );
  statNums.forEach((n) => counterObserver.observe(n));

  /* ══════════════════════════════════════════
     MARQUEE PAUSE ON HOVER
  ══════════════════════════════════════════ */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeTrack.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }

  const WHATSAPP_NUMBER = '919847660008';
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = form.querySelectorAll('[required]');
      let valid = true;

      required.forEach((field) => {
        field.style.borderColor = '';
        field.style.boxShadow   = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#c0392b';
          field.style.boxShadow   = '0 0 0 2px rgba(192,57,43,.25)';
          valid = false;
        }
      });

      if (!valid) {
        const firstBad = form.querySelector('[required][style*="c0392b"]');
        if (firstBad) firstBad.focus();
        return;
      }

      const fname    = (form.querySelector('#fname')?.value    || '').trim();
      const lname    = (form.querySelector('#lname')?.value    || '').trim();
      const email    = (form.querySelector('#email')?.value    || '').trim();
      const location = (form.querySelector('#location')?.value || '').trim();
      const vision   = (form.querySelector('#vision')?.value   || '').trim();
      const fullName = [fname, lname].filter(Boolean).join(' ');
      const lines = [
        '🛋️ *New Interior Design Enquiry — Modern Designers & Builders*',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━',
        `*Name:*      ${fullName || '—'}`,
        `*Email:*     ${email    || '—'}`,
        `*Location:*  ${location || '—'}`,
        '',
        '*Vision / Description:*',
        vision,
        '━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '_Sent via Custom Interiors enquiry form_',
      ];

      const message = lines.join('\n');
      const encoded = encodeURIComponent(message);
      const waURL   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
      const btn      = form.querySelector('.btn-submit');
      const btnText  = btn?.querySelector('.btn-text');
      const btnArrow = btn?.querySelector('.btn-arrow');
      if (btnText)  btnText.textContent  = 'Opening WhatsApp…';
      if (btnArrow) btnArrow.textContent = '↗';
      if (btn)      btn.disabled         = true;

      setTimeout(() => {
        window.open(waURL, '_blank', 'noopener,noreferrer');
        if (formSuccess) formSuccess.classList.add('visible');

        setTimeout(() => {
          form.reset();
          required.forEach((f) => { f.style.borderColor = ''; f.style.boxShadow = ''; });
          if (formSuccess)  formSuccess.classList.remove('visible');
          if (btn)          btn.disabled         = false;
          if (btnText)      btnText.textContent  = 'Send My Vision';
          if (btnArrow)     btnArrow.textContent = '→';
        }, 8000);
      }, 600);
    });

    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        if (field.value.trim()) {
          field.style.borderColor = '';
          field.style.boxShadow   = '';
        }
      });
    });
  }

}); 