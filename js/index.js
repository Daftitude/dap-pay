// js/index.js

import { toggleMenu } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll to features when "Learn More" clicked
  document.getElementById('learnMoreBtn').addEventListener('click', () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  });

  // Reveal-on-scroll: ensure fade-in sections are visible after injection
  const faders = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  faders.forEach(el => observer.observe(el));
});
