document.addEventListener('DOMContentLoaded', () => {
  // Multi-step form logic for signup
  const form = document.getElementById('signupForm');
  if (!form) return;
  // Capture password field
  const passwordInput = form.newPassword;

  const steps = Array.from(form.querySelectorAll('.form-step'));
  let currentStep = 0;

  function showStep(idx) {
    steps.forEach((fs, i) => {
      if (i === idx) {
        fs.classList.add('form-step-active');
      } else {
        fs.classList.remove('form-step-active');
      }
    });
    // Progress bar update
    const progressSteps = form.closest('.form-card').querySelectorAll('.progress-step');
    progressSteps.forEach((el, i) => {
      if (i <= idx) {
        el.classList.add('progress-step-active');
      } else {
        el.classList.remove('progress-step-active');
      }
    });
  }

  // Next/Prev button event listeners
  form.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-next')) {
      e.preventDefault();
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    }
    if (e.target.classList.contains('btn-prev')) {
      e.preventDefault();
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    }
  });

  // Password show/hide toggle
  form.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.getAttribute('type') === 'password') {
        input.setAttribute('type', 'text');
        btn.textContent = '🙈';
      } else {
        input.setAttribute('type', 'password');
        btn.textContent = '👁️';
      }
    });
  });

  // Initialize
  showStep(currentStep);

  // Add form submit event to trigger registerUser
  const formElement = document.getElementById('signupForm');
  formElement.addEventListener('submit', function(e) {
    e.preventDefault();
    registerUser();
  });
});

// Register user and save to localStorage, then redirect
function registerUser() {
  const form = document.getElementById('signupForm');
  const passwordInput = form.newPassword;
  const user = {
    username: form.newUsername.value.trim(),
    email:    form.newEmail.value.trim(),
    dob:      form.dob.value,
    address:  form.address.value.trim(),
    password: passwordInput.value.trim(),
    balance:  0
  };
  // Save individual and current user object
  localStorage.setItem('currentUser', user.username);
  localStorage.setItem('currentUserObj', JSON.stringify(user));
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  // Redirect
  window.location.href = 'login.html';
}
