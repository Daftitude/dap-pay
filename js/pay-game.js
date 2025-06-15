// js/pay-game.js

// Run after the DOM has parsed (script is <script defer>)
document.addEventListener('DOMContentLoaded', () => {
    // —————————————
    // 1) Element refs
    const payGameBtn = document.getElementById('payGameBtn');
    const payTableBtn = document.getElementById('payTableBtn');
    const otherBtn = document.getElementById('otherBtn');
    const otherInput = document.getElementById('otherAmount');
    const confirmBtn = document.getElementById('confirmBtn');
    const tableDisplay = document.getElementById('selectedTableDisplay');
    const amountDisplay = document.getElementById('selectedAmountDisplay');
    const balanceDisplay = document.getElementById('currentBalanceDisplay');
    const allContainer = document.getElementById('allTablesContainer');
    const modeDisplay = document.getElementById('selectedModeDisplay');
    const timeDisplay = document.getElementById('selectedTimeDisplay');
    // League/Casual selectors
    const leagueSelectorBtn = document.getElementById('leagueSelectorBtn');
    const casualSelectorBtn = document.getElementById('casualSelectorBtn');

    // Track current tables mode
    let tablesMode = 'league';

    // Track selected table
    let selectedTable = null;


    // —————————————
    // 2) Formatter helper
    const fmt = v => new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD'
    }).format(v);

    // —————————————
    // 3) Load & show current balance
    const currentUser = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userObj = users.find(u => u.username === currentUser) || {};
    balanceDisplay.textContent = fmt(userObj.balance || 0);

    // —————————————
    // 4) Mode toggle (Game, Table, Other)
    let mode = 'game';
    function setMode(m) {
        mode = m;
        [payGameBtn, payTableBtn, otherBtn].forEach(b => b.classList.remove('mode-active'));
        if (m === 'game') payGameBtn.classList.add('mode-active');
        if (m === 'table') payTableBtn.classList.add('mode-active');
        if (m === 'other') otherBtn.classList.add('mode-active');

        otherInput.disabled = (m !== 'other');
        if (m !== 'other') otherInput.value = '';
        updateSummary();
    }
    payGameBtn.addEventListener('click', () => setMode('game'));
    payTableBtn.addEventListener('click', () => setMode('table'));
    otherBtn.addEventListener('click', () => setMode('other'));
    otherInput.addEventListener('input', updateSummary);

    // —————————————
    // 5) Generate table buttons
    function injectTables(start, end, container) {
        for (let i = start; i <= end; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'table-item';
            btn.textContent = `Table ${i}`;
            btn.addEventListener('click', () => selectTable(i, btn));
            container.appendChild(btn);
        }
    }

    // Helper to render tables by mode
    function renderTablesForMode(mode) {
        allContainer.innerHTML = '';
        if (mode === 'league') {
            injectTables(1, 10, allContainer);
        } else {
            injectTables(11, 20, allContainer);
        }
        // reset selection and summary
        selectedTable = null;
        confirmBtn.disabled = true;
        updateSummary();
    }

    // Default to League view
    renderTablesForMode('league');

    // League/Casual selector event listeners
    leagueSelectorBtn.addEventListener('click', () => {
      tablesMode = 'league';
      leagueSelectorBtn.classList.add('mode-active');
      casualSelectorBtn.classList.remove('mode-active');
      renderTablesForMode('league');
    });
    casualSelectorBtn.addEventListener('click', () => {
      tablesMode = 'casual';
      casualSelectorBtn.classList.add('mode-active');
      leagueSelectorBtn.classList.remove('mode-active');
      renderTablesForMode('casual');
    });

    // 🛠 Event delegation fallback for mode selectors
    const modeSelectorContainer = document.querySelector('.tables-mode-selector');
    if (modeSelectorContainer) {
      modeSelectorContainer.addEventListener('click', (e) => {
        if (e.target === leagueSelectorBtn) {
          leagueSelectorBtn.click();
        } else if (e.target === casualSelectorBtn) {
          casualSelectorBtn.click();
        }
      });
    }

    // —————————————
    // 6) Tab switching logic removed (no longer needed)

    // —————————————
    // 7) Table selection & summary
    function selectTable(num, btnEl) {
        // un-highlight all
        document.querySelectorAll('.table-item.selected')
            .forEach(el => el.classList.remove('selected'));
        // highlight this
        btnEl.classList.add('selected');
        selectedTable = num;
        updateSummary();
    }

    function updateSummary() {
        tableDisplay.textContent = selectedTable || 'None';
        let amount = 0;
        if (mode === 'other') {
            const v = parseFloat(otherInput.value);
            amount = (!isNaN(v) && v >= 10 && v <= 200) ? v : 0;
        } else {
            amount = (mode === 'game') ? 5 : 10;
        }
        amountDisplay.textContent = fmt(amount);
        // show mode in UPPERCASE
        modeDisplay.textContent = mode.toUpperCase();

        // show current time (HH:MM:SS)
        timeDisplay.textContent = new Date().toLocaleTimeString();

        // Update game type display
        const gameTypeEl = document.getElementById('gameTypeDisplay');
        if (gameTypeEl) {
          gameTypeEl.textContent = tablesMode.charAt(0).toUpperCase() + tablesMode.slice(1);
        }

        confirmBtn.disabled = !selectedTable || amount <= 0;
    }

    // initialize
    setMode('game');

    // —————————————
    // 8) Confirm & Pay
    confirmBtn.addEventListener('click', () => {
        const amt = parseFloat(amountDisplay.textContent.replace(/[^0-9.-]+/g, ''));
        showToast(`✅ Paid ${fmt(amt)} for Table ${selectedTable}!`);

        // update storage
        const history = JSON.parse(localStorage.getItem('paymentHistory')) || [];
        history.push({
            username: currentUser,
            type: mode === 'game' ? 'Game' : mode === 'table' ? 'Table' : 'Other',
            table: selectedTable,
            amount: amt,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('paymentHistory', JSON.stringify(history));

        // deduct balance
        userObj.balance = (userObj.balance || 0) - amt;
        localStorage.setItem('users', JSON.stringify(users));
        balanceDisplay.textContent = fmt(userObj.balance);

        // reset UI
        selectedTable = null;
        otherInput.value = '';
        document.querySelectorAll('.table-item.selected')
            .forEach(el => el.classList.remove('selected'));
        setMode(mode);
    });
});
