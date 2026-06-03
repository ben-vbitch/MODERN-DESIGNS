(function () {
  'use strict';
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initProgress();
    initNav();
    initHeroCanvas();
    initHeroLoad();
    initReveal();
    initGSAP();
    initCounters();
    initTimeline();
    initTestimonials();
    initProjectFilter();
    initContactForm();
    logBrand();
  });

  function initCursor() {
    const ring = document.getElementById('cur-ring');
    const dot  = document.getElementById('cur-dot');
    if (!ring || !dot) return;
    let mx = -100, my = -100;
    let fx = -100, fy = -100;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      ring.style.left = mx + 'px';
      ring.style.top  = my + 'px';
    });

    (function follow() {
      fx += (mx - fx) * 0.13;
      fy += (my - fy) * 0.13;
      dot.style.left = fx + 'px';
      dot.style.top  = fy + 'px';
      requestAnimationFrame(follow);
    })();

    const hoverEls = 'a, button, .svc-card, .proj-card, .f-btn, .t-prev, .t-next, .t-dot, input, textarea, select';
    document.querySelectorAll(hoverEls).forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover-active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover-active'));});
    document.addEventListener('mouseleave', () => { ring.style.opacity = '0'; dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { ring.style.opacity = '1'; dot.style.opacity = '1'; });
  }

  function initProgress() {
    const bar = document.getElementById('progress');
    if (!bar) return;
    const update = () => {
      const max  = document.documentElement.scrollHeight - innerHeight;
      const pct  = max > 0 ? (scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
  }

  function initNav() {
    const nav    = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const mobNav = document.getElementById('mob-nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('glass', scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (burger && mobNav) {
      burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        mobNav.classList.toggle('open');
        document.body.style.overflow = mobNav.classList.contains('open') ? 'hidden' : '';
      });
      mobNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          burger.classList.remove('open');
          mobNav.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    const sections = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-links a, .mob-nav a');
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          document.querySelectorAll(`a[href="#${e.target.id}"]`).forEach(a => a.classList.add('active'));
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    const N  = 28;
    const pts = Array.from({ length: N }, () => ({
      x:  Math.random() * innerWidth,
      y:  Math.random() * innerHeight,
      r:  Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      a:  Math.random() * 0.35 + 0.08,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;
      ctx.strokeStyle = 'rgba(201,168,76,0.07)';
      ctx.lineWidth   = 0.6;
      const horizon = H * 0.62;
      for (let i = 0; i <= 9; i++) {
        const t = i / 9;
        const y = horizon * (1 - t * 0.9);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      const vx = W * 0.5, vy = H * 1.05;
      ctx.strokeStyle = 'rgba(201,168,76,0.055)';
      for (let i = 0; i <= 12; i++) {
        const x = (i / 12) * W;
        ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(x, 0); ctx.stroke();
      }

      const bSize = 40, bW = 1.2;
      ctx.strokeStyle = 'rgba(201,168,76,0.18)';
      ctx.lineWidth   = bW;
      const corners = [[30,30],[W-30,30],[30,H-30],[W-30,H-30]];
      const dirs     = [[1,1],[-1,1],[1,-1],[-1,-1]];
      corners.forEach(([cx, cy], i) => {
        const [dx, dy] = dirs[i];
        ctx.beginPath(); ctx.moveTo(cx, cy + dy * bSize); ctx.lineTo(cx, cy); ctx.lineTo(cx + dx * bSize, cy); ctx.stroke();
      });
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0)  p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0)  p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.a})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) draw();
      else { cancelAnimationFrame(raf); ctx.clearRect(0, 0, canvas.width, canvas.height); }
    });
    io.observe(canvas);
  }

  function initHeroLoad() {
    const hero = document.querySelector('.hero');
    const img  = hero?.querySelector('.hero-photo');
    if (!img) return;
    const release = () => hero.classList.add('loaded');
    img.complete ? release() : img.addEventListener('load', release);
  }

  function initReveal() {
    const els = document.querySelectorAll('.rv');
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.13 });
    els.forEach(el => io.observe(el));
  }

  function initGSAP() {
    if (typeof gsap === 'undefined') return;

    gsap.from('.about-left > *', {
      scrollTrigger: { trigger: '.about', start: 'top 78%' },
      y: 55, opacity: 0, duration: 0.95,
      stagger: 0.13, ease: 'power3.out',
    });
    gsap.from('.about-vis', {
      scrollTrigger: { trigger: '.about', start: 'top 78%' },
      x: 65, opacity: 0, duration: 1,
      ease: 'power3.out', delay: 0.1,
    });

    gsap.from('.svc-card', {
      scrollTrigger: { trigger: '.svc-grid', start: 'top 82%' },
      y: 50, opacity: 0, duration: 0.75,
      stagger: 0.1, ease: 'power3.out',
    });

    gsap.from('.proj-card', {
      scrollTrigger: { trigger: '.proj-grid', start: 'top 82%' },
      y: 60, opacity: 0, duration: 0.8,
      stagger: 0.12, ease: 'power3.out',
    });

    gsap.from('.stat-card', {
      scrollTrigger: { trigger: '.stats-grid', start: 'top 82%' },
      y: 45, opacity: 0, duration: 0.7,
      stagger: 0.1, ease: 'power3.out',
    });

    document.querySelectorAll('.sec-head').forEach(h => {
      gsap.from(h, {
        scrollTrigger: { trigger: h, start: 'top 88%' },
        y: 40, opacity: 0, duration: 0.9,
        ease: 'power3.out',
      });
    });

    gsap.from('.feat-i, .feat-sep', {
      scrollTrigger: { trigger: '.feat-row', start: 'top 90%' },
      opacity: 0, x: -18, duration: 0.5,
      stagger: 0.08, ease: 'power2.out',
    });

    gsap.from('.cta-band .cnt > *', {
      scrollTrigger: { trigger: '.cta-band', start: 'top 82%' },
      y: 40, opacity: 0, duration: 0.85,
      stagger: 0.15, ease: 'power3.out',
    });

    gsap.from('.test-wrap', {
      scrollTrigger: { trigger: '.testimonials', start: 'top 80%' },
      y: 50, opacity: 0, duration: 0.9,
      ease: 'power3.out',
    });

    const heroPhoto = document.querySelector('.hero-photo');
    if (heroPhoto) {
      gsap.to(heroPhoto, {
        y: '18%', ease: 'none',
        scrollTrigger: {
          trigger: '.hero', start: 'top top',
          end: 'bottom top', scrub: true,
        },
      });
    }

    gsap.from('.footer-brand > *', {
      scrollTrigger: { trigger: '.footer', start: 'top 92%' },
      y: 30, opacity: 0, duration: 0.7,
      stagger: 0.1, ease: 'power3.out',
    });
  }


  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el     = e.target;
        const target = parseInt(el.dataset.target, 10);
        const dur    = 2200;
        const start  = performance.now();
        const tick = now => {
          const p   = Math.min((now - start) / dur, 1);
          const val = Math.floor(easeOutCubic(p) * target);
          el.textContent = val;
          p < 1 ? requestAnimationFrame(tick) : (el.textContent = target);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.55 });
    counters.forEach(c => io.observe(c));
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function initTimeline() {
    const items = document.querySelectorAll('.tl-item');
    if (!items.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.22 });
    items.forEach(item => io.observe(item));
  }

  function initTestimonials() {
    const cards  = document.querySelectorAll('.test-card');
    const dots   = document.querySelectorAll('.t-dot');
    const btnPrv = document.getElementById('t-prev');
    const btnNxt = document.getElementById('t-next');
    if (!cards.length) return;
    let cur = 0, timer;
    const show = idx => {
      cards[cur].classList.remove('on');
      cards[cur].style.opacity = 0;
      dots[cur].classList.remove('on');
      cur = ((idx % cards.length) + cards.length) % cards.length;
      cards[cur].classList.add('on');
      setTimeout(() => { cards[cur].style.opacity = 1; }, 20);
      dots[cur].classList.add('on');
    };

    const next = () => show(cur + 1);
    const prev = () => show(cur - 1);
    const autoStart = () => { timer = setInterval(next, 5500); };
    const autoStop  = () => clearInterval(timer);
    btnNxt?.addEventListener('click', () => { autoStop(); next(); autoStart(); });
    btnPrv?.addEventListener('click', () => { autoStop(); prev(); autoStart(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { autoStop(); show(i); autoStart(); }));
    document.addEventListener('keydown', e => {
      if (document.querySelector('.testimonials').getBoundingClientRect().top < innerHeight) {
        if (e.key === 'ArrowRight') { autoStop(); next(); autoStart(); }
        if (e.key === 'ArrowLeft')  { autoStop(); prev(); autoStart(); }
      }
    });
    let tx0 = 0;
    const track = document.querySelector('.test-track');
    track?.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
    track?.addEventListener('touchend',   e => {
      const diff = tx0 - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) { autoStop(); diff > 0 ? next() : prev(); autoStart(); }
    }, { passive: true });
    cards[0].style.opacity = 1;
    autoStart();
  }


  function initProjectFilter() {
    const btns  = document.querySelectorAll('.f-btn');
    const cards = document.querySelectorAll('.proj-card');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        btns.forEach(b => b.classList.remove('on'));
        btn.classList.add('on');

        let delay = 0;
        cards.forEach(card => {
          const match = filter === 'all' || card.dataset.cat === filter;
          if (match) {
            card.style.display = 'block';
            if (typeof gsap !== 'undefined') {
              gsap.fromTo(card,
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, duration: 0.45, delay, ease: 'power2.out' }
              );
            } else {
              card.style.opacity = 1;
            }
            delay += 0.08;
          } else {
            if (typeof gsap !== 'undefined') {
              gsap.to(card, {
                opacity: 0, y: -12, duration: 0.3, ease: 'power2.in',
                onComplete: () => { card.style.display = 'none'; },
              });
            } else {
              card.style.display = 'none';
            }
          }
        });
      });
    });
  }


  function initContactForm() {
    const WHATSAPP = '919847660008'; 
    const form    = document.getElementById('c-form');
    const msg     = document.getElementById('f-msg');
    const submitB = document.getElementById('submit-btn');
    if (!form) return;
    form.setAttribute('action', 'javascript:void(0)');
    form.setAttribute('method', 'dialog');
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.style.borderColor = '';
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const lbl = submitB.querySelector('.btn-lbl');
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#f87171';
          valid = false;
        }
      });
      if (!valid) return;
      const name        = form.elements['name'].value.trim();
      const phone       = form.elements['phone'].value.trim();
      const projectType = form.elements['projectType'].value || 'Not specified';
      const message     = form.elements['message'].value.trim();
      const lines = [
        '🏛️ *New Project Enquiry*',
        '━━━━━━━━━━━━━━━━━━━━',
        `*Name:*         ${name}`,
        `*Phone:*        ${phone}`,
        `*Project Type:* ${projectType}`,
        '',
        '*Message:*',
        message,
        '━━━━━━━━━━━━━━━━━━━━',
        '_Sent via Modern Designers & Builders website_',
      ];

      const waURL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
      lbl.textContent  = 'Opening WhatsApp…';
      submitB.disabled = true;
      if (msg) { msg.className = 'f-msg'; msg.textContent = ''; }
      setTimeout(() => {
        window.open(waURL, '_blank', 'noopener,noreferrer');
        if (msg) {
          msg.className   = 'f-msg ok';
          msg.textContent = '✦ WhatsApp opened — your enquiry is pre-filled. Just tap Send.';
        }
        form.reset();
        lbl.textContent  = '✦ Sent via WhatsApp';
        setTimeout(() => {
          lbl.textContent  = 'Send Inquiry';
          submitB.disabled = false;
          if (msg) { msg.className = 'f-msg'; msg.textContent = ''; }
        }, 5000);

      }, 600);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  function logBrand() {
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#C9A84C');
    console.log('%c  🏛️  MODERN DESIGNERS & BUILDERS', 'color:#C9A84C;font-size:15px;font-weight:bold;font-family:Georgia,serif');
    console.log('%c  Premium Architecture & Construction', 'color:#777;font-size:11px;letter-spacing:2px');
    console.log('%c  Precision · Elegance · Innovation', 'color:#B87333;font-size:11px;letter-spacing:3px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#C9A84C');
  }

})();
