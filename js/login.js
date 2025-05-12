// js/login.js

import { toggleMenu } from './main.js'; // nav toggle
// showToast was attached globally by main.js
// if not, you can also import it: import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  // Wire up hamburger (after nav injection)
  document.querySelectorAll('.hamburger')
          .forEach(btn => btn.addEventListener('click', toggleMenu));

  // Password visibility toggle
  const pwdField = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePwd');
  toggleBtn.addEventListener('click', () => {
    if (pwdField.type === 'password') {
      pwdField.type = 'text';
      toggleBtn.textContent = '🙈';
      toggleBtn.setAttribute('aria-label', 'Hide password');
    } else {
      pwdField.type = 'password';
      toggleBtn.textContent = '👁️';
      toggleBtn.setAttribute('aria-label', 'Show password');
    }
  });

  // Login form submission
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = pwdField.value.trim();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem('currentUser', username);
      window.showToast?.('✅ Login Successful!');
      setTimeout(() => window.location.href = 'dashboard.html', 1200);
    } else {
      window.showToast?.('❌ Incorrect Username or Password.', 'error');
    }
  });
});
