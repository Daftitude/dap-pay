// toast.js
function showToast(type, message) {
  // Remove existing toast if any
  const oldToast = document.getElementById('dapToast');
  if (oldToast) oldToast.remove();

  // Create new toast
  const toast = document.createElement('div');
  toast.id = 'dapToast';
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.right = '30px';
  toast.style.background = 'rgba(255, 255, 255, 0.9)';
  toast.style.color = type === 'error' ? '#ff3333' : (type === 'success' ? '#0CC7F6' : '#333');
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '10px';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  toast.style.fontSize = '1rem';
  toast.style.zIndex = '9999';
  toast.style.animation = 'fadeInToast 0.5s ease, fadeOutToast 0.5s ease 2.5s forwards';

  toast.textContent = message;
  document.body.appendChild(toast);

  // Remove after animation
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Toast Fade Animations
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInToast {
  from { opacity: 0; transform: translateY(20px);}
  to { opacity: 1; transform: translateY(0);}
}
@keyframes fadeOutToast {
  from { opacity: 1; }
  to { opacity: 0; transform: translateY(20px);}
}`;
document.head.appendChild(style);
