// js/game-history.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth guard
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return window.location.href = 'login.html';
  
    // 2. Elements
    const gamesTabBtn    = document.querySelector('.tab-btn[data-tab="games"]');
    const depositsTabBtn = document.querySelector('.tab-btn[data-tab="deposits"]');
    const gamesPanel     = document.getElementById('games');
    const depositsPanel  = document.getElementById('deposits');
    const gamesListEl    = document.getElementById('gamesList');
    const depositsListEl = document.getElementById('depositsList');
    const searchInput    = document.getElementById('historySearch');
  
    // 3. Fetch full history for this user
    const fullHistory = (JSON.parse(localStorage.getItem('paymentHistory')) || [])
      .filter(tx => tx.username === currentUser);
  
    // 4. Partition
    const gamesHistory    = fullHistory.filter(tx => tx.type === 'Game' || tx.type === 'Table');
    const depositHistory  = fullHistory.filter(tx => tx.type === 'Deposit');
  
    // 5. Render function
    function renderList(items, container) {
      container.innerHTML = '';
      if (items.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'No records yet.';
        p.className = 'empty-state';
        return container.appendChild(p);
      }
      // most recent first
      items.slice().reverse().forEach(tx => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        // left side: descriptor + date
        const left = document.createElement('div');
        left.innerHTML = `
          <strong>
            ${tx.type === 'Deposit' ? 'Deposit' 
                : tx.type === 'Table' ? `Table ${tx.table}` 
                : 'Game Payment'}
          </strong><br>
          ${tx.date}
        `;
        // right side: amount
        const right = document.createElement('div');
        right.textContent = `$${tx.amount.toFixed(2)}`;
        div.appendChild(left);
        div.appendChild(right);
        container.appendChild(div);
      });
    }
  
    // 6. Initial render
    renderList(gamesHistory,    gamesListEl);
    renderList(depositHistory,  depositsListEl);
  
    // 7. Tab switching
    function activateTab(tab) {
      // buttons
      gamesTabBtn.classList.toggle('tab-active',    tab === 'games');
      depositsTabBtn.classList.toggle('tab-active', tab === 'deposits');
      // panels
      gamesPanel.hidden   = tab !== 'games';
      depositsPanel.hidden= tab !== 'deposits';
    }
    gamesTabBtn.addEventListener('click', () => activateTab('games'));
    depositsTabBtn.addEventListener('click', () => activateTab('deposits'));
  
    // 8. Live search
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      const filterFn = tx =>
        tx.date.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q) ||
        (tx.table && tx.table.toString().includes(q));
      renderList(gamesHistory.filter(filterFn),    gamesListEl);
      renderList(depositHistory.filter(filterFn),  depositsListEl);
    });
  });
  