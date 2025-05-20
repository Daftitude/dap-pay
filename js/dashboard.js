// js/dashboard.js

import { checkAuth, loadBalance, fmt } from './main.js';
import { showToast }         from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1) Make sure someone is logged in
  checkAuth();

  // 2) Grab the full user object
  const userJson = localStorage.getItem('currentUserObj');
  let user;
  try {
    user = JSON.parse(userJson);
  } catch {
    showToast('⚠️ Could not load your profile.', 'error');
    return;
  }

  // 3) Populate the page
  document.getElementById('userName').textContent        = user.username;
  document.getElementById('profileUsername').textContent = user.username;
  document.getElementById('profileEmail').textContent    = user.email;
  document.getElementById('profileDob').textContent      = user.dob;
  document.getElementById('profileAddress').textContent  = user.address;

  // Load and display wallet balance
  loadBalance('#walletBalance');

  // Update last payment info
  updateLastPayment();

  // Load quick stats
  loadQuickStats();

  // Load full transaction history
  loadTransactions();
});

function updateLastPayment() {
  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const userHistory = history.filter(tx => tx.username === currentUser);

  const el = document.getElementById('lastPaymentInfo');
  if (userHistory.length > 0) {
    const last = userHistory[userHistory.length - 1];
    el.innerHTML = `
      🎱 ${last.type} - Table ${last.table || '-'}<br>
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

  document.getElementById('gamesPlayed').textContent  = games;
  document.getElementById('tablesPaid').textContent  = tables;
  document.getElementById('totalSpent').textContent  = fmt(spent);
}

function loadTransactions() {
  const container = document.getElementById('transactionList');
  const history   = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const userHistory = history.filter(tx => tx.username === currentUser);

  if (userHistory.length === 0) {
    container.textContent = 'No transactions yet.';
    return;
  }

  container.innerHTML = '';
  userHistory.slice().reverse().forEach(tx => {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.innerHTML = `
      <span>🎱 ${tx.type} - Table ${tx.table || '-'}</span>
      <span>💵 ${fmt(tx.amount)}</span>
    `;
    container.appendChild(div);
  });
}
