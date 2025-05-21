// js/toast.js

export function showToast(message, type = 'info') {
  const old = document.getElementById('dapToast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'dapToast';
  toast.style.position   = 'fixed';
  toast.style.bottom     = '30px';
  toast.style.right      = '30px';
  toast.style.background = 'rgba(255,255,255,0.9)';
  toast.style.color      = ( type === 'error' ? '#ff3333'
                       : type === 'success' ? '#0CC7F6'
                       : '#333' );
  toast.style.padding     = '12px 20px';
  toast.style.borderRadius= '10px';
  toast.style.boxShadow   = '0 4px 12px rgba(0,0,0,0.3)';
  toast.style.fontSize    = '1rem';
  toast.style.zIndex      = '9999';
  toast.style.animation   = 'fadeInToast 0.5s ease, fadeOutToast 0.5s ease 2.5s forwards';
  toast.textContent       = message;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// expose globally for non-module consumers
window.showToast = showToast;

// add keyframe styles
const s = document.createElement('style');
s.textContent = `
@keyframes fadeInToast {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);     }
}
@keyframes fadeOutToast {
  from { opacity: 1; }
  to   { opacity: 0; transform: translateY(20px); }
}`;
document.head.appendChild(s);
