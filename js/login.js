// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  const currentUserObj = JSON.parse(localStorage.getItem('currentUserObj')) || {};
  console.log('Dashboard currentUserObj:', currentUserObj);

  const heroName = currentUserObj.username || 'Player';

  // Ensure hero greeting is updated
  const userNameEl = document.getElementById('userName');
  if (userNameEl) userNameEl.textContent = heroName;

  // Remove default placeholder content from hero span
  if (userNameEl && userNameEl.textContent === 'Player') {
    userNameEl.textContent = '';
  }

  // ...rest of the dashboard code
});
