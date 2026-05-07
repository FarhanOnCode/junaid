
/* ===================================
   SHARED.JS — Global Portfolio Logic
   Mohammed Junaid Digital Marketing
=================================== */

// ── Page Loader ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.6,
      delay: 0.4,
      ease: 'power2.out',
      onComplete: () => { loader.style.display = 'none'; }
    });
  }

  initNavbar();
  initCursorGlow();
  initScrollAnimations();
  initPageTransitions();
  initStickyTicker();
});

// ── Navbar ────────────────────────────────────────────────
function initNavbar() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const navbar = document.getElementById('navbar');

  // highlight active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active-nav');
    }
  });

  // hamburger toggle — uses .menu-open (not Tailwind .hidden which was overridden by CSS)
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('menu-open');
      hamburger.classList.toggle('open');
    });
    // close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('menu-open');
        hamburger.classList.remove('open');
      });
    });
  }

  // scroll shrink
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });
}

// ── Cursor Glow ────────────────────────────────────────────
function initCursorGlow() {
  if (window.matchMedia('(pointer:fine)').matches) {
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    document.body.appendChild(glow);

    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function animateCursor() {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      glow.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
      requestAnimationFrame(animateCursor);
    })();
  }
}

// ── Scroll Animations ──────────────────────────────────────
function initScrollAnimations() {
  // fade-up on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.fromTo(entry.target,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', delay: parseFloat(entry.target.dataset.delay || 0) }
        );
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // counter animation
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  let start = 0;
  const duration = 2000;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
    if (start >= target) clearInterval(timer);
  }, 16);
}

// ── Page Transitions ────────────────────────────────────────
function initPageTransitions() {
  const overlay = document.getElementById('transition-overlay');
  if (!overlay) return;

  // enter animation
  gsap.fromTo(document.body,
    { opacity: 0 },
    { opacity: 1, duration: 0.5, ease: 'power2.out' }
  );

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // only internal .html links
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('whatsapp') || !href.endsWith('.html')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.remove('hidden');
      gsap.fromTo(overlay,
        { scaleX: 0, opacity: 1 },
        {
          scaleX: 1, duration: 0.55, ease: 'power4.inOut',
          onComplete: () => { window.location.href = href; }
        }
      );
    });
  });
}

// ── Sticky Ticker ───────────────────────────────────────────
function initStickyTicker() {
  const ticker = document.getElementById('sticky-cta');
  if (!ticker) return;
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 300) {
      ticker.classList.add('visible');
      if (y > lastY) {
        ticker.classList.add('hide');
      } else {
        ticker.classList.remove('hide');
      }
    } else {
      ticker.classList.remove('visible');
    }
    lastY = y;
  });
}

// ── Card Tilt ───────────────────────────────────────────────
function initCardTilt(selector = '.tilt-card') {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (-y / rect.height) * 14;
      const rotY = (x / rect.width) * 14;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// ── Skill Bars ─────────────────────────────────────────────
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const pct = bar.dataset.pct;
        gsap.to(bar, { width: pct + '%', duration: 1.4, ease: 'power3.out' });
        obs.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.skill-bar').forEach(b => obs.observe(b));
}
