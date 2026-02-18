(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  const navToggle = $('#nav-toggle');
  const primaryNav = $('#primary-nav');
  const navLinks = $$('.nav-link');

  function openNav() {
    navToggle.setAttribute('aria-expanded', 'true');
    primaryNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  navLinks.forEach(link => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNav.classList.contains('open')) {
      closeNav();
      navToggle.focus();
    }
  });


  const header = $('#site-header');

  function handleHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();


  const fab = $('#fab-book');
  const heroSection = $('#hero');

  function handleFabVisibility() {
    if (!heroSection || !fab) return;
    if (heroSection.getBoundingClientRect().bottom < 0) {
      fab.classList.add('visible');
      fab.removeAttribute('hidden');
    } else {
      fab.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleFabVisibility, { passive: true });


  function initRevealAnimations() {
    if (prefersReducedMotion()) {
      $$('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.reveal').forEach(el => observer.observe(el));
  }

  initRevealAnimations();


  const galleryGrid = $('#gallery-grid');

  for (let i = 0; i < 12; i++) {
    const tile = document.createElement('div');
    tile.className = 'gallery-tile reveal';
    tile.setAttribute('data-index', i);
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('aria-label', `View photo ${i + 1}`);

    const img = document.createElement('img');
    img.src = `assets/gallery-${i + 1}.png`;
    img.alt = `Persian Beat Music — Photo ${i + 1}`;
    img.loading = 'lazy';
    tile.appendChild(img);

    galleryGrid.appendChild(tile);
  }

  if (!prefersReducedMotion()) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    $$('.gallery-tile.reveal').forEach(el => revealObserver.observe(el));
  } else {
    $$('.gallery-tile.reveal').forEach(el => el.classList.add('visible'));
  }


  const lightbox = $('#lightbox');
  const lbContent = $('#lb-content');
  const lbClose = $('#lb-close');
  const lbPrev = $('#lb-prev');
  const lbNext = $('#lb-next');
  const lbCounter = $('#lb-counter');
  let currentLbIndex = 0;
  let previousFocusElement = null;

  function openLightbox(index) {
    currentLbIndex = index;
    previousFocusElement = document.activeElement;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    if (previousFocusElement) previousFocusElement.focus();
  }

  function updateLightboxContent() {
    const tiles = $$('.gallery-tile', galleryGrid);
    const tile = tiles[currentLbIndex];
    if (!tile) return;

    const img = tile.querySelector('img');
    lbContent.innerHTML = '';
    if (img) {
      const lbImg = document.createElement('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbImg.className = 'lb-image';
      lbContent.appendChild(lbImg);
    }
    lbCounter.textContent = `${currentLbIndex + 1} / ${tiles.length}`;
  }

  function lightboxPrev() {
    const tiles = $$('.gallery-tile', galleryGrid);
    currentLbIndex = (currentLbIndex - 1 + tiles.length) % tiles.length;
    updateLightboxContent();
  }

  function lightboxNext() {
    const tiles = $$('.gallery-tile', galleryGrid);
    currentLbIndex = (currentLbIndex + 1) % tiles.length;
    updateLightboxContent();
  }

  galleryGrid.addEventListener('click', (e) => {
    const tile = e.target.closest('.gallery-tile');
    if (tile) openLightbox(parseInt(tile.dataset.index, 10));
  });

  galleryGrid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const tile = e.target.closest('.gallery-tile');
      if (tile) {
        e.preventDefault();
        openLightbox(parseInt(tile.dataset.index, 10));
      }
    }
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', lightboxPrev);
  lbNext.addEventListener('click', lightboxNext);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        lightboxPrev();
        break;
      case 'ArrowRight':
        lightboxNext();
        break;
    }
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });


  const toast = $('#toast');
  const toastMsg = $('#toast-msg');
  let toastTimeout = null;

  function showToast(message, duration = 5000) {
    toastMsg.textContent = message;
    toast.removeAttribute('hidden');
    void toast.offsetWidth;
    toast.classList.add('visible');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.setAttribute('hidden', ''), 350);
    }, duration);
  }


  const sparkleCanvas = $('#sparkle-canvas');

  if (sparkleCanvas && !prefersReducedMotion()) {
    const ctx = sparkleCanvas.getContext('2d');
    let sparkles = [];

    function resizeCanvas() {
      sparkleCanvas.width = window.innerWidth;
      sparkleCanvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const sparkleColors = ['#ff2d95', '#a855f7', '#00e5ff', '#fbbf24', '#ffffff'];

    document.addEventListener('click', (e) => {
      if (e.target.closest('button, a, input, select, textarea, .lightbox')) return;

      const count = 8 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        sparkles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          size: Math.random() * 3 + 1,
          color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
          life: 1,
          decay: 0.015 + Math.random() * 0.02,
        });
      }
    });

    function animateSparkles() {
      ctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
      sparkles = sparkles.filter(s => s.life > 0);

      sparkles.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08;
        s.life -= s.decay;

        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.beginPath();

        const spikes = 4;
        const outerR = s.size;
        const innerR = s.size * 0.4;
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          const x = s.x + Math.cos(angle) * r;
          const y = s.y + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animateSparkles);
    }

    animateSparkles();
  }


  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = $(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', targetId);
      }
    });
  });

})();
