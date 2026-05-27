document.addEventListener("DOMContentLoaded", () => {

  /* --- 1. Custom Cursor Logic --- */
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorOutline = document.querySelector(".cursor-outline");

  // Only run if cursor elements depend exist
  if (cursorDot && cursorOutline) {
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows instantly
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;

      // Re-enable blocked pointer events for interactive feel if needed, 
      // but usually pointer-events:none in css is best.
    });

    // Smooth trailing animation
    const animateCursor = () => {
      const speed = 0.15; // smoothness

      outlineX += (mouseX - outlineX) * speed;
      outlineY += (mouseY - outlineY) * speed;

      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;

      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    /* --- Magnetic Buttons --- */
    const magnets = document.querySelectorAll("a, button, .btn-primary, .project-link");
    magnets.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Move element slightly
        el.style.transform = `translate(${deltaX * 0.3}px, ${deltaY * 0.3}px)`;

        // Expand cursor
        document.body.classList.add("hovering");
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0, 0)";
        document.body.classList.remove("hovering");
      });
    });
  }

  /* --- 2. Scroll Reveal Logic --- */
  const sections = document.querySelectorAll("section, .project-card, .bio-item, .contact-wrapper, .intro, .profile, .hero-title, .hero-subtitle, .cta-group");

  // Add class if not present
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

  /* --- 3D Tilt Effect for Project Cards --- */
  const tiltCards = document.querySelectorAll("[data-tilt]");
  tiltCards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate rotation (max 10deg)
      const xPct = x / rect.width;
      const yPct = y / rect.height;
      const xRot = (0.5 - yPct) * 10;
      const yRot = (xPct - 0.5) * 10;

      card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
    });
  });
});


// Sticky Header Logic
const header = document.querySelector('.page-header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  });
}

// Add a simple fade-in for page elements using Anime.js if available
document.addEventListener('DOMContentLoaded', () => {
  // Use global anime if module import failed or didn't load
  const animeLib = typeof anime !== 'undefined' ? anime : (window.anime || window.animejs);

  if (animeLib) {
    // Profile and Main Content Stagger
    const mainElements = document.querySelectorAll('.profile-card, .info-section, .timeline-flow-item, .project-card, .contact-card');
    if (mainElements.length > 0) {
      animeLib({
        targets: mainElements,
        opacity: [0, 1],
        translateY: [30, 0],
        delay: animeLib.stagger(200, { start: 300 }), // Start after delay
        easing: 'easeOutCubic',
        duration: 800
      });
    }

    // Stats Counter Animation removed — handled by per-page inline scripts
  }
      // Navigation double reload constraint
      (function() {
        const reloadFlagKey = 'nav-double-reload';
        // Attach click listeners to navigation links
        document.querySelectorAll('a.nav-pill').forEach(a => {
          a.addEventListener('click', () => {
            const target = a.getAttribute('href');
            // Set flag to trigger a second reload after navigation
            sessionStorage.setItem(reloadFlagKey, '1');
            // If navigating to the same page, force an immediate reload
            if (window.location.pathname.endsWith(target)) {
              location.reload();
            }
          });
        });
        // On page load, perform the second reload if flag set
        if (sessionStorage.getItem(reloadFlagKey) === '1') {
          sessionStorage.removeItem(reloadFlagKey);
          location.reload();
        }
      })();
    });
