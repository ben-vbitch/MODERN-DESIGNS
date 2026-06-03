

'use strict';

const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mx = 0, my = 0, fx = 0, fy = 0;
document.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  if (cursor) {
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  }
});

(function followLoop() {
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  if (follower) {
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
  }
  requestAnimationFrame(followLoop);
})();

const interactives = document.querySelectorAll(
  'a, button, .villa-card, .pillar, .step, .team-card, input, textarea'
);
interactives.forEach((el) => {
  el.addEventListener('mouseenter', () => {
    if (cursor) {
      cursor.style.width  = '18px';
      cursor.style.height = '18px';
    }
    if (follower) {
      follower.style.width   = '60px';
      follower.style.height  = '60px';
      follower.style.opacity = '.6';
    }
  });
  el.addEventListener('mouseleave', () => {
    if (cursor) {
      cursor.style.width  = '8px';
      cursor.style.height = '8px';
    }
    if (follower) {
      follower.style.width   = '36px';
      follower.style.height  = '36px';
      follower.style.opacity = '1';
    }
  });
});
const nav = document.getElementById('nav');
let lastScrollY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  lastScrollY = y;
}, { passive: true });
const burger     = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
const mmLinks    = document.querySelectorAll('.mm-link');
let menuOpen = false;
function toggleMenu(open) {
  menuOpen = open;
  mobileMenu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  const spans = burger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(6px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-1px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
}

burger.addEventListener('click', () => toggleMenu(!menuOpen));
mmLinks.forEach((l) => l.addEventListener('click', () => toggleMenu(false)));
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
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
);

revealEls.forEach((el) => revealObserver.observe(el));
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = nav ? nav.offsetHeight + 20 : 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navAnchors.forEach((a) => {
          a.classList.toggle(
            'active',
            a.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  },
  { threshold: 0.4 }
);
sections.forEach((s) => sectionObserver.observe(s));
const WHATSAPP_NUMBER = '919847660008'; // +91 98476 60008
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
      const firstBad = form.querySelector('[required]:placeholder-shown, [required][style*="c0392b"]');
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
      '🏡 *New Enquiry — Skyline Villa*',
      '━━━━━━━━━━━━━━━━━━━━',
      `*Name:*      ${fullName || '—'}`,
      `*Email:*     ${email    || '—'}`,
      `*Location:*  ${location || '—'}`,
      '',
      '*Vision / Description:*',
      vision,
      '━━━━━━━━━━━━━━━━━━━━',
      '_Sent via Skyline Villa enquiry form_',
    ];

    const message    = lines.join('\n');
    const encoded    = encodeURIComponent(message);
    const waURL      = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    const btn     = form.querySelector('.btn-submit');
    const btnText = btn.querySelector('.btn-text');
    const btnArrow= btn.querySelector('.btn-arrow');
    btnText.textContent  = 'Opening WhatsApp…';
    btnArrow.textContent = '↗';
    btn.disabled         = true;
    setTimeout(() => {
      window.open(waURL, '_blank', 'noopener,noreferrer');
      if (formSuccess) formSuccess.classList.add('visible');
      btn.disabled         = false;
      btnText.textContent  = 'Send My Vision';
      btnArrow.textContent = '→';
      setTimeout(() => {
        form.reset();
        required.forEach((f) => { f.style.borderColor = ''; f.style.boxShadow = ''; });
        if (formSuccess) formSuccess.classList.remove('visible');
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

const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroImg.style.transform = `translateY(${y * 0.28}px)`;
    }
  }, { passive: true });
}

const villasCards = document.querySelectorAll('.villa-card');
villasCards.forEach((card) => {
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

const statNums = document.querySelectorAll('.stat-n');
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el   = entry.target;
      const raw  = el.textContent.trim();
      const num  = parseFloat(raw.replace(/[^0-9.]/g, ''));
      const sfx  = raw.replace(/[0-9.]/g, '');
      if (isNaN(num) || num === 0) return;
      let start     = 0;
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
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}