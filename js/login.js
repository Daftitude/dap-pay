// js/login.js

import { toggleMenu, logout } from './main.js';
import { showToast }            from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  // wire up mobile nav
  document.querySelectorAll('.hamburger')
          .forEach(btn => btn.addEventListener('click', toggleMenu));

  // toggle password visibility
  const pwdField = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePwd');
  toggleBtn.addEventListener('click', () => {
    if (pwdField.type === 'password') {
      pwdField.type = 'text';
      toggleBtn.textContent = '🙈';
    } else {
      pwdField.type = 'password';
      toggleBtn.textContent = '👁️';
    }
  });

  // login form
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = pwdField.value.trim();
    const users    = JSON.parse(localStorage.getItem('users')) || [];
    const user     = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem('currentUser', username);
      showToast?.('✅ Login Successful!');
      setTimeout(() => window.location.href = 'dashboard.html', 1200);
    } else {
      showToast?.('❌ Incorrect Username or Password.', 'error');
    }
  });

  // also wire any logout buttons
  document.querySelectorAll('[data-action="logout"]')
          .forEach(el => el.addEventListener('click', logout));
});
