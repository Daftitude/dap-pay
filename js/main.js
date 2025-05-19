// js/main.js

// —— HTML Fragment Injection ——

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
// Assumes particles.min.js was loaded via <script src="js/particles.min.js" defer>
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
        enable: true,
        distance: 150,
        color: '#0CC7F6',
        opacity: 0.3,
        width: 1
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

// —— Nav Toggle Helper ——  
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;
  const expanded = navLinks.classList.toggle('show');
  document.querySelectorAll('.hamburger')
    .forEach(btn => btn.setAttribute('aria-expanded', expanded));
}
window.toggleMenu = toggleMenu;
// —— Logout helper ——
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}
window.logout = logout;

// js/index.js

document.addEventListener('DOMContentLoaded', () => {
  // Smooth-scroll feature reveal
  const learnBtn = document.getElementById('learnMoreBtn');
  if (learnBtn) {
    learnBtn.addEventListener('click', () => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Fade-in on scroll
  const faders = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  faders.forEach(el => observer.observe(el));
});



// —— Common Bootstrap ——  
async function initCommon() {
  // Determine which header/footer to load based on <body data-flavor="...">
  const flavor = document.body.dataset.flavor || 'index';

  // Inject the matching header and footer
  await Promise.all([
    injectHTML(`includes/header-${flavor}.html`, '#nav-placeholder'),
    injectHTML(`includes/footer-${flavor}.html`, '#footer-placeholder')
  ]);

  // Wire up hamburger menu toggles
  document.querySelectorAll('.hamburger')
    .forEach(btn => btn.addEventListener('click', toggleMenu));

  // Initialize the particles background
  initParticles();

  // (Add any other global startup logic here)
}

// Run bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', initCommon);
