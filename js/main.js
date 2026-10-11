/* ============================================
   V SECURE — Main JavaScript
   Light Theme & Mobile Optimized
   Sequential Scroll Reveal System
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- STICKY HEADER SHADOW ----------
  const header = document.querySelector('.header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ---------- MOBILE DRAWER NAVIGATION ----------
  const navToggle = document.querySelector('.nav-toggle');
  const headerNav = document.querySelector('.header__nav');

  if (navToggle && headerNav) {
    // 1. Inject mobile backdrop if not already in DOM (placed before header so drawer is strictly above it)
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      if (header && header.parentNode) {
        header.parentNode.insertBefore(backdrop, header);
      } else {
        document.body.prepend(backdrop);
      }
    }

    // 2. Remove redundant second close button from drawer (sole close action is nav-toggle)
    const duplicateClose = headerNav.querySelectorAll('.nav__drawer-close');
    duplicateClose.forEach(btn => btn.remove());

    let drawerHeader = headerNav.querySelector('.nav__drawer-header');
    if (!drawerHeader) {
      drawerHeader = document.createElement('div');
      drawerHeader.className = 'nav__drawer-header';
      drawerHeader.innerHTML = `
        <div class="nav__drawer-brand">
          <div class="header__logo-icon" style="width:34px;height:34px;font-size:0.95rem;">VS</div>
          <div class="header__logo-text" style="font-size:1.05rem;">
            V SECURE
            <span style="font-size:0.65rem;">Property Services</span>
          </div>
        </div>
      `;
      headerNav.insertBefore(drawerHeader, headerNav.firstChild);
    }

    // 3. Ensure drawer footer exists with quick contact
    let drawerFooter = headerNav.querySelector('.nav__drawer-footer');
    if (!drawerFooter) {
      drawerFooter = document.createElement('div');
      drawerFooter.className = 'nav__drawer-footer';
      drawerFooter.innerHTML = `
        <a href="tel:+919840012345" class="nav__drawer-phone">
          <i class="fa-solid fa-phone"></i>
          <span>+91 98400 12345</span>
        </a>
        <div class="nav__drawer-division">A Division of VTrust Realty Pvt. Ltd.</div>
      `;
      headerNav.appendChild(drawerFooter);
    }

    // 4. Ensure mobile CTA pill exists before nav-toggle in header
    const headerInner = document.querySelector('.header__inner');
    if (headerInner && !headerInner.querySelector('.header__mobile-cta')) {
      const mobileCta = document.createElement('a');
      mobileCta.href = 'contact.html#register';
      mobileCta.className = 'header__mobile-cta';
      mobileCta.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Register';
      navToggle.parentNode.insertBefore(mobileCta, navToggle);
    }

    // 5. Drawer Toggle / Close Handlers (Unified Single Close Action)
    const toggleMenu = () => {
      const isOpen = headerNav.classList.toggle('open');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', isOpen);
      backdrop.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    };

    const closeMenu = () => {
      headerNav.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('open');
      document.body.classList.remove('menu-open');
    };

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    backdrop.addEventListener('click', closeMenu);

    // Close when clicking any nav link or CTA
    const allDrawerLinks = headerNav.querySelectorAll('.nav__link, .nav__cta, .nav__drawer-phone');
    allDrawerLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && headerNav.classList.contains('open')) {
        closeMenu();
      }
    });

    // Automatically close drawer if window expands beyond 1180px
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1180 && headerNav.classList.contains('open')) {
        closeMenu();
      }
    }, { passive: true });
  }

  // ---------- SEQUENTIAL SCROLL REVEAL SYSTEM ----------
  // This system ensures all elements animate strictly in DOM order (top → bottom).
  // No element will reveal before all elements above it have been revealed.
  // FIX: On refresh mid-page, elements already above/within viewport are instantly shown.

  const revealSelectors = [
    '.reveal',
    '.benefit-card',
    '.service-card',
    '.step',
    '.plan-card',
    '.app-feature',
    '.section-header',
    '.contact-info-card',
    '.contact-form',
    '.about-split__image',
    '.about-split__content',
    '.process-flow',
    '.additional-services__item',
    '.cta-section .container',
    '.app-section__image',
    '.mv-card',
    '.diff-card',
    '.serve-card',
    '.faq-item',
    '.faq-categories',
    '.about-cards-grid .benefit-card'
  ];

  // Collect all revealable elements, already in DOM order
  const allRevealElements = document.querySelectorAll(revealSelectors.join(', '));

  if (allRevealElements.length > 0) {
    // Ensure each element has the .reveal class for initial hidden state
    allRevealElements.forEach((el) => {
      if (!el.classList.contains('reveal') &&
          !el.classList.contains('reveal--left') &&
          !el.classList.contains('reveal--right') &&
          !el.classList.contains('reveal--zoom')) {
        el.classList.add('reveal');
      }
    });

    // Build an ordered index map: element → its index in DOM order
    const elementIndex = new Map();
    allRevealElements.forEach((el, idx) => {
      elementIndex.set(el, idx);
    });

    // Track state
    let highestRevealedIndex = -1;
    const pendingSet = new Set();

    /**
     * INSTANT REVEAL on page load:
     * If the browser restores scroll position (e.g. refresh while at footer),
     * immediately show all elements that are above or currently within the viewport.
     * This runs BEFORE the IntersectionObserver so content is never invisible.
     */
    const viewportBottom = window.scrollY + window.innerHeight;

    allRevealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elTop = rect.top + window.scrollY;

      // Element is above or within the current viewport
      if (elTop < viewportBottom + 50) {
        // Instantly reveal — no transition, no delay
        el.style.transition = 'none';
        el.style.transitionDelay = '0s';
        el.classList.add('revealed');
        const idx = elementIndex.get(el);
        highestRevealedIndex = Math.max(highestRevealedIndex, idx);
      }
    });

    // Force a reflow so the instant reveals paint before we re-enable transitions
    // eslint-disable-next-line no-unused-expressions
    document.body.offsetHeight;

    // Re-enable transitions on instantly revealed elements (for any future hover effects etc.)
    allRevealElements.forEach((el) => {
      if (el.classList.contains('revealed')) {
        el.style.transition = '';
      }
    });

    /**
     * Process the queue: reveal elements in strict DOM order.
     * Only reveals an element if all elements before it have been revealed.
     */
    const processQueue = () => {
      const pendingArray = Array.from(pendingSet).sort((a, b) => {
        return elementIndex.get(a) - elementIndex.get(b);
      });

      let revealedInThisPass = 0;

      for (const el of pendingArray) {
        const idx = elementIndex.get(el);

        if (idx <= highestRevealedIndex + 1) {
          const staggerDelay = revealedInThisPass * 0.07;
          el.style.transitionDelay = `${staggerDelay}s`;

          el.classList.add('revealed');
          pendingSet.delete(el);
          highestRevealedIndex = Math.max(highestRevealedIndex, idx);
          revealedInThisPass++;
        }
      }

      if (revealedInThisPass > 0 && pendingSet.size > 0) {
        requestAnimationFrame(processQueue);
      }
    };

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        let hasNew = false;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            pendingSet.add(entry.target);
            revealObserver.unobserve(entry.target);
            hasNew = true;
          }
        });

        if (hasNew) {
          processQueue();
        }
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
      });

      allRevealElements.forEach(el => revealObserver.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver
      allRevealElements.forEach(el => el.classList.add('revealed'));
    }
  }

  // ---------- FIX STEPS TIMELINE LINE HEIGHT ----------
  // Dynamically size the vertical line so it spans exactly from
  // the center of the first step marker to the center of the last.
  document.querySelectorAll('.steps').forEach(stepsContainer => {
    const line = stepsContainer.querySelector('.steps__line');
    const markers = stepsContainer.querySelectorAll('.step__marker');
    if (!line || markers.length < 2) return;

    const firstMarker = markers[0];
    const lastMarker = markers[markers.length - 1];

    const containerRect = stepsContainer.getBoundingClientRect();
    const firstCenter = firstMarker.getBoundingClientRect().top + (firstMarker.offsetHeight / 2) - containerRect.top;
    const lastCenter = lastMarker.getBoundingClientRect().top + (lastMarker.offsetHeight / 2) - containerRect.top;

    line.style.top = firstCenter + 'px';
    line.style.height = (lastCenter - firstCenter) + 'px';
    line.style.bottom = 'auto';
  });

  // ---------- COUNTER ANIMATION ----------
  const counters = document.querySelectorAll('.counter');
  if (counters.length > 0) {
    const runCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;

      const duration = 1800;
      const startTime = performance.now();

      const updateCounter = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);

        el.textContent = current.toLocaleString() + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.textContent = target.toLocaleString() + suffix;
        }
      };
      requestAnimationFrame(updateCounter);
    };

    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      counters.forEach(c => counterObserver.observe(c));
    } else {
      counters.forEach(runCounter);
    }
  }

  // ---------- FAQ ACCORDION ----------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // ---------- FAQ CATEGORY FILTER ----------
  const categoryBtns = document.querySelectorAll('.faq-category-btn');
  const faqAllItems = document.querySelectorAll('.faq-item');
  const faqHeadings = document.querySelectorAll('.faq-section-heading');
  if (categoryBtns.length > 0) {
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-category');

        faqAllItems.forEach(item => {
          if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });

        faqHeadings.forEach(heading => {
          if (category === 'all' || heading.getAttribute('data-category') === category) {
            heading.style.display = 'flex';
          } else {
            heading.style.display = 'none';
          }
        });
      });
    });
  }

  // ---------- FORM SUBMISSION HANDLER ----------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Registration Submitted!';
      submitBtn.style.backgroundColor = '#059669';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.backgroundColor = '';
        submitBtn.disabled = false;
        contactForm.reset();
      }, 4000);
    });
  }

  // ---------- ACTIVE NAV HIGHLIGHT ----------
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });

});
