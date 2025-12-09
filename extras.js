// --- Audio Engine ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Function to create brown noise buffer
function createBrownNoise() {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compenstating for gain
    }
    return noiseBuffer;
}

const brownNoise = audioCtx.createBufferSource();
brownNoise.buffer = createBrownNoise();
brownNoise.loop = true;

// Create a Filter to make it "Deep Space" but allow some mids for mobile visibility
const filter = audioCtx.createBiquadFilter();
filter.type = 'lowpass';
filter.frequency.value = 400; // 400Hz: Audible on phones, but still "bassy"

// Create a Gain Node (Volume)
const gainNode = audioCtx.createGain();
gainNode.gain.value = 0; // Start silent

// Connect nodes
brownNoise.connect(filter);
filter.connect(gainNode);
gainNode.connect(audioCtx.destination);

brownNoise.start();

// Fade In Function
window.fadeInAudio = function () {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    // Subtle background ambience (Requested: Low Volume)
    gainNode.gain.setTargetAtTime(0.1, audioCtx.currentTime, 3);
};

// --- Neo / Matrix Theme Logic ---
function checkNeo() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    // Check if URL ends with /neo or hash is #neo
    if (window.location.hash === '#neo' || path.includes('/neo')) {
        enableNeoMode();
    }
}

function enableNeoMode() {
    document.body.classList.add('neo-theme');

    // Inject Matrix Particle Override
    if (window.particlesMaterial) {
        window.particlesMaterial.color.setHex(0x00ff00); // Green
        window.particlesMaterial.size = 3.0;
        window.particlesMaterial.opacity = 1.0;
    }

    // Matrix Rain Overlay? (Optional, let purely CSS/Particles handle it for now)

    // Play Matrix Sound?
    // filter.frequency.value = 800; // Open up the filter for sharper sound
}

// Global Secret Code Listener
let keys = [];
const secretCode = 'sijo';
const altCode = 'neo';
window.addEventListener('keydown', (e) => {
    keys.push(e.key);
    // Keep buffer reasonably sized
    if (keys.length > 20) keys.shift();

    const stream = keys.join('');

    if (stream.includes(secretCode) || stream.includes(altCode)) {
        // Clear buffer so repeating doesn't jitter
        keys = [];
        // Toggle Neo Mode
        document.body.classList.toggle('neo-theme');
        if (document.body.classList.contains('neo-theme')) {
            window.location.hash = 'neo'; // Persist via hash
            if (window.particlesMaterial) window.particlesMaterial.color.setHex(0x00ff00);
        } else {
            window.history.pushState("", document.title, window.location.pathname + window.location.search);
            if (window.particlesMaterial) window.particlesMaterial.color.setHex(0x00ffff);
        }
    }
});

// Run Check
checkNeo();

// --- Robust Audio Unlock for Mobile ---
const unlockAudio = () => {
    // 1. Resume Context (Standard)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // 2. Play a distinct silent note to force the audio engine to wake up (iOS Hack)
    try {
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
    } catch (e) { }

    // 3. Fade In
    fadeInAudio();

    // Remove listeners
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
};

// listeners
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);
document.addEventListener('keydown', unlockAudio); // Also unlock on keypress
unlockAudio(); // Try immediately on load just in case (Desktop)

// --- Mobile Secret: Triple Tap to Toggle Neo ---
let lastTap = 0;
let tapCount = 0;

document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength < 500 && tapLength > 0) {
        tapCount++;
        if (tapCount >= 3) { // Triple Tap
            document.body.classList.toggle('neo-theme');
            if (document.body.classList.contains('neo-theme')) {
                // window.alert("Matrix Mode Activated"); // Feedback
                if (window.particlesMaterial) window.particlesMaterial.color.setHex(0x00ff00);
            } else {
                if (window.particlesMaterial) window.particlesMaterial.color.setHex(0x00ffff);
            }
            tapCount = 0;
        }
    } else {
        tapCount = 1;
    }
    lastTap = currentTime;
});
