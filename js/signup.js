document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  const currentUserObj = JSON.parse(localStorage.getItem('currentUserObj'));

  console.log('Dashboard currentUserObj:', currentUserObj);

  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  const heroName = currentUserObj?.username || currentUser || 'Player';
  const heroNameEl = document.getElementById('userName');
  if (heroNameEl) heroNameEl.textContent = '';

  // Ensure hero greeting is updated
  const userNameEl = document.getElementById('userName');
  if (userNameEl) userNameEl.textContent = heroName;

  // ... rest of your dashboard.js code ...
});
