import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// --- Configuration ---
const PARTICLE_COUNT = 1500;
const PARTICLE_SIZE = 1.3;
const WAVE_SPEED = 0.8;
const REACT_RADIUS = 150; // Mouse interaction radius

// --- Setup ---

const canvas = document.querySelector('#webgl-canvas');
if (!canvas) {
    console.error("Critical: Canvas #webgl-canvas not found!");
}
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.002); // Distance fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 100; // Closer for more immersion
camera.position.y = 20;  // Lower angle to see 'through' the field

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Particles (The Wave) ---
const geometry = new THREE.BufferGeometry();
const posArray = new Float32Array(PARTICLE_COUNT * 3);

// Create grid of particles
const spread = 800; // Wider spread to fill screen
for (let i = 0; i < PARTICLE_COUNT * 3; i += 3) {
    // x
    posArray[i] = (Math.random() - 0.5) * spread;
    // y (More volume)
    posArray[i + 1] = (Math.random() - 0.5) * 200;
    // z
    posArray[i + 2] = (Math.random() - 0.5) * spread;
}

geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Custom Shader Material (Simple glowing dots)
const material = new THREE.PointsMaterial({
    size: 2.0, // increased from 1.3
    color: 0x00ffff, // Cyan
    transparent: true,
    opacity: 0.9, // increased from 0.8
    blending: THREE.AdditiveBlending
});
// Expose for Neo Mode
window.particlesMaterial = material;

const particlesMesh = new THREE.Points(geometry, material);
scene.add(particlesMesh);

// --- Mouse Interaction ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    // Normalize mouse for rotation
    targetX = (event.clientX / window.innerWidth) * 2 - 1;
    targetY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// --- Gyroscope Interaction (Mobile & DevTools Sensors) ---
window.addEventListener('deviceorientation', (event) => {
    // Debug log to console to verify sensors are firing
    // console.log("Gyro:", event.gamma, event.beta);

    // Gamma: Left/Right tilt (-90 to 90)
    // Beta: Front/Back tilt (-180 to 180)

    // DevTools Sensors simulates gamma/beta correctly.
    // We map 90 degrees to full range 1.0.

    // Prevent null values (happens on some desktops without sensors)
    if (event.gamma !== null) {
        let x = event.gamma / 45;
        let y = event.beta / 45;

        // Clamp values to -1 to 1
        targetX = Math.max(-1, Math.min(1, x));
        targetY = Math.max(-1, Math.min(1, y));
    }
});

// --- Animation Loop ---
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // 1. Wave Animation (Sine waves)
    // We access the position array directly
    // This is CPU heavy, for 'trillions' performance use shaders, but this is simple/safe for vanilla

    // Gentle global rotation (Faster base speed)
    particlesMesh.rotation.y = elapsedTime * 0.15; // Increased from 0.05

    // Breathing/Pulse effect
    const pulse = 1 + Math.sin(elapsedTime * 0.5) * 0.05;
    particlesMesh.scale.set(pulse, pulse, pulse);

    // Mouse/Gyro Parallax
    particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
    particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

// --- Permission Request (iOS 13+ / Android) ---
document.body.addEventListener('click', async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permissionState = await DeviceOrientationEvent.requestPermission();
            if (permissionState === 'granted') {
                // window.alert("Gyroscope Access Granted!"); 
            }
        } catch (error) {
            console.error(error);
        }
    }
}, { once: true });

// Fade in
canvas.style.opacity = 1;

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
