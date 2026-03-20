/* =============================================
   WAVES PRINTING PRESS — script.js
   All interactive behaviour + GSAP animations
   ============================================= */

'use strict';

/* ==============================================
   GSAP REGISTRATION (called after GSAP loads)
   ============================================== */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
}

/* ==============================================
   1. PRELOADER — Video Preloader
   ============================================== */
function isMobile() {
  return window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function initPreloader() {
  const preloader = document.getElementById('preloader');
  const preloaderVideo = document.getElementById('preloader-video');
  const pageContent = document.getElementById('page-content');

  if (!preloader) {
    if (pageContent) pageContent.style.opacity = '1';
    return;
  }

  function hidePreloader() {
    sessionStorage.setItem('wpp_preloader_shown', 'true');
    preloader.classList.add('hidden');
    setTimeout(() => { preloader.style.display = 'none'; }, 700);
    revealPage();
  }

  // Skip preloader entirely on mobile
  if (isMobile()) {
    preloader.style.display = 'none';
    if (pageContent) pageContent.style.opacity = '1';
    initPageAnimations();
    return;
  }

  // Skip if shown this session
  if (sessionStorage.getItem('wpp_preloader_shown')) {
    preloader.classList.add('hidden');
    setTimeout(() => { preloader.style.display = 'none'; }, 100);
    if (pageContent) pageContent.style.opacity = '1';
    initPageAnimations();
    return;
  }

  if (preloaderVideo) {
    preloaderVideo.muted = true;
    preloaderVideo.setAttribute('muted', '');
    preloaderVideo.setAttribute('playsinline', '');
    preloaderVideo.setAttribute('webkit-playsinline', '');
    preloaderVideo.load();
    preloaderVideo.play().catch(() => {});
    preloaderVideo.addEventListener('ended', hidePreloader);
    setTimeout(hidePreloader, 8000);
  }
}

/* Hero video — force play on iOS */
window.addEventListener('load', () => {
  const heroVid = document.querySelector('.hero-video');
  if (heroVid) {
    heroVid.muted = true;
    heroVid.setAttribute('muted', '');
    heroVid.load();
    heroVid.play().catch(() => {});
  }
});

/* Reveal page after preloader */
function revealPage() {
  const pageContent = document.getElementById('page-content');
  if (pageContent) {
    gsap.to(pageContent, { opacity: 1, duration: 0.55, ease: 'power2.out' });
  }
  initPageAnimations();
}

/* ==============================================
   2. NAVBAR — scroll behaviour + hamburger + active
   ============================================== */
function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!navbar) return;

  // Transparent → solid on scroll
  const scrollThreshold = 80;
  function onScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', !isOpen);
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Smooth scroll + close mobile menu on nav link click
  document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
      }
    });
  });

  // Hero CTA "Get a Quote" — scroll to contact + pulse form
  const heroQuoteBtn = document.getElementById('hero-quote-btn');
  if (heroQuoteBtn) {
    heroQuoteBtn.addEventListener('click', e => {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      const contactForm    = document.getElementById('contact-form');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
      if (contactForm) {
        setTimeout(() => {
          contactForm.style.transition = 'box-shadow 0.4s ease';
          contactForm.style.boxShadow = '0 0 0 3px rgba(30,111,255,0.4)';
          setTimeout(() => { contactForm.style.boxShadow = ''; }, 1200);
        }, 700);
      }
    });
  }
}

/* Close mobile menu — exported for inline calls */
function closeMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu)  { mobileMenu.classList.remove('open'); }
  if (hamburger)   { hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); }
}

/* Active nav link highlighting based on scroll position */
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ==============================================
   3. LANGUAGE TOGGLE — EN / AR
   ============================================== */
function setLang(lang) {
  const html = document.documentElement;
  const body = document.body;

  if (lang === 'ar') {
    html.setAttribute('lang', 'ar');
    body.setAttribute('dir', 'rtl');
  } else {
    html.setAttribute('lang', 'en');
    body.setAttribute('dir', 'ltr');
  }

  // Update lang button states
  const btnEn = document.getElementById('btn-en');
  const btnAr = document.getElementById('btn-ar');
  if (btnEn) { btnEn.classList.toggle('active', lang === 'en'); btnEn.setAttribute('aria-pressed', lang === 'en'); }
  if (btnAr) { btnAr.classList.toggle('active', lang === 'ar'); btnAr.setAttribute('aria-pressed', lang === 'ar'); }

  // Persist preference
  sessionStorage.setItem('wpp_lang', lang);
}

function initLangToggle() {
  const savedLang = sessionStorage.getItem('wpp_lang') || 'en';
  setLang(savedLang);
}

