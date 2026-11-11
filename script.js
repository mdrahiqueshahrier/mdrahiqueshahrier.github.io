/**
 * Rahique.dev — Creative Technologist Motion & Interactivity Engine
 * Lenis Smooth Scroll + GSAP/ScrollTrigger + Dual-Ring Cursor + 3D Tilt + FormSubmit AJAX
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  initFooterYear();
  const lenisInstance = initLenisAndGsapSync(prefersReducedMotion);
  initNavbar(lenisInstance);
  initMobileMenu();
  initCustomCursor(prefersReducedMotion, isFinePointer);
  initMagneticButtons(prefersReducedMotion, isFinePointer);
  initTiltCards(prefersReducedMotion, isFinePointer);
  initAuroraParticles(prefersReducedMotion);
  initGsapChoreography(prefersReducedMotion);
  initProjectFilters();
  initContactForm();
});

/* --------------------------------------------------------------------------
   1. Dynamic Copyright Year
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

/* --------------------------------------------------------------------------
   2. Lenis Smooth Scroll + GSAP ScrollTrigger Synchronization
   -------------------------------------------------------------------------- */
function initLenisAndGsapSync(prefersReducedMotion) {
  if (prefersReducedMotion || typeof window.Lenis === 'undefined') {
    return null;
  }

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.5,
  });

  if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      window.requestAnimationFrame(raf);
    };
    window.requestAnimationFrame(raf);
  }

  // Smooth anchor scrolling via Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        event.preventDefault();
        lenis.scrollTo(targetEl, { offset: -76 });
      }
    });
  });

  return lenis;
}

/* --------------------------------------------------------------------------
   3. Sticky Navbar Scroll State & Active Section Highlighting
   -------------------------------------------------------------------------- */
function initNavbar() {
  const header = document.getElementById('site-header');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = ['about', 'skills', 'portfolio', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!header) return;

  const updateScrollState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const targetHash = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === targetHash);
          });
        });
      },
      { rootMargin: '-35% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }
}

/* --------------------------------------------------------------------------
   4. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('mobile-menu-icon');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!btn || !menu || !icon) return;

  const setMenuOpen = (isOpen) => {
    menu.classList.toggle('hidden', !isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    icon.classList.toggle('fa-bars', !isOpen);
    icon.classList.toggle('fa-xmark', isOpen);
  };

  btn.addEventListener('click', () => {
    const isCurrentlyOpen = btn.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isCurrentlyOpen);
  });

  links.forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      btn.focus();
    }
  });
}

/* --------------------------------------------------------------------------
   5. Dual-Ring Magnetic Cursor with Neon Spotlight Glow
   -------------------------------------------------------------------------- */
function initCustomCursor(prefersReducedMotion, isFinePointer) {
  if (prefersReducedMotion || !isFinePointer) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');

  document.body.appendChild(ring);
  document.body.appendChild(dot);
  document.body.classList.add('has-custom-cursor');

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;

  const showCursor = () => {
    if (isVisible) return;
    isVisible = true;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  };

  const hideCursor = () => {
    isVisible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  };

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    showCursor();
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  document.addEventListener('mouseleave', hideCursor);

  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    window.requestAnimationFrame(animateRing);
  };
  window.requestAnimationFrame(animateRing);

  const interactiveSelector = 'a, button, input, textarea, [role="button"]';
  document.addEventListener('mouseover', (event) => {
    const interactiveEl = event.target.closest(interactiveSelector);
    const cardEl = event.target.closest('.tilt-card');
    if (interactiveEl) {
      dot.classList.add('is-hovering');
      ring.classList.add('is-hovering');
    } else if (cardEl) {
      ring.classList.add('is-card-hover');
    }
  });

  document.addEventListener('mouseout', (event) => {
    const interactiveEl = event.target.closest(interactiveSelector);
    const cardEl = event.target.closest('.tilt-card');
    if (interactiveEl) {
      dot.classList.remove('is-hovering');
      ring.classList.remove('is-hovering');
    }
    if (cardEl) {
      ring.classList.remove('is-card-hover');
    }
  });
}

/* --------------------------------------------------------------------------
   6. Magnetic Buttons Hover Pull Physics
   -------------------------------------------------------------------------- */
