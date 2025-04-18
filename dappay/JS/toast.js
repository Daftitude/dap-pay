// toast.js

function showToast(message, type = "success") {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    if (type === "error") {
      toast.classList.add('error');
    }
    toast.innerText = message;
    
    document.body.appendChild(toast);
  
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3000);
  }
  