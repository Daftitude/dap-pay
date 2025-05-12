// js/dashboard.js

import { checkAuth, loadBalance, fmt } from './main.js';
import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  // Ensure user is logged in
  checkAuth();

  const currentUser = localStorage.getItem('currentUser');
  // Display username
  document.getElementById('userName').textContent = currentUser;

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