/* ==============================================
   4. STAT COUNTERS — count up on scroll
   ============================================== */
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length || typeof gsap === 'undefined') return;

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target, 10);
    const suffix = counter.dataset.suffix || '';
    let triggered = false;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              counter.textContent = Math.round(obj.val).toLocaleString() + suffix;
            }
          });
        }
      });
    }, { threshold: 0.5 });

    observer.observe(counter);
  });
}

/* ==============================================
   5. PORTFOLIO FILTER + LIGHTBOX
   ============================================== */
function initPortfolio() {
  /* -- Filter tabs -- */
  const tabs  = document.querySelectorAll('.f-tab');
  const cards = document.querySelectorAll('.port-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Update tab state
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Filter cards
      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('hidden', !show);
      });
    });
  });

  /* -- Lightbox -- */
  const lightbox  = document.getElementById('lightbox');
  const lbClose   = document.getElementById('lb-close');
  const lbCaption = document.getElementById('lb-caption');

  if (!lightbox) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.dataset.title || 'Portfolio Item';
      if (lbCaption) lbCaption.textContent = title;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}

/* ==============================================
   6. POPUP LEAD FORM — 7s delay
   ============================================== */
function initPopup() {
  const overlay   = document.getElementById('popup-overlay');
  const closeBtn  = document.getElementById('popup-close');

  if (!overlay) return;

  // Skip if shown this session
  if (sessionStorage.getItem('wpp_popup_shown')) return;

  function openPopup() {
    overlay.classList.add('active');
    sessionStorage.setItem('wpp_popup_shown', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Trigger after 7 seconds
  setTimeout(openPopup, 7000);

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closePopup();
  });
}

/* ==============================================
   7. FORM SUBMISSIONS — Formspree async
   ============================================== */
function initForms() {
  /* Contact form */
  const contactForm = document.getElementById('contact-form');
  const cfSuccess   = document.getElementById('cf-success');
  if (contactForm && cfSuccess) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn-submit');
      btn.disabled = true;
      btn.style.opacity = '0.7';
      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          contactForm.reset();
          cfSuccess.classList.add('show');
          setTimeout(() => cfSuccess.classList.remove('show'), 5000);
        }
      } catch (_) { /* silent */ }
      btn.disabled = false;
      btn.style.opacity = '';
    });
  }

  /* Popup form */
  const popupForm  = document.getElementById('popup-form');
  const pfSuccess  = document.getElementById('pf-success');
  if (popupForm && pfSuccess) {
    popupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = popupForm.querySelector('.btn-submit');
      btn.disabled = true;
      btn.style.opacity = '0.7';
      try {
        const res = await fetch(popupForm.action, {
          method: 'POST',
          body: new FormData(popupForm),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          popupForm.reset();
          pfSuccess.classList.add('show');
          setTimeout(() => {
            pfSuccess.classList.remove('show');
            document.getElementById('popup-overlay').classList.remove('active');
            document.body.style.overflow = '';
          }, 3000);
        }
      } catch (_) { /* silent */ }
      btn.disabled = false;
      btn.style.opacity = '';
    });
  }
}

/* ==============================================
   8. BLOG SEARCH FILTER (blog.html only)
   ============================================== */
function initBlogSearch() {
  const searchInput = document.getElementById('blog-search');
  const blogCards   = document.querySelectorAll('.blog-grid-full .blog-card');

  if (!searchInput || !blogCards.length) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    blogCards.forEach(card => {
      const title = card.querySelector('h3');
      const text  = title ? title.textContent.toLowerCase() : '';
      card.classList.toggle('blog-card-hidden', query.length > 0 && !text.includes(query));
    });
  });

  /* Blog page category filter tabs */
  const bTabs  = document.querySelectorAll('.blog-page-body .f-tab');
  bTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;
      bTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      blogCards.forEach(card => {
        const cat  = card.dataset.category || 'all';
        const show = filter === 'all' || cat === filter;
        card.classList.toggle('blog-card-hidden', !show);
      });
    });
  });
}

