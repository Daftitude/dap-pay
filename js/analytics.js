// js/analytics.js

import { initParticles, toggleMenu } from './main.js'; // if needed
import { fmt, showToast } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1) Ensure nav/footer and particles are inited
  // (initCommon in main.js already handles these)

  // 2) Compute metrics
  const users       = JSON.parse(localStorage.getItem('users')) || [];
  const history     = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const deposits    = history.filter(tx => tx.type === 'Deposit');
  const revenueTx   = history.filter(tx => tx.type === 'Game' || tx.type === 'Table');

  const totalUsers    = users.length;
  const totalDeposits = deposits.reduce((sum, tx) => sum + tx.amount, 0);
  const gameRevenue   = revenueTx.reduce((sum, tx) => sum + tx.amount, 0);
  const avgSpend      = totalUsers > 0 ? gameRevenue / totalUsers : 0;

  // 3) Populate summary tiles
  document.getElementById('totalUsers').textContent    = totalUsers;
  document.getElementById('totalDeposits').textContent = fmt(totalDeposits);
  document.getElementById('gameRevenue').textContent   = fmt(gameRevenue);
  document.getElementById('avgSpend').textContent      = fmt(avgSpend);

  // 4) Prepare earnings over last 7 days chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const labels = last7.map(d => d.toLocaleDateString());
  const dailyDeposits = last7.map(d => {
    const dateStr = d.toLocaleDateString();
    return deposits
      .filter(tx => new Date(tx.date).toLocaleDateString() === dateStr)
      .reduce((s, tx) => s + tx.amount, 0);
  });

  // 5) Render Chart.js line chart
  const ctx = document.getElementById('earningsChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Deposits ($)',
        data: dailyDeposits,
        borderColor: '#0CC7F6',
        backgroundColor: 'rgba(12,199,246,0.2)',
        tension: 0.3,
        fill: true,
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
});

// 6) HTML snapshot download (reuse existing backup logic)
export function downloadAnalytics() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const payments = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const timestamp = new Date().toLocaleString();

  // Build a simple HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DAP⚡Pay Analytics Backup</title>
  <style>
    body { font-family: Arial, sans-serif; background: #111; color: #fff; padding: 20px; }
    .container { max-width: 1000px; margin: auto; background: #222; padding: 20px; border-radius: 10px; }
    h1, h2 { color: #0CC7F6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
    th, td { border: 1px solid #444; padding: 8px; text-align: left; }
    th { background: #333; }
  </style>
</head>
<body>
  <div class="container">
    <h1>DAP⚡Pay Analytics Backup</h1>
    <p>Generated: ${timestamp}</p>
    <h2>Users (${users.length})</h2>
    <ul>
      ${users.map(u => `<li>${u.username} (${u.email||'–'}) – Balance: ${fmt(u.balance||0)}</li>`).join('')}
    </ul>
    <h2>Transactions (${payments.length})</h2>
    <table>
      <thead>
        <tr><th>User</th><th>Table</th><th>Amount</th><th>Type</th><th>Date</th></tr>
      </thead>
      <tbody>
        ${payments.map(tx => `
          <tr>
            <td>${tx.username}</td>
            <td>${tx.table||'–'}</td>
            <td>${fmt(tx.amount)}</td>
            <td>${tx.type}</td>
            <td>${tx.date}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `dap_pay_analytics_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
window.downloadAnalytics = downloadAnalytics;
