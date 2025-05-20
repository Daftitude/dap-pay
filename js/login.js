// js/login.js

import { toggleMenu, logout } from './main.js';
// showToast() is provided globally by toast.js

document.addEventListener('DOMContentLoaded', () => {
  // 1) Hamburger toggle (after nav injection)
  document.querySelectorAll('.hamburger')
    .forEach(btn => btn.addEventListener('click', toggleMenu));

  // 2) Logout links/buttons (marked with data-action="logout")
  document.querySelectorAll('[data-action="logout"]')
    .forEach(el => el.addEventListener('click', logout));

  // 3) Password visibility toggle
  const pwd = password, btn = togglePwd;
  btn.addEventListener('click', () => {
    if (pwd.type === 'password') {
      pwd.type = 'text'; btn.textContent = '🙈';
    } else {
      pwd.type = 'password'; btn.textContent = '👁️';
    }
  });

  // 4) Login form submission
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const u = users.find(u =>
      u.username === username.value.trim() &&
      u.password === pwd.value.trim()
    );
    if (!u) {
      window.showToast?.('❌ Wrong credentials', 'error');
      return;
    }
    localStorage.setItem('currentUserObj', JSON.stringify(u));
    window.showToast?.('✅ Welcome back!', '');
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  });
})
