/* =========================================================
   Haythem Houiji — Portfolio interactions
   Vanilla JS, no dependencies.
   ========================================================= */

(function () {
    'use strict';

    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------
       Year
    --------------------------------------------------------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------------------------------------------------------
       Theme toggle (dark default, light optional)
    --------------------------------------------------------- */
    const themeBtn = $('#theme-toggle');
    const body = document.body;

    const applyTheme = (mode) => {
        if (mode === 'light') {
            body.classList.add('light');
            if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            body.classList.remove('light');
            if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
        try { localStorage.setItem('theme', mode); } catch (e) {}
    };

    let storedTheme = null;
    try { storedTheme = localStorage.getItem('theme'); } catch (e) {}
    applyTheme(storedTheme === 'light' ? 'light' : 'dark');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            applyTheme(body.classList.contains('light') ? 'dark' : 'light');
        });
    }

    /* ---------------------------------------------------------
       Mobile nav
    --------------------------------------------------------- */
    const burger = $('#nav-burger');
    const navLinks = $('#nav-links');
    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
        navLinks.addEventListener('click', (e) => {
            if (e.target.matches('a')) {
                burger.classList.remove('open');
                navLinks.classList.remove('open');
            }
        });
    }

    /* ---------------------------------------------------------
       Navbar scroll state + scroll progress + active link
    --------------------------------------------------------- */
    const nav = $('#nav');
    const progress = $('.scroll-progress');
    const sections = $$('section[id], header[id]');
    const navLinkEls = $$('.nav__link');

    const onScroll = () => {
        const y = window.scrollY;
        if (nav) nav.classList.toggle('scrolled', y > 10);

        if (progress) {
            const h = document.documentElement;
            const pct = (y / (h.scrollHeight - h.clientHeight)) * 100;
            progress.style.width = Math.min(100, Math.max(0, pct)) + '%';
        }

        // Active link
        let current = '';
        for (const sec of sections) {
            const top = sec.getBoundingClientRect().top;
            if (top <= 120) current = sec.id;
        }
        navLinkEls.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------------------------------------------------------
       Smooth scroll for [data-scroll]
    --------------------------------------------------------- */
    $$('a[data-scroll]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const target = $(href);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 60;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    });

    /* ---------------------------------------------------------
       Reveal on scroll (IntersectionObserver)
    --------------------------------------------------------- */
    const revealEls = $$('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    /* ---------------------------------------------------------
       Typing effect
    --------------------------------------------------------- */
    const typedEl = $('#typed');
    if (typedEl) {
        const words = [
            'ship with confidence',
            'automate the boring parts',
            'design reliable systems',
            'care about quality'
        ];
        let w = 0, c = 0, deleting = false;

        const tick = () => {
            const word = words[w];
            typedEl.textContent = deleting
                ? word.substring(0, c--)
                : word.substring(0, c++);

            let delay = deleting ? 40 : 80;

            if (!deleting && c === word.length + 1) {
                deleting = true;
                delay = 1500;
            } else if (deleting && c === 0) {
                deleting = false;
                w = (w + 1) % words.length;
                delay = 300;
            }
            setTimeout(tick, delay);
        };
        if (!prefersReducedMotion) tick();
        else typedEl.textContent = words[0];
    }

    /* ---------------------------------------------------------
       Animated counters
    --------------------------------------------------------- */
    const counters = $$('.stat__num');
    if (counters.length && 'IntersectionObserver' in window) {
        const countIO = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10) || 0;
                const duration = 1400;
                const start = performance.now();
                const initial = 0;

                const step = (now) => {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - t, 3);
                    el.textContent = Math.round(initial + (target - initial) * eased);
                    if (t < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
                countIO.unobserve(el);
            });
        }, { threshold: 0.4 });
        counters.forEach(c => countIO.observe(c));
    }

    /* ---------------------------------------------------------
       Skill bars: animate width when visible
    --------------------------------------------------------- */
    const bars = $$('.skill-bar span');
    if (bars.length && 'IntersectionObserver' in window) {
        const barIO = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const s = entry.target;
                    const w = s.dataset.width || '0';
                    requestAnimationFrame(() => { s.style.width = w + '%'; });
                    barIO.unobserve(s);
                }
            });
        }, { threshold: 0.4 });
        bars.forEach(b => barIO.observe(b));
    } else {
        bars.forEach(b => b.style.width = (b.dataset.width || 0) + '%');
    }

    /* ---------------------------------------------------------
       Magnetic buttons
    --------------------------------------------------------- */
    if (!prefersReducedMotion) {
        $$('.magnetic').forEach(el => {
            const strength = 18;
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - (rect.left + rect.width / 2);
                const y = e.clientY - (rect.top + rect.height / 2);
                el.style.transform = `translate(${x / rect.width * strength}px, ${y / rect.height * strength}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }

    /* ---------------------------------------------------------
       Tilt + spotlight on skill cards
    --------------------------------------------------------- */
    if (!prefersReducedMotion) {
        $$('[data-tilt]').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rx = ((y / rect.height) - 0.5) * -8;
                const ry = ((x / rect.width)  - 0.5) *  8;
                card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
                card.style.setProperty('--mx', x + 'px');
                card.style.setProperty('--my', y + 'px');
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ---------------------------------------------------------
       Custom cursor
    --------------------------------------------------------- */
    const dot  = $('.cursor-dot');
    const ring = $('.cursor-ring');
    if (dot && ring && matchMedia('(hover: hover)').matches && !prefersReducedMotion) {
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        });

        const loop = () => {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(loop);
        };
        loop();

        const growEls = 'a, button, .skill-card, .stat, .timeline__card, input, textarea';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(growEls)) body.classList.add('cursor-grow');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(growEls)) body.classList.remove('cursor-grow');
        });
    }

    /* ---------------------------------------------------------
       Hero particles (canvas)
    --------------------------------------------------------- */
    const particlesHost = $('#particles');
    if (particlesHost && !prefersReducedMotion) {
        const canvas = document.createElement('canvas');
        canvas.style.width  = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        particlesHost.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, DPR;
        const particles = [];
        const COUNT = 60;

        const resize = () => {
            DPR = Math.min(window.devicePixelRatio || 1, 2);
            W = particlesHost.clientWidth;
            H = particlesHost.clientHeight;
            canvas.width  = W * DPR;
            canvas.height = H * DPR;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        };

        const seed = () => {
            particles.length = 0;
            for (let i = 0; i < COUNT; i++) {
                particles.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: Math.random() * 1.6 + 0.6
                });
            }
        };

        let mouse = { x: -9999, y: -9999 };
        window.addEventListener('mousemove', (e) => {
            const rect = particlesHost.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            const accent = body.classList.contains('light')
                ? 'rgba(37, 99, 235,'
                : 'rgba(110, 231, 183,';

            // lines
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;

                // mouse attraction
                const dx = mouse.x - p.x, dy = mouse.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 120) {
                    p.x += dx * 0.002;
                    p.y += dy * 0.002;
                }

                ctx.beginPath();
                ctx.fillStyle = accent + '0.7)';
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const d = Math.hypot(p.x - q.x, p.y - q.y);
                    if (d < 120) {
                        ctx.strokeStyle = accent + (0.18 * (1 - d / 120)) + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        };

        resize(); seed(); draw();
        window.addEventListener('resize', () => { resize(); seed(); });
    }

    /* ---------------------------------------------------------
       Field placeholder trick (floating labels rely on it)
    --------------------------------------------------------- */
    $$('.field input, .field textarea').forEach(el => {
        if (!el.hasAttribute('placeholder')) el.setAttribute('placeholder', ' ');
    });

})();
