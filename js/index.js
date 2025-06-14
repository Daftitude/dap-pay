
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.11.5/dist/gsap.min.js";

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

  // GSAP hero intro animation
  gsap.from(".hero-logo, .hero-title, .hero-subtitle, .hero-buttons > *", {
    duration: 1,
    opacity: 0,
    y: 20,
    stagger: 0.2,
    ease: "power3.out"
  });

  // NOTE: toggleMenu is on window from main.js, so your hamburger will now work

  // Hamburger menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  hamburger?.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });
});
