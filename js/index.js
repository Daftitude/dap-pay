// js/index.js

document.addEventListener('DOMContentLoaded', () => {
  // Wire up your Learn More button
  const learnBtn = document.getElementById('learnMoreBtn');
  learnBtn?.addEventListener('click', () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Fade-in on scroll
  const faders = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  faders.forEach(el => observer.observe(el));

  // NOTE: toggleMenu is on window from main.js, so your hamburger will now work
});
