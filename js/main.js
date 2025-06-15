// js/main.js

// —— Current User Helper ——
export function getCurrentUserObj() {
  const stored = localStorage.getItem('currentUserObj');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.warn('Failed to parse currentUserObj, falling back to user lookup');
    }
  }
  const currentUser = localStorage.getItem('currentUser');
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const found = users.find(u => u.username === currentUser);
  return found || {};
}

// —— HTML Fragment Injection ——
export async function injectHTML(url, selector) {
  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    document.querySelector(selector).innerHTML = html;
  } catch (err) {
    console.error(`Failed to inject ${url}:`, err);
  }
}

// —— Particles Init ——
export function initParticles(containerId = 'particles-js') {
  if (typeof particlesJS !== 'function') {
    console.warn('particlesJS not found — make sure particles.min.js is loaded.');
    return;
  }
  particlesJS(containerId, {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color:  { value: '#0CC7F6' },
      shape:  { type: 'circle' },
      opacity:{ value: 0.4, random: true },
      size:   { value: 3,   random: true },
      line_linked: {
        enable:   true,
        distance: 150,
        color:    '#0CC7F6',
        opacity:  0.3,
        width:    1
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
export function toggleMenu() {
  const nav = document.getElementById('navLinks');
  if (!nav) return;
  const expanded = nav.classList.toggle('show');
  document.querySelectorAll('.hamburger')
          .forEach(btn => btn.setAttribute('aria-expanded', expanded));
}

// —— Logout Helper ——
export function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// —— Auth + Balance Helpers ——
export function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (!user) window.location.href = 'login.html';
  return user;
}

export function fmt(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD'
  }).format(amount);
}

export function loadBalance(selector) {
  const currentUser = localStorage.getItem('currentUser');
  const users       = JSON.parse(localStorage.getItem('users')) || [];
  const obj         = users.find(u => u.username === currentUser) || {};
  const bal         = obj.balance || 0;
  document.querySelector(selector).textContent = fmt(bal);
}

// —— Common Bootstrap ——
export async function initCommon() {
  // 1) Inject the proper header & footer
  const flavor = document.body.dataset.flavor || 'index';
  await Promise.all([
    injectHTML(`includes/header-${flavor}.html`, '#nav-placeholder'),
    injectHTML(`includes/footer-${flavor}.html`, '#footer-placeholder')
  ]);

  // 2) Wire up nav toggle & logout buttons
  document.querySelectorAll('.hamburger')
    .forEach(btn => btn.addEventListener('click', toggleMenu));
  document.querySelectorAll('[data-action="logout"]')
    .forEach(el  => el.addEventListener('click', logout));

  // 3) Start particles
  initParticles();

  // 4) Demo reset (if present)
  const resetBtn = document.getElementById('reset-demo');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('Wipe all demo data?')) return;
      localStorage.removeItem('users');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserObj');
      localStorage.removeItem('paymentHistory');
      window.showToast?.('🧹 Demo data cleared!', 'success');
      setTimeout(() => location.reload(), 800);
    });
  }
}

// —— Kickoff ——
document.addEventListener('DOMContentLoaded', initCommon);
