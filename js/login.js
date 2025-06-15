// js/login.js

import { Storage } from './main.js'; // ensure Storage is exported from main.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Fetch stored users
    const users = Storage.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // Successful login
      Storage.setCurrentUser(user.username);
      Storage.setCurrentUserObj(user);
      window.location.href = 'dashboard.html';
    } else {
      // Show error message
      const errorEl = document.getElementById('loginError');
      if (errorEl) {
        errorEl.textContent = 'Invalid username or password';
        errorEl.style.display = 'block';
      } else {
        alert('Invalid username or password');
      }
    }
  });
});
