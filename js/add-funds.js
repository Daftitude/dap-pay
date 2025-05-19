// js/add-funds.js
document.addEventListener('DOMContentLoaded', () => {
    // Mode buttons + sections
    const modes   = ['fiat','crypto','bank','promo'];
    const buttons = modes.reduce((o,m) => {
      o[m] = document.getElementById(m + 'Btn'); return o;
    }, {});
    const secs    = modes.reduce((o,m) => {
      o[m] = document.getElementById(m + 'Section'); return o;
    }, {});
    const inputs  = {
      fiat:   document.getElementById('fiatAmount'),
      crypto: document.getElementById('cryptoAmount'),
      bank:   document.getElementById('bankAmount'),
      // promo code uses promoCode input
    };
    const wallet  = document.getElementById('walletAddr');
    const acct    = document.getElementById('acctNum');
    const routing = document.getElementById('routingNum');
    const promoIn = document.getElementById('promoCode');
    const promoFB = document.getElementById('promoFeedback');
  
    // Submit buttons
    const sub = {
      fiat:   document.getElementById('submitBtn'),
      crypto: document.getElementById('cryptoSubmit'),
      bank:   document.getElementById('bankSubmit'),
    };
  
    // Summary elements
    const sumMethod  = document.getElementById('summaryMethod');
    const sumAmount  = document.getElementById('summaryAmount');
    const sumFees    = document.getElementById('summaryFees');
    const sumBalance = document.getElementById('summaryBalance');
  
    let currentMode = 'fiat';
    const feeRates = { fiat:0.005, crypto:0.01, bank:0.002 }; // 0.5%, 1%, 0.2%
  
    // load balance
    const user       = JSON.parse(localStorage.getItem('users'))
                     .find(u=>u.username===localStorage.getItem('currentUser'));
    let balance      = user?.balance || 0;
    function fmt(v){ return v.toLocaleString('en-US',{style:'currency',currency:'USD'}); }
    
    // switch mode
    function setMode(m){
      currentMode = m;
      modes.forEach(x=> secs[x].hidden = x!==m);
      modes.forEach(x=> buttons[x].classList.toggle('mode-active', x===m));
      updateSummary();
    }
  
    // calculate & update summary
    function updateSummary(){
      let amt = 0, fee = 0;
      if (currentMode==='promo') {
        sumMethod.textContent = 'Promo';
        sumAmount.textContent = '0.00';
        sumFees.textContent   = '0.00';
        sumBalance.textContent= fmt(balance);
        return;
      }
  
      // get amount from correct input
      amt = parseFloat(inputs[currentMode]?.value) || 0;
      // extra validations
      if (currentMode==='crypto' && (!wallet.value.trim())) amt = 0;
      if (currentMode==='bank' && (!acct.value.trim()||!routing.value.trim())) amt = 0;
  
      fee = amt * (feeRates[currentMode]||0);
      sumMethod.textContent  = currentMode.charAt(0).toUpperCase()+currentMode.slice(1);
      sumAmount.textContent  = amt.toFixed(2);
      sumFees.textContent    = fee.toFixed(2);
      sumBalance.textContent = fmt(balance + amt - fee);
  
      // enable/disable submit
      if (currentMode!=='promo') {
        sub[currentMode].disabled = amt <= 0;
      }
    }
  
    // wiring up mode buttons
    modes.forEach(m => {
      buttons[m].addEventListener('click', ()=> setMode(m));
    });
  
    // inputs → update
    Object.values(inputs).forEach(i=> i.addEventListener('input',updateSummary));
    [wallet, acct, routing].forEach(i=> i?.addEventListener('input',updateSummary));
  
    // fiat deposit
    document.getElementById('addFundsForm').addEventListener('submit', e=>{
      e.preventDefault();
      const amt = parseFloat(inputs.fiat.value);
      balance += amt - amt*feeRates.fiat;
      user.balance = balance;
      localStorage.setItem('users', JSON.stringify(
        JSON.parse(localStorage.getItem('users')).map(u=>u.username===user.username?user:u)
      ));
      showToast(`✅ Deposited ${fmt(amt)} (Fiat)!`);
      inputs.fiat.value = '';
      updateSummary();
    });
  
    // crypto deposit
    document.getElementById('cryptoForm').addEventListener('submit', e=>{
      e.preventDefault();
      const amt = parseFloat(inputs.crypto.value);
      balance += amt - amt*feeRates.crypto;
      user.balance = balance;
      localStorage.setItem('users', JSON.stringify(
        JSON.parse(localStorage.getItem('users')).map(u=>u.username===user.username?user:u)
      ));
      showToast(`✅ Deposited ${fmt(amt)} via Crypto!`);
      inputs.crypto.value = ''; wallet.value = '';
      updateSummary();
    });
  
    // bank transfer deposit
    document.getElementById('bankForm').addEventListener('submit', e=>{
      e.preventDefault();
      const amt = parseFloat(inputs.bank.value);
      balance += amt - amt*feeRates.bank;
      user.balance = balance;
      localStorage.setItem('users', JSON.stringify(
        JSON.parse(localStorage.getItem('users')).map(u=>u.username===user.username?user:u)
      ));
      showToast(`✅ Deposited ${fmt(amt)} via Bank Transfer!`);
      inputs.bank.value = ''; acct.value = ''; routing.value = '';
      updateSummary();
    });
  
    // promo code apply (stub)
    document.getElementById('promoApply').addEventListener('click', () => {
      const code = promoIn.value.trim().toUpperCase();
      if (code==='FREEDAP') {
        balance += 10;
        user.balance = balance;
        localStorage.setItem('users', JSON.stringify(
          JSON.parse(localStorage.getItem('users')).map(u=>u.username===user.username?user:u)
        ));
        promoFB.textContent = '✔️ $10 credited!';
        updateSummary();
      } else {
        promoFB.textContent = '❌ Invalid code.';
      }
    });
  
    // init
    setMode('fiat');
  });
  