function initMagneticButtons(prefersReducedMotion, isFinePointer) {
  if (prefersReducedMotion || !isFinePointer) return;

  const buttons = document.querySelectorAll('.magnetic-btn');
  buttons.forEach((btn) => {
    const strength = Number(btn.dataset.magneticStrength || 14);

    btn.addEventListener('mousemove', (event) => {
      const rect = btn.getBoundingClientRect();
      const relX = event.clientX - rect.left - rect.width / 2;
      const relY = event.clientY - rect.top - rect.height / 2;
      const moveX = (relX / (rect.width / 2)) * strength;
      const moveY = (relY / (rect.height / 2)) * strength;
      btn.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

/* --------------------------------------------------------------------------
   7. 3D Perspective Tilt Cards + Dynamic Glassmorphism Spotlight Tracking
   -------------------------------------------------------------------------- */
function initTiltCards(prefersReducedMotion, isFinePointer) {
  if (prefersReducedMotion || !isFinePointer) return;

  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const rotateY = ((x / rect.width) - 0.5) * 9;
      const rotateX = ((y / rect.height) - 0.5) * -9;
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* --------------------------------------------------------------------------
   8. Interactive Aurora Shader Mesh & Particle Constellation Canvas
   -------------------------------------------------------------------------- */
function initAuroraParticles(prefersReducedMotion) {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrameId = null;
  let tick = 0;
  const pointer = { x: null, y: null, radius: 150 };

  const colors = [
    'rgba(0, 229, 255, 0.8)',
    'rgba(168, 85, 247, 0.78)',
    'rgba(56, 189, 248, 0.55)',
  ];

  const auroraNodes = [
    { baseX: 0.22, baseY: 0.3, radiusFactor: 0.38, color: 'rgba(0, 229, 255, 0.11)', speed: 0.008 },
    { baseX: 0.78, baseY: 0.36, radiusFactor: 0.42, color: 'rgba(168, 85, 247, 0.12)', speed: 0.006 },
    { baseX: 0.52, baseY: 0.74, radiusFactor: 0.36, color: 'rgba(99, 102, 241, 0.09)', speed: 0.007 },
  ];

  const createParticles = () => {
    const area = width * height;
    const count = Math.min(72, Math.max(26, Math.floor(area / 18500)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.9 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  };

  const resizeCanvas = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createParticles();
    if (prefersReducedMotion) {
      drawFrame();
    }
  };

  const drawAuroraMesh = () => {
    auroraNodes.forEach((node, idx) => {
      const offsetX = prefersReducedMotion ? 0 : Math.sin(tick * node.speed + idx * 2.1) * 55;
      const offsetY = prefersReducedMotion ? 0 : Math.cos(tick * node.speed + idx * 1.7) * 40;
      const cx = width * node.baseX + offsetX;
      const cy = height * node.baseY + offsetY;
      const rad = Math.max(width, height) * node.radiusFactor;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0, node.color);
      grad.addColorStop(1, 'rgba(4, 6, 12, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    });
  };

  const drawFrame = () => {
    tick += 1;
    ctx.clearRect(0, 0, width, height);

    drawAuroraMesh();

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      if (!prefersReducedMotion) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        if (pointer.x !== null && pointer.y !== null) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < pointer.radius && dist > 0) {
            p.x -= (dx / dist) * 0.4;
            p.y -= (dy / dist) * 0.4;
          }
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 135) {
          const alpha = (1 - distance / 135) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    if (!prefersReducedMotion) {
      animationFrameId = window.requestAnimationFrame(drawFrame);
    }
  };

  const heroSection = canvas.parentElement;
  if (heroSection && !prefersReducedMotion) {
    heroSection.addEventListener('mousemove', (event) => {
      const rect = heroSection.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    });

    heroSection.addEventListener('mouseleave', () => {
      pointer.x = null;
      pointer.y = null;
    });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeCanvas, 120);
  });

  resizeCanvas();
  if (!prefersReducedMotion) {
    animationFrameId = window.requestAnimationFrame(drawFrame);
  }

  document.addEventListener('visibilitychange', () => {
    if (prefersReducedMotion) return;
    if (document.hidden && animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    } else if (!document.hidden && !animationFrameId) {
      animationFrameId = window.requestAnimationFrame(drawFrame);
    }
  });
}

/* --------------------------------------------------------------------------
   9. GSAP Scroll Choreography, Kinetic Text & Animated Counters
   -------------------------------------------------------------------------- */
function initGsapChoreography(prefersReducedMotion) {
  if (prefersReducedMotion || typeof window.gsap === 'undefined') {
    return;
  }

  const { gsap, ScrollTrigger } = window;
  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Hero staggered entrance
  const heroItems = document.querySelectorAll('.hero-stagger');
  if (heroItems.length > 0) {
    gsap.fromTo(
      heroItems,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      }
    );
  }

  // Kinetic heading word reveals
  const kineticTitles = document.querySelectorAll('.kinetic-heading');
  if (ScrollTrigger && kineticTitles.length > 0) {
    kineticTitles.forEach((heading) => {
      gsap.fromTo(
        heading,
        { opacity: 0, y: 34, skewY: 2 },
        {
          opacity: 1,
          y: 0,
          skewY: 0,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: heading,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });
  }

  // Staggered card & block scroll reveals
  const revealElements = gsap.utils.toArray('.reveal-up');
  if (ScrollTrigger && revealElements.length > 0) {
    gsap.set(revealElements, { opacity: 0, y: 32 });

    ScrollTrigger.batch(revealElements, {
      start: 'top 87%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.78,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      },
    });
  }

  // Animated numeric counters
  const counters = document.querySelectorAll('[data-count-to]');
  counters.forEach((counterEl) => {
    const target = Number(counterEl.getAttribute('data-count-to'));
    const suffix = counterEl.getAttribute('data-count-suffix') || '';
    const decimals = Number(counterEl.getAttribute('data-count-decimals') || 0);
    if (Number.isNaN(target)) return;

    const state = { value: 0 };
    const runCounter = () => {
      gsap.to(state, {
        value: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => {
          counterEl.textContent = `${state.value.toFixed(decimals)}${suffix}`;
        },
      });
    };

    if (ScrollTrigger) {
      ScrollTrigger.create({
        trigger: counterEl,
        start: 'top 90%',
        once: true,
        onEnter: runCounter,
      });
    } else {
      runCounter();
    }
  });
}

/* --------------------------------------------------------------------------
   10. Projects Hub Category Filters (for Projects/index.html)
   -------------------------------------------------------------------------- */
function initProjectFilters() {
  const filterButtons = document.querySelectorAll('[data-filter-category]');
  const projectCards = document.querySelectorAll('[data-project-category]');
  if (filterButtons.length === 0 || projectCards.length === 0) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-filter-category');

      filterButtons.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('btn-neon-primary', isActive);
        b.classList.toggle('btn-cyber-ghost', !isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-project-category');
        const shouldShow = selected === 'all' || category === selected;
        card.classList.toggle('hidden', !shouldShow);
      });

      if (typeof window.ScrollTrigger !== 'undefined') {
        window.ScrollTrigger.refresh();
      }
    });
  });
}

/* --------------------------------------------------------------------------
   11. Contact Form via FormSubmit AJAX + Glowing Success Modal
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('contact-submit-btn');
  const btnText = document.getElementById('contact-btn-text');
  const btnIcon = document.getElementById('contact-btn-icon');
  const btnSpinner = document.getElementById('contact-btn-spinner');

  const modal = document.getElementById('contact-success-modal');
  const modalCloseBtn = document.getElementById('success-modal-close');
  const modalDoneBtn = document.getElementById('success-modal-done');

  if (!form || !feedback || !submitBtn) return;

  const recipientEmail = 'mdrahiqueshahrier@gmail.com';
  const endpoint = `https://formsubmit.co/ajax/${recipientEmail}`;

  const setLoading = (isLoading) => {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('opacity-80', isLoading);
    submitBtn.classList.toggle('cursor-wait', isLoading);
    if (btnText) btnText.textContent = isLoading ? 'Sending Inquiry...' : 'Send Message';
    if (btnIcon) btnIcon.classList.toggle('hidden', isLoading);
    if (btnSpinner) btnSpinner.classList.toggle('hidden', !isLoading);
  };

  const showInlineError = (message, mailtoUrl = null) => {
    feedback.classList.remove('hidden');
    feedback.className = 'rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200';
    feedback.textContent = message;

    if (mailtoUrl) {
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.className = 'ml-2 font-semibold text-cyan-300 underline underline-offset-4 hover:text-cyan-200';
      link.textContent = 'Send via Email App';
      feedback.appendChild(link);
    }
  };

  const clearFeedback = () => {
    feedback.classList.add('hidden');
    feedback.textContent = '';
  };

  const openSuccessModal = () => {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    if (modalDoneBtn) modalDoneBtn.focus();
  };

  const closeSuccessModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSuccessModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeSuccessModal);
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeSuccessModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeSuccessModal();
      }
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFeedback();

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();
    const subjectField = form.elements._subject ? form.elements._subject.value : 'New Portfolio Client Inquiry!';

    if (name.length < 2) {
      showInlineError('Please enter your name (at least 2 characters).');
      form.elements.name.focus();
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showInlineError('Please enter a valid email address.');
      form.elements.email.focus();
      return;
    }

    if (message.length < 10) {
      showInlineError('Please share a brief overview of your project (at least 10 characters).');
      form.elements.message.focus();
      return;
    }

    setLoading(true);

    const subject = encodeURIComponent(subjectField);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject Details:\n${message}`);
    const mailtoFallback = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: subjectField,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === 'false' || result.success === false) {
        throw new Error(result.message || 'Unable to send message right now.');
      }

      form.reset();
      openSuccessModal();
    } catch (error) {
      showInlineError(
        `Could not reach the mail relay (${error.message}). You can still reach me immediately:`,
        mailtoFallback
      );
    } finally {
      setLoading(false);
    }
  });
}
