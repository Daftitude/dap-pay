// js/balance.js

import { checkAuth, loadBalance, fmt } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  // Ensure user is logged in
  checkAuth();

  // Load and display current balance
  loadBalance('#walletBalance');

  // Compute and display last deposit
  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const deposits = history
    .filter(tx => tx.username === currentUser && tx.type === 'Deposit');

  const lastDepositEl = document.getElementById('lastDeposit');
  if (deposits.length) {
    const last = deposits[deposits.length - 1];
    lastDepositEl.textContent = `${fmt(last.amount)} on ${last.date}`;
  } else {
    lastDepositEl.textContent = 'No deposits yet.';
  }
});
