// js/dashboard.js

import { checkAuth, loadBalance, fmt } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  const currentUsername = localStorage.getItem('currentUser');
  document.getElementById('userName').textContent = currentUsername;

  loadBalance('#walletBalance');
  updateLastPayment();
  loadQuickStats();
  loadTransactions();

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const currentUserObj = users.find(u => u.username === currentUsername);

  if (!currentUserObj) return (window.location.href = 'login.html');

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
  const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
  const currentUser = localStorage.getItem('currentUser');
  const deposits = history.filter(tx => tx.username === currentUser && tx.type === 'Fiat');

  const daily = {};
  deposits.forEach(tx => {
    const day = new Date(tx.date).toDateString();
    daily[day] = (daily[day] || 0) + tx.amount;
  });

  const labels = Object.keys(daily).slice(-7);
  const data = labels.map(k => daily[k]);

  new Chart(document.getElementById('depositChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Deposits',
        data,
        backgroundColor: '#0CC7F6'
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// ========== CATEGORY CHART ==========
function drawCategoryChart() {
  const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
  const currentUser = localStorage.getItem('currentUser');
  const filtered = history.filter(tx => tx.username === currentUser);

  const totals = {
    Game: 0,
    Table: 0,
    Fiat: 0,
    Bonus: 0
  };

  filtered.forEach(tx => {
    if (totals[tx.type] !== undefined) {
      totals[tx.type] += tx.amount;
    }
  });

  new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: ['#0CC7F6', '#FFC857', '#69FF7F', '#f44']
      }]
    },
    options: {
      cutout: '60%'
    }
  });
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
  document.getElementById('dashTip').textContent = tips[index];
}
