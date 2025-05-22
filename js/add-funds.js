// js/add-funds.js
// (ES module, ensure Chart.js loaded!)

const FEE_MAP = {
  Fiat: { pct: 0.04, min: 1 },
  Crypto: { pct: 0.02, min: 0.5 },
  Bank: { pct: 0.015, min: 0.75 },
};

const SUGGEST_KEY = "dap_pay_suggestions";
const ACHIEVE_KEY = "dap_pay_achievements";
const WHEEL_BONUS = [1, 2, 3, 5, 7, 10];
const BADGES = {
  first: { label: "💸 First Deposit!", cond: (d) => d.length >= 1 },
  five: { label: "🏅 Five Deposits!", cond: (d) => d.length >= 5 },
  big: { label: "💰 $100 Club!", cond: (d) => d.some(x => x.amount >= 100) },
};

function fmt(amount) {
  return "$" + (Number(amount) || 0).toFixed(2);
}

function saveSuggestion(method, amt) {
  let all = JSON.parse(localStorage.getItem(SUGGEST_KEY) || '{}');
  all[method] = (all[method] || []);
  all[method].unshift(Number(amt));
  all[method] = all[method].slice(0, 3);
  localStorage.setItem(SUGGEST_KEY, JSON.stringify(all));
}

function getSuggestions(method) {
  let all = JSON.parse(localStorage.getItem(SUGGEST_KEY) || '{}');
  return all[method] || [];
}

function getCurrentUser() {
  const username = localStorage.getItem("currentUser");
  const users = JSON.parse(localStorage.getItem("users")) || [];
  return users.find(u => u.username === username);
}

function setUserBalance(newBal) {
  const username = localStorage.getItem("currentUser");
  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.map(u => (u.username === username ? { ...u, balance: newBal } : u));
  localStorage.setItem("users", JSON.stringify(users));
}

function updateLiveBalance() {
  const user = getCurrentUser();
  document.getElementById("liveBalance").textContent = fmt(user?.balance || 0);
}

function pushDepositHistory(obj) {
  let h = JSON.parse(localStorage.getItem("paymentHistory") || "[]");
  h.push(obj);
  localStorage.setItem("paymentHistory", JSON.stringify(h));
}

function markAchievement(badge) {
  let got = JSON.parse(localStorage.getItem(ACHIEVE_KEY) || "[]");
  if (!got.includes(badge)) {
    got.push(badge);
    localStorage.setItem(ACHIEVE_KEY, JSON.stringify(got));
    showModal(badge);
  }
}

function showModal(badge) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal-badge">
    <div class="modal-content">
      <div class="badge-emoji">${BADGES[badge].label}</div>
      <div class="badge-title">${BADGES[badge].label}</div>
      <button onclick="document.getElementById('modal-root').innerHTML=''">Close</button>
    </div>
  </div>`;
  setTimeout(() => root.innerHTML = "", 2500);
}

function showSpinWheel(onResult) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="modal-wheel">
    <div class="modal-content">
      <div class="wheel-spin" id="theWheel">🎰</div>
      <div id="wheelMsg" style="margin:1em 0">Spin to win a bonus!</div>
      <button id="spinBtn" class="glow-btn">Spin!</button>
    </div>
  </div>`;
  document.getElementById("spinBtn").onclick = () => {
    const val = WHEEL_BONUS[Math.floor(Math.random() * WHEEL_BONUS.length)];
    document.getElementById("wheelMsg").textContent = `🎉 Bonus: $${val}!`;
    setTimeout(() => { root.innerHTML = ""; onResult(val); }, 1200);
  };
}

function applyBadgeChecks(method) {
  let hist = JSON.parse(localStorage.getItem("paymentHistory") || "[]");
  let user = localStorage.getItem("currentUser");
  let myDeposits = hist.filter(tx => tx.username === user && tx.type === method);
  if (BADGES.first.cond(myDeposits)) markAchievement("first");
  if (BADGES.five.cond(myDeposits)) markAchievement("five");
  if (BADGES.big.cond(myDeposits)) markAchievement("big");
}

function getFee(method, amount) {
  const conf = FEE_MAP[method];
  const amt = Number(amount) || 0;
  const fee = Math.max(amt * conf.pct, conf.min);
  return { fee, net: amt - fee };
}

function applySecureMode(on) {
  document.querySelectorAll('[data-maskable]').forEach(inp => {
    inp.type = on ? "password" : "text";
  });
  localStorage.setItem("dap_pay_secure", on ? "1" : "0");
}

function restoreSecureMode() {
  applySecureMode(localStorage.getItem("dap_pay_secure") === "1");
}

