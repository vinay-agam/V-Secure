/* ============================================
   V SECURE — Main JavaScript
   Light Theme & Mobile Optimized
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

    // 2. Ensure drawer header exists with dedicated close button
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
        <button class="nav__drawer-close" aria-label="Close navigation">
          <i class="fa-solid fa-xmark"></i>
        </button>
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

    // 5. Drawer Toggle / Close Handlers
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

    const drawerCloseBtn = headerNav.querySelector('.nav__drawer-close');
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
      });
    }

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

    // Automatically close drawer if window expands beyond 1024px
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && headerNav.classList.contains('open')) {
        closeMenu();
      }
    }, { passive: true });
  }

  // ---------- SCROLL REVEAL OBSERVER ----------
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(el => revealObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('revealed'));
    }
  }

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
