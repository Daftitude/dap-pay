// js/particles-init.js

// Immediately-invoked to bootstrap particles
(function() {
    // Make sure the library is loaded
    if (typeof particlesJS === 'undefined') {
      console.error('particles.js not found. Did you include particles.min.js?');
      return;
    }
  
    // Initialize on the #particles-js container
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
          density: { enable: true, value_area: 800 }
        },
        color: { value: '#0CC7F6' },
        shape: {
          type: 'circle',
          stroke: { width: 0, color: '#0CC7F6' },
          polygon: { nb_sides: 5 }
        },
        opacity: {
          value: 0.4,
          random: true
        },
        size: {
          value: 3,
          random: true
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#0CC7F6',
          opacity: 0.3,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out'
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        },
        modes: {
          grab: { distance: 100, line_linked: { opacity: 1 } },
          bubble: { distance: 200, size: 80, duration: 0.4 },
          repulse: { distance: 200, duration: 0.4 },
          push: { particles_nb: 4 },
          remove: { particles_nb: 2 }
        }
      },
      retina_detect: true
    });
  })();
  