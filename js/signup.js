// ==== MOBILE MENU TOGGLE ====
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('show');
  }
  
  // ==== PASSWORD VISIBILITY TOGGLE ====
  function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = "password";
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
  
  // ==== MULTI-STEP FORM ====
  let currentStep = 1;
  const totalSteps = 6;
  
  function nextStep() {
    if (!validateStep(currentStep)) return;
    document.getElementById(`step${currentStep}`).style.display = 'none';
    currentStep++;
    if (currentStep > totalSteps) {
      saveUser();
      return;
    }
    document.getElementById(`step${currentStep}`).style.display = 'block';
    document.getElementById('stepProgress').textContent = `Step ${currentStep} of ${totalSteps}`;
    document.getElementById('backBtn').style.display = (currentStep > 1) ? 'inline-block' : 'none';
  }
  
  function prevStep() {
    document.getElementById(`step${currentStep}`).style.display = 'none';
    currentStep--;
    document.getElementById(`step${currentStep}`).style.display = 'block';
    document.getElementById('stepProgress').textContent = `Step ${currentStep} of ${totalSteps}`;
    document.getElementById('backBtn').style.display = (currentStep > 1) ? 'inline-block' : 'none';
  }
  
  // ==== VALIDATION ====
  function validateStep(step) {
    switch (step) {
      case 1:
        if (!document.getElementById('username').value.trim()) {
          showToast('❌ Please enter a username.', 'error');
          return false;
        }
        break;
      case 2:
        if (!document.getElementById('emailPhone').value.trim()) {
          showToast('❌ Please enter your email or phone.', 'error');
          return false;
        }
        break;
      case 3:
        if (!document.getElementById('firstName').value.trim() || !document.getElementById('lastName').value.trim()) {
          showToast('❌ Please fill in both names.', 'error');
          return false;
        }
        break;
      case 4:
        const year = parseInt(document.getElementById('dobYear').value);
        if (new Date().getFullYear() - year < 18) {
          showToast('⚠️ Must be 18+ to join.', 'error');
          return false;
        }
        break;
      case 6:
        const pass = document.getElementById('password').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        if (!pass || pass.length < 6) {
          showToast('❌ Password too short.', 'error');
          return false;
        }
        if (pass !== confirmPass) {
          showToast('❌ Passwords don’t match.', 'error');
          return false;
        }
        break;
    }
    return true;
  }
  
  // ==== SAVE USER TO LOCALSTORAGE ====
  function saveUser() {
    const user = {
      username: document.getElementById('username').value.trim(),
      emailPhone: document.getElementById('emailPhone').value.trim(),
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      dob: `${document.getElementById('dobMonth').value}/${document.getElementById('dobDay').value}/${document.getElementById('dobYear').value}`,
      address: document.getElementById('address').value.trim(),
      password: document.getElementById('password').value.trim(),
      balance: 0
    };
  
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let existing = users.find(u => u.username.toLowerCase() === user.username.toLowerCase());
  
    if (existing) {
      showToast('❌ Username already taken.', 'error');
      return;
    }
  
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', user.username);
  
    showToast('🎉 Account Created! Redirecting...');
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
  }
  document.addEventListener('DOMContentLoaded', () => {
    const steps = Array.from(document.querySelectorAll('.form-step'));
    let current = 0;
  
    function showStep(idx) {
      steps.forEach((fs, i) =>
        fs.classList.toggle('form-step-active', i === idx)
      );
    }
  
    document.querySelectorAll('.btn-next').forEach(btn => {
      btn.addEventListener('click', () => {
        if (current < steps.length - 1) {
          showStep(++current);
        }
      });
    });
  
    document.querySelectorAll('.btn-prev').forEach(btn => {
      btn.addEventListener('click', () => {
        if (current > 0) {
          showStep(--current);
        }
      });
    });
  });
  