// js/admin.js

import { checkAuth, fmt, loadBalance, showToast } from './main.js';

checkAuth(); // Redirect to login if not authenticated

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  // Show admin’s name
  document.getElementById('adminName').textContent = currentUser;

  // Load admin “wallet” balance display
  loadBalance('#walletBalanceAdmin');

  // Initialize all admin features
  displayEarningsChart();   // Earnings graph :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
  displayUsersTable();      // Manage Players list :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
  displayTransactions();    // Payment History list
});

// Commit: Render earnings over the last 7 days
function displayEarningsChart() {
  const transactions = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const ctx = document.getElementById('earningsChart').getContext('2d');

  // Build labels for last 7 days
  const last7days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString();
  });

  // Sum daily totals
  const dailyTotals = last7days.map(date =>
    transactions
      .filter(tx => new Date(tx.date).toLocaleDateString() === date)
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: last7days,
      datasets: [{
        label: 'Daily Earnings ($)',
        data: dailyTotals,
        backgroundColor: 'rgba(12, 199, 246, 0.2)',
        borderColor: '#0CC7F6',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Commit: Render the users management table
function displayUsersTable(users = null) {
  const allUsers = users || JSON.parse(localStorage.getItem('users')) || [];
  const container = document.getElementById('usersTable');

  if (!allUsers.length) {
    container.innerHTML = '<p style="color:#ccc;text-align:center;">No users found.</p>';
    return;
  }

  // Build HTML table
  let html = `
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
  `;
  allUsers.forEach(u => {
    html += `
      <tr>
        <td>${u.username}</td>
        <td>${u.email || '-'}</td>
        <td>${fmt(u.balance || 0)}</td>
      </tr>
    `;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

// Commit: Filter users as you type
function filterUsers() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const allUsers = JSON.parse(localStorage.getItem('users')) || [];
  const filtered = allUsers.filter(u => u.username.toLowerCase().includes(query));
  displayUsersTable(filtered);
}
window.filterUsers = filterUsers;  // for oninput in HTML

// Commit: Display all transactions in a table
function displayTransactions() {
  const transactions = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const container = document.getElementById('transactionTable');

  if (!transactions.length) {
    container.innerHTML = '<p style="color:#ccc;text-align:center;">No transactions yet.</p>';
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>User</th><th>Table</th><th>Amount</th><th>Type</th><th>Date</th>
        </tr>
      </thead>
      <tbody>
  `;
  transactions.slice().reverse().forEach(tx => {
    html += `
      <tr>
        <td>${tx.username}</td>
        <td>${tx.table ?? '-'}</td>
        <td>${fmt(tx.amount)}</td>
        <td>${tx.type}</td>
        <td>${new Date(tx.date).toLocaleString()}</td>
      </tr>
    `;
  });
  html += `</tbody></table>`;
  container.innerHTML = html;
}

// Commit: Download all transactions as CSV
function downloadCSV() {
  const transactions = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  let csv = 'Username,Table,Amount,Type,Date\n';
  transactions.forEach(tx => {
    csv += `${tx.username},${tx.table || ''},${tx.amount},${tx.type},${tx.date}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'transactions.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
window.downloadCSV = downloadCSV;  // for onclick in HTML

// Commit: Adjust a player’s balance manually
function adjustBalance() {
  const uname = document.getElementById('adjustUsername').value.trim();
  const amt   = parseFloat(document.getElementById('adjustAmount').value);
  if (!uname || isNaN(amt)) {
    return showToast('⚠️ Enter valid username and amount.', 'error');
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user  = users.find(u => u.username === uname);
  if (!user) {
    return showToast('❌ User not found.', 'error');
  }

  user.balance = (user.balance || 0) + amt;
  localStorage.setItem('users', JSON.stringify(users));
  showToast(`✅ ${uname}’s balance updated by ${fmt(amt)}.`, 'success');

  // Refresh displays
  displayUsersTable();
  loadBalance('#walletBalanceAdmin');
}
window.adjustBalance = adjustBalance;  // for onclick in HTML

// —— Clear all localStorage ——  
document.getElementById('clearDataBtn').addEventListener('click', () => {
  if (!confirm(
    '⚠️ This will permanently delete ALL user accounts, balances, \n' +
    '     payment history and log you out. Continue?'
  )) return;

  // wipe everything
  localStorage.clear();

  // feedback & reload
  showToast('✅ All data wiped — reloading…');
  setTimeout(() => location.reload(), 1200);
});