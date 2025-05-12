// js/main.js

// —— HTML Fragment Injection ——
// url: path to your include (e.g. 'includes/nav.html')
// selector: where to dump it (e.g. '#nav-placeholder')
async function injectHTML(url, selector) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        document.querySelector(selector).innerHTML = html;
    } catch (err) {
        console.error(`Failed to inject ${url}:`, err);
    }
}

// —— Particles Init ——
// Assumes particles.min.js was loaded via <script src="js/particles.min.js">
function initParticles(containerId = 'particles-js') {
    if (typeof particlesJS !== 'function') {
        console.warn('particlesJS not found — make sure particles.min.js is loaded.');
        return;
    }
    particlesJS(containerId, {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#0CC7F6' },
            shape: { type: 'circle' },
            opacity: { value: 0.4, random: true },
            size: { value: 3, random: true },
            line_linked: {
                enable: true, distance: 150,
                color: '#0CC7F6', opacity: 0.3, width: 1
            },
            move: { enable: true, speed: 1 }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'grab' },
                onclick: { enable: true, mode: 'push' },
                resize: true
            }
        },
        retina_detect: true
    });
}

// —— Nav Toggle & Helpers ——  
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    const expanded = navLinks.classList.toggle('show');
    document.querySelector('.hamburger')?.setAttribute('aria-expanded', expanded);
}

// Optionally expose globally
window.toggleMenu = toggleMenu;

// —— Common Bootstrap ——  
async function initCommon() {
    // 1) Inject nav & footer
    await Promise.all([
        injectHTML(`includes/header-${flavor}.html`, '#nav-placeholder'),
        injectHTML(`includes/footer-${flavor}.html`, '#footer-placeholder')
    ]);

    // 2) Hook up hamburger (must run after injection)
    document.querySelectorAll('.hamburger')
        .forEach(btn => btn.addEventListener('click', toggleMenu));

    // 3) Init Particles
    initParticles();

    // 4) (Any other common startup, e.g. loadBalance(), checkAuth(), etc.)
}

// run on DOM ready
document.addEventListener('DOMContentLoaded', initCommon);
