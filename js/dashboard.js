// js/dashboard.js

import { checkAuth, loadBalance, fmt, initCommon, getCurrentUserObj } from './main.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.esm.min.js';

// ─── Reusable Chart Creators ───
function createBarChart(ctx, data, options) {
  return new Chart(ctx, { type: 'bar', data, options });
}

function createDoughnutChart(ctx, data, options) {
  return new Chart(ctx, { type: 'doughnut', data, options });
}

function createLineChart(ctx, data, options) {
  return new Chart(ctx, { type: 'line', data, options });
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  const currentUserObj = getCurrentUserObj();
  console.log('Dashboard currentUserObj:', currentUserObj);
  if (!currentUserObj || !currentUserObj.username) {
    return (window.location.href = 'login.html');
  }

  // Show team name in welcome and banner (fallback to username)
  const heroName = currentUserObj.team || currentUserObj.username;
  document.getElementById('displayName').textContent = heroName;
  document.getElementById('teamName').textContent = currentUserObj.team || '';
  document.getElementById('userName').textContent = '';
  // Ensure hero greeting is updated
  const userNameEl = document.getElementById('userName');
  if (userNameEl) userNameEl.textContent = heroName;

  loadBalance('#walletBalance');
  updateLastPayment();
  loadQuickStats();
  loadTransactions();

  // Profile info
  document.getElementById('profileUsername').textContent = currentUserObj.username || '';
  document.getElementById('profileEmail').textContent = currentUserObj.email || '';
  document.getElementById('profileDob').textContent = currentUserObj.dob || '';
  document.getElementById('profileAddress').textContent = currentUserObj.address || '';

  updateDailyStreak();
  updateWalletTier();
  drawDepositChart();
  drawCategoryChart();
  loadBonuses();
  loadBadges();
  loadRecentActions();
  loadTip();
});

// ========== DAILY STREAK ==========
function updateDailyStreak() {
  const streakKey = 'dap_pay_streak';
  const today = new Date().toDateString();
  let streak = JSON.parse(localStorage.getItem(streakKey)) || { last: '', count: 0 };

  if (streak.last !== today) {
    const yesterday = new Date(Date.now() - 864e5).toDateString();
    streak.count = (streak.last === yesterday) ? streak.count + 1 : 1;
    streak.last = today;
    localStorage.setItem(streakKey, JSON.stringify(streak));
  }

  document.getElementById('dailyStreak').textContent = streak.count;
}

// ========== WALLET TIER ==========
function updateWalletTier() {
  const tiers = [
    { name: 'Bronze', min: 0 },
    { name: 'Silver', min: 100 },
    { name: 'Gold', min: 250 },
    { name: 'Platinum', min: 500 },
  ];

  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const total = history
    .filter(tx => tx.username === currentUser && tx.type === 'Fiat')
    .reduce((sum, tx) => sum + tx.amount, 0);

  let tier = tiers[0];
  for (let i = 1; i < tiers.length; i++) {
    if (total >= tiers[i].min) tier = tiers[i];
  }

  const progress = Math.min(100, (total / (tier.min === 0 ? 100 : tiers[tiers.indexOf(tier) + 1]?.min || total)) * 100);
  document.getElementById('walletTier').textContent = tier.name;
  document.getElementById('tierProgress').style.width = `${progress}%`;
}

// ========== LAST PAYMENT ==========
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
    document.getElementById('lastDeposit').textContent = fmt(last.amount);
  } else {
    el.textContent = 'No recent payments yet.';
  }
}

// ========== QUICK STATS ==========
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

