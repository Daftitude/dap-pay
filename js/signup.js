// js/signup.js

document.addEventListener('DOMContentLoaded', () => {
  const steps = Array.from(document.querySelectorAll('.form-step'));
  const dots  = Array.from(document.querySelectorAll('.progress-step'));
  const form  = document.getElementById('signupForm');
  let   current = 0;

  function showStep(i) {
    steps.forEach((fs,j) => {
      fs.style.display = j === i ? 'block' : 'none';
      fs.classList.toggle('form-step-active', j === i);
    });
    dots.forEach((dot,j) => {
      dot.classList.toggle('progress-step-active', j <= i);
    });
  }

  function toast(msg,type) {
    (window.showToast||alert)(msg,type);
  }

  function validateStep(n) {
    // your existing checks…
    return true;
  }

  document.querySelectorAll('.btn-next').forEach(btn =>
    btn.addEventListener('click', () => {
      if (!validateStep(current+1)) return;
      current++; showStep(current);
    })
  );
  document.querySelectorAll('.btn-prev').forEach(btn =>
    btn.addEventListener('click', () => {
      current--; showStep(current);
    })
  );

  document.querySelectorAll('.toggle-password').forEach(btn =>
    btn.addEventListener('click', () => {
      const inp = btn.previousElementSibling;
      if (inp.type==="password") { inp.type="text"; btn.textContent="🙈"; }
      else { inp.type="password"; btn.textContent="👁️"; }
    })
  );

  function saveUser() {
    const user = {
      username: newUsername.value.trim(),
      email:    newEmail.value.trim(),
      dob:      dob.value,
      address:  address.value.trim(),
      password: newPassword.value,
      balance:  0
    };

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u=>u.username.toLowerCase()===user.username.toLowerCase())) {
      return toast('❌ Username taken.','error');
    }

    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));

    // **NEW**: also mark this user as “logged in”
    localStorage.setItem('currentUser', user.username);
    localStorage.setItem('currentUserObj', JSON.stringify(user));

    toast('✅ Account created! Redirecting…');
    setTimeout(() => window.location.href='dashboard.html', 1200);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep(3)) return;
    saveUser();
  });

  showStep(0);
});
