// js/dashboard.js

import { checkAuth, loadBalance, fmt } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  // (1) Get username string
  const currentUsername = localStorage.getItem('currentUser');
  document.getElementById('userName').textContent = currentUsername;

  loadBalance('#walletBalance');
  updateLastPayment();
  loadQuickStats();
  loadTransactions();

  // (2) Find user object from users array
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const currentUserObj = users.find(u => u.username === currentUsername);

  if (!currentUserObj) {
    window.location.href = 'login.html';
    return;
  }

  // (3) Populate profile fields
  document.getElementById('profileUsername').textContent = currentUserObj.username || '';
  document.getElementById('profileEmail').textContent = currentUserObj.email || '';
  document.getElementById('profileDob').textContent      = currentUserObj.dob || '';
  document.getElementById('profileAddress').textContent = currentUserObj.address || '';
});
function updateLastPayment() {
  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const userHistory = history.filter(tx => tx.username === currentUser);
  const el = document.getElementById('lastPaymentInfo');

  if (userHistory.length) {
    const last = userHistory[userHistory.length - 1];
    el.innerHTML = `
      🎱 ${last.type} – Table ${last.table || '-'}<br>
      💵 ${fmt(last.amount)}<br>
      🕒 ${last.date}
    `;
  } else {
    el.textContent = 'No recent payments yet.';
  }
}

function loadQuickStats() {
  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const userHistory = history.filter(tx => tx.username === currentUser);

  let games = 0, tables = 0, spent = 0;
  userHistory.forEach(tx => {
    if (tx.type === 'Game') games++;
    if (tx.type === 'Table') tables++;
    spent += tx.amount;
  });

  document.getElementById('gamesPlayed').textContent = games;
  document.getElementById('tablesPaid').textContent = tables;
  document.getElementById('totalSpent').textContent = fmt(spent);
}

function loadTransactions() {
  const container = document.getElementById('transactionList');
  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const userHistory = history.filter(tx => tx.username === currentUser);

  if (!userHistory.length) {
    container.textContent = 'No transactions yet.';
    return;
  }

  container.innerHTML = '';
  userHistory.slice().reverse().forEach(tx => {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
      <span>🎱 ${tx.type} – Table ${tx.table || '-'}</span>
      <span>💵 ${fmt(tx.amount)}</span>
    `;
    container.appendChild(div);
  });
}
