/**
 * Md. Rahique Shahrier — Portfolio Interactivity & GSAP Animations
 * Zero-dependency Vanilla JS + GSAP/ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initFooterYear();
  initNavbar();
  initMobileMenu();
  initHeroParticles(prefersReducedMotion);
  initGsapAnimations(prefersReducedMotion);
  initDemoModal();
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
   2. Sticky Navbar Scroll State & Active Section Highlighting
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
   3. Responsive Mobile Navigation Drawer
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
   4. Hero Particle Constellation Canvas
   -------------------------------------------------------------------------- */
function initHeroParticles(prefersReducedMotion) {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrameId = null;
  const pointer = { x: null, y: null, radius: 130 };

  const colors = ['rgba(0, 229, 255, 0.75)', 'rgba(168, 85, 247, 0.7)', 'rgba(148, 163, 184, 0.45)'];

  const createParticles = () => {
    const area = width * height;
    const count = Math.min(68, Math.max(24, Math.floor(area / 19000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      radius: Math.random() * 1.8 + 1,
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

  const drawFrame = () => {
    ctx.clearRect(0, 0, width, height);

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
            p.x -= (dx / dist) * 0.35;
            p.y -= (dy / dist) * 0.35;
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

        if (distance < 130) {
          const alpha = (1 - distance / 130) * 0.16;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
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
   5. GSAP Hero Entrance & ScrollTrigger Reveal Animations
   -------------------------------------------------------------------------- */
function initGsapAnimations(prefersReducedMotion) {
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
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      }
    );
  }

  // Scroll-triggered fade-in & slide-up reveals
  const revealElements = gsap.utils.toArray('.reveal-up');
  if (ScrollTrigger && revealElements.length > 0) {
    gsap.set(revealElements, { opacity: 0, y: 30 });

    ScrollTrigger.batch(revealElements, {
      start: 'top 86%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      },
    });
  }
}

/* --------------------------------------------------------------------------
   6. Interactive Project Live Demo Modal
   -------------------------------------------------------------------------- */
function initDemoModal() {
  const modal = document.getElementById('demo-modal');
  const titleEl = document.getElementById('demo-modal-title');
  const bodyEl = document.getElementById('demo-modal-body');
  const closeBtn = document.getElementById('demo-modal-close');
  const hireBtn = document.getElementById('demo-modal-hire');
  const triggerButtons = document.querySelectorAll('[data-project-demo]');

  if (!modal || !titleEl || !bodyEl || !closeBtn) return;

  const projectDetails = {
    'video-pipeline': {
      title: 'Automated Video Pipeline',
      summary:
        'A serverless-ready media automation workflow that transforms raw content feeds into rendered, subtitled social videos without manual editing.',
      highlights: [
        'Scheduled Node.js workers fetch scripts, media assets, and voiceover tracks via REST APIs.',
        'Headless FFmpeg pipeline applies dynamic overlays, burned-in captions, and 16:9 / 9:16 exports.',
        'Automatic retry queues and webhook notifications confirm publication status in real time.',
      ],
      metric: 'Reduced manual video production time by ~85% per batch.',
    },
    'ecommerce-api': {
      title: 'Custom E-Commerce API',
      summary:
        'A modular headless commerce API engineered in Node.js for fast storefront checkouts, inventory integrity, and multi-channel synchronization.',
      highlights: [
        'Stateless JWT authentication with role-based endpoints for storefronts and admin dashboards.',
        'Idempotent Stripe webhook handlers prevent duplicate order creation under high concurrency.',
        'Automated low-stock alerts and invoice dispatch triggered asynchronously.',
      ],
      metric: 'Sub-50ms median API response across core catalog and cart endpoints.',
    },
    'workflow-engine': {
      title: 'SaaS Workflow & Scraper Engine',
      summary:
        'A reliable browser and API automation suite built to replace repetitive manual data collection and cross-platform syncing.',
      highlights: [
        'Headless Playwright workers navigate authenticated portals with smart rate limiting.',
        'Data validation layer normalizes records before pushing updates to Notion, Slack, and CRMs.',
        'Structured error logging with instant alerts if target page schemas change.',
      ],
      metric: 'Processes 12,000+ automated sync operations daily with zero manual intervention.',
    },
    'telemetry-ui': {
      title: 'Real-Time Telemetry Dashboard',
      summary:
        'A high-contrast, dark-mode operational command center designed for instant visibility into API health and automation jobs.',
      highlights: [
        'Responsive grid system built with semantic HTML5 and Tailwind CSS.',
        'GSAP-choreographed transitions maintain crisp 60fps interaction across desktop and mobile.',
        'Modular Vanilla JS state layer ready to connect to WebSocket or REST telemetry feeds.',
      ],
      metric: 'Lightweight zero-framework frontend delivering near-instant page loads.',
    },
  };

  let lastFocusedTrigger = null;

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  };

  const openModal = (projectKey, triggerEl) => {
    const project = projectDetails[projectKey];
    if (!project) return;

    lastFocusedTrigger = triggerEl;
    titleEl.textContent = project.title;

    bodyEl.innerHTML = '';

    const summaryP = document.createElement('p');
    summaryP.textContent = project.summary;
    bodyEl.appendChild(summaryP);

    const list = document.createElement('ul');
    list.className = 'space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-4';
    project.highlights.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'flex items-start gap-2.5 text-xs sm:text-sm text-slate-300';
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-circle-check mt-1 text-cyan-400';
      icon.setAttribute('aria-hidden', 'true');
      const span = document.createElement('span');
      span.textContent = item;
      li.appendChild(icon);
      li.appendChild(span);
      list.appendChild(li);
    });
    bodyEl.appendChild(list);

    const metricBox = document.createElement('div');
    metricBox.className =
      'rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 font-mono text-xs text-purple-200';
    metricBox.textContent = `Impact: ${project.metric}`;
    bodyEl.appendChild(metricBox);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  triggerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      openModal(btn.getAttribute('data-project-demo'), btn);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  if (hireBtn) {
    hireBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

/* --------------------------------------------------------------------------
   7. Contact Form Validation & Mailto Fallback
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form || !feedback) return;

  const recipientEmail = 'contact@rahiqueshahrier.dev';

  const showFeedback = (type, message, mailtoUrl = null) => {
    feedback.classList.remove(
      'hidden',
      'border-rose-500/40',
      'bg-rose-500/10',
      'text-rose-200',
      'border-emerald-500/40',
      'bg-emerald-500/10',
      'text-emerald-200'
    );

    if (type === 'error') {
      feedback.classList.add('border-rose-500/40', 'bg-rose-500/10', 'text-rose-200');
      feedback.textContent = message;
      return;
    }

    feedback.classList.add('border-emerald-500/40', 'bg-emerald-500/10', 'text-emerald-200');
    feedback.textContent = '';

    const textNode = document.createElement('span');
    textNode.textContent = message;
    feedback.appendChild(textNode);

    if (mailtoUrl) {
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.className = 'ml-2 font-semibold text-cyan-300 underline underline-offset-4 hover:text-cyan-200';
      link.textContent = 'Open Email Client';
      feedback.appendChild(link);
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    if (name.length < 2) {
      showFeedback('error', 'Please enter your name (at least 2 characters).');
      form.elements.name.focus();
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showFeedback('error', 'Please enter a valid email address.');
      form.elements.email.focus();
      return;
    }

    if (message.length < 10) {
      showFeedback('error', 'Please share a brief overview of your project (at least 10 characters).');
      form.elements.message.focus();
      return;
    }

    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject Details:\n${message}`);
    const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    showFeedback(
      'success',
      'Message validated and ready to send! Click to launch your email client:',
      mailtoUrl
    );

    form.reset();
  });
}

