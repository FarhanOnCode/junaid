
/* ===================================
   SHARED.JS — Global Portfolio Logic
   Mohammed Junaid Digital Marketing
=================================== */

// ── Emergency reset — runs instantly, before anything else ─────────────
// Fixes the bfcache "frozen gradient overlay" bug:
// When the browser restores a page from Back-Forward Cache,
// DOMContentLoaded does NOT fire again, but 'pageshow' does.
// We must immediately reset the transition overlay + loader on every
// pageshow so users never see a frozen gradient after pressing Back.
(function emergencyReset() {
  function resetPage() {
    // 1. Kill the transition overlay immediately (no animation)
    var overlay = document.getElementById('transition-overlay');
    if (overlay) {
      // Remove any inline GSAP transform so CSS default takes over
      overlay.style.transform = 'scaleX(0)';
      overlay.style.opacity   = '0';
      overlay.style.pointerEvents = 'none';
      // Ensure it's out of the way
      overlay.classList.add('hidden');
    }

    // 2. Kill the page loader immediately
    var loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.display = 'none';
    }

    // 3. Reset body overflow (resume.html sets overflow:hidden)
    document.body.style.overflow   = '';
    document.body.style.overflowX  = 'hidden';
    document.body.style.overflowY  = '';
    // Restore normal opacity in case body was mid-fade
    document.body.style.opacity = '1';
  }

  // Fires on EVERY page restoration (fresh load AND bfcache restore)
  window.addEventListener('pageshow', function(e) {
    resetPage();
    // If it's a bfcache restore, re-run any needed setup
    if (e.persisted) {
      // Re-init navbar scroll state
      var navbar = document.getElementById('navbar');
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
      }
    }
  });
}());

// ── Page Loader (fresh loads) ────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  var loader = document.getElementById('page-loader');
  if (loader) {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.5,
      delay: 0.3,
      ease: 'power2.out',
      onComplete: function() { loader.style.display = 'none'; }
    });
  }

  initNavbar();
  initCursorGlow();
  initScrollAnimations();
  initPageTransitions();
  initStickyTicker();
});

// ── Navbar ────────────────────────────────────────────────────────────────
function initNavbar() {
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  var navbar     = document.getElementById('navbar');

  // Highlight active link
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function(link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active-nav');
    }
  });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      mobileMenu.classList.toggle('menu-open');
      hamburger.classList.toggle('open');
    });
    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        mobileMenu.classList.remove('menu-open');
        hamburger.classList.remove('open');
      });
    });
  }

  // Scroll shrink
  window.addEventListener('scroll', function() {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }
  }, { passive: true });
}

// ── Cursor Glow & Custom Cursor ──────────────────────────────────────────
function initCursorGlow() {
  // Only on pointer-fine (mouse) devices, not touch
  if (!window.matchMedia('(pointer:fine)').matches) return;

  document.body.classList.add('hide-default-cursor');

  var glow = document.createElement('div');
  glow.id = 'cursor-glow';
  document.body.appendChild(glow);

  var dot = document.createElement('div');
  dot.id = 'custom-cursor-dot';
  document.body.appendChild(dot);

  var ring = document.createElement('div');
  ring.id = 'custom-cursor-ring';
  document.body.appendChild(ring);

  var mx = 0, my = 0, cx = 0, cy = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
  });

  // Hover effects for interactive elements
  var interactiveSelectors = 'a, button, input, textarea, select, .tilt-card, .profile-card, label';
  document.querySelectorAll(interactiveSelectors).forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      dot.classList.add('hovered');
      ring.classList.add('hovered');
    });
    el.addEventListener('mouseleave', function() {
      dot.classList.remove('hovered');
      ring.classList.remove('hovered');
    });
  });

  (function animateCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    glow.style.transform = 'translate(' + (cx - 200) + 'px,' + (cy - 200) + 'px)';

    rx += (mx - rx) * 0.3;
    ry += (my - ry) * 0.3;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';

    requestAnimationFrame(animateCursor);
  }());
}

// ── Scroll Animations ────────────────────────────────────────────────────
function initScrollAnimations() {
  // Fade-up on scroll
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        gsap.fromTo(entry.target,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out',
            delay: parseFloat(entry.target.dataset.delay || 0) }
        );
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function(el) {
    observer.observe(el);
  });

  // Counter animation
  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(function(el) {
    counterObserver.observe(el);
  });
}

function animateCounter(el) {
  var target   = parseInt(el.dataset.target, 10);
  var suffix   = el.dataset.suffix || '';
  var prefix   = el.dataset.prefix || '';
  var start    = 0;
  var duration = 2000;
  var step     = target / (duration / 16);
  var timer    = setInterval(function() {
    start = Math.min(start + step, target);
    el.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
    if (start >= target) clearInterval(timer);
  }, 16);
}

// ── Page Transitions ──────────────────────────────────────────────────────
function initPageTransitions() {
  var overlay = document.getElementById('transition-overlay');
  if (!overlay) return;

  // Ensure overlay is invisible and non-blocking on page enter
  overlay.style.transform    = 'scaleX(0)';
  overlay.style.opacity      = '0';
  overlay.style.pointerEvents = 'none';

  // Fade the body in (fresh page load entrance)
  gsap.fromTo(document.body,
    { opacity: 0 },
    { opacity: 1, duration: 0.45, ease: 'power2.out' }
  );

  // Intercept internal navigation links only
  document.querySelectorAll('a[href]').forEach(function(link) {
    var href = link.getAttribute('href');

    // Skip: anchors, external links, mailto/tel, non-HTML, download links
    if (!href) return;
    if (href.startsWith('#'))         return;
    if (href.startsWith('http'))      return;
    if (href.startsWith('mailto'))    return;
    if (href.startsWith('tel'))       return;
    if (href.startsWith('whatsapp'))  return;
    if (!href.endsWith('.html'))      return;
    if (link.hasAttribute('download')) return;
    if (link.getAttribute('target') === '_blank') return;

    link.addEventListener('click', function(e) {
      e.preventDefault();
      var dest = href;

      // Reset overlay to starting state before animating
      overlay.classList.remove('hidden');
      overlay.style.pointerEvents = 'all';

      gsap.fromTo(overlay,
        { scaleX: 0, opacity: 1 },
        {
          scaleX: 1,
          duration: 0.45,
          ease: 'power4.inOut',
          onComplete: function() {
            window.location.href = dest;
          }
        }
      );
    });
  });
}

// ── Sticky CTA Ticker ────────────────────────────────────────────────────
function initStickyTicker() {
  var ticker = document.getElementById('sticky-cta');
  if (!ticker) return;

  var lastY = 0;
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    if (y > 300) {
      ticker.classList.add('visible');
      ticker.classList.toggle('hide', y > lastY);
    } else {
      ticker.classList.remove('visible');
    }
    lastY = y;
  }, { passive: true });
}

// ── Card Tilt ────────────────────────────────────────────────────────────
function initCardTilt(selector) {
  selector = selector || '.tilt-card';
  document.querySelectorAll(selector).forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x    = e.clientX - rect.left  - rect.width  / 2;
      var y    = e.clientY - rect.top   - rect.height / 2;
      var rotX = (-y / rect.height) * 14;
      var rotY = ( x / rect.width)  * 14;
      card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.03)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// ── Skill Bars ───────────────────────────────────────────────────────────
function initSkillBars() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var bar = entry.target;
        gsap.to(bar, { width: bar.dataset.pct + '%', duration: 1.4, ease: 'power3.out' });
        obs.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.skill-bar').forEach(function(b) {
    obs.observe(b);
  });
}
