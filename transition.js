// =========================================================================
// PREMIUM SINGLE-PAGE-APPLICATION (SPA) DYNAMIC ROUTER & TRANSITIONS
// =========================================================================

if (typeof gsap === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
        initTransitions();
    };
    document.head.appendChild(script);
} else {
    initTransitions();
}

function initTransitions() {
    const run = () => {
        // ----------------------------------------------------
        // 1. INJECT REQUIRED DYNAMIC STYLES FOR THE OVERLAYS
        // ----------------------------------------------------
        if (!document.getElementById('transition-dynamic-styles')) {
            const style = document.createElement('style');
            style.id = 'transition-dynamic-styles';
            style.textContent = `
                /* Fluid Art Canvas Container (Morphic Overlay) */
                .transition-canvas-container {
                    position: fixed;
                    z-index: 999999;
                    overflow: hidden;
                    pointer-events: none;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    border-radius: 0px;
                }
                .transition-canvas-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Target Mask Container (State 2 Layout Overlay) */
                .transition-mask-overlay {
                    position: fixed;
                    inset: 0;
                    background: #ffffff;
                    z-index: 999998;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                    font-family: 'Outfit', 'Inter', sans-serif;
                }
                .transition-mask-overlay.active {
                    opacity: 1;
                    pointer-events: auto;
                }

                /* Masked text styling */
                .transition-mask-text {
                    font-family: 'Playfair Display', serif;
                    font-size: 12vw;
                    font-weight: 900;
                    text-transform: lowercase;
                    background-image: url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1600&auto=format&fit=crop');
                    background-size: 100vw 100vh;
                    background-attachment: fixed;
                    background-position: center;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    -webkit-text-fill-color: transparent;
                    display: inline-block;
                    line-height: 1;
                    letter-spacing: -0.05em;
                    transform-origin: center center;
                    padding: 0 0.3em; /* Prevent italic slanting characters from being cut off */
                }

                /* Subtext under masked text */
                .transition-subtext-el {
                    font-size: 1.15rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.18em;
                    color: #0a0a0c;
                    margin-top: 1.5rem;
                    opacity: 0;
                    transform: translateY(10px);
                    font-family: 'Outfit', sans-serif;
                }
            `;
            document.head.appendChild(style);
        }

        // Run Page Entry Transition on Initial Load
        playPageEntry();
        
        // Bind dynamic routing links
        bindNavLinks();

        // Handle browser back/forward buttons seamlessly
        window.addEventListener('popstate', () => {
            loadPageDynamically(window.location.href);
        });

        // Continuous background state synchronizer (prevents race conditions/transitions leaks)
        setInterval(() => {
            const currentUrl = window.location.href;
            const isHome = currentUrl.includes('index.html') || currentUrl.endsWith('/') || !currentUrl.includes('.html');
            const shapesContainer = document.getElementById('floating-shapes-container');
            if (shapesContainer) {
                shapesContainer.style.display = isHome ? 'none' : 'block';
            }
        }, 100);
    };

    // ==========================================
    // INITIAL LOAD ENTRY ANIMATION
    // ==========================================
    function playPageEntry() {
        const currentUrl = window.location.href;
        let currentWord = 'explore';
        if (currentUrl.includes('about.html')) {
            currentWord = 'passion';
        } else if (currentUrl.includes('projects.html')) {
            currentWord = 'creative';
        } else if (currentUrl.includes('contact.html')) {
            currentWord = 'connect';
        }

        // Toggle background shapes container visibility
        const shapesContainer = document.getElementById('floating-shapes-container');
        if (shapesContainer) {
            if (currentUrl.includes('index.html') || currentUrl.endsWith('/') || !currentUrl.includes('.html')) {
                shapesContainer.style.display = 'none';
            } else {
                shapesContainer.style.display = 'block';
            }
        }

        const entryOverlay = document.createElement('div');
        entryOverlay.className = 'transition-mask-overlay active transition-mask-overlay-entry';
        entryOverlay.style.opacity = '1';
        entryOverlay.innerHTML = `
            <div style="position: relative; display: inline-block; display: flex; align-items: center; justify-content: center;">
                <h2 id="entry-headline" class="transition-mask-text" style="transform: scale(1); opacity: 1;">${currentWord}</h2>
            </div>
        `;
        document.body.appendChild(entryOverlay);

        const pageNav = document.querySelector('.floaty-nav') || document.querySelector('nav') || document.querySelector('.nav-launcher-btn');
        const pageMain = document.querySelector('.page-wrapper') || document.querySelector('.container') || document.querySelector('main');
        const webglCanvas = document.getElementById('webgl-canvas');

        if (pageNav) gsap.set(pageNav, { opacity: 0, y: -20 });
        if (pageMain) gsap.set(pageMain, { opacity: 0, y: 20 });
        if (webglCanvas) gsap.set(webglCanvas, { opacity: 0 });

        const entryHeadline = document.getElementById('entry-headline');
        gsap.timeline({
            onComplete: () => {
                entryOverlay.remove();
                if (pageNav) gsap.set(pageNav, { clearProps: "all" });
                if (pageMain) {
                    pageMain.classList.add('loaded');
                    gsap.set(pageMain, { clearProps: "all" });
                }
            }
        })
        .to(entryHeadline, {
            scale: 80,
            duration: 1.1,
            ease: 'power4.inOut'
        })
        .to(entryOverlay, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, "-=0.5")
        .to([pageNav, pageMain, webglCanvas], {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out'
        }, "-=0.7");
    }

    // ==========================================
    // ROUTING LINK CAPTURE
    // ==========================================
    function bindNavLinks() {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && 
                !href.startsWith('mailto:') && 
                !href.startsWith('tel:') && 
                !href.startsWith('#') && 
                link.target !== '_blank' &&
                link.hostname === window.location.hostname &&
                link.href !== window.location.href) {
                
                link.removeAttribute('data-router-bound');
                link.addEventListener('click', onLinkClick);
                link.setAttribute('data-router-bound', 'true');
            }
        });
    }

    function onLinkClick(e) {
        e.preventDefault();
        const targetUrl = e.currentTarget.href;
        loadPageDynamically(targetUrl);
    }

    // ==========================================
    // SEAMLESS SINGLE-OVERLAY ROUTER & TRANSITION
    // ==========================================
    function loadPageDynamically(targetUrl) {
        // Start AJAX page fetch in background
        const pagePromise = fetch(targetUrl).then(response => response.text());

        let targetWord = 'creative';
        let subtextVal = 'recent works';

        if (targetUrl.includes('index.html') || targetUrl.endsWith('/') || !targetUrl.includes('.html')) {
            targetWord = 'explore';
            subtextVal = 'creative developer';
        } else if (targetUrl.includes('about.html')) {
            targetWord = 'passion';
            subtextVal = 'identity & journey';
        } else if (targetUrl.includes('contact.html')) {
            targetWord = 'connect';
            subtextVal = 'get in touch';
        }

        // Reuse or create overlay
        let transOverlay = document.querySelector('.transition-mask-overlay:not(.transition-mask-overlay-entry)');
        if (!transOverlay) {
            transOverlay = document.createElement('div');
            transOverlay.className = 'transition-mask-overlay';
            transOverlay.innerHTML = `
                <div id="trans-target-box" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 60vw; height: 20vw;">
                    <h2 id="trans-headline" class="transition-mask-text">creative</h2>
                    <div id="trans-subtext" class="transition-subtext-el">loading...</div>
                </div>
            `;
            document.body.appendChild(transOverlay);
        }

        let transCanvas = document.querySelector('.transition-canvas-container');
        if (!transCanvas) {
            transCanvas = document.createElement('div');
            transCanvas.className = 'transition-canvas-container';
            transCanvas.innerHTML = `<img src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1600&auto=format&fit=crop" class="transition-canvas-image" id="trans-canvas-img">`;
            document.body.appendChild(transCanvas);
        }

        const transHeadline = document.getElementById('trans-headline');
        const transSubtext = document.getElementById('trans-subtext');

        // Reset transition values before exit morph starts
        transHeadline.textContent = targetWord;
        transSubtext.textContent = subtextVal;
        gsap.set(transHeadline, { scale: 1, opacity: 1 });
        gsap.set(transSubtext, { opacity: 0, y: 10 });

        // Calculate dynamic dimensions of word target
        const targetBox = document.getElementById('trans-target-box');
        const rect = targetBox.getBoundingClientRect();
        const targetBounds = {
            width: rect.width + 'px',
            height: (rect.height * 0.7) + 'px',
            left: rect.left + 'px',
            top: rect.top + 'px'
        };

        // Reset Canvas Container
        gsap.set(transCanvas, {
            width: '100%',
            height: '100%',
            left: '0px',
            top: '0px',
            borderRadius: '0px',
            opacity: 1
        });
        gsap.set('#trans-canvas-img', { scale: 1.0 });

        const pageNav = document.querySelector('.floaty-nav') || document.querySelector('nav') || document.querySelector('.nav-launcher-btn');
        const pageMain = document.querySelector('.page-wrapper') || document.querySelector('.container') || document.querySelector('main');
        const webglCanvas = document.getElementById('webgl-canvas');

        const fadeTargets = [];
        if (pageNav) fadeTargets.push(pageNav);
        if (pageMain) fadeTargets.push(pageMain);
        if (webglCanvas) fadeTargets.push(webglCanvas);

        // Timeline Phase 1: Morph Canvas Down into Text Mask
        const tl = gsap.timeline();

        tl.addLabel("start")
            // Outro current page elements
            .to(fadeTargets, { opacity: 0, y: -20, duration: 0.4, ease: "power2.in", stagger: 0.05 }, "start")
            
            // Fade-in white background & morph canvas container
            .to(transOverlay, { opacity: 1, pointerEvents: 'auto', duration: 0.4 }, "start")
            .to(transCanvas, {
                width: targetBounds.width,
                height: targetBounds.height,
                left: targetBounds.left,
                top: targetBounds.top,
                borderRadius: '16px',
                duration: 0.8,
                ease: 'cubic-bezier(0.76, 0, 0.24, 1)'
            }, "start+=0.1")
            .to('#trans-canvas-img', { scale: 1.15, duration: 0.8, ease: 'power3.inOut' }, "start+=0.1")
            .to(transCanvas, { opacity: 0, duration: 0.1 }, "start+=0.85")
            .to(transSubtext, { opacity: 1, y: 0, duration: 0.3 }, "start+=0.85")
            .call(() => {
                // Wait for fetch to complete, swap contents and trigger zoom-in immediately
                pagePromise.then(htmlText => {
                    const parser = new DOMParser();
                    const htmlDoc = parser.parseFromString(htmlText, 'text/html');

                    // Swap documents & body styles
                    document.title = htmlDoc.title;
                    document.body.className = htmlDoc.body.className;

                    // Synchronize external stylesheets dynamically
                    const currentLinks = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href.split('?')[0]);
                    htmlDoc.querySelectorAll('link[rel="stylesheet"]').forEach(newLink => {
                        const baseUrl = newLink.href.split('?')[0];
                        if (!currentLinks.includes(baseUrl)) {
                            const clone = newLink.cloneNode(true);
                            document.head.appendChild(clone);
                        }
                    });

                    // Swap Main Content
                    const oldMain = document.querySelector('.page-wrapper') || document.querySelector('.container') || document.querySelector('main');
                    const newMain = htmlDoc.querySelector('.page-wrapper') || htmlDoc.querySelector('.container') || htmlDoc.querySelector('main');
                    if (oldMain && newMain) {
                        oldMain.parentNode.replaceChild(newMain, oldMain);
                    }

                    // Swap Navigation
                    const oldNav = document.querySelector('.floaty-nav');
                    const newNav = htmlDoc.querySelector('.floaty-nav');
                    if (oldNav && newNav) {
                        oldNav.innerHTML = newNav.innerHTML;
                    }

                    // Sync browser URL
                    if (window.location.href !== targetUrl) {
                        history.pushState(null, '', targetUrl);
                    }
                    // Signal bg scripts to sync immediately
                    document.dispatchEvent(new CustomEvent('pagechange'));

                    // Run script initializations
                    executeScripts(newMain);
                    rebindGlobalScripts();

                    // Phase 2: Immediately Zoom In through the text
                    gsap.timeline({
                        onComplete: () => {
                            transOverlay.style.opacity = '0';
                            transOverlay.style.pointerEvents = 'none';
                            transOverlay.remove();
                            transCanvas.remove();
                            
                            if (pageNav) gsap.set(pageNav, { clearProps: "all" });
                            const freshMain = document.querySelector('.page-wrapper') || document.querySelector('.container') || document.querySelector('main');
                            if (freshMain) {
                                freshMain.classList.add('loaded');
                                gsap.set(freshMain, { clearProps: "all" });
                            }
                        }
                    })
                    .to(transHeadline, {
                        scale: 80,
                        duration: 1.1,
                        ease: 'power4.inOut'
                    })
                    .to(transSubtext, {
                        opacity: 0,
                        duration: 0.3
                    }, "-=0.8")
                    .to(transOverlay, {
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    }, "-=0.5")
                    .to([pageNav, newMain, webglCanvas], {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        stagger: 0.12,
                        ease: 'power3.out'
                    }, "-=0.7");
                });
            });
    }

    // ==========================================
    // SCRIPT RUNNER AND HOVER INTERACTION BINDER
    // ==========================================
    function executeScripts(container) {
        if (!container) return;
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            // Only execute inline scripts, DO NOT re-execute scripts with src attribute!
            if (!oldScript.getAttribute('src')) {
                const newScript = document.createElement('script');
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                oldScript.parentNode.replaceChild(newScript, oldScript);
            }
        });
    }

    function rebindGlobalScripts() {
        // 1. 3D Tilt Card Effects
        const tiltCards = document.querySelectorAll("[data-tilt]");
        tiltCards.forEach(card => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xPct = x / rect.width;
                const yPct = y / rect.height;
                const xRot = (0.5 - yPct) * 10;
                const yRot = (xPct - 0.5) * 10;
                card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.02)`;
            });
            card.style.transition = 'transform 0.1s ease';
            card.addEventListener("mouseleave", () => {
                card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
            });
        });

        // 2. Magnetic Buttons & Hover effects
        const magnets = document.querySelectorAll("a, button, .btn-primary, .project-link");
        magnets.forEach((el) => {
            el.addEventListener("mousemove", (e) => {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = e.clientX - centerX;
                const deltaY = e.clientY - centerY;
                el.style.transform = `translate(${deltaX * 0.3}px, ${deltaY * 0.3}px)`;
                document.body.classList.add("hovering");
            });
            el.addEventListener("mouseleave", () => {
                el.style.transform = "translate(0, 0)";
                document.body.classList.remove("hovering");
            });
        });

        // 3. Stats Numbers Counter (using Anime.js)
        const animeLib = typeof anime !== 'undefined' ? anime : (window.anime || window.animejs);
        if (animeLib) {
            const statNumbers = document.querySelectorAll('.stats-num');
            statNumbers.forEach(stat => {
                const targetVal = parseInt(stat.getAttribute('data-target') || stat.innerText);
                animeLib({
                    targets: stat,
                    innerHTML: [0, targetVal],
                    easing: 'linear',
                    round: 1,
                    duration: 2000,
                    update: function (a) {
                        // Only update the numeric text — the '+' lives as a sibling in HTML
                        stat.textContent = Math.round(a.animations[0].currentValue);
                    }
                });
            });
        }

        // 4. Scroll Reveal Intersections
        const sections = document.querySelectorAll("section, .project-card, .bio-item, .contact-wrapper, .intro, .profile, .hero-title, .hero-subtitle, .cta-group");
        sections.forEach(sec => {
            if (!sec.classList.contains('reveal-on-scroll')) {
                sec.classList.add("reveal-on-scroll");
            }
        });
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                }
            });
        }, { threshold: 0.1 });
        sections.forEach(sec => observer.observe(sec));

        // 5. Re-bind dynamic router nav links
        bindNavLinks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
}
