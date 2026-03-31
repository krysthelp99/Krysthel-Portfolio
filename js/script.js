/* ============================================================
   KRYSTHEL PORTFOLIO
   1. GSAP Splash  — SplitText-like char animation (power3.out)
   2. TextRoll     — rotateX 90→0 + blur 2px→0 per-char entrance
   3. Lenis        — smooth scroll + parallax
   ============================================================ */

'use strict';

(() => {

  /* ══════════════════════════════════════════════════════════
     SECTION 1 — SPLASH
     Aligned with React SplashScreen / SplitText:
       from { opacity:0, y:16 } | duration ~1.12 | stagger ~48ms | power4.out
  ══════════════════════════════════════════════════════════ */
  const SPLASH_TEXT = 'Krysthel Lua Peterus';

  document.body.classList.add('splash-active');

  const splashEl = document.getElementById('splash');
  const textEl   = document.getElementById('splash-text');
  const barFill  = document.getElementById('splash-bar-fill');

  function splitIntoChars(el, text) {
    el.innerHTML = '';
    text.split(' ').forEach((word, wi, arr) => {
      const wSpan = document.createElement('span');
      wSpan.className = 'splash__word';
      [...word].forEach(char => {
        const cSpan = document.createElement('span');
        cSpan.className = 'splash__char';
        cSpan.textContent = char;
        cSpan.style.opacity = '0';
        cSpan.style.transform = 'translateY(16px)';
        wSpan.appendChild(cSpan);
      });
      el.appendChild(wSpan);
      if (wi < arr.length - 1) el.appendChild(document.createTextNode('\u00A0'));
    });
    return el.querySelectorAll('.splash__char');
  }

  async function animateSplash() {
    await document.fonts.ready;
    const taglineEl = document.getElementById('splash-tagline');
    const chars = splitIntoChars(textEl, SPLASH_TEXT);
    const duration = 1.12;
    const delay = 0.048;
    const totalDuration = duration + delay * Math.max(0, chars.length - 1);
    if (barFill) {
      barFill.style.transition = `width ${totalDuration}s linear`;
      requestAnimationFrame(() => {
        barFill.style.width = '100%';
      });
    }
    if (taglineEl) {
      gsap.fromTo(
        taglineEl,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.75, delay: 0.42, ease: 'power2.out' }
      );
    }
    await new Promise(resolve => {
      gsap.fromTo(
        chars,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: 'power4.out',
          stagger: delay,
          force3D: true,
          onComplete: resolve,
        }
      );
    });
  }

  function exitSplash() {
    return new Promise(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        splashEl.classList.add('done');
        resolve();
      };
      setTimeout(() => {
        document.body.classList.add('app-ready');
        setTimeout(() => {
          splashEl.classList.add('exit');
          splashEl.setAttribute('aria-hidden', 'true');
          splashEl.setAttribute('aria-busy', 'false');
          document.body.classList.remove('splash-active');
          splashEl.addEventListener('transitionend', finish, { once: true });
          setTimeout(finish, 1450);
        }, 130);
      }, 380);
    });
  }


  /* ══════════════════════════════════════════════════════════
     SECTION 2 — TEXT ROLL
     Faithfully ports the motion-primitives TextRoll component.

     Custom variants used:
       enter.initial  → { rotateX: 0,  filter: 'blur(0px)' }  (hidden state)
       enter.animate  → { rotateX: 90, filter: 'blur(2px)'  }  (leaving)
       exit.initial   → { rotateX: 90, filter: 'blur(2px)'  }  (incoming hidden)
       exit.animate   → { rotateX: 0,  filter: 'blur(0px)'  }  (arriving)

     In practice: each char arrives by rotating from rotateX:90→0
     with blur clearing — exactly what the component plays on first render.
  ══════════════════════════════════════════════════════════ */

  function initTextRoll(titleEl) {
    /* 2a. Split each .tr-word into individual .tr-char spans */
    const words = titleEl.querySelectorAll('.tr-word');
    let allChars = [];

    words.forEach(wordEl => {
      const text = wordEl.textContent;
      wordEl.textContent = '';
      [...text].forEach(ch => {
        const span = document.createElement('span');
        span.className  = 'tr-char';
        span.textContent = ch;
        wordEl.appendChild(span);
        allChars.push(span);
      });
    });

    /* 2b. Set initial state — dramatic entrance:
           rotateX flipped, blurred, scaled down, offset Y          */
    gsap.set(allChars, {
      rotateX:             90,
      y:                   40,
      scale:               0.8,
      filter:              'blur(8px)',
      opacity:             0,
      transformPerspective: 600,
      transformOrigin:     'bottom center',
    });

    /* 2c. Animate to final state — cinematic reveal:
           rotateX:0, blur cleared, scale 1, Y 0                    */
    gsap.to(allChars, {
      rotateX:   0,
      y:         0,
      scale:     1,
      filter:    'blur(0px)',
      opacity:   1,
      duration:  1.0,
      ease:      'power3.out',
      stagger:   0.04,
      force3D:   true,
    });
  }


  /* ══════════════════════════════════════════════════════════
     SECTION 3 — MAIN APP
     Starts after splash exits.
  ══════════════════════════════════════════════════════════ */

  function bootApp() {

    /* ── 3a. TextRoll on hero headline ───────────────────── */
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) initTextRoll(heroTitle);

    /* ── 3a-ii. TextType on hero subtitle ────────────────── */
    const heroTyped = document.getElementById('hero-typed');
    if (heroTyped && typeof TextType !== 'undefined') {
      new TextType(heroTyped, {
        texts: [
          'Research-led interfaces. Experiences that feel obvious.',
          'Evidence first. Design that respects how minds work.',
          'From insight to interface—without the noise.',
          'Clarity isn’t accidental. It’s tested.',
          'Human-centered craft, built on real data.',
        ],
        typingSpeed:      55,
        deletingSpeed:    30,
        pauseDuration:    2400,
        initialDelay:     800,
        loop:             true,
        showCursor:       true,
        cursorCharacter:  '|',
        cursorBlinkDuration: 0.53,
      });
    }

    /* ── 3b. Stagger-in for hero elements via GSAP ────────── */
    const staggerEls = [
      document.querySelector('.hero__label'),
      document.querySelector('.hero__typing-wrapper'),
      document.querySelector('.hero__actions'),
    ].filter(Boolean);

    gsap.fromTo(staggerEls,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 0.3 }
    );

    /* ── 3c. LENIS SMOOTH SCROLL ─────────────────────────── */
    const lenis = new Lenis({
      duration:   1.35,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      syncTouch:  false,
      touchInertiaMultiplier: 30,
    });

    let scrollY = 0;
    lenis.on('scroll', ({ scroll }) => { scrollY = scroll; });

    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());


    /* ── 3d. PARALLAX — hero content drift only (no orbs) ─── */
    const heroHeadline = document.querySelector('.hero__headline');
    const heroSub      = document.querySelector('.hero__sub');
    const heroActions  = document.querySelector('.hero__actions');
    const heroLabel    = document.querySelector('.hero__label');

    function tickDrift() {
      const d = scrollY * 0.25;
      if (heroHeadline) heroHeadline.style.transform = `translateY(${-d * 0.6}px)`;
      if (heroSub)      heroSub.style.transform      = `translateY(${-d * 0.45}px)`;
      if (heroActions)  heroActions.style.transform   = `translateY(${-d * 0.3}px)`;
      if (heroLabel)    heroLabel.style.transform     = `translateY(${-d * 0.2}px)`;
      requestAnimationFrame(tickDrift);
    }
    requestAnimationFrame(tickDrift);

    /* Mockup frame parallax */
    const mockupFrames = [...document.querySelectorAll('.mockup-frame[data-parallax]')];
    function tickMockups() {
      mockupFrames.forEach(el => {
        const speed  = parseFloat(el.dataset.parallax);
        const rect   = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
      requestAnimationFrame(tickMockups);
    }
    requestAnimationFrame(tickMockups);





    /* ── 3g. SMOOTH ANCHOR SCROLLING ────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: -56, duration: 1.4 });
      });
    });


    /* ── 3h. SCROLL REVEAL ───────────────────────────────── */
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal-fade, .reveal-slide-up').forEach(el => obs.observe(el));


    /* ── 3i. ACTIVE DOCK ITEM ────────────────────────────── */
    const dockItems = document.querySelectorAll('.dock-item[href^="#"]');
    ['home','about','skills','projects','contact']
      .map(id => document.getElementById(id)).filter(Boolean)
      .forEach(section => {
        new IntersectionObserver(
          entries => entries.forEach(e => {
            if (e.isIntersecting) {
              dockItems.forEach(l => {
                const isActive = l.getAttribute('href') === `#${e.target.id}`;
                l.classList.toggle('active', isActive);
              });
            }
          }),
          { threshold: 0.4 }
        ).observe(section);
      });
    document.querySelectorAll('.mockup-frame').forEach(frame => {
      frame.addEventListener('mousemove', e => {
        const r = frame.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - .5;
        const y = (e.clientY - r.top)  / r.height - .5;
        const py = (frame.style.transform.match(/translateY\(([^)]+)\)/) || ['','0px'])[1];
        frame.style.transform = `translateY(${py}) perspective(1200px) rotateY(${x*10}deg) rotateX(${-y*7}deg)`;
      });
      frame.addEventListener('mouseleave', () => {
        frame.style.transition = 'transform .7s cubic-bezier(.25,.46,.45,.94)';
        setTimeout(() => { frame.style.transition = ''; }, 750);
      });
    });


    /* ── 3k. STAT COUNTERS ───────────────────────────────── */
    const cObs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, raw = el.textContent.trim();
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        const sfx = raw.replace(/[0-9.]/g, '');
        if (isNaN(num)) return;
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / 1400, 1);
          el.textContent = (Math.round((1-Math.pow(1-p,3)) * num * 10) / 10) + sfx;
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
        cObs.unobserve(el);
      }),
      { threshold: 0.6 }
    );
    document.querySelectorAll('.stat__num').forEach(s => cObs.observe(s));

  } // end bootApp()


  /* ══════════════════════════════════════════════════════════
     KICK OFF
  ══════════════════════════════════════════════════════════ */
  animateSplash().then(exitSplash).then(bootApp);

})();
