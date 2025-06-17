// Section: Storage Service
const Storage = {
  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  },
  saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  },
  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  },
  setCurrentUser(username) {
    localStorage.setItem('currentUser', username);
  },
  getCurrentUser() {
    return localStorage.getItem('currentUser');
  },
  setCurrentUserObj(user) {
    localStorage.setItem('currentUserObj', JSON.stringify(user));
  },
  getCurrentUserObj() {
    return JSON.parse(localStorage.getItem('currentUserObj') || '{}');
  }
};

// Section: User Helper
function getCurrentUserObj() {
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

// Section: Authentication Helpers
function checkAuth() {
  const user = localStorage.getItem('currentUser');
  if (!user) window.location.href = 'login.html';
  return user;
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// Section: Formatting & Data Loaders
function fmt(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD'
  }).format(amount);
}

function loadBalance(selector) {
  const currentUser = localStorage.getItem('currentUser');
  const users       = JSON.parse(localStorage.getItem('users')) || [];
  const obj         = users.find(u => u.username === currentUser) || {};
  const bal         = obj.balance || 0;
  document.querySelector(selector).textContent = fmt(bal);
}

// Section: UI Injectors & Particles
async function injectHTML(url, selector) {
  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    document.querySelector(selector).innerHTML = html;
  } catch (err) {
    console.error(`Failed to inject ${url}:`, err);
  }
}

function initParticles(containerId = 'particles-js') {
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

function toggleMenu() {
  const nav = document.getElementById('navLinks');
  if (!nav) return;
  const expanded = nav.classList.toggle('show');
  document.querySelectorAll('.hamburger')
          .forEach(btn => btn.setAttribute('aria-expanded', expanded));
}

// Expose toggleMenu globally for inline handlers
window.toggleMenu = toggleMenu;

/**
 * Show a brief toast notification.
 * @param {string} message - The message to display
 * @param {'success'|'error'} [type='success'] - The toast style
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `toast toast-${type}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function initCommon() {
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

// Section: Profile Initialization
async function initProfilePage() {
  const u = getCurrentUserObj();
  document.getElementById('profileUsername').textContent = u.username || '';
  document.getElementById('profileTeam').textContent     = u.team     || '';
  document.getElementById('profileEmail').textContent    = u.email    || '';
  document.getElementById('profileDob').textContent      = u.dob      || '';
  document.getElementById('profileAddress').textContent  = u.address  || '';
  document.getElementById('statusText').textContent      = u.status   || '';

  // Populate new profile fields
  document.getElementById('profilePhone').textContent       = u.phone || '—';
  document.getElementById('profileMemberSince').textContent = u.memberSince || '—';
  document.getElementById('profileLastLogin').textContent   = u.lastLogin || '—';

  // Payment Methods
  const pmList = document.getElementById('paymentMethodsList');
  if (pmList) {
    pmList.innerHTML = '';
    (u.paymentMethods || []).forEach(method => {
      const li = document.createElement('li');
      li.textContent = method;
      pmList.appendChild(li);
    });
    if (!(u.paymentMethods || []).length) {
      pmList.innerHTML = '<li>No payment methods on file</li>';
    }
  }

  // Notifications toggles
  const notifyEmail = document.getElementById('notifyEmail');
  const notifySMS   = document.getElementById('notifySMS');
  const notifyPush  = document.getElementById('notifyPush');
  if (notifyEmail) notifyEmail.checked = u.notifications?.email || false;
  if (notifySMS)   notifySMS.checked   = u.notifications?.sms   || false;
  if (notifyPush)  notifyPush.checked  = u.notifications?.push  || false;

  const editBtn = document.getElementById('editProfileBtn');
  if (editBtn) editBtn.addEventListener('click', () => {
    window.location.href = 'edit-profile.html';
  });
}

// Section: Entry Point
document.addEventListener('DOMContentLoaded', async () => {
  await initCommon();
  // If on profile page, initialize profile
  if (document.body.dataset.flavor === 'profile') {
    await initProfilePage();
  }
});

export {
  Storage,
  getCurrentUserObj,
  checkAuth,
  logout,
  fmt,
  loadBalance,
  injectHTML,
  initParticles,
  toggleMenu,
  initCommon,
  initProfilePage,
  showToast
};