/* ==============================================
   9. GSAP SCROLL ANIMATIONS — all sections
   ============================================== */
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const trigger = (el, vars, triggerVars = {}) => {
    if (!el) return;
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        once: true,
        toggleActions: 'play none none none',
        ...triggerVars
      },
      immediateRender: false,
      ...vars
    });
  };

  /* Section titles */
  document.querySelectorAll('.section-title').forEach(el => {
    trigger(el, { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out' });
  });

  /* Trusted-by label */
  trigger(document.querySelector('.trusted-label'), { opacity: 0, y: 15, duration: 0.6 });

  /* Service cards — staggered */
  const srvCards = document.querySelectorAll('.srv-card');
  if (srvCards.length) {
    gsap.from(srvCards, {
      scrollTrigger: { trigger: '#services .services-grid', start: 'top 95%', once: true, toggleActions: 'play none none none' },
      y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', immediateRender: false
    });
  }

  /* Stat cards */
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length) {
    gsap.from(statCards, {
      scrollTrigger: { trigger: '.stats-row', start: 'top 95%', once: true, toggleActions: 'play none none none' },
      y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', immediateRender: false
    });
  }

  /* Differentiator cards */
  const diffCards = document.querySelectorAll('.diff-card');
  if (diffCards.length) {
    gsap.from(diffCards, {
      scrollTrigger: { trigger: '.diff-row', start: 'top 95%', once: true, toggleActions: 'play none none none' },
      y: 30, opacity: 0, duration: 0.65, stagger: 0.12, ease: 'power2.out', immediateRender: false
    });
  }

  /* Portfolio cards */
  const portCards = document.querySelectorAll('.port-card');
  if (portCards.length) {
    gsap.from(portCards, {
      scrollTrigger: { trigger: '#portfolio-grid', start: 'top 95%', once: true, toggleActions: 'play none none none' },
      opacity: 0, scale: 0.95, duration: 0.55, stagger: 0.08, ease: 'power2.out', immediateRender: false
    });
  }

  /* Process steps + line draw */
  const procSteps = document.querySelectorAll('.proc-step');
  if (procSteps.length) {
    gsap.from(procSteps, {
      scrollTrigger: { trigger: '#process-wrap', start: 'top 95%', once: true, toggleActions: 'play none none none' },
      opacity: 0, y: 20, duration: 0.6, stagger: 0.15, ease: 'power2.out', immediateRender: false
    });

    // Draw the connecting line from left to right
    const lineFill = document.getElementById('proc-line-fill');
    if (lineFill) {
      ScrollTrigger.create({
        trigger: '#process-wrap',
        start: 'top 95%',
        once: true,
        onEnter: () => { lineFill.style.width = '100%'; }
      });
    }
  }

  /* Testimonial section title */
  trigger(document.querySelector('#testimonials .section-title'), { y: 25, opacity: 0, duration: 0.7 });

  /* Blog cards */
  const blogCards = document.querySelectorAll('#blog .blog-card');
  if (blogCards.length) {
    gsap.from(blogCards, {
      scrollTrigger: { trigger: '#blog .blog-grid', start: 'top 95%', once: true, toggleActions: 'play none none none' },
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', immediateRender: false
    });
  }

  /* FAQ items — slide in from left */
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    gsap.from(faqItems, {
      scrollTrigger: { trigger: '.faq-list', start: 'top 95%', once: true, toggleActions: 'play none none none' },
      x: -24, opacity: 0, duration: 0.55, stagger: 0.06, ease: 'power2.out', immediateRender: false
    });
  }

  /* Footer columns */
  const fCols = document.querySelectorAll('.footer-col');
  if (fCols.length) {
    gsap.from(fCols, {
      scrollTrigger: { trigger: '.footer-grid', start: 'top 95%', once: true, toggleActions: 'play none none none' },
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', immediateRender: false
    });
  }

  /* Blog page cards (blog.html) */
  const bPageCards = document.querySelectorAll('.blog-grid-full .blog-card');
  if (bPageCards.length) {
    gsap.from(bPageCards, {
      scrollTrigger: { trigger: '.blog-grid-full', start: 'top 95%', once: true, toggleActions: 'play none none none' },
      y: 28, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power2.out', immediateRender: false
    });
  }
}

/* ==============================================
   10. CHAIRMAN VIDEO SECTION
   ============================================== */
function initChairman() {
  const chairmanSection   = document.getElementById('chairman');
  const chairmanVideo     = document.getElementById('chairman-video');
  const chairmanVideoLayer = document.querySelector('.chairman-video-layer');
  const chairmanMessage   = document.getElementById('chairman-message');

  if (!chairmanSection || !chairmanVideo) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        chairmanVideo.muted = true;
        chairmanVideo.play().catch(() => {});
        observer.unobserve(chairmanSection);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(chairmanSection);

  chairmanVideo.addEventListener('ended', () => {
    chairmanVideoLayer.classList.add('fade-out');
    setTimeout(() => {
      chairmanMessage.classList.add('visible');
    }, 800);
  });

  // Fallback: show message if video fails or takes too long
  setTimeout(() => {
    if (chairmanMessage && !chairmanMessage.classList.contains('visible')) {
      if (chairmanVideoLayer) chairmanVideoLayer.classList.add('fade-out');
      chairmanMessage.classList.add('visible');
    }
  }, 12000);
}

/* ==============================================
   11. PAGE ANIMATIONS — called after preloader
   ============================================== */
function initPageAnimations() {
  initGSAP();
  initScrollAnimations();
  initStatCounters();
  initPortfolio();
  initBlogSearch();
  initChairman();
}

/* ==============================================
   INIT — DOMContentLoaded
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
  initLangToggle();
  initNavbar();
  initPreloader();
  initPopup();
  initForms();
});
