// js/signup.js
document.addEventListener('DOMContentLoaded', () => {
  const steps = Array.from(document.querySelectorAll('.form-step'));
  const dots  = Array.from(document.querySelectorAll('.progress-step'));
  const form  = document.getElementById('signupForm');
  let current = 0;

  // Show only step “i” and highlight dots up to i
  function showStep(i) {
    steps.forEach((fs, j) => {
      fs.style.display = j === i ? 'block' : 'none';
      fs.classList.toggle('form-step-active', j === i);
    });
    dots.forEach((dot, j) => {
      dot.classList.toggle('progress-step-active', j <= i);
    });
  }

  // fallback to window.showToast or alert
  function toast(msg, type) {
    (window.showToast || alert)(msg, type);
  }

  // Validate fields on each step
  function validateStep(step) {
    switch (step) {
      case 1:
        if (!newUsername.value.trim() || !newEmail.value.trim()) {
          toast('❌ Please enter a username and email.', 'error');
          return false;
        }
        break;
      case 2:
        if (!dob.value || !address.value.trim()) {
          toast('❌ Please enter your date of birth and address.', 'error');
          return false;
        }
        break;
      case 3:
        if (newPassword.value.length < 6) {
          toast('❌ Password must be at least 6 characters.', 'error');
          return false;
        }
        if (newPassword.value !== confirmPassword.value) {
          toast('❌ Passwords do not match.', 'error');
          return false;
        }
        break;
    }
    return true;
  }

  // Next / Prev buttons
  document.querySelectorAll('.btn-next').forEach(btn =>
    btn.addEventListener('click', () => {
      if (!validateStep(current+1)) return;
      if (current < steps.length - 1) {
        current++;
        showStep(current);
      }
    })
  );
  document.querySelectorAll('.btn-prev').forEach(btn =>
    btn.addEventListener('click', () => {
      if (current > 0) {
        current--;
        showStep(current);
      }
    })
  );

  // Password visibility toggles
  document.querySelectorAll('.toggle-password').forEach(btn =>
    btn.addEventListener('click', () => {
      const inp = btn.previousElementSibling;
      if (inp.type === 'password') {
        inp.type = 'text';
        btn.textContent = '🙈';
      } else {
        inp.type = 'password';
        btn.textContent = '👁️';
      }
    })
  );

  // Save new user, set currentUser, then redirect
  function saveUser() {
    const user = {
      username:  newUsername.value.trim(),
      email:     newEmail.value.trim(),
      dob:       dob.value,
      address:   address.value.trim(),
      password:  newPassword.value,
      balance:   0
    };
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
      toast('❌ Username taken.', 'error');
      return;
    }
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', user.username);
    toast('✅ Account created! Redirecting...');
    setTimeout(() => window.location.href = 'dashboard.html', 1200);
  }

  // Expose for inline onsubmit
  window.registerUser = saveUser;

  // Also intercept the form submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (validateStep(3)) saveUser();
  });

  // Show step 0 on load
  showStep(0);
});
