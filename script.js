/* DREAM SCHOOL — animated interactions */

const DREAM_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#C8D4F0' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5B6B8C' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#EEF1FB' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#A8C5E8' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#DDE3F2' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#B8D4C8' }] },
];

window.initMap = function initMap() {
  const container = document.getElementById('map');
  if (!container || !window.google || !window.google.maps) return;
  const cfg = window.DREAM_MAP_CONFIG || { lat: 41.367, lng: 69.288 };
  const center = { lat: cfg.lat, lng: cfg.lng };
  const map = new window.google.maps.Map(container, {
    center,
    zoom: 16,
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'cooperative',
    styles: DREAM_MAP_STYLES,
  });

  const pinSvg = `
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="9" fill="#4A90C2" stroke="white" stroke-width="3"/>
    </svg>`;
  const marker = new window.google.maps.Marker({
    position: center,
    map,
    icon: {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
      scaledSize: new window.google.maps.Size(26, 26),
      anchor: new window.google.maps.Point(13, 13),
    },
  });

  const info = document.getElementById('mapOverlay');
  const route = document.getElementById('googleRouteLink');
  if (info && route) {
    route.href = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
    marker.addListener('click', () => info.classList.toggle('is-open'));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const mmReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced = mmReduced.matches;
  const isMobile = window.matchMedia('(max-width: 920px)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
  const isHome = document.body.querySelector('.hero');

  /* ---- Mobile menu ---- */
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) burger.addEventListener('click', () => navLinks.classList.toggle('is-open'));

  /* ---- Active nav link ---- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ---- FAQ accordion (about page) ---- */
  document.querySelectorAll('[data-faq]').forEach((item) => {
    const trigger = item.querySelector('[data-faq-trigger]');
    if (!trigger) return;
    trigger.addEventListener('click', () => item.classList.toggle('is-open'));
  });

  /* ---- Clubs filter (programs page) ---- */
  const filterBtns = document.querySelectorAll('[data-filter-btn]');
  const clubCards = document.querySelectorAll('[data-club]');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const cat = btn.dataset.filterBtn;
      clubCards.forEach((card) => {
        const match = cat === 'all' || card.dataset.club === cat;
        card.style.display = match ? '' : 'none';
      });
    });
  });

  const setRevealFallback = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  };

  const setFormMicroUX = () => {
    document.querySelectorAll('.form-field').forEach((field) => {
      const input = field.querySelector('input, textarea, select');
      if (!input) return;
      const update = () => field.classList.toggle('has-value', !!String(input.value || '').trim());
      input.addEventListener('focus', () => field.classList.add('is-focused'));
      input.addEventListener('blur', () => field.classList.remove('is-focused'));
      input.addEventListener('input', update);
      update();
    });
  };

  const setButtonRipple = () => {
    document.querySelectorAll('[data-ripple-btn]').forEach((btn) => {
      btn.addEventListener('pointerdown', (event) => {
        if (isReduced) return;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple';
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  };

  const setTrialFormSubmit = () => {
    const form = document.querySelector('[data-trial-form]');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const status = form.querySelector('[data-form-status]');
      if (!data.parent || !data.phone || !data.child) {
        status.textContent = 'Пожалуйста, заполните все обязательные поля.';
        status.className = 'form-status is-error';
        return;
      }
      status.innerHTML = '<span class="status-check">✓</span> Заявка отправлена! Мы свяжемся с вами в течение дня.';
      status.className = 'form-status is-success';
      if (!isReduced) createConfetti(status);
      form.reset();
      setFormMicroUX();
      setTimeout(() => { status.textContent = ''; status.className = 'form-status'; }, 6000);
    });
  };

  const createConfetti = (anchor) => {
    const rect = anchor.getBoundingClientRect();
    const colors = ['#7FB1E0', '#BCD7F2', '#2E6FB8', '#D9EAF9'];
    for (let i = 0; i < 18; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${rect.left + rect.width / 2}px`;
      piece.style.top = `${rect.top + 14}px`;
      piece.style.background = colors[i % colors.length];
      document.body.appendChild(piece);
      const angle = (Math.PI * 2 * i) / 18;
      const distance = 42 + Math.random() * 38;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - 26;
      piece.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${x}px, ${y}px) scale(0.35)`, opacity: 0 },
      ], { duration: 760, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
      setTimeout(() => piece.remove(), 800);
    }
  };

  const setHomeSwipers = () => {
    if (!isHome || typeof window.Swiper === 'undefined') return;
    const testWrap = document.querySelector('.testimonials-swiper');
    if (!testWrap) return;
    // eslint-disable-next-line no-new
    new Swiper(testWrap, {
      loop: true,
      speed: 800,
      autoplay: isReduced ? false : { delay: 5200, disableOnInteraction: false },
      centeredSlides: true,
      slidesPerView: 1.15,
      spaceBetween: 14,
      breakpoints: {
        920: { slidesPerView: 1.45, spaceBetween: 20 },
      },
      pagination: { el: '.testimonial-dots', clickable: true },
      on: {
        init() { document.querySelector('.testimonials')?.classList.add('is-quote-visible'); },
      },
    });
    testWrap.addEventListener('mouseenter', () => testWrap.swiper?.autoplay?.stop());
    testWrap.addEventListener('mouseleave', () => { if (!isReduced) testWrap.swiper?.autoplay?.start(); });
  };

  if (!hasGSAP || !hasScrollTrigger || isReduced) {
    document.documentElement.classList.add('reduced-motion');
    setRevealFallback();
    setFormMicroUX();
    setButtonRipple();
    setTrialFormSubmit();
    setHomeSwipers();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const setSmoothScroll = () => {
    if (typeof window.Lenis === 'undefined') return;
    const lenis = new window.Lenis({ duration: 1.08, smoothWheel: true, touchMultiplier: 1.4 });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  };

  const setScrollProgress = () => {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      transformOrigin: 'left center',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true },
    });
  };

  const setCustomCursor = () => {
    const shouldDisable = isMobile
      || window.matchMedia('(max-width: 1024px)').matches
      || window.matchMedia('(pointer: coarse)').matches
      || isReduced;
    if (shouldDisable) return;

    const glow = document.createElement('div');
    const dot = document.createElement('div');
    glow.className = 'cursor-aura-glow';
    dot.className = 'cursor-aura-dot';
    document.body.append(glow, dot);
    document.body.classList.add('has-aura');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let pressTimer;

    window.addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    });

    window.addEventListener('mousedown', () => {
      glow.classList.add('is-press');
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => glow.classList.remove('is-press'), 120);
    });
    window.addEventListener('mouseup', () => glow.classList.remove('is-press'));

    const tick = () => {
      glowX += (mouseX - glowX) * 0.16;
      glowY += (mouseY - glowY) * 0.16;
      glow.style.left = `${glowX}px`;
      glow.style.top = `${glowY}px`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.querySelectorAll('a, button, [role="button"], input, .interactive').forEach((el) => {
      el.addEventListener('mouseenter', () => glow.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => glow.classList.remove('is-hover'));
    });
  };

  const setMagnetic = () => {
    if (isMobile) return;
    document.querySelectorAll('a, button, .btn').forEach((el) => {
      el.classList.add('magnetic');
      const range = 50;
      el.addEventListener('mousemove', (event) => {
        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        if (Math.hypot(dx, dy) < range) gsap.to(el, { x: dx * 0.14, y: dy * 0.14, duration: 0.45, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' }));
    });
  };

  const animateRevealOnce = () => {
    gsap.utils.toArray('.reveal').forEach((item) => {
      gsap.fromTo(item, { y: 30, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 86%', toggleActions: 'play none none none', once: true },
      });
    });
  };

  const setHeroAnimations = () => {
    if (!isHome) return;
    gsap.to('.hero-title-word > span', {
      yPercent: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      delay: 0.15,
    });

    const linePath = document.querySelector('.hero-underline path');
    if (linePath) {
      const len = linePath.getTotalLength();
      linePath.style.strokeDasharray = `${len}`;
      linePath.style.strokeDashoffset = `${len}`;
      gsap.to(linePath, { strokeDashoffset: 0, duration: 1.05, delay: 1.0, ease: 'power2.out' });
    }

    gsap.fromTo('.hero-sphere', { y: 14, opacity: 0, scale: 0.92 }, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.14,
      ease: 'power3.out',
      delay: 0.35,
    });
    gsap.fromTo('.hero-badge', { y: 12, opacity: 0, scale: 0.94 }, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.55,
      ease: 'power3.out',
      delay: 0.74,
    });

    gsap.utils.toArray('.hero-sphere').forEach((el, index) => {
      gsap.to(el, {
        y: index % 2 ? -9 : 8,
        x: index % 2 ? 5 : -5,
        duration: 4.5 + index,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    gsap.utils.toArray('[data-count]').forEach((el) => {
      const endValue = Number(el.getAttribute('data-count') || 0);
      const hasPlus = el.textContent.includes('+');
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        toggleActions: 'play none none none',
        onEnter: () => {
          const counter = { value: 0 };
          gsap.to(counter, {
            value: endValue,
            duration: 2,
            ease: 'expo.out',
            onUpdate: () => { el.textContent = `${Math.round(counter.value)}${hasPlus ? '+' : ''}`; },
          });
        },
      });
    });

    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
      const marqueeTween = gsap.to(marqueeTrack, {
        xPercent: -50,
        duration: 26,
        ease: 'none',
        repeat: -1,
      });
      marqueeTrack.addEventListener('mouseenter', () => gsap.to(marqueeTween, { timeScale: 0.33, duration: 0.3 }));
      marqueeTrack.addEventListener('mouseleave', () => gsap.to(marqueeTween, { timeScale: 1, duration: 0.3 }));
    }

    const canvas = document.querySelector('.hero-particles');
    if (canvas instanceof HTMLCanvasElement) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const points = Array.from({ length: 14 }, () => ({
        x: Math.random(),
        y: Math.random(),
        s: 1 + Math.random() * 2,
        vx: -0.0003 + Math.random() * 0.0006,
        vy: -0.0002 + Math.random() * 0.0004,
      }));
      const resize = () => {
        canvas.width = canvas.clientWidth * window.devicePixelRatio;
        canvas.height = canvas.clientHeight * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize);
      const draw = () => {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        points.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > 1) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;
          ctx.beginPath();
          ctx.fillStyle = 'rgba(127,177,224,0.24)';
          ctx.arc(p.x * canvas.clientWidth, p.y * canvas.clientHeight, p.s, 0, Math.PI * 2);
          ctx.fill();
        });
        requestAnimationFrame(draw);
      };
      draw();
    }
  };

  const setValuesAnimations = () => {
    const cards = gsap.utils.toArray('.values .value-card');
    if (cards.length) {
      gsap.set(cards, { opacity: 0, y: 24 });
      gsap.from(cards, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.values-grid', start: 'top 80%', toggleActions: 'play none none none', once: true },
      });
    }

    gsap.utils.toArray('.value-num').forEach((num) => {
      const parent = num.closest('.value-card');
      if (!parent) return;
      parent.addEventListener('mouseenter', () => gsap.to(num, {
        backgroundImage: 'linear-gradient(135deg, #2E6FB8, #7FB1E0)',
        color: 'transparent',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        scale: 1.08,
        duration: 0.45,
      }));
      parent.addEventListener('mouseleave', () => gsap.to(num, { clearProps: 'all', duration: 0.4 }));
    });

    const growthWord = document.querySelector('.values h2 em');
    if (growthWord) {
      gsap.fromTo(growthWord, { backgroundSize: '0% 100%' }, {
        backgroundImage: 'linear-gradient(90deg, var(--accent), var(--sky-deep))',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        color: 'transparent',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        duration: 1.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: growthWord, start: 'top 90%', toggleActions: 'play none none none', once: true },
      });
    }

    if (!isMobile && typeof window.VanillaTilt !== 'undefined') {
      window.VanillaTilt.init(document.querySelectorAll('.value-card'), {
        max: 8,
        speed: 360,
        glare: false,
        perspective: 900,
      });
    }
  };

  const setProgramsAnimations = () => {
    gsap.utils.toArray('.program-card .symbol').forEach((symbol) => {
      gsap.from(symbol, {
        scale: 0,
        rotate: -35,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: symbol, start: 'top 86%', toggleActions: 'play none none none', once: true },
        onComplete: () => burstSpark(symbol),
      });
      const card = symbol.closest('.program-card');
      if (!card) return;
      card.addEventListener('mouseenter', () => gsap.to(symbol, {
        rotate: '+=6',
        color: '#DDEEFF',
        duration: 0.45,
        ease: 'power2.out',
      }));
      card.addEventListener('mouseleave', () => gsap.to(symbol, { rotate: 0, color: '#FFFFFF', duration: 0.45 }));
    });
  };

  const burstSpark = (target) => {
    const host = target.parentElement;
    if (!host) return;
    const hostRect = host.getBoundingClientRect();
    for (let i = 0; i < 7; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      host.appendChild(spark);
      const angle = (Math.PI * 2 * i) / 7;
      const x = Math.cos(angle) * (22 + Math.random() * 20);
      const y = Math.sin(angle) * (22 + Math.random() * 18);
      spark.style.left = `${(target.getBoundingClientRect().left - hostRect.left) + target.clientWidth / 2}px`;
      spark.style.top = `${(target.getBoundingClientRect().top - hostRect.top) + target.clientHeight / 2}px`;
      spark.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.2)`, opacity: 0 },
      ], { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
      setTimeout(() => spark.remove(), 500);
    }
  };

  const setNewsAnimations = () => {
    gsap.utils.toArray('.news-grid .news-card').forEach((card, idx) => {
      gsap.from(card, {
        y: 26,
        opacity: 0,
        duration: 0.75,
        delay: idx * 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none', once: true },
      });
      const cover = card.querySelector('.news-cover');
      if (cover) {
        gsap.to(cover, {
          '--news-parallax': '24px',
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    });
  };

  const setCTAAnimation = () => {
    const cta = document.querySelector('.cta-banner');
    if (cta) cta.classList.add('is-animated');
  };

  const setSectionBlobs = () => {
    ['.hero', '.values', '.trial-section', '.cta-banner'].forEach((selector) => {
      const host = document.querySelector(selector);
      if (!host) return;
      host.classList.add('has-blobs');
      for (let i = 0; i < 2; i += 1) {
        const blob = document.createElement('span');
        blob.className = `section-blob section-blob-${i + 1}`;
        host.appendChild(blob);
      }
    });
  };

  setSmoothScroll();
  setScrollProgress();
  setCustomCursor();
  setMagnetic();
  setSectionBlobs();
  animateRevealOnce();
  setHeroAnimations();
  setValuesAnimations();
  setProgramsAnimations();
  setNewsAnimations();
  setCTAAnimation();
  setHomeSwipers();
  setFormMicroUX();
  setButtonRipple();
  setTrialFormSubmit();

  const copyAddressBtn = document.getElementById('copyAddressBtn');
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('Юнусабад-19, Ташкент');
        copyAddressBtn.textContent = 'Адрес скопирован';
        setTimeout(() => { copyAddressBtn.textContent = 'Скопировать адрес'; }, 1800);
      } catch (err) {
        copyAddressBtn.textContent = 'Скопируйте вручную';
      }
    });
  }
});
