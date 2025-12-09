document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the Curtain Element
    const curtain = document.createElement('div');
    curtain.id = 'page-transition-curtain';
    Object.assign(curtain.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: '#000', // Deep black
        zIndex: '99999', // Top of everything
        pointerEvents: 'none', // Allow clicks initially
        opacity: '1', // Start visible (black screen)
        transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
    });
    document.body.appendChild(curtain);

    // 2. Reveal Page Logic (Fade Out Curtain)
    // Small delay to ensure browser rendering has started
    requestAnimationFrame(() => {
        setTimeout(() => {
            curtain.style.opacity = '0';
        }, 100);
    });

    // Remove curtain after animation to prevent blocking
    curtain.addEventListener('transitionend', () => {
        if (curtain.style.opacity === '0') {
            curtain.style.display = 'none';
        }
    });

    // 3. Navigate Logic (Fade In Curtain)
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        // Filter out hash links (#), duplicates, or target blank
        if (link.hostname === window.location.hostname &&
            !link.hash &&
            link.target !== '_blank' &&
            link.href !== window.location.href) {

            link.addEventListener('click', (e) => {
                e.preventDefault(); // Stop immediate navigation
                const targetUrl = link.href;

                // Show curtain again
                curtain.style.display = 'block';

                // Force reflow
                void curtain.offsetWidth;

                curtain.style.opacity = '1';

                // Wait for animation then navigate
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 600);
            });
        }
    });
});