// ========== TRANSACTIONS ==========
function loadTransactions() {
  const container = document.getElementById('transactionList');
  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const userHistory = history.filter(tx => tx.username === currentUser);

  if (!userHistory.length) return (container.textContent = 'No transactions yet.');

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

// ========== BONUS HISTORY ==========
function loadBonuses() {
  const list = document.getElementById('bonusList');
  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const bonuses = history.filter(tx => tx.username === currentUser && tx.type === 'Bonus');

  list.innerHTML = '';
  bonuses.slice().reverse().forEach(b => {
    const li = document.createElement('li');
    li.textContent = `+ ${fmt(b.amount)} – ${b.date}`;
    list.appendChild(li);
  });

  document.getElementById('totalBonuses').textContent = fmt(
    bonuses.reduce((sum, b) => sum + b.amount, 0)
  );
}

// ========== BADGES ==========
function loadBadges() {
  const container = document.getElementById('badgeContainer');
  const unlocked = JSON.parse(localStorage.getItem('dap_pay_achievements') || '[]');

  const BADGES = {
    first: "💸 First Deposit",
    five: "🏅 Five Deposits",
    big: "💰 $100 Club"
  };

  container.innerHTML = '';
  unlocked.forEach(badge => {
    const div = document.createElement('div');
    div.className = 'badge-earned';
    div.innerHTML = `<div class="badge-icon">${BADGES[badge].split(" ")[0]}</div><div class="badge-label">${BADGES[badge]}</div>`;
    container.appendChild(div);
  });

  if (unlocked.length > 0) {
    const confetti = document.getElementById('confetti');
    confetti.classList.add('show');
    setTimeout(() => confetti.classList.remove('show'), 2500);
  }

}

// ========== RECENT ACTIONS ==========
function loadRecentActions() {
  const list = document.getElementById('actionFeed');
  const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
  const currentUser = localStorage.getItem('currentUser');
  const actions = history.filter(tx => tx.username === currentUser).slice().reverse().slice(0, 5);

  list.innerHTML = '';
  actions.forEach(tx => {
    const li = document.createElement('li');
    li.textContent = `${tx.type}: ${fmt(tx.amount)} — ${tx.date}`;
    list.appendChild(li);
  });
}

// ========== DEPOSIT CHART ==========
function drawDepositChart() {
  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const deposits = history.filter(tx => tx.username === currentUser && tx.type === 'Fiat');

  const daily = {};
  deposits.forEach(tx => {
    const day = new Date(tx.date).toDateString();
    daily[day] = (daily[day] || 0) + tx.amount;
  });

  const allDates = Object.keys(daily).slice(-7);
  const labels = allDates.map(dateStr =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
  );
  const values = allDates.map(k => daily[k]);

  // Calculate total deposited over last 7 days and set it
  const total = values.reduce((sum, v) => sum + v, 0);
  document.getElementById('totalDeposited').textContent = fmt(total);

  const data = {
    labels,
    datasets: [{
      label: 'Deposits',
      data: values,
      borderColor: '#69FF7F',
      backgroundColor: 'rgba(105,255,127,0.2)',
      tension: 0.3,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#69FF7F'
    }]
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#fff' }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: context => ` $${context.parsed.y.toFixed(2)}`,
        }
      }
    },
    elements: {
      line: { borderWidth: 2 },
      point: { radius: 6, hoverRadius: 8 }
    },
    scales: {
      x: {
        title: { display: true, text: 'Day of Week', color: '#fff' },
        ticks: { autoSkip: false, maxRotation: 0, minRotation: 0, color: '#fff' },
        grid: { display: true, color: 'rgba(255,255,255,0.15)' }
      },
      y: {
        title: { display: true, text: 'Amount ($)', color: '#fff' },
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { display: true, color: 'rgba(255,255,255,0.15)' }
      }
    }
  };
  createLineChart(document.getElementById('depositChart'), data, options);
}

// ========== CATEGORY CHART ==========
function drawCategoryChart() {
  const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
  const currentUser = localStorage.getItem('currentUser');
  const filtered = history.filter(tx => tx.username === currentUser);

  const totals = { Game: 0, Table: 0, Fiat: 0, Bonus: 0 };
  filtered.forEach(tx => {
    if (totals[tx.type] !== undefined) {
      totals[tx.type] += tx.amount;
    }
  });

  const data = {
    labels: Object.keys(totals),
    datasets: [{
      data: Object.values(totals),
      backgroundColor: ['#0CC7F6', '#FFC857', '#69FF7F', '#f44']
    }]
  };
  const options = {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: {
        labels: { color: '#fff' }
      }
    }
  };
  createDoughnutChart(document.getElementById('categoryChart'), data, options);
}

// ========== DASHBOARD TIP ==========
function loadTip() {
  const tips = [
    '💡 Tip: Use your promo code today for a bonus spin!',
    '💡 You earn a badge after 5 deposits!',
    '💡 Bonuses stack — spin often!',
    '💡 Unlock Platinum Tier to reduce fees!',
    '💡 Game now, withdraw later — fast balance updates!'
  ];
  const index = new Date().getDate() % tips.length;
  const el = document.getElementById('dashTip');
  if (el) el.textContent = tips[index];
}
