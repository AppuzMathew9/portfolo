// Use global anime if module import failed or didn't load (fallback for different envs)
const animeLib = typeof anime !== 'undefined' ? anime : (window.anime || window.animejs);

// Configuration
const SHAPE_COUNT = 15;
const SHAPE_TYPES = ['circle', 'square', 'triangle'];
// Cosmic Palette: Cyan, Magenta, Mint, Deep Purple, White
const COLORS = ['#00FFFF', '#FF00FF', '#69f0ae', '#b86adf', '#ffffff'];

const container = document.createElement('div');
container.id = 'floating-shapes-container';
Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '0', // Increased from -1 to be on top of the dark BG canvas
    pointerEvents: 'none',
    overflow: 'hidden'
});

document.body.appendChild(container);

function createShape() {
    // If animeLib is not found, stop to prevent errors
    if (!animeLib) {
        console.error("Anime.js library not found for background shapes.");
        return;
    }

    const shape = document.createElement('div');
    const size = animeLib.random(20, 80);
    const type = SHAPE_TYPES[animeLib.random(0, SHAPE_TYPES.length - 1)];
    const color = COLORS[animeLib.random(0, COLORS.length - 1)];

    Object.assign(shape.style, {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'rgba(255,255,255,0.05)', // Very subtle default
        border: `1px solid ${color}`,
        borderRadius: type === 'circle' ? '50%' : '0%',
        opacity: animeLib.random(0.1, 0.4),
        transition: 'border-color 0.5s, box-shadow 0.5s' // Smooth transition for Neo mode
    });

    // Add logic to listen for class changes on body (MutationObserver is overkill, we'll use a poller or Custom Event)
    // Actually, css variable fallback is better, but 'color' is inline.
    // Let's add a data attribute so we can target it later if needed, 
    // OR we just use a global update interval.
    shape.classList.add('floating-shape');

    // Triangle logic is css complex, keeping to square/circle for simplicity or use clip-path
    if (type === 'triangle') {
        shape.style.width = '0';
        shape.style.height = '0';
        shape.style.border = 'none';
        shape.style.borderLeft = `${size / 2}px solid transparent`;
        shape.style.borderRight = `${size / 2}px solid transparent`;
        shape.style.borderBottom = `${size}px solid ${color}`;
        shape.style.backgroundColor = 'transparent';
    }

    // Random position but avoid center area (approx 30% to 70% width/height)
    let safe = false;
    let x, y;
    let attempts = 0;
    while (!safe && attempts < 20) {
        x = animeLib.random(0, 100);
        y = animeLib.random(0, 100);
        // Define center exclusion zone (e.g., 25% < x < 75% AND 20% < y < 80%)
        // This is rough but keeps the middle mostly clear for content
        if ((x < 20 || x > 80) || (y < 10 || y > 90)) {
            safe = true;
        }
        attempts++;
    }

    shape.style.left = `${x}vw`;
    shape.style.top = `${y}vh`;

    container.appendChild(shape);

    animateShape(shape);
}

function animateShape(el) {
    if (!animeLib) return;
    animeLib({
        targets: el,
        translateX: () => animeLib.random(-300, 300), // More movement
        translateY: () => animeLib.random(-300, 300),
        rotate: () => animeLib.random(0, 360),
        rotateX: () => animeLib.random(0, 360), // 3D Rotation
        rotateY: () => animeLib.random(0, 360), // 3D Rotation
        scale: () => animeLib.random(0.5, 1.5),
        duration: () => animeLib.random(15000, 30000), // Slower, more majestic
        easing: 'linear',
        direction: 'alternate',
        loop: true
    });
}

// --- Gyroscope for Shapes ---
window.addEventListener('deviceorientation', (event) => {
    // Subtle parallax for the container of shapes
    const x = event.gamma / 20; // Damped
    const y = event.beta / 20;

    if (container) {
        container.style.transform = `translate(${x}px, ${y}px) rotateX(${y}deg) rotateY(${x}deg)`;
        container.style.transition = 'transform 0.5s ease-out'; // Smoothout
    }
});

// Init
if (animeLib) {
    for (let i = 0; i < SHAPE_COUNT; i++) {
        createShape();
    }
} else {
    // Retry once in case of async load
    setTimeout(() => {
        const retryLib = typeof anime !== 'undefined' ? anime : (window.anime || window.animejs);
        if (retryLib) {
            // Redefine globally if needed or just use retryLib
            for (let i = 0; i < SHAPE_COUNT; i++) {
                // We'd need to pass retryLib or rely on global scope being updated, 
                // but local 'animeLib' const won't update.
                // Simple reload of page usually fixes this, but let's just log error.
                console.log("Anime.js loaded late, please refresh if shapes are missing.");
            }
        }
    }, 1000);
}

// --- Neo Mode Shape Updater ---
setInterval(() => {
    const isNeo = document.body.classList.contains('neo-theme');
    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach(shape => {
        if (isNeo) {
            shape.style.borderColor = '#00ff00';
            shape.style.boxShadow = '0 0 10px #00ff00';
            // If triangle
            if (shape.style.borderBottom) {
                shape.style.borderBottomColor = '#00ff00';
            }
        } else {
            // Revert if previously green
            if (shape.style.borderColor === 'rgb(0, 255, 0)' || shape.style.borderColor === '#00ff00') {
                shape.style.borderColor = 'rgba(255,255,255,0.3)';
                shape.style.boxShadow = 'none';
                if (shape.style.borderBottom) shape.style.borderBottomColor = 'rgba(255,255,255,0.3)';
            }
        }
    });
}, 500);