// Chart.js cache
let charts = {};
function updateChart(method, amount) {
  const chartId = method.toLowerCase() + "FeeChart";
  const ctx = document.getElementById(chartId);
  if (!ctx) return;
  const { fee, net } = getFee(method, amount);
  if (!charts[method]) {
    charts[method] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Deposit', 'Fee'],
        datasets: [{
          data: [Math.max(amount - fee, 0), fee],
          backgroundColor: ['#0CC7F6', '#FFC857'],
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        cutout: '70%'
      }
    });
  } else {
    charts[method].data.datasets[0].data = [Math.max(amount - fee, 0), fee];
    charts[method].update();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  restoreSecureMode();
  updateLiveBalance();

  // Tab switch logic
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove("mode-active"));
      btn.classList.add("mode-active");
      let m = btn.dataset.method;

      // Show correct section
      ['fiat', 'crypto', 'bank', 'promo'].forEach(id =>
        document.getElementById(id + "Section").hidden = (m.toLowerCase() !== id)
      );

      // Force chart refresh on tab switch
      const activeInput = document.getElementById(m.toLowerCase() + "Amount");
      if (activeInput) {
        updateChart(m, activeInput.value);
      }
    };
  });


  // Secure toggle
  document.getElementById("secureToggle").onclick = () => {
    let on = localStorage.getItem("dap_pay_secure") !== "1";
    applySecureMode(on);
    document.getElementById("secureToggle").classList.toggle("glow-btn-secondary", !on);
  };

  // Bind all methods
  bindDepositForm("Fiat", "fiatAmount", "addFundsForm", "fiatSuggestion", "fiatFeeChart", "submitBtn");
  bindDepositForm("Crypto", "cryptoAmount", "cryptoForm", "cryptoSuggestion", "cryptoFeeChart", "cryptoSubmit");
  bindDepositForm("Bank", "bankAmount", "bankForm", "bankSuggestion", "bankFeeChart", "bankSubmit");

  // Enhanced Quick Fill Logic
  document.querySelectorAll('.quick-fill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.quick-fill-row').nextElementSibling;
      const value = btn.dataset.value;

      input.value = value;
      input.dispatchEvent(new Event('input'));

      btn.parentElement.querySelectorAll('.quick-fill-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

function bindDepositForm(method, amtId, formId, sugId, chartId, submitId) {
  const form = document.getElementById(formId);
  const input = document.getElementById(amtId);
  const sugBox = document.getElementById(sugId);
  const submit = document.getElementById(submitId);
  updateChart(method, input.value);

  input.addEventListener('input', () => {
    const animateValue = (el, newVal) => {
      if (el.textContent !== newVal) {
        el.textContent = newVal;
        el.classList.add('flash-animate');
        setTimeout(() => el.classList.remove('flash-animate'), 600);
      }
    };

    const summaryBox = document.getElementById(method.toLowerCase() + "Summary");
    if (summaryBox) {
      const { fee, net } = getFee(method, val);
      const user = getCurrentUser();
      const balance = user?.balance || 0;

      animateValue(summaryBox.querySelector(".sum-amount"), fmt(val));
      animateValue(summaryBox.querySelector(".sum-fee"), fmt(fee));
      animateValue(summaryBox.querySelector(".sum-net"), fmt(balance + net));
    }


    const suggestions = getSuggestions(method);
    if (suggestions.length) {
      const avg = (suggestions.reduce((a, b) => a + b, 0) / suggestions.length).toFixed(2);
      sugBox.innerHTML = `Suggested: $${avg} (based on last ${suggestions.length} deposits: ${suggestions.join(", ")})`;
    } else {
      sugBox.innerHTML = '';
    }

    submit.disabled = !(val && val >= (method === "Bank" ? 5 : 1));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const amt = Number(input.value);
    if (!amt || (method === "Bank" && amt < 5) || amt < 1) return;

    if (Math.random() < 0.10) {
      showError("Network Error. Please retry.", () => form.dispatchEvent(new Event('submit')));
      return;
    }

    saveSuggestion(method, amt);
    const { fee } = getFee(method, amt);
    let user = getCurrentUser();
    let bal = (user?.balance || 0) + amt - fee;
    setUserBalance(bal);
    updateLiveBalance();

    pushDepositHistory({
      type: method,
      username: user.username,
      amount: amt,
      fee,
      date: new Date().toLocaleString()
    });

    applyBadgeChecks(method);

    showConfirmation(amt - fee, fee, method, () => {
      showSpinWheel(bonus => {
        let user = getCurrentUser();
        let bal = (user?.balance || 0) + bonus;
        setUserBalance(bal);
        updateLiveBalance();
        pushDepositHistory({
          type: "Bonus",
          username: user.username,
          amount: bonus,
          fee: 0,
          date: new Date().toLocaleString()
        });
      });
    });

    form.reset();
    submit.disabled = true;
    updateChart(method, 0);
  });
}

function showConfirmation(net, fee, method, next) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-confirm">
      <div class="modal-content">
        <h2>✅ Deposit Successful!</h2>
        <div>Method: <b>${method}</b></div>
        <div>Amount: <b>${fmt(net + fee)}</b></div>
        <div>Fee: <b>${fmt(fee)}</b></div>
        <div>Net Added: <b>${fmt(net)}</b></div>
        <div style="font-size:2em; margin:1em 0;">🎉</div>
        <button onclick="document.getElementById('modal-root').innerHTML=''; (${next})();" class="glow-btn">Spin Wheel</button>
      </div>
    </div>`;
  setTimeout(() => {
    if (document.getElementById("modal-root").innerHTML) next();
  }, 2500);
}

function showError(msg, retryFn) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-error">
      <div class="modal-content">
        <h2>❌ ${msg}</h2>
        <button onclick="document.getElementById('modal-root').innerHTML='';">Cancel</button>
        <button onclick="document.getElementById('modal-root').innerHTML=''; (${retryFn})();" class="glow-btn">Retry</button>
      </div>
    </div>`;
}
